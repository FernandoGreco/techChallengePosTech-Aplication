import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrarDiagnosticoDto {
  @ApiProperty({ example: 'Motor com desgaste na correia dentada' })
  @IsString()
  @IsNotEmpty({ message: 'Diagnóstico é obrigatório' })
  diagnostico: string;
}
