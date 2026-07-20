export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  clinicId: string | null; // null => super admin (cross-tenant)
  branchId: string | null;
  roleCode: string;
  permissions: string[];
}
