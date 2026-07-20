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
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const queue_service_1 = require("./queue.service");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
class CallNextDto {
    queueType;
    doctorId;
    clinicId;
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.QueueType),
    __metadata("design:type", String)
], CallNextDto.prototype, "queueType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CallNextDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CallNextDto.prototype, "clinicId", void 0);
class TransferDto {
    queueType;
    doctorId;
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.QueueType),
    __metadata("design:type", String)
], TransferDto.prototype, "queueType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TransferDto.prototype, "doctorId", void 0);
let QueueController = class QueueController {
    queueService;
    constructor(queueService) {
        this.queueService = queueService;
    }
    board(user, queueType, doctorId, date, clinicId) {
        return this.queueService.board(user, { queueType, doctorId, date, clinicId });
    }
    callNext(user, dto) {
        return this.queueService.callNext(user, dto);
    }
    call(user, id) {
        return this.queueService.setStatus(user, id, client_1.TokenStatus.CALLED);
    }
    skip(user, id) {
        return this.queueService.setStatus(user, id, client_1.TokenStatus.SKIPPED);
    }
    recall(user, id) {
        return this.queueService.setStatus(user, id, client_1.TokenStatus.RECALLED);
    }
    complete(user, id) {
        return this.queueService.setStatus(user, id, client_1.TokenStatus.COMPLETED);
    }
    uncall(user, id) {
        return this.queueService.setStatus(user, id, client_1.TokenStatus.WAITING);
    }
    transfer(user, id, dto) {
        return this.queueService.transfer(user, id, dto);
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('queue.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('queueType')),
    __param(2, (0, common_1.Query)('doctorId')),
    __param(3, (0, common_1.Query)('date')),
    __param(4, (0, common_1.Query)('clinicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "board", null);
__decorate([
    (0, common_1.Post)('call-next'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CallNextDto]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "callNext", null);
__decorate([
    (0, common_1.Post)('tokens/:id/call'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "call", null);
__decorate([
    (0, common_1.Post)('tokens/:id/skip'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "skip", null);
__decorate([
    (0, common_1.Post)('tokens/:id/recall'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "recall", null);
__decorate([
    (0, common_1.Post)('tokens/:id/complete'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)('tokens/:id/uncall'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "uncall", null);
__decorate([
    (0, common_1.Post)('tokens/:id/transfer'),
    (0, permissions_decorator_1.RequirePermissions)('queue.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, TransferDto]),
    __metadata("design:returntype", void 0)
], QueueController.prototype, "transfer", null);
exports.QueueController = QueueController = __decorate([
    (0, common_1.Controller)('queue'),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], QueueController);
//# sourceMappingURL=queue.controller.js.map