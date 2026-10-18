import { PartialType } from '@nestjs/swagger';
import { CreateServicoDto } from './create-servico.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateServicoDto extends PartialType(CreateServicoDto) {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
