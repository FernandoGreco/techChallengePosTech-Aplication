import {
  Injectable,
  Inject,
  Optional,
  NotFoundException,
} from '@nestjs/common';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOSRules } from '../../domain/rules/status-os.rules';
import {
  INotificacaoOrcamentoService,
  NOTIFICACAO_ORCAMENTO_SERVICE,
} from '../../domain/services/notificacao-orcamento.service.interface';

@Injectable()
export class GerarOrcamentoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
    @Optional()
    @Inject(NOTIFICACAO_ORCAMENTO_SERVICE)
    private readonly notificacao: INotificacaoOrcamentoService | null,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    StatusOSRules.validarGerarOrcamento(os.status);

    const valorServicos = os.servicos.reduce((sum, s) => sum + s.valor, 0);
    const valorPecas = os.pecas.reduce(
      (sum, p) => sum + p.valorUnitario * p.quantidade,
      0,
    );
    const valorTotal = valorServicos + valorPecas;

    const resultado = await this.repository.gerarOrcamento({
      id,
      valorServicos,
      valorPecas,
      valorTotal,
    });

    if (this.notificacao) {
      await this.notificacao.notificarOrcamentoPendente(resultado, valorTotal);
    }

    return resultado;
  }
}
