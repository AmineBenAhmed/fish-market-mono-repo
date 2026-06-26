import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: string[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);
