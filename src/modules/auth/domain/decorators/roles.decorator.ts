import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type ApiRole = 'cliente' | 'staff';

export const Roles = (...roles: ApiRole[]) => SetMetadata(ROLES_KEY, roles);
