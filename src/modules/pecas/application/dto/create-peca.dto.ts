import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePecaDto {
  @ApiProperty({ example: 'Filtro de óleo' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: 'Filtro de óleo motor 1.0' })
  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao: string;

  @ApiProperty({ example: 35.9 })
  @IsNumber({}, { message: 'Preço unitário deve ser um número' })
  @Min(0.01, { message: 'Preço unitário deve ser positivo' })
  precoUnitario: number;

  @ApiProperty({ example: 50 })
  @IsInt({ message: 'Quantidade em estoque deve ser um número inteiro' })
  @Min(0, { message: 'Quantidade em estoque não pode ser negativa' })
  quantidadeEstoque: number;
}
