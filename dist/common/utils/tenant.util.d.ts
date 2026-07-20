import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
export declare function resolveClinicId(user: AuthenticatedUser, requestedClinicId?: string): string;
export declare function localDateLabel(date: Date): string;
export declare function dayRange(date?: string | Date): {
    gte: Date;
    lt: Date;
};
