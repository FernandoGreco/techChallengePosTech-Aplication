import { isValidCPF } from '../cpf.validator';

describe('isValidCPF', () => {
  it('deve validar CPF correto', () => {
    expect(isValidCPF('12345678909')).toBe(true);
  });

  it('deve rejeitar CPF com dígitos repetidos', () => {
    expect(isValidCPF('11111111111')).toBe(false);
    expect(isValidCPF('00000000000')).toBe(false);
  });

  it('deve rejeitar CPF com tamanho incorreto', () => {
    expect(isValidCPF('1234567890')).toBe(false);
    expect(isValidCPF('123456789012')).toBe(false);
  });

  it('deve rejeitar CPF inválido', () => {
    expect(isValidCPF('12345678901')).toBe(false);
  });

  it('deve validar CPF com formatação', () => {
    expect(isValidCPF('123.456.789-09')).toBe(true);
  });
});
