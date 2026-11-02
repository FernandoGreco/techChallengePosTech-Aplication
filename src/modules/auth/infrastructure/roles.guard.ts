import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../domain/decorators/public.decorator';
import { ApiRole, ROLES_KEY } from '../domain/decorators/roles.decorator';
import { IAuthenticatedUser } from '../domain/jwt-payload.types';

interface AuthenticatedRequest {
  user?: IAuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    if (isPublic) return true;

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) return false;

    const allowedRoles = this.reflector.getAllAndOverride<ApiRole[]>(
      ROLES_KEY,
      targets,
    ) ?? ['staff'];

    return allowedRoles.some((role) => {
      if (role === 'cliente') return user.tipo === 'cliente';
      return user.tipo === 'staff';
    });
  }
}
