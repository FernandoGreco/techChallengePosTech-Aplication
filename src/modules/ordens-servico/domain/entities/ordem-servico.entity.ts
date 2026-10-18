import { StatusOS } from '../enums/status-os.enum';

export interface IOrdemServicoServico {
  id: string;
  servicoId: string;
  valor: number;
  servico?: { id: string; nome: string; descricao: string; precoBase: number };
}

export interface IOrdemServicoPeca {
  id: string;
  pecaId: string;
  quantidade: number;
  valorUnitario: number;
  peca?: {
    id: string;
    nome: string;
    descricao: string;
    precoUnitario: number;
    quantidadeEstoque: number;
    quantidadeReservada: number;
  };
}

export interface IOrcamento {
  id: string;
  ordemServicoId: string;
  valorServicos: number;
  valorPecas: number;
  valorTotal: number;
  status: string;
  dataAprovacao?: Date | null;
  createdAt: Date;
}

export interface IHistoricoStatusOS {
  id: string;
  ordemServicoId: string;
  statusAnterior?: StatusOS | null;
  statusNovo: StatusOS;
  observacao?: string | null;
  createdAt: Date;
}

export interface IOrdemServico {
  id: string;
  numero: number;
  clienteId: string;
  veiculoId: string;
  status: StatusOS;
  diagnostico?: string | null;
  valorTotal: number;
  dataCriacao: Date;
  dataInicioDiagnostico?: Date | null;
  dataInicioExecucao?: Date | null;
  dataFinalizacao?: Date | null;
  dataEntrega?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  cliente?: {
    id: string;
    nome: string;
    documento: string;
    telefone: string;
    email: string;
  };
  veiculo?: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano: number;
  };
  servicos: IOrdemServicoServico[];
  pecas: IOrdemServicoPeca[];
  orcamentos: IOrcamento[];
  historico?: IHistoricoStatusOS[];
}

export interface IStatusConsulta {
  id: string;
  numero: number;
  status: StatusOS;
  dataCriacao: Date;
  dataInicioDiagnostico?: Date | null;
  dataInicioExecucao?: Date | null;
  dataFinalizacao?: Date | null;
  dataEntrega?: Date | null;
}
