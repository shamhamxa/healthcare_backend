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
exports.FollowUpsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const follow_ups_service_1 = require("./follow-ups.service");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
class ListFollowUpsDto extends pagination_dto_1.PaginationDto {
    status;
    due;
    doctorId;
    clinicId;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FollowUpStatus),
    __metadata("design:type", String)
], ListFollowUpsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['today', 'overdue', 'upcoming']),
    __metadata("design:type", String)
], ListFollowUpsDto.prototype, "due", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ListFollowUpsDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListFollowUpsDto.prototype, "clinicId", void 0);
class BookFollowUpDto {
    scheduledAt;
}
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BookFollowUpDto.prototype, "scheduledAt", void 0);
class SetStatusDto {
    status;
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.FollowUpStatus),
    __metadata("design:type", String)
], SetStatusDto.prototype, "status", void 0);
let FollowUpsController = class FollowUpsController {
    followUpsService;
    constructor(followUpsService) {
        this.followUpsService = followUpsService;
    }
    list(user, dto) {
        return this.followUpsService.list(user, dto);
    }
    book(user, id, dto) {
        return this.followUpsService.book(user, id, dto.scheduledAt);
    }
    remind(user, id) {
        return this.followUpsService.remind(user, id);
    }
    setStatus(user, id, dto) {
        return this.followUpsService.setStatus(user, id, dto.status);
    }
};
exports.FollowUpsController = FollowUpsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('followups.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ListFollowUpsDto]),
    __metadata("design:returntype", void 0)
], FollowUpsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/book'),
    (0, permissions_decorator_1.RequirePermissions)('followups.manage', 'appointments.create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, BookFollowUpDto]),
    __metadata("design:returntype", void 0)
], FollowUpsController.prototype, "book", null);
__decorate([
    (0, common_1.Post)(':id/remind'),
    (0, permissions_decorator_1.RequirePermissions)('followups.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FollowUpsController.prototype, "remind", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('followups.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, SetStatusDto]),
    __metadata("design:returntype", void 0)
], FollowUpsController.prototype, "setStatus", null);
exports.FollowUpsController = FollowUpsController = __decorate([
    (0, common_1.Controller)('follow-ups'),
    __metadata("design:paramtypes", [follow_ups_service_1.FollowUpsService])
], FollowUpsController);
//# sourceMappingURL=follow-ups.controller.js.map