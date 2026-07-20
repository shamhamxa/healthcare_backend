"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async loadUserWithPermissions(where) {
        return this.prisma.user.findFirst({
            where: { ...where, deletedAt: null },
            include: {
                role: {
                    include: { rolePermissions: { include: { permission: true } } },
                },
                clinic: { select: { id: true, name: true, code: true, isActive: true } },
                doctorProfile: true,
            },
        });
    }
    buildPayload(user) {
        return {
            sub: user.id,
            email: user.email,
            clinicId: user.clinicId,
            role: user.role.code,
            permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
        };
    }
    async issueTokens(payload) {
        const accessToken = await this.jwt.signAsync(payload);
        const refreshToken = await this.jwt.signAsync({ sub: payload.sub, jti: (0, crypto_1.randomUUID)() }, {
            secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId: payload.sub,
                tokenHash: this.hashToken(refreshToken),
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    async login(dto, ip) {
        const user = await this.loadUserWithPermissions({
            email: dto.email.trim().toLowerCase(),
        });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.clinic && !user.clinic.isActive) {
            throw new common_1.UnauthorizedException('Clinic is deactivated');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = this.buildPayload(user);
        const tokens = await this.issueTokens(payload);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await this.prisma.activityLog.create({
            data: {
                clinicId: user.clinicId,
                userId: user.id,
                action: 'LOGIN',
                ip,
            },
        });
        return {
            ...tokens,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role.code,
                clinic: user.clinic,
                permissions: payload.permissions,
                doctorProfile: user.doctorProfile,
            },
        };
    }
    async refresh(refreshToken) {
        let decoded;
        try {
            decoded = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash: this.hashToken(refreshToken) },
        });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired or revoked');
        }
        const user = await this.loadUserWithPermissions({ id: decoded.sub });
        if (!user || user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User is inactive');
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        return this.issueTokens(this.buildPayload(user));
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, tokenHash: this.hashToken(refreshToken) },
                data: { revokedAt: new Date() },
            });
        }
        else {
            await this.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        return { success: true };
    }
    async me(user) {
        const full = await this.loadUserWithPermissions({ id: user.id });
        if (!full)
            throw new common_1.UnauthorizedException();
        return {
            id: full.id,
            fullName: full.fullName,
            email: full.email,
            phone: full.phone,
            role: full.role.code,
            clinic: full.clinic,
            permissions: full.role.rolePermissions.map((rp) => rp.permission.code),
            doctorProfile: full.doctorProfile,
        };
    }
    async changePassword(user, dto) {
        const dbUser = await this.prisma.user.findUniqueOrThrow({
            where: { id: user.id },
        });
        const valid = await bcrypt.compare(dto.currentPassword, dbUser.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password incorrect');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId: user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map