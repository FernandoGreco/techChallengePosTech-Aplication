import { PartialType } from '@nestjs/swagger';
import { CreatePecaDto } from './create-peca.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePecaDto extends PartialType(CreatePecaDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
