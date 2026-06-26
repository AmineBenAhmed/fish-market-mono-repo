import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { PERMISSIONS_KEY } from '../guards/permissions.guard';

export const RequirePermission = (...permissions: string[]): CustomDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
