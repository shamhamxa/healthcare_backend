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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let NumberingService = class NumberingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async next(clinicId, scope) {
        const rows = await this.prisma.$queryRaw `
      INSERT INTO counters ("clinicId", scope, value)
      VALUES (${clinicId}, ${scope}, 1)
      ON CONFLICT ("clinicId", scope)
      DO UPDATE SET value = counters.value + 1
      RETURNING value`;
        return rows[0].value;
    }
    dateKey(date = new Date()) {
        return date.toISOString().slice(0, 10).replace(/-/g, '');
    }
    async nextMrn(clinicId, clinicCode) {
        const n = await this.next(clinicId, 'mrn');
        return `${clinicCode}-${String(n).padStart(6, '0')}`;
    }
    async nextVisitNumber(clinicId) {
        const key = this.dateKey();
        const n = await this.next(clinicId, `visit:${key}`);
        return `V-${key}-${String(n).padStart(4, '0')}`;
    }
    async nextToken(clinicId, doctorId) {
        return this.next(clinicId, `token:${this.dateKey()}:${doctorId}`);
    }
    async nextInvoiceNumber(clinicId) {
        const key = this.dateKey();
        const n = await this.next(clinicId, `invoice:${key}`);
        return `INV-${key}-${String(n).padStart(4, '0')}`;
    }
    async nextReceiptNumber(clinicId) {
        const key = this.dateKey();
        const n = await this.next(clinicId, `receipt:${key}`);
        return `RCPT-${key}-${String(n).padStart(4, '0')}`;
    }
};
exports.NumberingService = NumberingService;
exports.NumberingService = NumberingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NumberingService);
//# sourceMappingURL=numbering.service.js.map