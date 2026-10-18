import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateServicoDto {
  @ApiProperty({ example: 'Troca de óleo' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: 'Troca de óleo do motor com filtro' })
  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber({}, { message: 'Preço base deve ser um número' })
  @Min(0.01, { message: 'Preço base deve ser positivo' })
  precoBase: number;

  @ApiProperty({ example: 30 })
  @IsInt({ message: 'Tempo médio deve ser um número inteiro' })
  @Min(1, { message: 'Tempo médio deve ser maior que zero' })
  tempoMedioMinutos: number;
}
