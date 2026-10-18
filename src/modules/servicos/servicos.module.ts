import { Module } from '@nestjs/common';
import { ServicosController } from './presentation/controllers/servicos.controller';
import { ServicosUseCase } from './application/use-cases/servicos.use-case';
import { ServicoPrismaRepository } from './infrastructure/repositories/servico-prisma.repository';
import { SERVICO_REPOSITORY } from './domain/repositories/servico.repository.interface';

@Module({
  controllers: [ServicosController],
  providers: [
    ServicosUseCase,
    {
      provide: SERVICO_REPOSITORY,
      useClass: ServicoPrismaRepository,
    },
  ],
  exports: [ServicosUseCase],
})
export class ServicosModule {}
