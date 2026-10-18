import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { IsPlacaValida } from '../../../../shared/validators';

export class CreateVeiculoDto {
  @ApiProperty({ example: 'ABC1D23' })
  @IsString()
  @IsNotEmpty({ message: 'Placa é obrigatória' })
  @Validate(IsPlacaValida)
  placa: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty({ message: 'Marca é obrigatória' })
  marca: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  modelo: string;

  @ApiProperty({ example: 2023 })
  @IsInt({ message: 'Ano deve ser um número inteiro' })
  @Min(1900, { message: 'Ano deve ser maior que 1900' })
  @Max(new Date().getFullYear() + 1, {
    message: 'Ano não pode ser maior que o próximo ano',
  })
  ano: number;

  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsUUID('4', { message: 'clienteId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'clienteId é obrigatório' })
  clienteId: string;
}
