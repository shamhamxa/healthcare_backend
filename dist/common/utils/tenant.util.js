"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveClinicId = resolveClinicId;
exports.localDateLabel = localDateLabel;
exports.dayRange = dayRange;
const common_1 = require("@nestjs/common");
function resolveClinicId(user, requestedClinicId) {
    if (user.clinicId) {
        if (requestedClinicId && requestedClinicId !== user.clinicId) {
            throw new common_1.ForbiddenException('Cross-tenant access denied');
        }
        return user.clinicId;
    }
    if (!requestedClinicId) {
        throw new common_1.ForbiddenException('Super admin must specify clinicId for this operation');
    }
    return requestedClinicId;
}
function localDateLabel(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function dayRange(date) {
    const d = date ? new Date(date) : new Date();
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { gte: start, lt: end };
}
//# sourceMappingURL=tenant.util.js.map