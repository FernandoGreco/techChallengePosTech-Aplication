import { IsDocumentoValido } from '../documento.validator';
import { IsPlacaValida } from '../placa-validator.constraint';

describe('IsDocumentoValido', () => {
  const validator = new IsDocumentoValido();

  it('deve validar CPF quando tipoDocumento é CPF', () => {
    const result = validator.validate('12345678909', {
      object: { tipoDocumento: 'CPF' },
    } as any);
    expect(result).toBe(true);
  });

  it('deve validar CNPJ quando tipoDocumento é CNPJ', () => {
    const result = validator.validate('11222333000181', {
      object: { tipoDocumento: 'CNPJ' },
    } as any);
    expect(result).toBe(true);
  });

  it('deve retornar falso para tipoDocumento desconhecido', () => {
    const result = validator.validate('12345678909', {
      object: { tipoDocumento: 'XYZ' },
    } as any);
    expect(result).toBe(false);
  });

  it('deve retornar mensagem padrão de erro', () => {
    expect(validator.defaultMessage()).toBe(
      'Documento inválido para o tipo informado',
    );
  });
});

describe('IsPlacaValida', () => {
  const validator = new IsPlacaValida();

  it('deve validar placa no formato antigo', () => {
    expect(validator.validate('ABC-1234')).toBe(true);
  });

  it('deve validar placa no formato Mercosul', () => {
    expect(validator.validate('ABC1D23')).toBe(true);
  });

  it('deve rejeitar placa inválida', () => {
    expect(validator.validate('INVALIDA')).toBe(false);
  });

  it('deve retornar mensagem de erro padrão', () => {
    expect(validator.defaultMessage()).toBe(
      'Placa inválida. Use o formato ABC-1234 ou ABC1D23 (Mercosul)',
    );
  });
});
