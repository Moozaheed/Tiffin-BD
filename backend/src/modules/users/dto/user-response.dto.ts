export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  primaryBranchId: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  branchRoles?: Array<{
    branchId: string;
    branchName: string;
    roleCode: string;
    roleName: string;
  }>;
}

export class PaginatedUsersResponseDto {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
