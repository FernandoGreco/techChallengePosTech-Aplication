import { JwtStrategy } from '../jwt.strategy';

describe('JwtStrategy', () => {
  it('deve validar payload JWT', () => {
    const strategy = new JwtStrategy();
    const result = strategy.validate({
      sub: 'user-1',
      email: 'teste@exemplo.com',
      papel: 'ADMIN',
    });

    expect(result).toEqual({
      id: 'user-1',
      email: 'teste@exemplo.com',
      papel: 'ADMIN',
    });
  });
});
