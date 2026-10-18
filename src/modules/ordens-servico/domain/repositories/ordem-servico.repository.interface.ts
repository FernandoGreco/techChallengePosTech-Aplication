import { StatusOS } from '../enums/status-os.enum';
import {
  IOrdemServico,
  IStatusConsulta,
} from '../entities/ordem-servico.entity';

export interface ICriarOSInput {
  clienteId: string;
  veiculoId: string;
  servicos?: { servicoId: string }[];
  pecas?: { pecaId: string; quantidade: number }[];
}

export interface IAdicionarServicoInput {
  servicoId: string;
  valor: number;
}

export interface IAdicionarPecaInput {
  pecaId: string;
  quantidade: number;
  valorUnitario: number;
}

export interface IGerarOrcamentoInput {
  id: string;
  valorServicos: number;
  valorPecas: number;
  valorTotal: number;
}

export interface IAprovarOrcamentoInput {
  id: string;
  orcamentoId: string;
  reservas: { pecaId: string; quantidade: number }[];
}

export interface IRecusarOrcamentoInput {
  id: string;
  orcamentoId: string;
}

export interface ITransicaoStatusInput {
  id: string;
  statusAnterior: StatusOS;
  statusNovo: StatusOS;
  observacao: string;
  dadosAdicionais?: Record<string, unknown>;
}

export interface IBaixarEstoqueInput {
  id: string;
  pecas: { pecaId: string; quantidade: number }[];
}

export const ORDEM_SERVICO_REPOSITORY = 'ORDEM_SERVICO_REPOSITORY';

export interface IOrdemServicoRepository {
  criar(input: ICriarOSInput): Promise<IOrdemServico>;
  findAll(): Promise<IOrdemServico[]>;
  findOperacionais(): Promise<IOrdemServico[]>;
  findById(id: string): Promise<IOrdemServico | null>;
  findStatusById(id: string): Promise<IStatusConsulta | null>;
  adicionarServico(
    ordemServicoId: string,
    input: IAdicionarServicoInput,
  ): Promise<IOrdemServico>;
  adicionarPeca(
    ordemServicoId: string,
    input: IAdicionarPecaInput,
  ): Promise<IOrdemServico>;
  atualizarDiagnostico(id: string, diagnostico: string): Promise<IOrdemServico>;
  transicionarStatus(input: ITransicaoStatusInput): Promise<IOrdemServico>;
  gerarOrcamento(input: IGerarOrcamentoInput): Promise<IOrdemServico>;
  aprovarOrcamento(input: IAprovarOrcamentoInput): Promise<IOrdemServico>;
  recusarOrcamento(input: IRecusarOrcamentoInput): Promise<IOrdemServico>;
  baixarEstoque(input: IBaixarEstoqueInput): Promise<IOrdemServico>;
}
