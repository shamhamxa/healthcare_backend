export declare class PrescriptionItemDto {
    medicineId?: string;
    medicineName: string;
    dosage?: string;
    frequency?: string;
    morning?: boolean;
    afternoon?: boolean;
    night?: boolean;
    sos?: boolean;
    durationDays?: number;
    instructions?: string;
}
export declare class UpsertPrescriptionDto {
    items: PrescriptionItemDto[];
    generalInstructions?: string;
}
