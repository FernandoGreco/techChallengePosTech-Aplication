import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddPecaOSDto {
  @ApiProperty({ example: 'uuid-da-peca' })
  @IsUUID('4', { message: 'pecaId deve ser um UUID válido' })
  pecaId: string;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser maior que zero' })
  quantidade: number;
}
