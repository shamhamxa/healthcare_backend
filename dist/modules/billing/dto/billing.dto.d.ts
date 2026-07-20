import { PaymentMethod } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class InvoiceItemDto {
    description: string;
    quantity?: number;
    unitPrice: number;
}
export declare class UpdateInvoiceDto {
    items?: InvoiceItemDto[];
    discount?: number;
    discountReason?: string;
    tax?: number;
    notes?: string;
}
export declare class RecordPaymentDto {
    method: PaymentMethod;
    amount: number;
    reference?: string;
}
export declare class RefundDto {
    amount: number;
    reason: string;
}
export declare class ListInvoicesDto extends PaginationDto {
    date?: string;
    status?: string;
    patientId?: string;
    q?: string;
    clinicId?: string;
}
