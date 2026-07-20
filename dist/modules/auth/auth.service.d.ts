import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { ChangePasswordDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    private hashToken;
    private loadUserWithPermissions;
    private buildPayload;
    private issueTokens;
    login(dto: LoginDto, ip?: string): Promise<{
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
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken?: string): Promise<{
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
