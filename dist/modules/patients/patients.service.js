"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PatientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const numbering_service_1 = require("../../prisma/numbering.service");
const audit_service_1 = require("../audit/audit.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let PatientsService = class PatientsService {
    static { PatientsService_1 = this; }
    prisma;
    numbering;
    audit;
    constructor(prisma, numbering, audit) {
        this.prisma = prisma;
        this.numbering = numbering;
        this.audit = audit;
    }
    static MAX_PATIENTS_PER_CNIC = 4;
    static MAX_PATIENTS_PER_PHONE = 4;
    async assertCnicCapacity(clinicId, cnic, excludePatientId) {
        const count = await this.prisma.patient.count({
            where: {
                clinicId,
                cnic,
                deletedAt: null,
                ...(excludePatientId ? { id: { not: excludePatientId } } : {}),
            },
        });
        if (count >= PatientsService_1.MAX_PATIENTS_PER_CNIC) {
            throw new common_1.BadRequestException(`This CNIC already has ${PatientsService_1.MAX_PATIENTS_PER_CNIC} registered patients (family limit reached)`);
        }
    }
    async assertPhoneCapacity(clinicId, phone, excludePatientId) {
        const count = await this.prisma.patient.count({
            where: {
                clinicId,
                phone,
                deletedAt: null,
                ...(excludePatientId ? { id: { not: excludePatientId } } : {}),
            },
        });
        if (count >= PatientsService_1.MAX_PATIENTS_PER_PHONE) {
            throw new common_1.BadRequestException(`This mobile number already has ${PatientsService_1.MAX_PATIENTS_PER_PHONE} registered patients (family limit reached)`);
        }
    }
    async findDuplicates(clinicId, cnic, phone) {
        const or = [];
        if (cnic?.trim())
            or.push({ cnic: cnic.trim() });
        if (phone?.trim())
            or.push({ phone: phone.trim() });
        if (or.length === 0)
            return [];
        return this.prisma.patient.findMany({
            where: { clinicId, deletedAt: null, OR: or },
            select: {
                id: true,
                mrn: true,
                fullName: true,
                phone: true,
                cnic: true,
                gender: true,
                dateOfBirth: true,
                city: true,
                extra: true,
            },
            take: 5,
        });
    }
    async assertSelfUnique(clinicId, phone, cnic) {
        const or = [];
        if (phone?.trim())
            or.push({ phone: phone.trim() });
        if (cnic?.trim())
            or.push({ cnic: cnic.trim() });
        if (or.length === 0)
            return;
        const existing = await this.prisma.patient.findFirst({
            where: {
                clinicId,
                deletedAt: null,
                OR: or,
                extra: { path: ['relation'], equals: 'SELF' },
            },
            select: { id: true, mrn: true, fullName: true, phone: true, cnic: true },
        });
        if (existing) {
            throw new common_1.ConflictException({
                message: `${existing.fullName} (${existing.mrn}) is already registered as ` +
                    `"myself" on this phone/CNIC. Search the patient and use check-in ` +
                    `for a token, or select a relation (son/daughter…) to register a ` +
                    `family member.`,
                selfExists: true,
                existing,
            });
        }
    }
    async create(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const emergency = dto.emergency === true;
        if (!emergency) {
            if (!dto.fullName?.trim()) {
                throw new common_1.BadRequestException('Patient name is required');
            }
            if (!dto.phone?.trim() && !dto.cnic?.trim()) {
                throw new common_1.BadRequestException('Mobile number or CNIC is required (at least one)');
            }
        }
        if (dto.phone?.trim()) {
            await this.assertPhoneCapacity(clinicId, dto.phone);
        }
        if (dto.cnic) {
            await this.assertCnicCapacity(clinicId, dto.cnic);
        }
        if (!emergency) {
            const relation = `${dto.extra?.['relation'] ?? 'SELF'}`
                .toUpperCase();
            if (relation === 'SELF') {
                await this.assertSelfUnique(clinicId, dto.phone, dto.cnic);
            }
            if (!dto.force) {
                const duplicates = await this.findDuplicates(clinicId, dto.cnic, dto.phone);
                if (duplicates.length > 0) {
                    throw new common_1.ConflictException({
                        message: 'Possible duplicate patient(s) found. Pass force=true to create anyway.',
                        duplicates,
                    });
                }
            }
        }
        const clinic = await this.prisma.clinic.findUniqueOrThrow({
            where: { id: clinicId },
            select: { code: true },
        });
        const mrn = await this.numbering.nextMrn(clinicId, clinic.code);
        const patient = await this.prisma.patient.create({
            data: {
                clinicId,
                mrn,
                fullName: dto.fullName?.trim() || `Emergency Patient ${mrn}`,
                phone: dto.phone,
                isTemporary: emergency,
                altPhone: dto.altPhone,
                email: dto.email,
                gender: dto.gender ?? 'OTHER',
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                bloodGroup: dto.bloodGroup,
                cnic: dto.cnic,
                address: dto.address,
                city: dto.city,
                emergencyContactName: dto.emergencyContactName,
                emergencyContactPhone: dto.emergencyContactPhone,
                emergencyContactRelation: dto.emergencyContactRelation,
                allergies: (dto.allergies ?? []),
                chronicDiseases: (dto.chronicDiseases ?? []),
                familyHistory: (dto.familyHistory ?? []),
                lifestyleNotes: (dto.lifestyleNotes ?? {}),
                extra: (dto.extra ?? {}),
            },
        });
        this.audit.log(user, clinicId, {
            action: 'CREATE',
            entity: 'Patient',
            entityId: patient.id,
            newValues: { mrn: patient.mrn, fullName: patient.fullName },
        });
        return patient;
    }
    async search(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const where = {
            clinicId,
            deletedAt: null,
            ...(dto.includeInactive ? {} : { isActive: true }),
            ...(user.roleCode === 'DOCTOR'
                ? { visits: { some: { doctorId: user.id, deletedAt: null } } }
                : {}),
            ...(dto.q
                ? {
                    OR: [
                        { fullName: { contains: dto.q, mode: 'insensitive' } },
                        { phone: { contains: dto.q } },
                        { altPhone: { contains: dto.q } },
                        { mrn: { contains: dto.q, mode: 'insensitive' } },
                        { cnic: { contains: dto.q } },
                    ],
                }
                : {}),
        };
        const today = (0, tenant_util_1.dayRange)();
        const [data, total] = await this.prisma.$transaction([
            this.prisma.patient.findMany({
                where,
                orderBy: dto.sortBy
                    ? { [dto.sortBy]: dto.sortOrder }
                    : { createdAt: 'desc' },
                skip: dto.skip,
                take: dto.limit,
                include: {
                    visits: {
                        where: {
                            visitDate: today,
                            status: { notIn: ['COMPLETED', 'CANCELLED'] },
                            deletedAt: null,
                        },
                        orderBy: { visitDate: 'desc' },
                        take: 1,
                        select: {
                            id: true,
                            visitNumber: true,
                            status: true,
                            token: { select: { tokenNumber: true } },
                        },
                    },
                },
            }),
            this.prisma.patient.count({ where }),
        ]);
        const shaped = data.map((p) => {
            const { visits, ...rest } = p;
            const activeVisit = visits[0] ?? null;
            return {
                ...rest,
                activeVisit,
                tokenNumber: activeVisit?.token
                    ?.tokenNumber ?? null,
            };
        });
        return (0, pagination_dto_1.paginated)(shaped, total, dto);
    }
    async findOne(user, id) {
        const patient = await this.prisma.patient.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: {
                _count: { select: { visits: true, appointments: true } },
            },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return patient;
    }
    async timeline(user, id) {
        const patient = await this.findOne(user, id);
        const visits = await this.prisma.visit.findMany({
            where: { patientId: id, deletedAt: null },
            orderBy: { visitDate: 'desc' },
            include: {
                doctor: { select: { id: true, fullName: true } },
                diagnoses: true,
                prescription: {
                    include: { items: { orderBy: { sortOrder: 'asc' } } },
                },
                invoice: {
                    select: { invoiceNumber: true, total: true, status: true },
                },
                followUp: true,
                attachments: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        category: true,
                        fileName: true,
                        mimeType: true,
                        createdAt: true,
                    },
                },
                token: { select: { tokenNumber: true } },
            },
        });
        return {
            patient,
            visits,
            stats: {
                totalVisits: visits.length,
                lastVisit: visits[0]?.visitDate ?? null,
            },
        };
    }
    async update(user, id, dto) {
        const existing = await this.findOne(user, id);
        const { force: _force, clinicId: _clinicId, emergency: _e, ...data } = dto;
        const isAdmin = user.roleCode === 'SUPER_ADMIN' || user.roleCode === 'CLINIC_ADMIN';
        const phoneChange = dto.phone !== undefined && !!existing.phone && dto.phone !== existing.phone;
        const cnicChange = dto.cnic !== undefined && !!existing.cnic && dto.cnic !== existing.cnic;
        if ((phoneChange || cnicChange) && !isAdmin) {
            throw new common_1.ForbiddenException('Only an admin can change a patient mobile number or CNIC');
        }
        if (dto.cnic && dto.cnic !== existing.cnic) {
            await this.assertCnicCapacity(existing.clinicId, dto.cnic, id);
        }
        if (dto.phone && dto.phone !== existing.phone) {
            await this.assertPhoneCapacity(existing.clinicId, dto.phone, id);
        }
        const nowPermanent = existing.isTemporary && !!(dto.cnic ?? existing.cnic);
        const patient = await this.prisma.patient.update({
            where: { id },
            data: {
                ...data,
                ...(nowPermanent ? { isTemporary: false } : {}),
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
                allergies: dto.allergies,
                chronicDiseases: dto.chronicDiseases,
                familyHistory: dto.familyHistory,
                lifestyleNotes: dto.lifestyleNotes,
                extra: dto.extra,
            },
        });
        this.audit.log(user, existing.clinicId, {
            action: 'UPDATE',
            entity: 'Patient',
            entityId: id,
            oldValues: { fullName: existing.fullName, phone: existing.phone },
            newValues: { fullName: patient.fullName, phone: patient.phone },
        });
        return patient;
    }
    async softDelete(user, id) {
        const existing = await this.findOne(user, id);
        await this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        this.audit.log(user, existing.clinicId, {
            action: 'DELETE',
            entity: 'Patient',
            entityId: id,
        });
        return { success: true };
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = PatientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        numbering_service_1.NumberingService,
        audit_service_1.AuditService])
], PatientsService);
//# sourceMappingURL=patients.service.js.map