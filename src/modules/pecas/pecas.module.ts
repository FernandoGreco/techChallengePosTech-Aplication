import { Module } from '@nestjs/common';
import { PecasController } from './presentation/controllers/pecas.controller';
import { PecasUseCase } from './application/use-cases/pecas.use-case';
import { PecaPrismaRepository } from './infrastructure/repositories/peca-prisma.repository';
import { PECA_REPOSITORY } from './domain/repositories/peca.repository.interface';

@Module({
  controllers: [PecasController],
  providers: [
    PecasUseCase,
    {
      provide: PECA_REPOSITORY,
      useClass: PecaPrismaRepository,
    },
  ],
  exports: [PecasUseCase],
})
export class PecasModule {}
