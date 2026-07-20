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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let UsersService = class UsersService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        if (dto.roleCode === 'SUPER_ADMIN') {
            throw new common_1.BadRequestException('Cannot create super admin via this endpoint');
        }
        const role = await this.prisma.role.findFirst({
            where: {
                code: dto.roleCode,
                OR: [{ clinicId: null }, { clinicId }],
            },
        });
        if (!role)
            throw new common_1.BadRequestException(`Unknown role: ${dto.roleCode}`);
        const created = await this.prisma.user.create({
            data: {
                clinicId,
                branchId: dto.branchId,
                roleId: role.id,
                fullName: dto.fullName,
                email: dto.email.toLowerCase(),
                phone: dto.phone,
                passwordHash: await bcrypt.hash(dto.password, 10),
                ...(dto.roleCode === 'DOCTOR'
                    ? {
                        doctorProfile: {
                            create: {
                                specialization: dto.doctorProfile?.specialization,
                                qualifications: dto.doctorProfile?.qualifications,
                                registrationNo: dto.doctorProfile?.registrationNo,
                                consultationFee: dto.doctorProfile?.consultationFee ?? 0,
                                followUpFee: dto.doctorProfile?.followUpFee ?? 0,
                                avgConsultMinutes: dto.doctorProfile?.avgConsultMinutes ?? 10,
                            },
                        },
                    }
                    : {}),
            },
            include: { role: true, doctorProfile: true },
        });
        this.audit.log(user, clinicId, {
            action: 'CREATE',
            entity: 'User',
            entityId: created.id,
            newValues: { email: created.email, role: dto.roleCode },
        });
        const { passwordHash: _p, ...safe } = created;
        return safe;
    }
    async list(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const where = {
            clinicId,
            deletedAt: null,
            ...(dto.role ? { role: { code: dto.role } } : {}),
            ...(dto.q
                ? {
                    OR: [
                        { fullName: { contains: dto.q, mode: 'insensitive' } },
                        { email: { contains: dto.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                orderBy: { fullName: 'asc' },
                skip: dto.skip,
                take: dto.limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                    role: { select: { code: true, name: true } },
                    doctorProfile: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_dto_1.paginated)(data, total, dto);
    }
    async listDoctors(user, clinicIdParam) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, clinicIdParam);
        return this.prisma.user.findMany({
            where: {
                clinicId,
                deletedAt: null,
                status: 'ACTIVE',
                role: { code: 'DOCTOR' },
            },
            select: {
                id: true,
                fullName: true,
                doctorProfile: {
                    select: {
                        specialization: true,
                        consultationFee: true,
                        followUpFee: true,
                        avgConsultMinutes: true,
                    },
                },
            },
            orderBy: { fullName: 'asc' },
        });
    }
    async update(user, id, dto) {
        const target = await this.prisma.user.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: { role: true },
        });
        if (!target)
            throw new common_1.NotFoundException('User not found');
        let roleId;
        if (dto.roleCode && dto.roleCode !== target.role.code) {
            const role = await this.prisma.role.findFirst({
                where: {
                    code: dto.roleCode,
                    OR: [{ clinicId: null }, { clinicId: target.clinicId }],
                },
            });
            if (!role)
                throw new common_1.BadRequestException(`Unknown role: ${dto.roleCode}`);
            roleId = role.id;
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                fullName: dto.fullName,
                phone: dto.phone,
                status: dto.status,
                roleId,
                ...(dto.password
                    ? { passwordHash: await bcrypt.hash(dto.password, 10) }
                    : {}),
                ...(dto.doctorProfile
                    ? {
                        doctorProfile: {
                            upsert: {
                                create: dto.doctorProfile,
                                update: dto.doctorProfile,
                            },
                        },
                    }
                    : {}),
            },
            include: { role: true, doctorProfile: true },
        });
        this.audit.log(user, target.clinicId, {
            action: 'UPDATE',
            entity: 'User',
            entityId: id,
            newValues: { status: dto.status, role: dto.roleCode },
        });
        const { passwordHash: _p, ...safe } = updated;
        return safe;
    }
    async deactivate(user, id) {
        if (id === user.id)
            throw new common_1.BadRequestException('Cannot deactivate yourself');
        return this.update(user, id, { status: 'INACTIVE' });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map