import { IsDocumentoValido } from '../documento.validator';

describe('IsDocumentoValido', () => {
  const validator = new IsDocumentoValido();

  it('valida CPF quando tipoDocumento é CPF', () => {
    const args: any = { object: { tipoDocumento: 'CPF' } };
    expect(validator.validate('12345678909', args)).toBe(true);
    expect(validator.validate('11111111111', args)).toBe(false);
  });

  it('valida CNPJ quando tipoDocumento é CNPJ', () => {
    const args: any = { object: { tipoDocumento: 'CNPJ' } };
    expect(validator.validate('11222333000181', args)).toBe(true);
    expect(validator.validate('11111111111111', args)).toBe(false);
  });

  it('retorna false para tipo de documento desconhecido', () => {
    const args: any = { object: { tipoDocumento: 'OUTRO' } };
    expect(validator.validate('whatever', args)).toBe(false);
  });
});
