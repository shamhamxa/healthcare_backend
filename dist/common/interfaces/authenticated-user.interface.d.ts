export interface AuthenticatedUser {
    id: string;
    email: string;
    fullName: string;
    clinicId: string | null;
    branchId: string | null;
    roleCode: string;
    permissions: string[];
}
