export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    isSuperAdmin: boolean;
    primaryBranchId: string;
    roles: Array<{
      branchId: string;
      branchName: string;
      roleCode: string;
      roleName: string;
    }>;
  };
}
