import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddServicoOSDto {
  @ApiProperty({ example: 'uuid-do-servico' })
  @IsUUID('4', { message: 'servicoId deve ser um UUID válido' })
  servicoId: string;
}
