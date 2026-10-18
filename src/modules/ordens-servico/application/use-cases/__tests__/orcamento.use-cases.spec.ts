import { NotFoundException } from '@nestjs/common';
import { AprovarOrcamentoUseCase } from '../aprovar-orcamento.use-case';
import { RecusarOrcamentoUseCase } from '../recusar-orcamento.use-case';
import { GerarOrcamentoUseCase } from '../gerar-orcamento.use-case';
import { StatusOS } from '../../../domain/enums/status-os.enum';
import { BusinessException } from '../../../../../shared/exceptions';

const makeRepository = () => ({
  criar: jest.fn(),
  findAll: jest.fn(),
  findOperacionais: jest.fn(),
  findById: jest.fn(),
  findStatusById: jest.fn(),
  adicionarServico: jest.fn(),
  adicionarPeca: jest.fn(),
  atualizarDiagnostico: jest.fn(),
  transicionarStatus: jest.fn(),
  gerarOrcamento: jest.fn(),
  aprovarOrcamento: jest.fn(),
  recusarOrcamento: jest.fn(),
  baixarEstoque: jest.fn(),
});

const makeOSBase = (status: StatusOS, extras: Partial<any> = {}) => ({
  id: 'os1',
  status,
  servicos: [],
  pecas: [],
  orcamentos: [],
  dataCriacao: new Date(),
  ...extras,
});

describe('GerarOrcamentoUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: GerarOrcamentoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new GerarOrcamentoUseCase(repository, null);
  });

  it('deve gerar orçamento somando serviços e peças', async () => {
    const os = makeOSBase(StatusOS.EM_DIAGNOSTICO, {
      servicos: [{ valor: 100 }, { valor: 50 }],
      pecas: [{ valorUnitario: 30, quantidade: 2 }],
    });
    repository.findById.mockResolvedValue(os);
    repository.gerarOrcamento.mockResolvedValue({
      ...os,
      status: StatusOS.AGUARDANDO_APROVACAO,
    });

    await useCase.execute('os1');

    expect(repository.gerarOrcamento).toHaveBeenCalledWith({
      id: 'os1',
      valorServicos: 150,
      valorPecas: 60,
      valorTotal: 210,
    });
  });

  it('deve lançar NotFoundException se OS não existir', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('os1')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro ao tentar gerar orçamento com status inválido', async () => {
    const os = makeOSBase(StatusOS.RECEBIDA);
    repository.findById.mockResolvedValue(os);
    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });

  it('deve chamar serviço de notificação após gerar orçamento', async () => {
    const os = makeOSBase(StatusOS.EM_DIAGNOSTICO, {
      servicos: [{ valor: 200 }],
      pecas: [],
    });
    const osAtualizado = { ...os, status: StatusOS.AGUARDANDO_APROVACAO };
    repository.findById.mockResolvedValue(os);
    repository.gerarOrcamento.mockResolvedValue(osAtualizado);

    const mockNotificacao = {
      notificarOrcamentoPendente: jest.fn().mockResolvedValue(undefined),
    };
    const useCaseComNotificacao = new GerarOrcamentoUseCase(
      repository,
      mockNotificacao,
    );

    await useCaseComNotificacao.execute('os1');

    expect(mockNotificacao.notificarOrcamentoPendente).toHaveBeenCalledWith(
      osAtualizado,
      200,
    );
  });

  it('não deve falhar se serviço de notificação não estiver configurado', async () => {
    const os = makeOSBase(StatusOS.EM_DIAGNOSTICO, {
      servicos: [{ valor: 100 }],
      pecas: [],
    });
    repository.findById.mockResolvedValue(os);
    repository.gerarOrcamento.mockResolvedValue({
      ...os,
      status: StatusOS.AGUARDANDO_APROVACAO,
    });

    await expect(useCase.execute('os1')).resolves.not.toThrow();
  });
});

describe('AprovarOrcamentoUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: AprovarOrcamentoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new AprovarOrcamentoUseCase(repository);
  });

  it('deve aprovar orçamento e reservar peças com estoque suficiente', async () => {
    const os = makeOSBase(StatusOS.AGUARDANDO_APROVACAO, {
      orcamentos: [{ id: 'orc1', status: 'GERADO' }],
      pecas: [
        {
          pecaId: 'p1',
          quantidade: 2,
          peca: { quantidadeEstoque: 10, quantidadeReservada: 0 },
        },
      ],
    });
    repository.findById.mockResolvedValue(os);
    repository.aprovarOrcamento.mockResolvedValue({
      ...os,
      status: StatusOS.EM_EXECUCAO,
    });

    await useCase.execute('os1');

    expect(repository.aprovarOrcamento).toHaveBeenCalledWith({
      id: 'os1',
      orcamentoId: 'orc1',
      reservas: [{ pecaId: 'p1', quantidade: 2 }],
    });
  });

  it('deve lançar BusinessException quando estoque insuficiente', async () => {
    const os = makeOSBase(StatusOS.AGUARDANDO_APROVACAO, {
      orcamentos: [{ id: 'orc1', status: 'GERADO' }],
      pecas: [
        {
          pecaId: 'p1',
          quantidade: 5,
          peca: { quantidadeEstoque: 3, quantidadeReservada: 0 },
        },
      ],
    });
    repository.findById.mockResolvedValue(os);

    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
    expect(repository.aprovarOrcamento).not.toHaveBeenCalled();
  });

  it('deve lançar BusinessException se não houver orçamento GERADO', async () => {
    const os = makeOSBase(StatusOS.AGUARDANDO_APROVACAO, {
      orcamentos: [],
    });
    repository.findById.mockResolvedValue(os);
    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });

  it('deve lançar NotFoundException se OS não existir', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('os1')).rejects.toThrow(NotFoundException);
  });
});

describe('RecusarOrcamentoUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: RecusarOrcamentoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new RecusarOrcamentoUseCase(repository);
  });

  it('deve recusar orçamento e retornar OS para EM_DIAGNOSTICO', async () => {
    const os = makeOSBase(StatusOS.AGUARDANDO_APROVACAO, {
      orcamentos: [{ id: 'orc1', status: 'GERADO' }],
    });
    repository.findById.mockResolvedValue(os);
    repository.recusarOrcamento.mockResolvedValue({
      ...os,
      status: StatusOS.EM_DIAGNOSTICO,
    });

    await useCase.execute('os1');

    expect(repository.recusarOrcamento).toHaveBeenCalledWith({
      id: 'os1',
      orcamentoId: 'orc1',
    });
  });

  it('deve lançar BusinessException ao recusar com status inválido', async () => {
    const os = makeOSBase(StatusOS.RECEBIDA, {
      orcamentos: [{ id: 'orc1', status: 'GERADO' }],
    });
    repository.findById.mockResolvedValue(os);
    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });

  it('deve lançar NotFoundException se OS não existir', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('os1')).rejects.toThrow(NotFoundException);
  });
});
