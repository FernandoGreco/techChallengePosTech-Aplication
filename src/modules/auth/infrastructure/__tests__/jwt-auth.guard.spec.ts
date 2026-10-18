import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('deve liberar rota pública sem chamar super', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as any;
    const guard = new JwtAuthGuard(reflector);
    const context = { getHandler: jest.fn(), getClass: jest.fn() } as any;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      expect.any(String),
      [context.getHandler(), context.getClass()],
    );
  });

  it('deve delegar para super quando não for rota pública', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as any;
    const guard = new JwtAuthGuard(reflector);
    const context = { getHandler: jest.fn(), getClass: jest.fn() } as any;

    const parentPrototype = Object.getPrototypeOf(Object.getPrototypeOf(guard));
    const spy = jest
      .spyOn(parentPrototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(spy).toHaveBeenCalledWith(context);
  });
});
