import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLE_PERMISSIONS } from '../../modules/auth/constants/permissions';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const userPermissions = ROLE_PERMISSIONS[user.role as string] || [];

    if (userPermissions.includes('*')) {
      return true;
    }

    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}
