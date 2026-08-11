import { PatientsService } from './patients.service';
import { CreatePatientDto, SearchPatientsDto, UpdatePatientDto } from './dto/patient.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(user: AuthenticatedUser, dto: CreatePatientDto): Promise<{
        mrn: string;
        id: string;
        clinicId: string;
        fullName: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        address: string | null;
        city: string | null;
        isActive: boolean;
        altPhone: string | null;
        isTemporary: boolean;
        gender: import("@prisma/client").$Enums.Gender;
        dateOfBirth: Date | null;
        bloodGroup: import("@prisma/client").$Enums.BloodGroup;
        cnic: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyContactRelation: string | null;
        allergies: import("@prisma/client/runtime/library").JsonValue;
        chronicDiseases: import("@prisma/client/runtime/library").JsonValue;
        familyHistory: import("@prisma/client/runtime/library").JsonValue;
        lifestyleNotes: import("@prisma/client/runtime/library").JsonValue;
        extra: import("@prisma/client/runtime/library").JsonValue;
    }>;
    search(user: AuthenticatedUser, dto: SearchPatientsDto): Promise<{
        data: {
            activeVisit: Record<string, unknown>;
            tokenNumber: number | null;
            mrn: string;
            id: string;
            clinicId: string;
            fullName: string;
            email: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            city: string | null;
            isActive: boolean;
            altPhone: string | null;
            isTemporary: boolean;
            gender: import("@prisma/client").$Enums.Gender;
            dateOfBirth: Date | null;
            bloodGroup: import("@prisma/client").$Enums.BloodGroup;
            cnic: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            emergencyContactRelation: string | null;
            allergies: import("@prisma/client/runtime/library").JsonValue;
            chronicDiseases: import("@prisma/client/runtime/library").JsonValue;
            familyHistory: import("@prisma/client/runtime/library").JsonValue;
            lifestyleNotes: import("@prisma/client/runtime/library").JsonValue;
            extra: import("@prisma/client/runtime/library").JsonValue;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    cities(user: AuthenticatedUser): Promise<string[]>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        _count: {
            appointments: number;
            visits: number;
        };
    } & {
        mrn: string;
        id: string;
        clinicId: string;
        fullName: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        address: string | null;
        city: string | null;
        isActive: boolean;
        altPhone: string | null;
        isTemporary: boolean;
        gender: import("@prisma/client").$Enums.Gender;
        dateOfBirth: Date | null;
        bloodGroup: import("@prisma/client").$Enums.BloodGroup;
        cnic: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyContactRelation: string | null;
        allergies: import("@prisma/client/runtime/library").JsonValue;
        chronicDiseases: import("@prisma/client/runtime/library").JsonValue;
        familyHistory: import("@prisma/client/runtime/library").JsonValue;
        lifestyleNotes: import("@prisma/client/runtime/library").JsonValue;
        extra: import("@prisma/client/runtime/library").JsonValue;
    }>;
    timeline(user: AuthenticatedUser, id: string): Promise<{
        patient: {
            _count: {
                appointments: number;
                visits: number;
            };
        } & {
            mrn: string;
            id: string;
            clinicId: string;
            fullName: string;
            email: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            city: string | null;
            isActive: boolean;
            altPhone: string | null;
            isTemporary: boolean;
            gender: import("@prisma/client").$Enums.Gender;
            dateOfBirth: Date | null;
            bloodGroup: import("@prisma/client").$Enums.BloodGroup;
            cnic: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            emergencyContactRelation: string | null;
            allergies: import("@prisma/client/runtime/library").JsonValue;
            chronicDiseases: import("@prisma/client/runtime/library").JsonValue;
            familyHistory: import("@prisma/client/runtime/library").JsonValue;
            lifestyleNotes: import("@prisma/client/runtime/library").JsonValue;
            extra: import("@prisma/client/runtime/library").JsonValue;
        };
        visits: ({
            token: {
                tokenNumber: number;
            } | null;
            prescription: ({
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
            }) | null;
            invoice: {
                status: import("@prisma/client").$Enums.InvoiceStatus;
                total: import("@prisma/client/runtime/library").Decimal;
                invoiceNumber: string;
            } | null;
            followUp: {
                id: string;
                clinicId: string;
                status: import("@prisma/client").$Enums.FollowUpStatus;
                createdAt: Date;
                updatedAt: Date;
                patientId: string;
                doctorId: string;
                appointmentId: string | null;
                visitId: string;
                dueDate: Date;
                reason: string | null;
            } | null;
            attachments: {
                id: string;
                createdAt: Date;
                category: import("@prisma/client").$Enums.FileCategory;
                fileName: string;
                mimeType: string;
            }[];
            doctor: {
                id: string;
                fullName: string;
            };
            diagnoses: {
                id: string;
                createdAt: Date;
                name: string;
                code: string | null;
                visitId: string;
                notes: string | null;
                isPrimary: boolean;
            }[];
        } & {
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
        })[];
        stats: {
            totalVisits: number;
            lastVisit: Date;
        };
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdatePatientDto): Promise<{
        mrn: string;
        id: string;
        clinicId: string;
        fullName: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        address: string | null;
        city: string | null;
        isActive: boolean;
        altPhone: string | null;
        isTemporary: boolean;
        gender: import("@prisma/client").$Enums.Gender;
        dateOfBirth: Date | null;
        bloodGroup: import("@prisma/client").$Enums.BloodGroup;
        cnic: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyContactRelation: string | null;
        allergies: import("@prisma/client/runtime/library").JsonValue;
        chronicDiseases: import("@prisma/client/runtime/library").JsonValue;
        familyHistory: import("@prisma/client/runtime/library").JsonValue;
        lifestyleNotes: import("@prisma/client/runtime/library").JsonValue;
        extra: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        success: boolean;
    }>;
}
