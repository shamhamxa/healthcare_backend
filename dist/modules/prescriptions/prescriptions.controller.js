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
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const prescriptions_service_1 = require("./prescriptions.service");
const prescription_dto_1 = require("./dto/prescription.dto");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PrescriptionsController = class PrescriptionsController {
    prescriptionsService;
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    upsert(user, visitId, dto) {
        return this.prescriptionsService.upsertForVisit(user, visitId, dto);
    }
    find(user, visitId) {
        return this.prescriptionsService.findByVisit(user, visitId);
    }
    sign(user, visitId) {
        return this.prescriptionsService.sign(user, visitId);
    }
    print(user, visitId) {
        return this.prescriptionsService.printPayload(user, visitId);
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Put)(),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('visitId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, prescription_dto_1.UpsertPrescriptionDto]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('visitId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "find", null);
__decorate([
    (0, common_1.Post)('sign'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.sign'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('visitId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "sign", null);
__decorate([
    (0, common_1.Get)('print'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('visitId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PrescriptionsController.prototype, "print", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, common_1.Controller)('visits/:visitId/prescription'),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map