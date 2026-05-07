import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @Public - Mark routes as public (bypasses JWT guard)
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * @Roles - Mark routes requiring specific roles
 * Usage: @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * @Branch - Mark routes requiring branch access verification
 * Usage: @Branch()
 */
export const Branch = () => SetMetadata('branch', true);

/**
 * @CurrentUser - Extract current user from request
 * Usage: @CurrentUser() user: any
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

/**
 * @CurrentBranch - Extract branch ID from request
 * Usage: @CurrentBranch() branchId: string
 */
export const CurrentBranch = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.params.branchId || request.body?.branchId || request.query?.branchId;
});

/**
 * @Throttle - Custom throttle decorator for rate limiting
 * Usage: @Throttle(5, 60) - 5 requests per 60 seconds
 */
export const Throttle = (requestsLimit: number, secondsWindow: number) =>
  SetMetadata('throttle', { requestsLimit, secondsWindow });
