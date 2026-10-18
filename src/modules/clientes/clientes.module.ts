import { Module } from '@nestjs/common';
import { ClientesController } from './presentation/controllers/clientes.controller';
import { ClientesUseCase } from './application/use-cases/clientes.use-case';
import { ClientePrismaRepository } from './infrastructure/repositories/cliente-prisma.repository';
import { CLIENTE_REPOSITORY } from './domain/repositories/cliente.repository.interface';

@Module({
  controllers: [ClientesController],
  providers: [
    ClientesUseCase,
    {
      provide: CLIENTE_REPOSITORY,
      useClass: ClientePrismaRepository,
    },
  ],
  exports: [ClientesUseCase],
})
export class ClientesModule {}
