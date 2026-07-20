"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
const auth_module_1 = require("./modules/auth/auth.module");
const audit_module_1 = require("./modules/audit/audit.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const users_module_1 = require("./modules/users/users.module");
const clinics_module_1 = require("./modules/clinics/clinics.module");
const patients_module_1 = require("./modules/patients/patients.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const visits_module_1 = require("./modules/visits/visits.module");
const queue_module_1 = require("./modules/queue/queue.module");
const medicines_module_1 = require("./modules/medicines/medicines.module");
const prescriptions_module_1 = require("./modules/prescriptions/prescriptions.module");
const billing_module_1 = require("./modules/billing/billing.module");
const follow_ups_module_1 = require("./modules/follow-ups/follow-ups.module");
const attachments_module_1 = require("./modules/attachments/attachments.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            clinics_module_1.ClinicsModule,
            patients_module_1.PatientsModule,
            appointments_module_1.AppointmentsModule,
            visits_module_1.VisitsModule,
            queue_module_1.QueueModule,
            medicines_module_1.MedicinesModule,
            prescriptions_module_1.PrescriptionsModule,
            billing_module_1.BillingModule,
            follow_ups_module_1.FollowUpsModule,
            attachments_module_1.AttachmentsModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
            { provide: core_1.APP_FILTER, useClass: prisma_exception_filter_1.PrismaExceptionFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map