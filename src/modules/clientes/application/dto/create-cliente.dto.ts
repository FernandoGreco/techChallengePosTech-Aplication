import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';
import { TipoDocumento } from '../../domain/enums/tipo-documento.enum';
import { IsDocumentoValido } from '../../../../shared/validators';

export class CreateClienteDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: '12345678909' })
  @IsString()
  @IsNotEmpty({ message: 'Documento é obrigatório' })
  @Validate(IsDocumentoValido)
  documento: string;

  @ApiProperty({ enum: TipoDocumento, example: 'CPF' })
  @IsEnum(TipoDocumento, { message: 'Tipo de documento deve ser CPF ou CNPJ' })
  tipoDocumento: TipoDocumento;

  @ApiProperty({ example: '11999998888' })
  @IsString()
  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  telefone: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}
