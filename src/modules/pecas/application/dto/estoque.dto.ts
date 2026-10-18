import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class EntradaEstoqueDto {
  @ApiProperty({
    example: 10,
    description: 'Quantidade a adicionar ao estoque',
  })
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;
}

export class ReservarEstoqueDto {
  @ApiProperty({ example: 2, description: 'Quantidade a reservar' })
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;
}

export class BaixarEstoqueDto {
  @ApiProperty({ example: 2, description: 'Quantidade a baixar do estoque' })
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;
}
