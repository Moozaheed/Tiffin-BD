import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredBranch = this.reflector.getAllAndOverride<string>('branch', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredBranch) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const branchParam = request.params.branchId || request.body?.branchId || request.query?.branchId;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.branchIds || user.branchIds.length === 0) {
      throw new ForbiddenException('User has no branch assignments');
    }

    if (branchParam && !user.branchIds.includes(branchParam)) {
      throw new ForbiddenException(
        `User does not have access to branch ${branchParam}. Accessible branches: ${user.branchIds.join(', ')}`,
      );
    }

    return true;
  }
}
