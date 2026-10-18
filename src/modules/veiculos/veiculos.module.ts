import { Module } from '@nestjs/common';
import { VeiculosController } from './presentation/controllers/veiculos.controller';
import { VeiculosUseCase } from './application/use-cases/veiculos.use-case';
import { VeiculoPrismaRepository } from './infrastructure/repositories/veiculo-prisma.repository';
import { VEICULO_REPOSITORY } from './domain/repositories/veiculo.repository.interface';

@Module({
  controllers: [VeiculosController],
  providers: [
    VeiculosUseCase,
    {
      provide: VEICULO_REPOSITORY,
      useClass: VeiculoPrismaRepository,
    },
  ],
  exports: [VeiculosUseCase],
})
export class VeiculosModule {}
