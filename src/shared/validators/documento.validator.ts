import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isValidCPF } from './cpf.validator';
import { isValidCNPJ } from './cnpj.validator';

@ValidatorConstraint({ name: 'IsDocumentoValido', async: false })
export class IsDocumentoValido implements ValidatorConstraintInterface {
  validate(documento: string, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, unknown>;
    const tipoDocumento = obj['tipoDocumento'] as string;
    if (tipoDocumento === 'CPF') {
      return isValidCPF(documento);
    }
    if (tipoDocumento === 'CNPJ') {
      return isValidCNPJ(documento);
    }
    return false;
  }

  defaultMessage(): string {
    return 'Documento inválido para o tipo informado';
  }
}
