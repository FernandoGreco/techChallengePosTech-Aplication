import { NotFoundException } from '@nestjs/common';
import { BusinessException } from '../../../../../shared/exceptions';
import { StatusOS } from '../../../domain/enums/status-os.enum';
import { BuscarOrdemServicoPorIdUseCase } from '../buscar-ordem-servico-por-id.use-case';
import { ConsultarStatusOSUseCase } from '../consultar-status-os.use-case';
import { AdicionarServicoOSUseCase } from '../adicionar-servico-os.use-case';
import { AdicionarPecaOSUseCase } from '../adicionar-peca-os.use-case';
import { IniciarExecucaoUseCase } from '../iniciar-execucao.use-case';

const makeRepository = () => ({
  findById: jest.fn(),
  findStatusById: jest.fn(),
  adicionarServico: jest.fn(),
  adicionarPeca: jest.fn(),
  transicionarStatus: jest.fn(),
  criar: jest.fn(),
  findAll: jest.fn(),
  findOperacionais: jest.fn(),
  atualizarDiagnostico: jest.fn(),
  gerarOrcamento: jest.fn(),
  aprovarOrcamento: jest.fn(),
  recusarOrcamento: jest.fn(),
  baixarEstoque: jest.fn(),
});

const makeOS = (status: StatusOS, extras: Partial<any> = {}) => ({
  id: 'os1',
  status,
  servicos: [],
  pecas: [],
  orcamentos: [],
  dataCriacao: new Date(),
  ...extras,
});

// ─── BuscarOrdemServicoPorIdUseCase ───────────────────────────────────────────

describe('BuscarOrdemServicoPorIdUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: BuscarOrdemServicoPorIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new BuscarOrdemServicoPorIdUseCase(repository);
  });

  it('deve retornar a OS quando encontrada', async () => {
    const os = makeOS(StatusOS.RECEBIDA);
    repository.findById.mockResolvedValue(os);

    const result = await useCase.execute('os1');

    expect(result).toBe(os);
    expect(repository.findById).toHaveBeenCalledWith('os1');
  });

  it('deve lançar NotFoundException quando OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});

// ─── ConsultarStatusOSUseCase ─────────────────────────────────────────────────

describe('ConsultarStatusOSUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: ConsultarStatusOSUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new ConsultarStatusOSUseCase(repository);
  });

  it('deve retornar status quando OS existe', async () => {
    const statusInfo = {
      id: 'os1',
      numero: 1,
      status: StatusOS.EM_DIAGNOSTICO,
      dataCriacao: new Date(),
    };
    repository.findStatusById.mockResolvedValue(statusInfo);

    const result = await useCase.execute('os1');

    expect(result).toBe(statusInfo);
    expect(repository.findStatusById).toHaveBeenCalledWith('os1');
  });

  it('deve lançar NotFoundException quando OS não existe', async () => {
    repository.findStatusById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});

// ─── AdicionarServicoOSUseCase ────────────────────────────────────────────────

describe('AdicionarServicoOSUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: AdicionarServicoOSUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new AdicionarServicoOSUseCase(repository);
  });

  it('deve adicionar serviço quando OS está RECEBIDA', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.RECEBIDA));
    repository.adicionarServico.mockResolvedValue(makeOS(StatusOS.RECEBIDA));

    await useCase.execute('os1', { servicoId: 's1' });

    expect(repository.adicionarServico).toHaveBeenCalledWith('os1', {
      servicoId: 's1',
      valor: 0,
    });
  });

  it('deve adicionar serviço quando OS está EM_DIAGNOSTICO', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.EM_DIAGNOSTICO));
    repository.adicionarServico.mockResolvedValue(
      makeOS(StatusOS.EM_DIAGNOSTICO),
    );

    await useCase.execute('os1', { servicoId: 's1' });

    expect(repository.adicionarServico).toHaveBeenCalled();
  });

  it('deve lançar BusinessException quando OS está em outro status', async () => {
    repository.findById.mockResolvedValue(
      makeOS(StatusOS.AGUARDANDO_APROVACAO),
    );

    await expect(
      useCase.execute('os1', { servicoId: 's1' } as any),
    ).rejects.toThrow(BusinessException);
    expect(repository.adicionarServico).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('inexistente', { servicoId: 's1' } as any),
    ).rejects.toThrow(NotFoundException);
  });
});

// ─── AdicionarPecaOSUseCase ───────────────────────────────────────────────────

describe('AdicionarPecaOSUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: AdicionarPecaOSUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new AdicionarPecaOSUseCase(repository);
  });

  it('deve adicionar peça quando OS está RECEBIDA', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.RECEBIDA));
    repository.adicionarPeca.mockResolvedValue(makeOS(StatusOS.RECEBIDA));

    await useCase.execute('os1', { pecaId: 'p1', quantidade: 2 });

    expect(repository.adicionarPeca).toHaveBeenCalledWith('os1', {
      pecaId: 'p1',
      quantidade: 2,
      valorUnitario: 0,
    });
  });

  it('deve adicionar peça quando OS está EM_DIAGNOSTICO', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.EM_DIAGNOSTICO));
    repository.adicionarPeca.mockResolvedValue(makeOS(StatusOS.EM_DIAGNOSTICO));

    await useCase.execute('os1', { pecaId: 'p1', quantidade: 1 });

    expect(repository.adicionarPeca).toHaveBeenCalled();
  });

  it('deve lançar BusinessException quando OS está em status inválido', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.EM_EXECUCAO));

    await expect(
      useCase.execute('os1', { pecaId: 'p1', quantidade: 1 } as any),
    ).rejects.toThrow(BusinessException);
    expect(repository.adicionarPeca).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException quando OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('inexistente', { pecaId: 'p1', quantidade: 1 } as any),
    ).rejects.toThrow(NotFoundException);
  });
});

// ─── IniciarExecucaoUseCase ───────────────────────────────────────────────────

describe('IniciarExecucaoUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: IniciarExecucaoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new IniciarExecucaoUseCase(repository);
  });

  it('deve transicionar para EM_EXECUCAO quando orçamento está APROVADO', async () => {
    const os = makeOS(StatusOS.AGUARDANDO_APROVACAO, {
      orcamentos: [{ id: 'orc1', status: 'APROVADO' }],
    });
    repository.findById.mockResolvedValue(os);
    repository.transicionarStatus.mockResolvedValue(
      makeOS(StatusOS.EM_EXECUCAO),
    );

    await useCase.execute('os1');

    expect(repository.transicionarStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'os1',
        statusAnterior: StatusOS.AGUARDANDO_APROVACAO,
        statusNovo: StatusOS.EM_EXECUCAO,
      }),
    );
  });

  it('deve lançar BusinessException quando OS não está AGUARDANDO_APROVACAO', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.RECEBIDA));

    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
    expect(repository.transicionarStatus).not.toHaveBeenCalled();
  });

  it('deve lançar BusinessException quando não há orçamento APROVADO', async () => {
    const os = makeOS(StatusOS.AGUARDANDO_APROVACAO, {
      orcamentos: [{ id: 'orc1', status: 'GERADO' }],
    });
    repository.findById.mockResolvedValue(os);

    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });

  it('deve lançar BusinessException quando não há nenhum orçamento', async () => {
    const os = makeOS(StatusOS.AGUARDANDO_APROVACAO, { orcamentos: [] });
    repository.findById.mockResolvedValue(os);

    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });

  it('deve lançar NotFoundException quando OS não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
