import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database';
import { StatusOS } from '../../domain/enums/status-os.enum';
import {
  IOrdemServicoRepository,
  ICriarOSInput,
  IAdicionarServicoInput,
  IAdicionarPecaInput,
  IGerarOrcamentoInput,
  IAprovarOrcamentoInput,
  IRecusarOrcamentoInput,
  ITransicaoStatusInput,
  IBaixarEstoqueInput,
} from '../../domain/repositories/ordem-servico.repository.interface';
import {
  IOrdemServico,
  IStatusConsulta,
} from '../../domain/entities/ordem-servico.entity';
import { OrdemServicoMapper } from '../mappers/ordem-servico.mapper';

const STATUS_PRIORIDADE: Record<string, number> = {
  [StatusOS.EM_EXECUCAO]: 1,
  [StatusOS.AGUARDANDO_APROVACAO]: 2,
  [StatusOS.EM_DIAGNOSTICO]: 3,
  [StatusOS.RECEBIDA]: 4,
};

const FULL_INCLUDE = {
  cliente: true,
  veiculo: true,
  servicos: { include: { servico: true } },
  pecas: { include: { peca: true } },
  orcamentos: true,
  historico: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class OrdemServicoPrismaRepository implements IOrdemServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(input: ICriarOSInput): Promise<IOrdemServico> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: input.clienteId },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id: input.veiculoId },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');

    if (veiculo.clienteId !== input.clienteId) {
      throw new NotFoundException(
        'O veículo não pertence ao cliente informado',
      );
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const os = await tx.ordemServico.create({
        data: {
          clienteId: input.clienteId,
          veiculoId: input.veiculoId,
          status: StatusOS.RECEBIDA,
        },
      });

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: os.id,
          statusNovo: StatusOS.RECEBIDA,
          observacao: 'OS criada',
        },
      });

      if (input.servicos?.length) {
        for (const s of input.servicos) {
          const servico = await tx.servico.findUnique({
            where: { id: s.servicoId },
          });
          if (!servico)
            throw new NotFoundException(
              `Serviço ${s.servicoId} não encontrado`,
            );
          await tx.ordemServicoServico.create({
            data: {
              ordemServicoId: os.id,
              servicoId: s.servicoId,
              valor: servico.precoBase,
            },
          });
        }
      }

      if (input.pecas?.length) {
        for (const p of input.pecas) {
          const peca = await tx.peca.findUnique({ where: { id: p.pecaId } });
          if (!peca)
            throw new NotFoundException(`Peça ${p.pecaId} não encontrada`);
          await tx.ordemServicoPeca.create({
            data: {
              ordemServicoId: os.id,
              pecaId: p.pecaId,
              quantidade: p.quantidade,
              valorUnitario: peca.precoUnitario,
            },
          });
        }
      }

      return os;
    });

    return this.findById(created.id);
  }

  async findAll(): Promise<IOrdemServico[]> {
    const results = await this.prisma.ordemServico.findMany({
      include: FULL_INCLUDE,
      orderBy: { dataCriacao: 'desc' },
    });
    return results.map(OrdemServicoMapper.toDomain);
  }

  async findOperacionais(): Promise<IOrdemServico[]> {
    const statusExcluidos = [StatusOS.FINALIZADA, StatusOS.ENTREGUE];

    const results = await this.prisma.ordemServico.findMany({
      where: { status: { notIn: statusExcluidos } },
      include: FULL_INCLUDE,
      orderBy: { dataCriacao: 'asc' },
    });

    return results.map(OrdemServicoMapper.toDomain).sort((a, b) => {
      const prioA = STATUS_PRIORIDADE[a.status] ?? 99;
      const prioB = STATUS_PRIORIDADE[b.status] ?? 99;
      if (prioA !== prioB) return prioA - prioB;
      return a.dataCriacao.getTime() - b.dataCriacao.getTime();
    });
  }

  async findById(id: string): Promise<IOrdemServico | null> {
    const os = await this.prisma.ordemServico.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });
    if (!os) return null;
    return OrdemServicoMapper.toDomain(os);
  }

  async findStatusById(id: string): Promise<IStatusConsulta | null> {
    const os = await this.prisma.ordemServico.findUnique({
      where: { id },
      select: {
        id: true,
        numero: true,
        status: true,
        dataCriacao: true,
        dataInicioDiagnostico: true,
        dataInicioExecucao: true,
        dataFinalizacao: true,
        dataEntrega: true,
      },
    });
    if (!os) return null;
    return OrdemServicoMapper.toStatusConsulta(
      os as Parameters<typeof OrdemServicoMapper.toStatusConsulta>[0],
    );
  }

  async adicionarServico(
    ordemServicoId: string,
    input: IAdicionarServicoInput,
  ): Promise<IOrdemServico> {
    const servico = await this.prisma.servico.findUnique({
      where: { id: input.servicoId },
    });
    if (!servico) throw new NotFoundException('Serviço não encontrado');

    await this.prisma.ordemServicoServico.create({
      data: {
        ordemServicoId,
        servicoId: input.servicoId,
        valor: servico.precoBase,
      },
    });

    return this.findById(ordemServicoId);
  }

  async adicionarPeca(
    ordemServicoId: string,
    input: IAdicionarPecaInput,
  ): Promise<IOrdemServico> {
    const peca = await this.prisma.peca.findUnique({
      where: { id: input.pecaId },
    });
    if (!peca) throw new NotFoundException('Peça não encontrada');

    await this.prisma.ordemServicoPeca.create({
      data: {
        ordemServicoId,
        pecaId: input.pecaId,
        quantidade: input.quantidade,
        valorUnitario: peca.precoUnitario,
      },
    });

    return this.findById(ordemServicoId);
  }

  async atualizarDiagnostico(
    id: string,
    diagnostico: string,
  ): Promise<IOrdemServico> {
    await this.prisma.ordemServico.update({
      where: { id },
      data: { diagnostico },
    });
    return this.findById(id);
  }

  async transicionarStatus(
    input: ITransicaoStatusInput,
  ): Promise<IOrdemServico> {
    const dadosOS: Record<string, unknown> = { status: input.statusNovo };
    if (input.dadosAdicionais) {
      Object.assign(dadosOS, input.dadosAdicionais);
    }

    await this.prisma.$transaction([
      this.prisma.ordemServico.update({
        where: { id: input.id },
        data: dadosOS,
      }),
      this.prisma.historicoStatusOS.create({
        data: {
          ordemServicoId: input.id,
          statusAnterior: input.statusAnterior,
          statusNovo: input.statusNovo,
          observacao: input.observacao,
        },
      }),
    ]);

    return this.findById(input.id);
  }

  async gerarOrcamento(input: IGerarOrcamentoInput): Promise<IOrdemServico> {
    await this.prisma.$transaction(async (tx) => {
      await tx.orcamento.create({
        data: {
          ordemServicoId: input.id,
          valorServicos: input.valorServicos,
          valorPecas: input.valorPecas,
          valorTotal: input.valorTotal,
        },
      });

      await tx.ordemServico.update({
        where: { id: input.id },
        data: {
          status: StatusOS.AGUARDANDO_APROVACAO,
          valorTotal: input.valorTotal,
        },
      });

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: input.id,
          statusAnterior: StatusOS.EM_DIAGNOSTICO,
          statusNovo: StatusOS.AGUARDANDO_APROVACAO,
          observacao: `Orçamento gerado - Valor total: R$ ${input.valorTotal.toFixed(2)}`,
        },
      });
    });

    return this.findById(input.id);
  }

  async aprovarOrcamento(
    input: IAprovarOrcamentoInput,
  ): Promise<IOrdemServico> {
    await this.prisma.$transaction(async (tx) => {
      await tx.orcamento.update({
        where: { id: input.orcamentoId },
        data: { status: 'APROVADO', dataAprovacao: new Date() },
      });

      await tx.ordemServico.update({
        where: { id: input.id },
        data: { status: StatusOS.EM_EXECUCAO, dataInicioExecucao: new Date() },
      });

      for (const reserva of input.reservas) {
        const peca = await tx.peca.findUnique({
          where: { id: reserva.pecaId },
        });
        if (!peca)
          throw new NotFoundException(`Peça ${reserva.pecaId} não encontrada`);
        await tx.peca.update({
          where: { id: reserva.pecaId },
          data: {
            quantidadeReservada: peca.quantidadeReservada + reserva.quantidade,
          },
        });
      }

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: input.id,
          statusAnterior: StatusOS.AGUARDANDO_APROVACAO,
          statusNovo: StatusOS.EM_EXECUCAO,
          observacao: 'Orçamento aprovado pelo cliente',
        },
      });
    });

    return this.findById(input.id);
  }

  async recusarOrcamento(
    input: IRecusarOrcamentoInput,
  ): Promise<IOrdemServico> {
    await this.prisma.$transaction(async (tx) => {
      await tx.orcamento.update({
        where: { id: input.orcamentoId },
        data: { status: 'RECUSADO' },
      });

      await tx.ordemServico.update({
        where: { id: input.id },
        data: { status: StatusOS.EM_DIAGNOSTICO },
      });

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: input.id,
          statusAnterior: StatusOS.AGUARDANDO_APROVACAO,
          statusNovo: StatusOS.EM_DIAGNOSTICO,
          observacao:
            'Orçamento recusado pelo cliente — OS retornada para diagnóstico',
        },
      });
    });

    return this.findById(input.id);
  }

  async baixarEstoque(input: IBaixarEstoqueInput): Promise<IOrdemServico> {
    await this.prisma.$transaction(async (tx) => {
      for (const item of input.pecas) {
        const peca = await tx.peca.findUnique({ where: { id: item.pecaId } });
        if (peca) {
          await tx.peca.update({
            where: { id: item.pecaId },
            data: {
              quantidadeEstoque: peca.quantidadeEstoque - item.quantidade,
              quantidadeReservada: Math.max(
                0,
                peca.quantidadeReservada - item.quantidade,
              ),
            },
          });
        }
      }

      await tx.ordemServico.update({
        where: { id: input.id },
        data: { status: StatusOS.FINALIZADA, dataFinalizacao: new Date() },
      });

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: input.id,
          statusAnterior: StatusOS.EM_EXECUCAO,
          statusNovo: StatusOS.FINALIZADA,
          observacao: 'OS finalizada',
        },
      });
    });

    return this.findById(input.id);
  }
}
