import { BloodGroup, Gender } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CreatePatientDto {
    fullName?: string;
    phone?: string;
    emergency?: boolean;
    altPhone?: string;
    email?: string;
    gender?: Gender;
    dateOfBirth?: string;
    bloodGroup?: BloodGroup;
    cnic?: string;
    address?: string;
    city?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    allergies?: unknown[];
    chronicDiseases?: unknown[];
    familyHistory?: unknown[];
    lifestyleNotes?: Record<string, unknown>;
    force?: boolean;
    clinicId?: string;
}
export declare class UpdatePatientDto extends CreatePatientDto {
    gender: Gender;
}
export declare class SearchPatientsDto extends PaginationDto {
    q?: string;
    clinicId?: string;
    includeInactive?: boolean;
}
