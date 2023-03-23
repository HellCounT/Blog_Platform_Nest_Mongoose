import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    if (!request.userId) throw new Error('No user id in request or payload');
    return request.userId as string;
  },
);
