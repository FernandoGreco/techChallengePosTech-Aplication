import { Module } from '@nestjs/common';
import { RelatoriosController } from './presentation/controllers/relatorios.controller';

@Module({
  controllers: [RelatoriosController],
})
export class RelatoriosModule {}
