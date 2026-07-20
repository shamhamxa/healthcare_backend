import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberingService } from '../../prisma/numbering.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { dayRange, resolveClinicId } from '../../common/utils/tenant.util';
import { paginated } from '../../common/dto/pagination.dto';
import {
  ListInvoicesDto,
  RecordPaymentDto,
  RefundDto,
  UpdateInvoiceDto,
} from './dto/billing.dto';

const D = (n: number | string | Prisma.Decimal) => new Prisma.Decimal(n);

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
    private readonly audit: AuditService,
  ) {}

  private async getInvoice(user: AuthenticatedUser, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: { items: true, payments: { include: { refunds: true } }, visit: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async list(user: AuthenticatedUser, dto: ListInvoicesDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const where: Prisma.InvoiceWhereInput = {
      clinicId,
      ...(dto.date ? { issuedAt: dayRange(dto.date) } : {}),
      ...(dto.status ? { status: dto.status as InvoiceStatus } : {}),
      ...(dto.patientId ? { patientId: dto.patientId } : {}),
      ...(dto.q ? { invoiceNumber: { contains: dto.q, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip: dto.skip,
        take: dto.limit,
        include: {
          patient: { select: { id: true, mrn: true, fullName: true } },
          visit: { select: { id: true, visitNumber: true } },
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return paginated(data, total, dto);
  }

  findOne(user: AuthenticatedUser, id: string) {
    return this.getInvoice(user, id);
  }

  /** Edit line items / discount / tax while not fully paid. */
  async update(user: AuthenticatedUser, id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.getInvoice(user, id);
    if (['PAID', 'REFUNDED', 'VOID'].includes(invoice.status)) {
      throw new BadRequestException(`Invoice is ${invoice.status} and cannot be edited`);
    }

    return this.prisma.$transaction(async (tx) => {
      let subtotal = invoice.subtotal;
      if (dto.items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        subtotal = dto.items.reduce(
          (acc, item) => acc.add(D(item.unitPrice).mul(item.quantity ?? 1)),
          D(0),
        );
        await tx.invoiceItem.createMany({
          data: dto.items.map((item) => ({
            invoiceId: id,
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: D(item.unitPrice),
            amount: D(item.unitPrice).mul(item.quantity ?? 1),
          })),
        });
      }

      const discount = dto.discount !== undefined ? D(dto.discount) : invoice.discount;
      const tax = dto.tax !== undefined ? D(dto.tax) : invoice.tax;
      const total = subtotal.sub(discount).add(tax);
      if (total.lt(0)) throw new BadRequestException('Total cannot be negative');

      const updated = await tx.invoice.update({
        where: { id },
        data: {
          subtotal,
          discount,
          discountReason: dto.discountReason ?? invoice.discountReason,
          tax,
          total,
          notes: dto.notes ?? invoice.notes,
          status: invoice.amountPaid.gte(total) && total.gt(0)
            ? 'PAID'
            : invoice.amountPaid.gt(0)
              ? 'PARTIALLY_PAID'
              : 'ISSUED',
        },
        include: { items: true, payments: true },
      });

      this.audit.log(user, invoice.clinicId, {
        action: 'UPDATE',
        entity: 'Invoice',
        entityId: id,
        oldValues: { total: invoice.total },
        newValues: { total: updated.total, discount: updated.discount },
      });
      return updated;
    });
  }

  /**
   * Record a payment (split payments = multiple calls). When the invoice
   * becomes fully paid, the visit auto-closes (PAYMENT_PENDING → COMPLETED).
   */
  async recordPayment(user: AuthenticatedUser, invoiceId: string, dto: RecordPaymentDto) {
    const invoice = await this.getInvoice(user, invoiceId);
    if (['PAID', 'REFUNDED', 'VOID'].includes(invoice.status)) {
      throw new BadRequestException(`Invoice is already ${invoice.status}`);
    }

    const amount = D(dto.amount);
    const outstanding = invoice.total.sub(invoice.amountPaid);
    if (amount.gt(outstanding)) {
      throw new BadRequestException(
        `Payment ${amount} exceeds outstanding balance ${outstanding}`,
      );
    }

    const receiptNumber = await this.numbering.nextReceiptNumber(invoice.clinicId);

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          clinicId: invoice.clinicId,
          invoiceId,
          method: dto.method,
          amount,
          reference: dto.reference,
          receiptNumber,
          receivedById: user.id,
        },
      });

      const newPaid = invoice.amountPaid.add(amount);
      const fullyPaid = newPaid.gte(invoice.total);
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newPaid,
          status: fullyPaid ? 'PAID' : 'PARTIALLY_PAID',
        },
        include: { items: true, payments: true },
      });

      // Auto-close the visit once fully paid
      if (fullyPaid && invoice.visit && invoice.visit.status === 'PAYMENT_PENDING') {
        await tx.visit.update({
          where: { id: invoice.visitId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      }
      return { payment, invoice: updatedInvoice };
    });

    this.audit.log(user, invoice.clinicId, {
      action: 'CREATE',
      entity: 'Payment',
      entityId: result.payment.id,
      newValues: { amount: dto.amount, method: dto.method, receiptNumber },
    });
    return result;
  }

  /** Receipt payload for printing. */
  async receipt(user: AuthenticatedUser, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: {
        invoice: {
          include: {
            items: true,
            patient: { select: { mrn: true, fullName: true, phone: true } },
            visit: { select: { visitNumber: true } },
          },
        },
        receivedBy: { select: { fullName: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    const clinic = await this.prisma.clinic.findUniqueOrThrow({
      where: { id: payment.clinicId },
      select: { name: true, address: true, phone: true, logoUrl: true },
    });
    return { clinic, payment };
  }

  async refund(user: AuthenticatedUser, paymentId: string, dto: RefundDto) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: { refunds: true, invoice: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const alreadyRefunded = payment.refunds
      .filter((r) => r.status !== 'REJECTED')
      .reduce((acc, r) => acc.add(r.amount), D(0));
    if (D(dto.amount).gt(payment.amount.sub(alreadyRefunded))) {
      throw new BadRequestException('Refund exceeds refundable amount');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          paymentId,
          amount: D(dto.amount),
          reason: dto.reason,
          status: 'COMPLETED',
          approvedById: user.id,
          processedAt: new Date(),
        },
      });
      const newPaid = payment.invoice.amountPaid.sub(D(dto.amount));
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          amountPaid: newPaid,
          status: newPaid.lte(0)
            ? 'REFUNDED'
            : newPaid.gte(payment.invoice.total)
              ? 'PAID'
              : 'PARTIALLY_PAID',
        },
      });
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: D(dto.amount).gte(payment.amount) ? 'REFUNDED' : payment.status,
        },
      });
      return refund;
    });

    this.audit.log(user, payment.clinicId, {
      action: 'CREATE',
      entity: 'Refund',
      entityId: result.id,
      newValues: { amount: dto.amount, reason: dto.reason },
    });
    return result;
  }
}
