import { BillingService } from './billing.service';
import { ListInvoicesDto, RecordPaymentDto, RefundDto, UpdateInvoiceDto } from './dto/billing.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
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
                amount: import("@prisma/client/runtime/library").Decimal;
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
            total: import("@prisma/client/runtime/library").Decimal;
            patientId: string;
            visitId: string;
            invoiceNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            discountReason: string | null;
            tax: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
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
            extra: import("@prisma/client/runtime/library").JsonValue;
            doctorId: string;
            visitDate: Date;
            appointmentId: string | null;
            visitNumber: string;
            chiefComplaint: string | null;
            vitals: import("@prisma/client/runtime/library").JsonValue;
            symptoms: import("@prisma/client/runtime/library").JsonValue;
            assessmentNotes: import("@prisma/client/runtime/library").JsonValue;
            clinicalNotes: import("@prisma/client/runtime/library").JsonValue;
            soapNotes: import("@prisma/client/runtime/library").JsonValue;
            aiNotes: import("@prisma/client/runtime/library").JsonValue;
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
                amount: import("@prisma/client/runtime/library").Decimal;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        })[];
        items: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        patientId: string;
        visitId: string;
        invoiceNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        discountReason: string | null;
        tax: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        }[];
        items: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        patientId: string;
        visitId: string;
        invoiceNumber: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        discountReason: string | null;
        tax: import("@prisma/client/runtime/library").Decimal;
        amountPaid: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        issuedAt: Date;
    }>;
    recordPayment(user: AuthenticatedUser, id: string, dto: RecordPaymentDto): Promise<{
        payment: {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
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
                amount: import("@prisma/client/runtime/library").Decimal;
                reference: string | null;
                receiptNumber: string;
                paidAt: Date;
                receivedById: string | null;
                invoiceId: string;
            }[];
            items: {
                id: string;
                description: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                invoiceId: string;
            }[];
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            total: import("@prisma/client/runtime/library").Decimal;
            patientId: string;
            visitId: string;
            invoiceNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            discountReason: string | null;
            tax: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            issuedAt: Date;
        };
    }>;
    receipt(user: AuthenticatedUser, id: string): Promise<{
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
                    amount: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: string;
                }[];
            } & {
                id: string;
                clinicId: string;
                status: import("@prisma/client").$Enums.InvoiceStatus;
                createdAt: Date;
                updatedAt: Date;
                total: import("@prisma/client/runtime/library").Decimal;
                patientId: string;
                visitId: string;
                invoiceNumber: string;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discount: import("@prisma/client/runtime/library").Decimal;
                discountReason: string | null;
                tax: import("@prisma/client/runtime/library").Decimal;
                amountPaid: import("@prisma/client/runtime/library").Decimal;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            receiptNumber: string;
            paidAt: Date;
            receivedById: string | null;
            invoiceId: string;
        };
    }>;
    refund(user: AuthenticatedUser, id: string, dto: RefundDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.RefundStatus;
        createdAt: Date;
        reason: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentId: string;
        approvedById: string | null;
        processedAt: Date | null;
    }>;
}
