import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database';
import { RelatoriosController } from './presentation/controllers/relatorios.controller';
import { TempoMedioServicosUseCase } from './application/use-cases/tempo-medio-servicos.use-case';
import { RELATORIO_REPOSITORY } from './domain/repositories/relatorio.repository.interface';
import { RelatorioPrismaRepository } from './infrastructure/repositories/relatorio-prisma.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [RelatoriosController],
  providers: [
    TempoMedioServicosUseCase,
    {
      provide: RELATORIO_REPOSITORY,
      useClass: RelatorioPrismaRepository,
    },
  ],
})
export class RelatoriosModule {}
