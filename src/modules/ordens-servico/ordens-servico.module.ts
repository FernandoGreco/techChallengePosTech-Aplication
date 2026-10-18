import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database';
import { OrdensServicoController } from './presentation/controllers/ordens-servico.controller';
import { ORDEM_SERVICO_REPOSITORY } from './domain/repositories/ordem-servico.repository.interface';
import { NOTIFICACAO_ORCAMENTO_SERVICE } from './domain/services/notificacao-orcamento.service.interface';
import { OrdemServicoPrismaRepository } from './infrastructure/repositories/ordem-servico-prisma.repository';
import { EmailNotificacaoOrcamentoService } from './infrastructure/services/email-notificacao-orcamento.service';
import { CriarOrdemServicoUseCase } from './application/use-cases/criar-ordem-servico.use-case';
import { ListarOrdensServicoUseCase } from './application/use-cases/listar-ordens-servico.use-case';
import { BuscarOrdemServicoPorIdUseCase } from './application/use-cases/buscar-ordem-servico-por-id.use-case';
import { ConsultarStatusOSUseCase } from './application/use-cases/consultar-status-os.use-case';
import { AdicionarServicoOSUseCase } from './application/use-cases/adicionar-servico-os.use-case';
import { AdicionarPecaOSUseCase } from './application/use-cases/adicionar-peca-os.use-case';
import { IniciarDiagnosticoUseCase } from './application/use-cases/iniciar-diagnostico.use-case';
import { RegistrarDiagnosticoUseCase } from './application/use-cases/registrar-diagnostico.use-case';
import { GerarOrcamentoUseCase } from './application/use-cases/gerar-orcamento.use-case';
import { AprovarOrcamentoUseCase } from './application/use-cases/aprovar-orcamento.use-case';
import { RecusarOrcamentoUseCase } from './application/use-cases/recusar-orcamento.use-case';
import { IniciarExecucaoUseCase } from './application/use-cases/iniciar-execucao.use-case';
import { FinalizarOSUseCase } from './application/use-cases/finalizar-os.use-case';
import { EntregarOSUseCase } from './application/use-cases/entregar-os.use-case';

const useCases = [
  CriarOrdemServicoUseCase,
  ListarOrdensServicoUseCase,
  BuscarOrdemServicoPorIdUseCase,
  ConsultarStatusOSUseCase,
  AdicionarServicoOSUseCase,
  AdicionarPecaOSUseCase,
  IniciarDiagnosticoUseCase,
  RegistrarDiagnosticoUseCase,
  GerarOrcamentoUseCase,
  AprovarOrcamentoUseCase,
  RecusarOrcamentoUseCase,
  IniciarExecucaoUseCase,
  FinalizarOSUseCase,
  EntregarOSUseCase,
];

@Module({
  imports: [DatabaseModule],
  controllers: [OrdensServicoController],
  providers: [
    {
      provide: ORDEM_SERVICO_REPOSITORY,
      useClass: OrdemServicoPrismaRepository,
    },
    {
      provide: NOTIFICACAO_ORCAMENTO_SERVICE,
      useClass: EmailNotificacaoOrcamentoService,
    },
    ...useCases,
  ],
  exports: useCases,
})
export class OrdensServicoModule {}
