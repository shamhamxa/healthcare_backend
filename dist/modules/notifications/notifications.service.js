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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = exports.NOTIFICATIONS_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
exports.NOTIFICATIONS_QUEUE = 'notifications';
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    queue;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async enqueue(input) {
        const notification = await this.prisma.notification.create({
            data: {
                clinicId: input.clinicId,
                patientId: input.patientId,
                userId: input.userId,
                type: input.type,
                channel: input.channel,
                title: input.title,
                body: input.body,
                payload: (input.payload ?? {}),
                scheduledAt: input.scheduledAt,
                status: 'PENDING',
            },
        });
        if (this.queue) {
            const delay = input.scheduledAt
                ? Math.max(0, input.scheduledAt.getTime() - Date.now())
                : 0;
            try {
                await this.queue.add('send', { notificationId: notification.id }, { delay, attempts: 3, backoff: { type: 'exponential', delay: 30_000 } });
                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: { status: 'QUEUED' },
                });
            }
            catch (err) {
                this.logger.warn(`Queue unavailable, notification stays PENDING: ${err}`);
            }
        }
        return notification;
    }
    async list(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const where = {
            clinicId,
            ...(opts.status ? { status: opts.status } : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (opts.page - 1) * opts.limit,
                take: opts.limit,
                include: { patient: { select: { id: true, fullName: true, phone: true } } },
            }),
            this.prisma.notification.count({ where }),
        ]);
        return { data, meta: { total, page: opts.page, limit: opts.limit } };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, bullmq_1.InjectQueue)(exports.NOTIFICATIONS_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map