import { PrismaService } from './prisma.service';
export declare class NumberingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    next(clinicId: string, scope: string): Promise<number>;
    private dateKey;
    nextMrn(clinicId: string, clinicCode: string): Promise<string>;
    nextVisitNumber(clinicId: string): Promise<string>;
    nextToken(clinicId: string, doctorId: string): Promise<number>;
    nextInvoiceNumber(clinicId: string): Promise<string>;
    nextReceiptNumber(clinicId: string): Promise<string>;
}
