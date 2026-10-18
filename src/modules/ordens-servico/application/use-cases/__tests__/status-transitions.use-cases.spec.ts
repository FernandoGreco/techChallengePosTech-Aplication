import { NotFoundException } from '@nestjs/common';
import { IniciarDiagnosticoUseCase } from '../iniciar-diagnostico.use-case';
import { RegistrarDiagnosticoUseCase } from '../registrar-diagnostico.use-case';
import { FinalizarOSUseCase } from '../finalizar-os.use-case';
import { EntregarOSUseCase } from '../entregar-os.use-case';
import { StatusOS } from '../../../domain/enums/status-os.enum';
import { BusinessException } from '../../../../../shared/exceptions';

const makeRepository = () => ({
  findById: jest.fn(),
  transicionarStatus: jest.fn(),
  atualizarDiagnostico: jest.fn(),
  baixarEstoque: jest.fn(),
  criar: jest.fn(),
  findAll: jest.fn(),
  findOperacionais: jest.fn(),
  findStatusById: jest.fn(),
  adicionarServico: jest.fn(),
  adicionarPeca: jest.fn(),
  gerarOrcamento: jest.fn(),
  aprovarOrcamento: jest.fn(),
  recusarOrcamento: jest.fn(),
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

describe('IniciarDiagnosticoUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: IniciarDiagnosticoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new IniciarDiagnosticoUseCase(repository);
  });

  it('deve transicionar OS de RECEBIDA para EM_DIAGNOSTICO', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.RECEBIDA));
    repository.transicionarStatus.mockResolvedValue(
      makeOS(StatusOS.EM_DIAGNOSTICO),
    );

    await useCase.execute('os1');

    expect(repository.transicionarStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'os1',
        statusAnterior: StatusOS.RECEBIDA,
        statusNovo: StatusOS.EM_DIAGNOSTICO,
      }),
    );
  });

  it('deve lançar BusinessException para transição inválida', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.EM_EXECUCAO));
    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });

  it('deve lançar NotFoundException se OS não existir', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(useCase.execute('os1')).rejects.toThrow(NotFoundException);
  });
});

describe('RegistrarDiagnosticoUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: RegistrarDiagnosticoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new RegistrarDiagnosticoUseCase(repository);
  });

  it('deve registrar diagnóstico quando OS está EM_DIAGNOSTICO', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.EM_DIAGNOSTICO));
    repository.atualizarDiagnostico.mockResolvedValue(
      makeOS(StatusOS.EM_DIAGNOSTICO),
    );

    await useCase.execute('os1', { diagnostico: 'Motor com problema' });

    expect(repository.atualizarDiagnostico).toHaveBeenCalledWith(
      'os1',
      'Motor com problema',
    );
  });

  it('deve lançar BusinessException se OS não estiver EM_DIAGNOSTICO', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.RECEBIDA));
    await expect(
      useCase.execute('os1', { diagnostico: 'Teste' }),
    ).rejects.toThrow(BusinessException);
  });
});

describe('FinalizarOSUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: FinalizarOSUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new FinalizarOSUseCase(repository);
  });

  it('deve finalizar OS e baixar estoque das peças', async () => {
    const os = makeOS(StatusOS.EM_EXECUCAO, {
      pecas: [
        { pecaId: 'p1', quantidade: 2 },
        { pecaId: 'p2', quantidade: 1 },
      ],
    });
    repository.findById.mockResolvedValue(os);
    repository.baixarEstoque.mockResolvedValue(makeOS(StatusOS.FINALIZADA));

    await useCase.execute('os1');

    expect(repository.baixarEstoque).toHaveBeenCalledWith({
      id: 'os1',
      pecas: [
        { pecaId: 'p1', quantidade: 2 },
        { pecaId: 'p2', quantidade: 1 },
      ],
    });
  });

  it('deve lançar BusinessException para transição inválida', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.RECEBIDA));
    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });
});

describe('EntregarOSUseCase', () => {
  let repository: ReturnType<typeof makeRepository>;
  let useCase: EntregarOSUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    useCase = new EntregarOSUseCase(repository);
  });

  it('deve transicionar OS de FINALIZADA para ENTREGUE', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.FINALIZADA));
    repository.transicionarStatus.mockResolvedValue(makeOS(StatusOS.ENTREGUE));

    await useCase.execute('os1');

    expect(repository.transicionarStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'os1',
        statusAnterior: StatusOS.FINALIZADA,
        statusNovo: StatusOS.ENTREGUE,
      }),
    );
  });

  it('deve lançar BusinessException para transição inválida', async () => {
    repository.findById.mockResolvedValue(makeOS(StatusOS.EM_EXECUCAO));
    await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  });
});
