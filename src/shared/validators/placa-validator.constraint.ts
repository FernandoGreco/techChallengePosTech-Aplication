import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidPlaca } from './placa.validator';

@ValidatorConstraint({ name: 'IsPlacaValida', async: false })
export class IsPlacaValida implements ValidatorConstraintInterface {
  validate(placa: string): boolean {
    return isValidPlaca(placa);
  }

  defaultMessage(): string {
    return 'Placa inválida. Use o formato ABC-1234 ou ABC1D23 (Mercosul)';
  }
}
