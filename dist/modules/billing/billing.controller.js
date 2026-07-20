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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const billing_dto_1 = require("./dto/billing.dto");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let BillingController = class BillingController {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    list(user, dto) {
        return this.billingService.list(user, dto);
    }
    findOne(user, id) {
        return this.billingService.findOne(user, id);
    }
    update(user, id, dto) {
        return this.billingService.update(user, id, dto);
    }
    recordPayment(user, id, dto) {
        return this.billingService.recordPayment(user, id, dto);
    }
    receipt(user, id) {
        return this.billingService.receipt(user, id);
    }
    refund(user, id, dto) {
        return this.billingService.refund(user, id, dto);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('invoices'),
    (0, permissions_decorator_1.RequirePermissions)('billing.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, billing_dto_1.ListInvoicesDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, permissions_decorator_1.RequirePermissions)('billing.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('invoices/:id'),
    (0, permissions_decorator_1.RequirePermissions)('billing.collect'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, billing_dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('invoices/:id/payments'),
    (0, permissions_decorator_1.RequirePermissions)('billing.collect'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, billing_dto_1.RecordPaymentDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)('payments/:id/receipt'),
    (0, permissions_decorator_1.RequirePermissions)('billing.read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "receipt", null);
__decorate([
    (0, common_1.Post)('payments/:id/refund'),
    (0, permissions_decorator_1.RequirePermissions)('billing.refund'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, billing_dto_1.RefundDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "refund", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map