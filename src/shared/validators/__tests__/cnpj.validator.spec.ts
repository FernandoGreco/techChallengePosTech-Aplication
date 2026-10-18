import { isValidCNPJ } from '../cnpj.validator';

describe('isValidCNPJ', () => {
  it('deve validar CNPJ correto', () => {
    expect(isValidCNPJ('11222333000181')).toBe(true);
  });

  it('deve rejeitar CNPJ com dígitos repetidos', () => {
    expect(isValidCNPJ('11111111111111')).toBe(false);
  });

  it('deve rejeitar CNPJ com tamanho incorreto', () => {
    expect(isValidCNPJ('1122233300018')).toBe(false);
    expect(isValidCNPJ('112223330001811')).toBe(false);
  });

  it('deve rejeitar CNPJ inválido', () => {
    expect(isValidCNPJ('11222333000182')).toBe(false);
  });

  it('deve validar CNPJ com formatação', () => {
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
  });
});
