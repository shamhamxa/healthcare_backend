import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Resolve the clinic a request operates on. Regular users are locked to
 * their own clinic; super admins may target any clinic via explicit param.
 */
export function resolveClinicId(
  user: AuthenticatedUser,
  requestedClinicId?: string,
): string {
  if (user.clinicId) {
    if (requestedClinicId && requestedClinicId !== user.clinicId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    return user.clinicId;
  }
  if (!requestedClinicId) {
    throw new ForbiddenException(
      'Super admin must specify clinicId for this operation',
    );
  }
  return requestedClinicId;
}

/** Local-date label (YYYY-MM-DD) without UTC shifting. */
export function localDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Day boundaries for "today" queries. */
export function dayRange(date?: string | Date): { gte: Date; lt: Date } {
  const d = date ? new Date(date) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
}
