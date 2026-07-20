import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TokenStatus, VisitStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberingService } from '../../prisma/numbering.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { dayRange, resolveClinicId } from '../../common/utils/tenant.util';
import { paginated } from '../../common/dto/pagination.dto';
import {
  AssessmentDto,
  CancelVisitDto,
  CloseVisitDto,
  ConsultationDto,
  CreateVisitDto,
  ListVisitsDto,
} from './dto/visit.dto';

/**
 * The Visit state machine. A visit only moves forward through the
 * patient journey; CANCELLED is reachable from any pre-completed state.
 */
const ALLOWED_TRANSITIONS: Record<VisitStatus, VisitStatus[]> = {
  REGISTERED: ['WAITING', 'IN_ASSESSMENT', 'CANCELLED'],
  WAITING: ['IN_ASSESSMENT', 'READY_FOR_DOCTOR', 'CANCELLED'],
  IN_ASSESSMENT: ['READY_FOR_DOCTOR', 'WAITING', 'CANCELLED'],
  READY_FOR_DOCTOR: ['IN_CONSULTATION', 'CANCELLED'],
  // Doctor can send the patient for labs (AWAITING_TEST) and resume later.
  IN_CONSULTATION: ['AWAITING_TEST', 'PRESCRIBED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
  AWAITING_TEST: ['IN_CONSULTATION', 'CANCELLED'],
  PRESCRIBED: ['PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
  PAYMENT_PENDING: ['COMPLETED', 'CANCELLED'],
  // Doctor undo: a completed visit can be reopened the SAME day.
  COMPLETED: ['IN_CONSULTATION'],
  CANCELLED: [],
};

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
    private readonly audit: AuditService,
  ) {}

  private assertTransition(from: VisitStatus, to: VisitStatus) {
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
      throw new BadRequestException(
        `Invalid visit transition: ${from} → ${to}`,
      );
    }
  }

  async getOwned(user: AuthenticatedUser, id: string) {
    const visit = await this.prisma.visit.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: { token: true, invoice: true },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  /**
   * Front-desk check-in: creates the Visit (the central entity) and its
   * daily token, and moves the linked appointment to CHECKED_IN.
   */
  async create(user: AuthenticatedUser, dto: CreateVisitDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);

    const [patient, doctor] = await Promise.all([
      this.prisma.patient.findFirst({
        where: { id: dto.patientId, clinicId, deletedAt: null },
      }),
      this.prisma.user.findFirst({
        where: { id: dto.doctorId, clinicId, deletedAt: null },
        include: { role: true, doctorProfile: true },
      }),
    ]);
    if (!patient) throw new NotFoundException('Patient not found');
    if (!doctor || doctor.role.code !== 'DOCTOR') {
      throw new BadRequestException('Selected user is not a doctor');
    }

    // One open visit per patient at a time
    const openVisit = await this.prisma.visit.findFirst({
      where: {
        clinicId,
        patientId: dto.patientId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        deletedAt: null,
      },
    });
    if (openVisit) {
      throw new BadRequestException(
        `Patient already has an open visit (${openVisit.visitNumber})`,
      );
    }

    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findFirst({
        where: { id: dto.appointmentId, clinicId, deletedAt: null },
      });
      if (!appointment) throw new NotFoundException('Appointment not found');
      if (appointment.status === 'CANCELLED') {
        throw new BadRequestException('Appointment is cancelled');
      }
    }

    const visitNumber = await this.numbering.nextVisitNumber(clinicId);
    const tokenNumber = await this.numbering.nextToken(clinicId, dto.doctorId);
    const invoiceNumber = await this.numbering.nextInvoiceNumber(clinicId);
    const receiptNumber = dto.payment
      ? await this.numbering.nextReceiptNumber(clinicId)
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fee at check-in: paisay pehle, token baad. Invoice is created with
    // the visit; when payment info is present it is settled immediately.
    const profile = doctor.doctorProfile;
    const isFollowUp = dto.appointmentId
      ? (await this.prisma.appointment.findUnique({
          where: { id: dto.appointmentId },
          select: { type: true },
        }))?.type === 'FOLLOW_UP'
      : false;
    const fee = isFollowUp
      ? (profile?.followUpFee ?? new Prisma.Decimal(0))
      : (profile?.consultationFee ?? new Prisma.Decimal(0));
    const feeLabel = isFollowUp ? 'Follow-up Fee' : 'Consultation Fee';
    const payAmount = dto.payment
      ? new Prisma.Decimal(dto.payment.amount ?? fee)
      : null;
    if (payAmount && payAmount.gt(fee)) {
      throw new BadRequestException(`Payment exceeds fee (${fee})`);
    }

    const visit = await this.prisma.$transaction(async (tx) => {
      const v = await tx.visit.create({
        data: {
          clinicId,
          branchId: dto.branchId,
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          appointmentId: dto.appointmentId,
          visitNumber,
          status: 'WAITING',
          chiefComplaint: dto.chiefComplaint,
          token: {
            create: {
              clinicId,
              tokenNumber,
              tokenDate: today,
              doctorId: dto.doctorId,
              queueType: 'ASSISTANT',
              status: 'WAITING',
            },
          },
          invoice: {
            create: {
              clinicId,
              patientId: dto.patientId,
              invoiceNumber,
              status: payAmount?.gte(fee)
                ? 'PAID'
                : payAmount
                  ? 'PARTIALLY_PAID'
                  : 'ISSUED',
              subtotal: fee,
              total: fee,
              amountPaid: payAmount ?? 0,
              items: {
                create: [
                  {
                    description: feeLabel,
                    quantity: 1,
                    unitPrice: fee,
                    amount: fee,
                  },
                ],
              },
              ...(payAmount && receiptNumber
                ? {
                    payments: {
                      create: [
                        {
                          clinicId,
                          method: dto.payment!.method,
                          amount: payAmount,
                          receiptNumber,
                          receivedById: user.id,
                        },
                      ],
                    },
                  }
                : {}),
            },
          },
        },
        include: {
          token: true,
          invoice: { include: { payments: true } },
          patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
          doctor: { select: { id: true, fullName: true } },
        },
      });
      if (dto.appointmentId) {
        await tx.appointment.update({
          where: { id: dto.appointmentId },
          data: { status: 'CHECKED_IN' },
        });
      }
      return v;
    });

    this.audit.log(user, clinicId, {
      action: 'CREATE',
      entity: 'Visit',
      entityId: visit.id,
      newValues: {
        visitNumber,
        tokenNumber,
        feePaid: payAmount?.toString() ?? '0',
        receiptNumber,
      },
    });
    return visit;
  }

  async list(user: AuthenticatedUser, dto: ListVisitsDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const where: Prisma.VisitWhereInput = {
      clinicId,
      deletedAt: null,
      ...(dto.date ? { visitDate: dayRange(dto.date) } : {}),
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
      ...(dto.patientId ? { patientId: dto.patientId } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.visit.findMany({
        where,
        orderBy: { visitDate: 'desc' },
        skip: dto.skip,
        take: dto.limit,
        include: {
          patient: { select: { id: true, mrn: true, fullName: true, phone: true, gender: true, dateOfBirth: true } },
          doctor: { select: { id: true, fullName: true } },
          token: true,
          invoice: { select: { id: true, invoiceNumber: true, total: true, status: true } },
        },
      }),
      this.prisma.visit.count({ where }),
    ]);
    return paginated(data, total, dto);
  }

  /** Full visit snapshot: everything the doctor/reception needs in one call. */
  async findOne(user: AuthenticatedUser, id: string) {
    const visit = await this.prisma.visit.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: {
        patient: true,
        doctor: { select: { id: true, fullName: true, doctorProfile: true } },
        appointment: true,
        token: true,
        diagnoses: true,
        prescription: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
        invoice: { include: { items: true, payments: true } },
        followUp: true,
        attachments: { where: { deletedAt: null } },
      },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  /**
   * Diagnosis autocomplete: har likhi hui diagnosis DB mein hai —
   * doctor typing shuru kare to pehle likhi hui suggest hoti hain
   * (sab se zyada istemal wali pehle).
   */
  async diagnosisSuggestions(user: AuthenticatedUser, q?: string) {
    const clinicId = resolveClinicId(user);
    const rows = await this.prisma.diagnosis.groupBy({
      by: ['name', 'code'],
      where: {
        visit: { clinicId },
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: 10,
    });
    return rows.map((r) => ({
      name: r.name,
      code: r.code,
      timesUsed: r._count.name,
    }));
  }

  /** Assistant workspace: vitals, chief complaint, symptoms, notes. */
  async saveAssessment(user: AuthenticatedUser, id: string, dto: AssessmentDto) {
    const visit = await this.getOwned(user, id);
    if (!['REGISTERED', 'WAITING', 'IN_ASSESSMENT'].includes(visit.status)) {
      throw new BadRequestException(
        `Cannot record assessment while visit is ${visit.status}`,
      );
    }

    const targetStatus: VisitStatus = dto.readyForDoctor
      ? 'READY_FOR_DOCTOR'
      : 'IN_ASSESSMENT';
    if (visit.status !== targetStatus) {
      this.assertTransition(visit.status, targetStatus);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const v = await tx.visit.update({
        where: { id },
        data: {
          status: targetStatus,
          chiefComplaint: dto.chiefComplaint ?? visit.chiefComplaint,
          vitals: (dto.vitals ?? visit.vitals) as Prisma.InputJsonValue,
          symptoms: (dto.symptoms ?? visit.symptoms) as Prisma.InputJsonValue,
          assessmentNotes: (dto.assessmentNotes ??
            visit.assessmentNotes) as Prisma.InputJsonValue,
          assessmentStartAt: visit.assessmentStartAt ?? new Date(),
          readyForDoctorAt: dto.readyForDoctor ? new Date() : undefined,
        },
        include: { token: true },
      });
      if (dto.readyForDoctor && visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { queueType: 'DOCTOR', status: 'WAITING' },
        });
      }
      return v;
    });

    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: visit.status },
      newValues: { status: targetStatus },
    });
    return updated;
  }

  /** Doctor pulls the patient in. */
  async startConsultation(user: AuthenticatedUser, id: string) {
    const visit = await this.getOwned(user, id);
    this.assertTransition(visit.status, 'IN_CONSULTATION');

    const updated = await this.prisma.$transaction(async (tx) => {
      const v = await tx.visit.update({
        where: { id },
        data: { status: 'IN_CONSULTATION', consultStartAt: new Date() },
      });
      if (visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { status: 'IN_PROGRESS', calledAt: new Date() },
        });
      }
      return v;
    });

    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: visit.status },
      newValues: { status: 'IN_CONSULTATION' },
    });
    return updated;
  }

  /** Doctor consultation: notes, diagnoses, follow-up intent. */
  async saveConsultation(user: AuthenticatedUser, id: string, dto: ConsultationDto) {
    const visit = await this.getOwned(user, id);
    if (visit.status !== 'IN_CONSULTATION') {
      throw new BadRequestException('Visit is not in consultation');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.diagnoses) {
        await tx.diagnosis.deleteMany({ where: { visitId: id } });
        if (dto.diagnoses.length > 0) {
          await tx.diagnosis.createMany({
            data: dto.diagnoses.map((d) => ({
              visitId: id,
              code: d.code,
              name: d.name,
              isPrimary: d.isPrimary ?? false,
              notes: d.notes,
            })),
          });
        }
      }

      if (dto.followUpDate) {
        await tx.followUp.upsert({
          where: { visitId: id },
          create: {
            clinicId: visit.clinicId,
            visitId: id,
            patientId: visit.patientId,
            doctorId: visit.doctorId,
            dueDate: new Date(dto.followUpDate),
            reason: dto.followUpReason,
          },
          update: {
            dueDate: new Date(dto.followUpDate),
            reason: dto.followUpReason,
          },
        });
      }

      return tx.visit.update({
        where: { id },
        data: {
          clinicalNotes: (dto.clinicalNotes ??
            visit.clinicalNotes) as Prisma.InputJsonValue,
          soapNotes: (dto.soapNotes ?? visit.soapNotes) as Prisma.InputJsonValue,
          aiNotes: (dto.aiNotes ?? visit.aiNotes) as Prisma.InputJsonValue,
        },
        include: { diagnoses: true, followUp: true },
      });
    });
  }

  /**
   * Doctor finishes: visit → PAYMENT_PENDING and the invoice is created
   * automatically (consultation or follow-up fee), so the front desk /
   * cashier can collect immediately.
   */
  async completeConsultation(user: AuthenticatedUser, id: string) {
    const visit = await this.prisma.visit.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: {
        token: true,
        invoice: true,
        appointment: true,
        doctor: { include: { doctorProfile: true } },
      },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    this.assertTransition(visit.status, 'PAYMENT_PENDING');

    const profile = visit.doctor.doctorProfile;
    const isFollowUp = visit.appointment?.type === 'FOLLOW_UP';
    const fee = isFollowUp
      ? (profile?.followUpFee ?? new Prisma.Decimal(0))
      : (profile?.consultationFee ?? new Prisma.Decimal(0));
    const feeLabel = isFollowUp ? 'Follow-up Fee' : 'Consultation Fee';

    const invoiceNumber = visit.invoice
      ? null
      : await this.numbering.nextInvoiceNumber(visit.clinicId);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (!visit.invoice && invoiceNumber) {
        await tx.invoice.create({
          data: {
            clinicId: visit.clinicId,
            visitId: id,
            patientId: visit.patientId,
            invoiceNumber,
            status: 'ISSUED',
            subtotal: fee,
            total: fee,
            items: {
              create: [
                { description: feeLabel, quantity: 1, unitPrice: fee, amount: fee },
              ],
            },
          },
        });
      }
      if (visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { status: 'COMPLETED' },
        });
      }
      // Fee-first flow: invoice was already settled at check-in, so the
      // visit closes the moment the doctor finishes.
      const alreadyPaid = visit.invoice?.status === 'PAID';
      return tx.visit.update({
        where: { id },
        data: alreadyPaid
          ? {
              status: 'COMPLETED',
              consultEndAt: new Date(),
              completedAt: new Date(),
            }
          : { status: 'PAYMENT_PENDING', consultEndAt: new Date() },
        include: { invoice: { include: { items: true } }, followUp: true },
      });
    });

    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: visit.status },
      newValues: { status: 'PAYMENT_PENDING' },
    });
    return updated;
  }

  /**
   * Doctor sends the patient for labs/tests. Visit → AWAITING_TEST and the
   * token goes back to a waiting queue so the doctor can pick up the next
   * patient. Requested tests are stored in JSONB (assessmentNotes.tests).
   */
  async sendForTest(user: AuthenticatedUser, id: string, tests: string[]) {
    const visit = await this.getOwned(user, id);
    this.assertTransition(visit.status, 'AWAITING_TEST');

    const notes = (visit.assessmentNotes ?? {}) as Record<string, unknown>;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { status: 'WAITING' },
        });
      }
      return tx.visit.update({
        where: { id },
        data: {
          status: 'AWAITING_TEST',
          assessmentNotes: {
            ...notes,
            tests,
            testsRequestedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    });
    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: visit.status },
      newValues: { status: 'AWAITING_TEST', tests },
    });
    return updated;
  }

  /** Test results are back — doctor resumes the consultation. */
  async resumeFromTest(user: AuthenticatedUser, id: string) {
    const visit = await this.getOwned(user, id);
    this.assertTransition(visit.status, 'IN_CONSULTATION');
    const updated = await this.prisma.$transaction(async (tx) => {
      if (visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { status: 'IN_PROGRESS' },
        });
      }
      return tx.visit.update({
        where: { id },
        data: { status: 'IN_CONSULTATION' },
      });
    });
    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: 'AWAITING_TEST' },
      newValues: { status: 'IN_CONSULTATION' },
    });
    return updated;
  }

  /**
   * Doctor undo: reopen a COMPLETED visit back to IN_CONSULTATION — but
   * only within the SAME day (daily tokens). Registration is never undoable.
   */
  async reopen(user: AuthenticatedUser, id: string) {
    const visit = await this.getOwned(user, id);
    this.assertTransition(visit.status, 'IN_CONSULTATION');

    const completedAt = visit.completedAt ?? visit.consultEndAt;
    if (completedAt) {
      const today = dayRange();
      if (completedAt < today.gte || completedAt >= today.lt) {
        throw new BadRequestException(
          'Only visits completed today can be reopened',
        );
      }
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      if (visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { status: 'IN_PROGRESS' },
        });
      }
      return tx.visit.update({
        where: { id },
        data: { status: 'IN_CONSULTATION', completedAt: null },
      });
    });
    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: 'COMPLETED' },
      newValues: { status: 'IN_CONSULTATION', undo: true },
    });
    return updated;
  }

  /** Close the visit (normally automatic once the invoice is fully paid). */
  async close(user: AuthenticatedUser, id: string, dto: CloseVisitDto) {
    const visit = await this.getOwned(user, id);
    this.assertTransition(visit.status, 'COMPLETED');

    if (visit.invoice && visit.invoice.status !== 'PAID' && !dto.force) {
      throw new BadRequestException(
        `Invoice ${visit.invoice.invoiceNumber} is not fully paid. Pass force=true to close anyway.`,
      );
    }
    if (dto.force && !user.permissions.includes('billing.refund') && user.roleCode !== 'SUPER_ADMIN' && user.roleCode !== 'CLINIC_ADMIN') {
      throw new ForbiddenException('Only admin/billing staff may force-close unpaid visits');
    }

    const updated = await this.prisma.visit.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: visit.status },
      newValues: { status: 'COMPLETED' },
    });
    return updated;
  }

  async cancel(user: AuthenticatedUser, id: string, dto: CancelVisitDto) {
    const visit = await this.getOwned(user, id);
    this.assertTransition(visit.status, 'CANCELLED');

    const updated = await this.prisma.$transaction(async (tx) => {
      if (visit.token) {
        await tx.token.update({
          where: { id: visit.token.id },
          data: { status: 'CANCELLED' },
        });
      }
      return tx.visit.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
      });
    });

    this.audit.log(user, visit.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Visit',
      entityId: id,
      oldValues: { status: visit.status },
      newValues: { status: 'CANCELLED', reason: dto.reason },
    });
    return updated;
  }
}
