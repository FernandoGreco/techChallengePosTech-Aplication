import { isValidPlaca } from '../placa.validator';

describe('isValidPlaca', () => {
  it('deve validar placa formato antigo (ABC-1234)', () => {
    expect(isValidPlaca('ABC-1234')).toBe(true);
  });

  it('deve validar placa formato antigo sem hífen', () => {
    expect(isValidPlaca('ABC1234')).toBe(true);
  });

  it('deve validar placa formato Mercosul (ABC1D23)', () => {
    expect(isValidPlaca('ABC1D23')).toBe(true);
  });

  it('deve rejeitar placa com formato inválido', () => {
    expect(isValidPlaca('AB12345')).toBe(false);
    expect(isValidPlaca('1234ABC')).toBe(false);
    expect(isValidPlaca('ABCDEFG')).toBe(false);
  });

  it('deve aceitar placa em minúsculas', () => {
    expect(isValidPlaca('abc1d23')).toBe(true);
  });
});
