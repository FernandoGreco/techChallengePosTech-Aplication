import { OrdemServicoMapper } from '../ordem-servico.mapper';
import { StatusOS } from '../../../domain/enums/status-os.enum';

const makePrismaOS = (overrides: Partial<any> = {}) => ({
  id: 'os1',
  numero: 42,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: StatusOS.RECEBIDA,
  diagnostico: null,
  valorTotal: 0,
  dataCriacao: new Date('2025-01-01'),
  dataInicioDiagnostico: null,
  dataInicioExecucao: null,
  dataFinalizacao: null,
  dataEntrega: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  cliente: null,
  veiculo: null,
  servicos: [],
  pecas: [],
  orcamentos: [],
  historico: [],
  ...overrides,
});

describe('OrdemServicoMapper', () => {
  describe('toDomain', () => {
    it('deve mapear campos escalares corretamente', () => {
      const prisma = makePrismaOS({
        status: StatusOS.EM_DIAGNOSTICO,
        valorTotal: 350.5,
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.id).toBe('os1');
      expect(domain.numero).toBe(42);
      expect(domain.status).toBe(StatusOS.EM_DIAGNOSTICO);
      expect(domain.valorTotal).toBe(350.5);
      expect(domain.clienteId).toBe('c1');
      expect(domain.veiculoId).toBe('v1');
    });

    it('deve mapear cliente quando presente', () => {
      const prisma = makePrismaOS({
        cliente: {
          id: 'c1',
          nome: 'João',
          documento: '12345678909',
          telefone: '11999999999',
          email: 'joao@test.com',
          tipoDocumento: 'CPF',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.cliente).toBeDefined();
      expect(domain.cliente.nome).toBe('João');
      expect(domain.cliente.email).toBe('joao@test.com');
    });

    it('deve mapear veiculo quando presente', () => {
      const prisma = makePrismaOS({
        veiculo: {
          id: 'v1',
          placa: 'ABC1234',
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2020,
          clienteId: 'c1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.veiculo).toBeDefined();
      expect(domain.veiculo.placa).toBe('ABC1234');
      expect(domain.veiculo.modelo).toBe('Corolla');
    });

    it('deve mapear servicos com relação aninhada', () => {
      const prisma = makePrismaOS({
        servicos: [
          {
            id: 'oss1',
            servicoId: 's1',
            valor: 150,
            ordemServicoId: 'os1',
            createdAt: new Date(),
            servico: {
              id: 's1',
              nome: 'Troca de óleo',
              descricao: 'Desc',
              precoBase: 150,
              tempoMedioMinutos: 30,
              ativo: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.servicos).toHaveLength(1);
      expect(domain.servicos[0].valor).toBe(150);
      expect(domain.servicos[0].servico.nome).toBe('Troca de óleo');
    });

    it('deve mapear pecas com relação aninhada', () => {
      const prisma = makePrismaOS({
        pecas: [
          {
            id: 'osp1',
            pecaId: 'p1',
            quantidade: 2,
            valorUnitario: 50,
            ordemServicoId: 'os1',
            createdAt: new Date(),
            peca: {
              id: 'p1',
              nome: 'Filtro',
              descricao: 'Desc',
              precoUnitario: 50,
              quantidadeEstoque: 10,
              quantidadeReservada: 2,
              ativo: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.pecas).toHaveLength(1);
      expect(domain.pecas[0].quantidade).toBe(2);
      expect(domain.pecas[0].peca.quantidadeEstoque).toBe(10);
    });

    it('deve mapear orcamentos', () => {
      const prisma = makePrismaOS({
        orcamentos: [
          {
            id: 'orc1',
            ordemServicoId: 'os1',
            valorServicos: 100,
            valorPecas: 50,
            valorTotal: 150,
            status: 'GERADO',
            dataAprovacao: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.orcamentos).toHaveLength(1);
      expect(domain.orcamentos[0].status).toBe('GERADO');
      expect(domain.orcamentos[0].valorTotal).toBe(150);
    });

    it('deve mapear historico de status', () => {
      const prisma = makePrismaOS({
        historico: [
          {
            id: 'h1',
            ordemServicoId: 'os1',
            statusAnterior: null,
            statusNovo: StatusOS.RECEBIDA,
            observacao: 'OS criada',
            createdAt: new Date(),
          },
        ],
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.historico).toHaveLength(1);
      expect(domain.historico[0].statusNovo).toBe(StatusOS.RECEBIDA);
      expect(domain.historico[0].observacao).toBe('OS criada');
    });

    it('deve retornar arrays vazios quando relações são undefined', () => {
      const prisma = makePrismaOS({
        servicos: undefined,
        pecas: undefined,
        orcamentos: undefined,
      });

      const domain = OrdemServicoMapper.toDomain(prisma);

      expect(domain.servicos).toEqual([]);
      expect(domain.pecas).toEqual([]);
      expect(domain.orcamentos).toEqual([]);
    });
  });

  describe('toStatusConsulta', () => {
    it('deve mapear apenas campos de status', () => {
      const dataInicio = new Date('2025-03-01');
      const prisma = makePrismaOS({
        status: StatusOS.EM_EXECUCAO,
        dataInicioDiagnostico: dataInicio,
      });

      const result = OrdemServicoMapper.toStatusConsulta(prisma);

      expect(result.id).toBe('os1');
      expect(result.numero).toBe(42);
      expect(result.status).toBe(StatusOS.EM_EXECUCAO);
      expect(result.dataInicioDiagnostico).toBe(dataInicio);
      expect((result as any).clienteId).toBeUndefined();
    });
  });
});
