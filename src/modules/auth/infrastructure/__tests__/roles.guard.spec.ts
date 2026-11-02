import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { IS_PUBLIC_KEY } from '../../domain/decorators/public.decorator';
import { ROLES_KEY } from '../../domain/decorators/roles.decorator';

const makeContext = (user?: unknown) =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('deve exigir staff por padrão nas rotas autenticadas', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(
      guard.canActivate(makeContext({ id: 'staff-1', tipo: 'staff' })),
    ).toBe(true);
    expect(
      guard.canActivate(makeContext({ id: 'cliente-1', tipo: 'cliente' })),
    ).toBe(false);
  });

  it('deve permitir cliente em rota explicitamente autorizada', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === ROLES_KEY) return ['cliente', 'staff'] as never;
      return undefined;
    });

    expect(
      guard.canActivate(makeContext({ id: 'cliente-1', tipo: 'cliente' })),
    ).toBe(true);
  });

  it('deve permitir rota marcada como pública sem usuário autenticado', () => {
    reflector.getAllAndOverride.mockImplementation((key) =>
      key === IS_PUBLIC_KEY ? true : undefined,
    );

    expect(guard.canActivate(makeContext())).toBe(true);
  });
});
