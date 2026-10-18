import {
  OrdemServico as PrismaOrdemServico,
  OrdemServicoServico as PrismaOrdemServicoServico,
  OrdemServicoPeca as PrismaOrdemServicoPeca,
  Orcamento as PrismaOrcamento,
  HistoricoStatusOS as PrismaHistoricoStatusOS,
  Servico as PrismaServico,
  Peca as PrismaPeca,
  Cliente as PrismaCliente,
  Veiculo as PrismaVeiculo,
} from '@prisma/client';
import {
  IOrdemServico,
  IOrdemServicoServico,
  IOrdemServicoPeca,
  IOrcamento,
  IHistoricoStatusOS,
  IStatusConsulta,
} from '../../domain/entities/ordem-servico.entity';
import { StatusOS } from '../../domain/enums/status-os.enum';

type PrismaOrdemServicoServicoCom = PrismaOrdemServicoServico & {
  servico?: PrismaServico;
};

type PrismaOrdemServicoPecaCom = PrismaOrdemServicoPeca & {
  peca?: PrismaPeca;
};

type PrismaOrdemServicoCom = PrismaOrdemServico & {
  cliente?: PrismaCliente;
  veiculo?: PrismaVeiculo;
  servicos?: PrismaOrdemServicoServicoCom[];
  pecas?: PrismaOrdemServicoPecaCom[];
  orcamentos?: PrismaOrcamento[];
  historico?: PrismaHistoricoStatusOS[];
};

export class OrdemServicoMapper {
  static toDomain(prisma: PrismaOrdemServicoCom): IOrdemServico {
    return {
      id: prisma.id,
      numero: prisma.numero,
      clienteId: prisma.clienteId,
      veiculoId: prisma.veiculoId,
      status: prisma.status as StatusOS,
      diagnostico: prisma.diagnostico,
      valorTotal: prisma.valorTotal,
      dataCriacao: prisma.dataCriacao,
      dataInicioDiagnostico: prisma.dataInicioDiagnostico,
      dataInicioExecucao: prisma.dataInicioExecucao,
      dataFinalizacao: prisma.dataFinalizacao,
      dataEntrega: prisma.dataEntrega,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      cliente: prisma.cliente
        ? {
            id: prisma.cliente.id,
            nome: prisma.cliente.nome,
            documento: prisma.cliente.documento,
            telefone: prisma.cliente.telefone,
            email: prisma.cliente.email,
          }
        : undefined,
      veiculo: prisma.veiculo
        ? {
            id: prisma.veiculo.id,
            placa: prisma.veiculo.placa,
            marca: prisma.veiculo.marca,
            modelo: prisma.veiculo.modelo,
            ano: prisma.veiculo.ano,
          }
        : undefined,
      servicos: (prisma.servicos ?? []).map((s): IOrdemServicoServico => ({
        id: s.id,
        servicoId: s.servicoId,
        valor: s.valor,
        servico: s.servico
          ? {
              id: s.servico.id,
              nome: s.servico.nome,
              descricao: s.servico.descricao,
              precoBase: s.servico.precoBase,
            }
          : undefined,
      })),
      pecas: (prisma.pecas ?? []).map((p): IOrdemServicoPeca => ({
        id: p.id,
        pecaId: p.pecaId,
        quantidade: p.quantidade,
        valorUnitario: p.valorUnitario,
        peca: p.peca
          ? {
              id: p.peca.id,
              nome: p.peca.nome,
              descricao: p.peca.descricao,
              precoUnitario: p.peca.precoUnitario,
              quantidadeEstoque: p.peca.quantidadeEstoque,
              quantidadeReservada: p.peca.quantidadeReservada,
            }
          : undefined,
      })),
      orcamentos: (prisma.orcamentos ?? []).map((o): IOrcamento => ({
        id: o.id,
        ordemServicoId: o.ordemServicoId,
        valorServicos: o.valorServicos,
        valorPecas: o.valorPecas,
        valorTotal: o.valorTotal,
        status: o.status,
        dataAprovacao: o.dataAprovacao,
        createdAt: o.createdAt,
      })),
      historico: (prisma.historico ?? []).map((h): IHistoricoStatusOS => ({
        id: h.id,
        ordemServicoId: h.ordemServicoId,
        statusAnterior: h.statusAnterior as StatusOS | null | undefined,
        statusNovo: h.statusNovo as StatusOS,
        observacao: h.observacao,
        createdAt: h.createdAt,
      })),
    };
  }

  static toStatusConsulta(prisma: PrismaOrdemServico): IStatusConsulta {
    return {
      id: prisma.id,
      numero: prisma.numero,
      status: prisma.status as StatusOS,
      dataCriacao: prisma.dataCriacao,
      dataInicioDiagnostico: prisma.dataInicioDiagnostico,
      dataInicioExecucao: prisma.dataInicioExecucao,
      dataFinalizacao: prisma.dataFinalizacao,
      dataEntrega: prisma.dataEntrega,
    };
  }
}
