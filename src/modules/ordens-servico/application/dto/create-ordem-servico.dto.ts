import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServicoOSDto {
  @ApiProperty({ example: 'uuid-do-servico' })
  @IsUUID('4', { message: 'servicoId deve ser um UUID válido' })
  servicoId: string;
}

export class PecaOSDto {
  @ApiProperty({ example: 'uuid-da-peca' })
  @IsUUID('4', { message: 'pecaId deve ser um UUID válido' })
  pecaId: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;
}

export class CreateOrdemServicoDto {
  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsUUID('4', { message: 'clienteId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'clienteId é obrigatório' })
  clienteId: string;

  @ApiProperty({ example: 'uuid-do-veiculo' })
  @IsUUID('4', { message: 'veiculoId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'veiculoId é obrigatório' })
  veiculoId: string;

  @ApiPropertyOptional({ type: [ServicoOSDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServicoOSDto)
  servicos?: ServicoOSDto[];

  @ApiPropertyOptional({ type: [PecaOSDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PecaOSDto)
  pecas?: PecaOSDto[];
}
