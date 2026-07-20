import { PrescriptionsService } from './prescriptions.service';
import { UpsertPrescriptionDto } from './dto/prescription.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    upsert(user: AuthenticatedUser, visitId: string, dto: UpsertPrescriptionDto): Promise<{
        items: {
            id: string;
            sortOrder: number;
            prescriptionId: string;
            medicineId: string | null;
            medicineName: string;
            dosage: string | null;
            frequency: string | null;
            morning: boolean;
            afternoon: boolean;
            night: boolean;
            sos: boolean;
            durationDays: number | null;
            instructions: string | null;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.PrescriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        extra: import("@prisma/client/runtime/library").JsonValue;
        doctorId: string;
        visitId: string;
        generalInstructions: string | null;
        pdfUrl: string | null;
        signedAt: Date | null;
    }>;
    find(user: AuthenticatedUser, visitId: string): Promise<{
        patient: {
            mrn: string;
            id: string;
            fullName: string;
            gender: import("@prisma/client").$Enums.Gender;
            dateOfBirth: Date | null;
            allergies: import("@prisma/client/runtime/library").JsonValue;
        };
        visit: {
            visitDate: Date;
            visitNumber: string;
            vitals: import("@prisma/client/runtime/library").JsonValue;
            diagnoses: {
                id: string;
                createdAt: Date;
                name: string;
                code: string | null;
                visitId: string;
                notes: string | null;
                isPrimary: boolean;
            }[];
        };
        doctor: {
            doctorProfile: {
                id: string;
                userId: string;
                specialization: string | null;
                qualifications: string | null;
                registrationNo: string | null;
                consultationFee: import("@prisma/client/runtime/library").Decimal;
                followUpFee: import("@prisma/client/runtime/library").Decimal;
                followUpFreeDays: number;
                signatureUrl: string | null;
                avgConsultMinutes: number;
                preferences: import("@prisma/client/runtime/library").JsonValue;
            } | null;
            id: string;
            fullName: string;
        };
        items: {
            id: string;
            sortOrder: number;
            prescriptionId: string;
            medicineId: string | null;
            medicineName: string;
            dosage: string | null;
            frequency: string | null;
            morning: boolean;
            afternoon: boolean;
            night: boolean;
            sos: boolean;
            durationDays: number | null;
            instructions: string | null;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.PrescriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        extra: import("@prisma/client/runtime/library").JsonValue;
        doctorId: string;
        visitId: string;
        generalInstructions: string | null;
        pdfUrl: string | null;
        signedAt: Date | null;
    }>;
    sign(user: AuthenticatedUser, visitId: string): Promise<{
        items: {
            id: string;
            sortOrder: number;
            prescriptionId: string;
            medicineId: string | null;
            medicineName: string;
            dosage: string | null;
            frequency: string | null;
            morning: boolean;
            afternoon: boolean;
            night: boolean;
            sos: boolean;
            durationDays: number | null;
            instructions: string | null;
        }[];
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.PrescriptionStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        extra: import("@prisma/client/runtime/library").JsonValue;
        doctorId: string;
        visitId: string;
        generalInstructions: string | null;
        pdfUrl: string | null;
        signedAt: Date | null;
    }>;
    print(user: AuthenticatedUser, visitId: string): Promise<{
        clinic: {
            email: string | null;
            phone: string | null;
            name: string;
            address: string | null;
            logoUrl: string | null;
        };
        prescription: {
            patient: {
                mrn: string;
                id: string;
                fullName: string;
                gender: import("@prisma/client").$Enums.Gender;
                dateOfBirth: Date | null;
                allergies: import("@prisma/client/runtime/library").JsonValue;
            };
            visit: {
                visitDate: Date;
                visitNumber: string;
                vitals: import("@prisma/client/runtime/library").JsonValue;
                diagnoses: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    code: string | null;
                    visitId: string;
                    notes: string | null;
                    isPrimary: boolean;
                }[];
            };
            doctor: {
                doctorProfile: {
                    id: string;
                    userId: string;
                    specialization: string | null;
                    qualifications: string | null;
                    registrationNo: string | null;
                    consultationFee: import("@prisma/client/runtime/library").Decimal;
                    followUpFee: import("@prisma/client/runtime/library").Decimal;
                    followUpFreeDays: number;
                    signatureUrl: string | null;
                    avgConsultMinutes: number;
                    preferences: import("@prisma/client/runtime/library").JsonValue;
                } | null;
                id: string;
                fullName: string;
            };
            items: {
                id: string;
                sortOrder: number;
                prescriptionId: string;
                medicineId: string | null;
                medicineName: string;
                dosage: string | null;
                frequency: string | null;
                morning: boolean;
                afternoon: boolean;
                night: boolean;
                sos: boolean;
                durationDays: number | null;
                instructions: string | null;
            }[];
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.PrescriptionStatus;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            extra: import("@prisma/client/runtime/library").JsonValue;
            doctorId: string;
            visitId: string;
            generalInstructions: string | null;
            pdfUrl: string | null;
            signedAt: Date | null;
        };
        generatedAt: string;
    }>;
}
