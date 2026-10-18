import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './shared/database';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/infrastructure/jwt-auth.guard';
import { ClientesModule } from './modules/clientes/clientes.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { PecasModule } from './modules/pecas/pecas.module';
import { OrdensServicoModule } from './modules/ordens-servico/ordens-servico.module';
import { OrcamentosModule } from './modules/orcamentos/orcamentos.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    PecasModule,
    OrdensServicoModule,
    OrcamentosModule,
    RelatoriosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
