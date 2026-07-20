"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const numbering_service_1 = require("../../prisma/numbering.service");
const audit_service_1 = require("../audit/audit.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const D = (n) => new client_1.Prisma.Decimal(n);
let BillingService = class BillingService {
    prisma;
    numbering;
    audit;
    constructor(prisma, numbering, audit) {
        this.prisma = prisma;
        this.numbering = numbering;
        this.audit = audit;
    }
    async getInvoice(user, id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: { items: true, payments: { include: { refunds: true } }, visit: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async list(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const where = {
            clinicId,
            ...(dto.date ? { issuedAt: (0, tenant_util_1.dayRange)(dto.date) } : {}),
            ...(dto.status ? { status: dto.status } : {}),
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
        return (0, pagination_dto_1.paginated)(data, total, dto);
    }
    findOne(user, id) {
        return this.getInvoice(user, id);
    }
    async update(user, id, dto) {
        const invoice = await this.getInvoice(user, id);
        if (['PAID', 'REFUNDED', 'VOID'].includes(invoice.status)) {
            throw new common_1.BadRequestException(`Invoice is ${invoice.status} and cannot be edited`);
        }
        return this.prisma.$transaction(async (tx) => {
            let subtotal = invoice.subtotal;
            if (dto.items) {
                await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
                subtotal = dto.items.reduce((acc, item) => acc.add(D(item.unitPrice).mul(item.quantity ?? 1)), D(0));
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
            if (total.lt(0))
                throw new common_1.BadRequestException('Total cannot be negative');
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
    async recordPayment(user, invoiceId, dto) {
        const invoice = await this.getInvoice(user, invoiceId);
        if (['PAID', 'REFUNDED', 'VOID'].includes(invoice.status)) {
            throw new common_1.BadRequestException(`Invoice is already ${invoice.status}`);
        }
        const amount = D(dto.amount);
        const outstanding = invoice.total.sub(invoice.amountPaid);
        if (amount.gt(outstanding)) {
            throw new common_1.BadRequestException(`Payment ${amount} exceeds outstanding balance ${outstanding}`);
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
    async receipt(user, paymentId) {
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
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const clinic = await this.prisma.clinic.findUniqueOrThrow({
            where: { id: payment.clinicId },
            select: { name: true, address: true, phone: true, logoUrl: true },
        });
        return { clinic, payment };
    }
    async refund(user, paymentId, dto) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id: paymentId,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: { refunds: true, invoice: true },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const alreadyRefunded = payment.refunds
            .filter((r) => r.status !== 'REJECTED')
            .reduce((acc, r) => acc.add(r.amount), D(0));
        if (D(dto.amount).gt(payment.amount.sub(alreadyRefunded))) {
            throw new common_1.BadRequestException('Refund exceeds refundable amount');
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
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        numbering_service_1.NumberingService,
        audit_service_1.AuditService])
], BillingService);
//# sourceMappingURL=billing.service.js.map