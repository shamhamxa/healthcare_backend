import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberingService } from '../../prisma/numbering.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { ListInvoicesDto, RecordPaymentDto, RefundDto, UpdateInvoiceDto } from './dto/billing.dto';
export declare class BillingService {
    private readonly prisma;
    private readonly numbering;
    private readonly audit;
    constructor(prisma: PrismaService, numbering: NumberingService, audit: AuditService);
    private getInvoice;
    list(user: AuthenticatedUser, dto: ListInvoicesDto): Promise<{
        data: ({
            patient: {
                mrn: string;
                id: string;
                fullName: string;
            };
            visit: {
                id: string;
                visitNumber: string;
            };
            payments: {
                id: string;
                clinicId: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: Prisma.Decimal;
                reference: string | null;
                receiptNumber: string;
                paidAt: Date;
                receivedById: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            total: Prisma.Decimal;
            patientId: string;
            visitId: string;
            invoiceNumber: string;
            subtotal: Prisma.Decimal;
            discount: Prisma.Decimal;
            discountReason: string | null;
            tax: Prisma.Decimal;
            amountPaid: Prisma.Decimal;
            notes: string | null;
            issuedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        visit: {
            id: string;
            clinicId: string;
            branchId: string | null;
            status: import("@prisma/client").$Enums.VisitStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            patientId: string;
            extra: Prisma.JsonValue;
            doctorId: string;
            visitDate: Date;
            appointmentId: string | null;
            visitNumber: string;
            chiefComplaint: string | null;
            vitals: Prisma.JsonValue;
            symptoms: Prisma.JsonValue;
            assessmentNotes: Prisma.JsonValue;
            clinicalNotes: Prisma.JsonValue;
            soapNotes: Prisma.JsonValue;
            aiNotes: Prisma.JsonValue;
            registeredAt: Date;
            assessmentStartAt: Date | null;
            readyForDoctorAt: Date | null;
            consultStartAt: Date | null;
            consultEndAt: Date | null;
            completedAt: Date | null;
            cancelledAt: Date | null;
            cancelReason: string | null;
        };
        payments: ({
            refunds: {
                id: string;
                status: import("@prisma/client").$Enums.RefundStatus;
                createdAt: Date;
                reason: string;
                amount: Prisma.Decimal;
                paymentId: string;
                approvedById: string | null;
                processedAt: Date | null;
            }[];
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: Prisma.Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        })[];
        items: {
            id: string;
            description: string;
            amount: Prisma.Decimal;
            quantity: number;
            unitPrice: Prisma.Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        total: Prisma.Decimal;
        patientId: string;
        visitId: string;
        invoiceNumber: string;
        subtotal: Prisma.Decimal;
        discount: Prisma.Decimal;
        discountReason: string | null;
        tax: Prisma.Decimal;
        amountPaid: Prisma.Decimal;
        notes: string | null;
        issuedAt: Date;
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateInvoiceDto): Promise<{
        payments: {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: Prisma.Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        }[];
        items: {
            id: string;
            description: string;
            amount: Prisma.Decimal;
            quantity: number;
            unitPrice: Prisma.Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        total: Prisma.Decimal;
        patientId: string;
        visitId: string;
        invoiceNumber: string;
        subtotal: Prisma.Decimal;
        discount: Prisma.Decimal;
        discountReason: string | null;
        tax: Prisma.Decimal;
        amountPaid: Prisma.Decimal;
        notes: string | null;
        issuedAt: Date;
    }>;
    recordPayment(user: AuthenticatedUser, invoiceId: string, dto: RecordPaymentDto): Promise<{
        payment: {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: Prisma.Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        };
        invoice: {
            payments: {
                id: string;
                clinicId: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: Prisma.Decimal;
                reference: string | null;
                receiptNumber: string;
                paidAt: Date;
                receivedById: string | null;
                invoiceId: string;
            }[];
            items: {
                id: string;
                description: string;
                amount: Prisma.Decimal;
                quantity: number;
                unitPrice: Prisma.Decimal;
                invoiceId: string;
            }[];
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            total: Prisma.Decimal;
            patientId: string;
            visitId: string;
            invoiceNumber: string;
            subtotal: Prisma.Decimal;
            discount: Prisma.Decimal;
            discountReason: string | null;
            tax: Prisma.Decimal;
            amountPaid: Prisma.Decimal;
            notes: string | null;
            issuedAt: Date;
        };
    }>;
    receipt(user: AuthenticatedUser, paymentId: string): Promise<{
        clinic: {
            phone: string | null;
            name: string;
            address: string | null;
            logoUrl: string | null;
        };
        payment: {
            invoice: {
                patient: {
                    mrn: string;
                    fullName: string;
                    phone: string | null;
                };
                visit: {
                    visitNumber: string;
                };
                items: {
                    id: string;
                    description: string;
                    amount: Prisma.Decimal;
                    quantity: number;
                    unitPrice: Prisma.Decimal;
                    invoiceId: string;
                }[];
            } & {
                id: string;
                clinicId: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                createdAt: Date;
                updatedAt: Date;
                total: Prisma.Decimal;
                patientId: string;
                visitId: string;
                invoiceNumber: string;
                subtotal: Prisma.Decimal;
                discount: Prisma.Decimal;
                discountReason: string | null;
                tax: Prisma.Decimal;
                amountPaid: Prisma.Decimal;
                notes: string | null;
                issuedAt: Date;
            };
            receivedBy: {
                fullName: string;
            } | null;
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: Prisma.Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        };
    }>;
    refund(user: AuthenticatedUser, paymentId: string, dto: RefundDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.RefundStatus;
        createdAt: Date;
        reason: string;
        amount: Prisma.Decimal;
        paymentId: string;
        approvedById: string | null;
        processedAt: Date | null;
    }>;
}
