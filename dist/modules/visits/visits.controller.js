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
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const visits_service_1 = require("./visits.service");
const visit_dto_1 = require("./dto/visit.dto");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let VisitsController = class VisitsController {
    visitsService;
    constructor(visitsService) {
        this.visitsService = visitsService;
    }
    create(user, dto) {
        return this.visitsService.create(user, dto);
    }
    list(user, dto) {
        return this.visitsService.list(user, dto);
    }
    diagnosisSuggestions(user, q) {
        return this.visitsService.diagnosisSuggestions(user, q);
    }
    findOne(user, id) {
        return this.visitsService.findOne(user, id);
    }
    saveAssessment(user, id, dto) {
        return this.visitsService.saveAssessment(user, id, dto);
    }
    startConsultation(user, id) {
        return this.visitsService.startConsultation(user, id);
    }
    saveConsultation(user, id, dto) {
        return this.visitsService.saveConsultation(user, id, dto);
    }
    completeConsultation(user, id) {
        return this.visitsService.completeConsultation(user, id);
    }
    sendForTest(user, id, dto) {
        return this.visitsService.sendForTest(user, id, dto.tests ?? []);
    }
    resumeFromTest(user, id) {
        return this.visitsService.resumeFromTest(user, id);
    }
    reopen(user, id) {
        return this.visitsService.reopen(user, id);
    }
    close(user, id, dto) {
        return this.visitsService.close(user, id, dto);
    }
    cancel(user, id, dto) {
        return this.visitsService.cancel(user, id, dto);
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('visits.create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, visit_dto_1.CreateVisitDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('visits.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, visit_dto_1.ListVisitsDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('diagnosis-suggestions'),
    (0, permissions_decorator_1.RequirePermissions)('visits.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "diagnosisSuggestions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('visits.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/assessment'),
    (0, permissions_decorator_1.RequirePermissions)('visits.assess'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, visit_dto_1.AssessmentDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "saveAssessment", null);
__decorate([
    (0, common_1.Post)(':id/start-consultation'),
    (0, permissions_decorator_1.RequirePermissions)('visits.consult'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "startConsultation", null);
__decorate([
    (0, common_1.Patch)(':id/consultation'),
    (0, permissions_decorator_1.RequirePermissions)('visits.consult'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, visit_dto_1.ConsultationDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "saveConsultation", null);
__decorate([
    (0, common_1.Post)(':id/complete-consultation'),
    (0, permissions_decorator_1.RequirePermissions)('visits.consult'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "completeConsultation", null);
__decorate([
    (0, common_1.Post)(':id/send-for-test'),
    (0, permissions_decorator_1.RequirePermissions)('visits.consult'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "sendForTest", null);
__decorate([
    (0, common_1.Post)(':id/resume-test'),
    (0, permissions_decorator_1.RequirePermissions)('visits.consult'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "resumeFromTest", null);
__decorate([
    (0, common_1.Post)(':id/reopen'),
    (0, permissions_decorator_1.RequirePermissions)('visits.consult'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "reopen", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, permissions_decorator_1.RequirePermissions)('visits.complete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, visit_dto_1.CloseVisitDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, permissions_decorator_1.RequirePermissions)('visits.cancel'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, visit_dto_1.CancelVisitDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "cancel", null);
exports.VisitsController = VisitsController = __decorate([
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [visits_service_1.VisitsService])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map