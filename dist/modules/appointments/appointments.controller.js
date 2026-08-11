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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const appointments_service_1 = require("./appointments.service");
const appointment_dto_1 = require("./dto/appointment.dto");
const visit_dto_1 = require("../visits/dto/visit.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CheckInBodyDto {
    payment;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => visit_dto_1.CheckInPaymentDto),
    __metadata("design:type", visit_dto_1.CheckInPaymentDto)
], CheckInBodyDto.prototype, "payment", void 0);
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AppointmentsController = class AppointmentsController {
    appointmentsService;
    constructor(appointmentsService) {
        this.appointmentsService = appointmentsService;
    }
    create(user, dto) {
        return this.appointmentsService.create(user, dto);
    }
    list(user, dto) {
        return this.appointmentsService.list(user, dto);
    }
    slots(user, dto) {
        return this.appointmentsService.slots(user, dto);
    }
    findOne(user, id) {
        return this.appointmentsService.findOne(user, id);
    }
    checkIn(user, id, dto) {
        return this.appointmentsService.checkIn(user, id, dto.payment);
    }
    reschedule(user, id, dto) {
        return this.appointmentsService.reschedule(user, id, dto);
    }
    cancel(user, id, dto) {
        return this.appointmentsService.cancel(user, id, dto);
    }
    markNoShow(user, id) {
        return this.appointmentsService.markNoShow(user, id);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('appointments.create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('appointments.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, appointment_dto_1.ListAppointmentsDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, permissions_decorator_1.RequirePermissions)('appointments.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, appointment_dto_1.SlotsQueryDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "slots", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('appointments.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/check-in'),
    (0, permissions_decorator_1.RequirePermissions)('visits.create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, CheckInBodyDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)(':id/reschedule'),
    (0, permissions_decorator_1.RequirePermissions)('appointments.update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, appointment_dto_1.RescheduleAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.RequirePermissions)('appointments.cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, appointment_dto_1.CancelAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/no-show'),
    (0, permissions_decorator_1.RequirePermissions)('appointments.update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "markNoShow", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.Controller)('appointments'),
    __metadata("design:paramtypes", [appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map