import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../interfaces';

export const CurrentUser = createParamDecorator(
  (data: keyof Omit<JwtPayload, 'iat' | 'exp'> | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);
