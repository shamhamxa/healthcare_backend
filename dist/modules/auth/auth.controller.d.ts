import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RefreshDto } from './dto/auth.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, ip: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: string;
            clinic: {
                id: string;
                name: string;
                code: string;
                isActive: boolean;
            } | null;
            permissions: string[];
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
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: AuthenticatedUser, dto: Partial<RefreshDto>): Promise<{
        success: boolean;
    }>;
    me(user: AuthenticatedUser): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: string;
        clinic: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
        } | null;
        permissions: string[];
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
    }>;
    changePassword(user: AuthenticatedUser, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
}
