import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Atomic per-clinic sequence generator backed by the counters table.
 * Uses INSERT ... ON CONFLICT DO UPDATE so concurrent requests never
 * receive the same number.
 */
@Injectable()
export class NumberingService {
  constructor(private readonly prisma: PrismaService) {}

  async next(clinicId: string, scope: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ value: number }[]>`
      INSERT INTO counters ("clinicId", scope, value)
      VALUES (${clinicId}, ${scope}, 1)
      ON CONFLICT ("clinicId", scope)
      DO UPDATE SET value = counters.value + 1
      RETURNING value`;
    return rows[0].value;
  }

  private dateKey(date = new Date()): string {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  async nextMrn(clinicId: string, clinicCode: string): Promise<string> {
    const n = await this.next(clinicId, 'mrn');
    return `${clinicCode}-${String(n).padStart(6, '0')}`;
  }

  async nextVisitNumber(clinicId: string): Promise<string> {
    const key = this.dateKey();
    const n = await this.next(clinicId, `visit:${key}`);
    return `V-${key}-${String(n).padStart(4, '0')}`;
  }

  async nextToken(clinicId: string, doctorId: string): Promise<number> {
    return this.next(clinicId, `token:${this.dateKey()}:${doctorId}`);
  }

  async nextInvoiceNumber(clinicId: string): Promise<string> {
    const key = this.dateKey();
    const n = await this.next(clinicId, `invoice:${key}`);
    return `INV-${key}-${String(n).padStart(4, '0')}`;
  }

  async nextReceiptNumber(clinicId: string): Promise<string> {
    const key = this.dateKey();
    const n = await this.next(clinicId, `receipt:${key}`);
    return `RCPT-${key}-${String(n).padStart(4, '0')}`;
  }
}
