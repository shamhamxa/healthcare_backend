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
exports.MedicinesController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const medicines_service_1 = require("./medicines.service");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
class CreateMedicineDto {
    name;
    genericName;
    form;
    strength;
    manufacturer;
    clinicId;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "genericName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "form", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "strength", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "manufacturer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "clinicId", void 0);
class FavoriteDto {
    medicineId;
    defaults;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FavoriteDto.prototype, "medicineId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FavoriteDto.prototype, "defaults", void 0);
class TemplateDto {
    name;
    items;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], TemplateDto.prototype, "items", void 0);
let MedicinesController = class MedicinesController {
    medicinesService;
    constructor(medicinesService) {
        this.medicinesService = medicinesService;
    }
    search(user, q, limit) {
        return this.medicinesService.search(user, q, limit ? parseInt(limit, 10) : 20);
    }
    create(user, dto) {
        return this.medicinesService.create(user, dto);
    }
    update(user, id, dto) {
        return this.medicinesService.update(user, id, dto);
    }
    favorites(user) {
        return this.medicinesService.listFavorites(user);
    }
    addFavorite(user, dto) {
        return this.medicinesService.addFavorite(user, dto.medicineId, dto.defaults);
    }
    removeFavorite(user, medicineId) {
        return this.medicinesService.removeFavorite(user, medicineId);
    }
    mostUsed(user, limit) {
        return this.medicinesService.mostUsed(user, limit ? parseInt(limit, 10) : 15);
    }
    templates(user) {
        return this.medicinesService.listTemplates(user);
    }
    createTemplate(user, dto) {
        return this.medicinesService.createTemplate(user, dto);
    }
    updateTemplate(user, id, dto) {
        return this.medicinesService.updateTemplate(user, id, dto);
    }
    deleteTemplate(user, id) {
        return this.medicinesService.deleteTemplate(user, id);
    }
    useTemplate(user, id) {
        return this.medicinesService.touchTemplate(user, id);
    }
};
exports.MedicinesController = MedicinesController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('medicines.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "search", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('medicines.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateMedicineDto]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('medicines.manage'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('favorites/mine'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "favorites", null);
__decorate([
    (0, common_1.Post)('favorites'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, FavoriteDto]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.Delete)('favorites/:medicineId'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('medicineId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.Get)('most-used/mine'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "mostUsed", null);
__decorate([
    (0, common_1.Get)('templates/mine'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "templates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, TemplateDto]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Patch)('templates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/use'),
    (0, permissions_decorator_1.RequirePermissions)('prescriptions.write'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MedicinesController.prototype, "useTemplate", null);
exports.MedicinesController = MedicinesController = __decorate([
    (0, common_1.Controller)('medicines'),
    __metadata("design:paramtypes", [medicines_service_1.MedicinesService])
], MedicinesController);
//# sourceMappingURL=medicines.controller.js.map