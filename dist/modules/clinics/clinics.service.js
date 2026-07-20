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
exports.ClinicsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let ClinicsService = class ClinicsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async create(user, dto) {
        if (user.roleCode !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only super admin can create clinics');
        }
        const adminRole = await this.prisma.role.findFirstOrThrow({
            where: { code: 'CLINIC_ADMIN', clinicId: null },
        });
        const clinic = await this.prisma.clinic.create({
            data: {
                name: dto.name,
                code: dto.code.toUpperCase(),
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                city: dto.city,
                country: dto.country,
                timezone: dto.timezone ?? 'Asia/Karachi',
                users: {
                    create: {
                        roleId: adminRole.id,
                        fullName: dto.admin.fullName,
                        email: dto.admin.email.toLowerCase(),
                        phone: dto.admin.phone,
                        passwordHash: await bcrypt.hash(dto.admin.password, 10),
                    },
                },
            },
            include: {
                users: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });
        this.audit.log(user, clinic.id, {
            action: 'CREATE',
            entity: 'Clinic',
            entityId: clinic.id,
            newValues: { name: clinic.name, code: clinic.code },
        });
        return clinic;
    }
    async list(user) {
        if (user.roleCode !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only super admin can list all clinics');
        }
        return this.prisma.clinic.findMany({
            where: { deletedAt: null },
            include: { _count: { select: { users: true, patients: true, visits: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findMine(user, id) {
        const clinicId = user.clinicId ?? id;
        if (!clinicId)
            throw new common_1.NotFoundException('No clinic in scope');
        if (user.clinicId && id && id !== user.clinicId) {
            throw new common_1.ForbiddenException('Cross-tenant access denied');
        }
        const clinic = await this.prisma.clinic.findFirst({
            where: { id: clinicId, deletedAt: null },
            include: {
                branches: { where: { isActive: true } },
                _count: { select: { users: true, patients: true } },
            },
        });
        if (!clinic)
            throw new common_1.NotFoundException('Clinic not found');
        return clinic;
    }
    async update(user, id, dto) {
        if (user.clinicId && user.clinicId !== id) {
            throw new common_1.ForbiddenException('Cross-tenant access denied');
        }
        const { settings, ...rest } = dto;
        const clinic = await this.prisma.clinic.update({
            where: { id },
            data: {
                ...rest,
                ...(settings ? { settings: settings } : {}),
            },
        });
        this.audit.log(user, id, {
            action: 'UPDATE',
            entity: 'Clinic',
            entityId: id,
            newValues: rest,
        });
        return clinic;
    }
    async roles(user) {
        return this.prisma.role.findMany({
            where: {
                OR: [{ clinicId: null }, ...(user.clinicId ? [{ clinicId: user.clinicId }] : [])],
                NOT: { code: 'SUPER_ADMIN' },
            },
            include: {
                rolePermissions: { include: { permission: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
};
exports.ClinicsService = ClinicsService;
exports.ClinicsService = ClinicsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ClinicsService);
//# sourceMappingURL=clinics.service.js.map