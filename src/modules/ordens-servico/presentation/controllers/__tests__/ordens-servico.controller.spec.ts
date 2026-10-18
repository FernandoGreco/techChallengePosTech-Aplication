import { OrdensServicoController } from '../ordens-servico.controller';

const makeMock = () => ({ execute: jest.fn() }) as any;

describe('OrdensServicoController', () => {
  let controller: OrdensServicoController;
  let criarOS: any;
  let listarOS: any;
  let buscarOSPorId: any;
  let consultarStatus: any;
  let adicionarServico: any;
  let adicionarPeca: any;
  let iniciarDiagnostico: any;
  let registrarDiagnostico: any;
  let gerarOrcamento: any;
  let aprovarOrcamento: any;
  let recusarOrcamento: any;
  let iniciarExecucao: any;
  let finalizarOS: any;
  let entregarOS: any;

  beforeEach(() => {
    jest.clearAllMocks();
    criarOS = makeMock();
    listarOS = makeMock();
    buscarOSPorId = makeMock();
    consultarStatus = makeMock();
    adicionarServico = makeMock();
    adicionarPeca = makeMock();
    iniciarDiagnostico = makeMock();
    registrarDiagnostico = makeMock();
    gerarOrcamento = makeMock();
    aprovarOrcamento = makeMock();
    recusarOrcamento = makeMock();
    iniciarExecucao = makeMock();
    finalizarOS = makeMock();
    entregarOS = makeMock();

    controller = new OrdensServicoController(
      criarOS,
      listarOS,
      buscarOSPorId,
      consultarStatus,
      adicionarServico,
      adicionarPeca,
      iniciarDiagnostico,
      registrarDiagnostico,
      gerarOrcamento,
      aprovarOrcamento,
      recusarOrcamento,
      iniciarExecucao,
      finalizarOS,
      entregarOS,
    );
  });

  it('criar chama CriarOrdemServicoUseCase.execute', async () => {
    const dto = { clienteId: 'c1', veiculoId: 'v1' } as any;
    criarOS.execute.mockResolvedValue({ id: 'o1', status: 'RECEBIDA' });
    await expect(controller.criar(dto)).resolves.toEqual({
      id: 'o1',
      status: 'RECEBIDA',
    });
    expect(criarOS.execute).toHaveBeenCalledWith(dto);
  });

  it('listarTodas chama ListarOrdensServicoUseCase.execute', async () => {
    const result = [{ id: 'o1' }];
    listarOS.execute.mockResolvedValue(result);
    await expect(controller.listarTodas()).resolves.toBe(result);
    expect(listarOS.execute).toHaveBeenCalled();
  });

  it('buscarPorId chama BuscarOrdemServicoPorIdUseCase.execute', async () => {
    buscarOSPorId.execute.mockResolvedValue({ id: 'o1' });
    await expect(controller.buscarPorId('o1')).resolves.toEqual({ id: 'o1' });
    expect(buscarOSPorId.execute).toHaveBeenCalledWith('o1');
  });

  it('consultarStatusOS chama ConsultarStatusOSUseCase.execute', async () => {
    consultarStatus.execute.mockResolvedValue({ status: 'RECEBIDA' });
    await expect(controller.consultarStatusOS('o1')).resolves.toEqual({
      status: 'RECEBIDA',
    });
    expect(consultarStatus.execute).toHaveBeenCalledWith('o1');
  });

  it('adicionarServicoOS chama AdicionarServicoOSUseCase.execute', async () => {
    const dto = { servicoId: 's1' } as any;
    adicionarServico.execute.mockResolvedValue({ success: true });
    await expect(controller.adicionarServicoOS('o1', dto)).resolves.toEqual({
      success: true,
    });
    expect(adicionarServico.execute).toHaveBeenCalledWith('o1', dto);
  });

  it('adicionarPecaOS chama AdicionarPecaOSUseCase.execute', async () => {
    const dto = { pecaId: 'p1', quantidade: 2 } as any;
    adicionarPeca.execute.mockResolvedValue({ success: true });
    await expect(controller.adicionarPecaOS('o1', dto)).resolves.toEqual({
      success: true,
    });
    expect(adicionarPeca.execute).toHaveBeenCalledWith('o1', dto);
  });

  it('iniciarDiagnosticoOS chama IniciarDiagnosticoUseCase.execute', async () => {
    iniciarDiagnostico.execute.mockResolvedValue({ success: true });
    await expect(controller.iniciarDiagnosticoOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(iniciarDiagnostico.execute).toHaveBeenCalledWith('o1');
  });

  it('registrarDiagnosticoOS chama RegistrarDiagnosticoUseCase.execute', async () => {
    const dto = { diagnostico: 'Motor OK' } as any;
    registrarDiagnostico.execute.mockResolvedValue({ success: true });
    await expect(controller.registrarDiagnosticoOS('o1', dto)).resolves.toEqual(
      { success: true },
    );
    expect(registrarDiagnostico.execute).toHaveBeenCalledWith('o1', dto);
  });

  it('gerarOrcamentoOS chama GerarOrcamentoUseCase.execute', async () => {
    gerarOrcamento.execute.mockResolvedValue({ success: true });
    await expect(controller.gerarOrcamentoOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(gerarOrcamento.execute).toHaveBeenCalledWith('o1');
  });

  it('aprovarOrcamentoOS chama AprovarOrcamentoUseCase.execute', async () => {
    aprovarOrcamento.execute.mockResolvedValue({ success: true });
    await expect(controller.aprovarOrcamentoOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(aprovarOrcamento.execute).toHaveBeenCalledWith('o1');
  });

  it('recusarOrcamentoOS chama RecusarOrcamentoUseCase.execute', async () => {
    recusarOrcamento.execute.mockResolvedValue({ success: true });
    await expect(controller.recusarOrcamentoOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(recusarOrcamento.execute).toHaveBeenCalledWith('o1');
  });

  it('iniciarExecucaoOS chama IniciarExecucaoUseCase.execute', async () => {
    iniciarExecucao.execute.mockResolvedValue({ success: true });
    await expect(controller.iniciarExecucaoOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(iniciarExecucao.execute).toHaveBeenCalledWith('o1');
  });

  it('finalizarOS chama FinalizarOSUseCase.execute', async () => {
    finalizarOS.execute.mockResolvedValue({ success: true });
    await expect(controller.finalizarOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(finalizarOS.execute).toHaveBeenCalledWith('o1');
  });

  it('entregarOS chama EntregarOSUseCase.execute', async () => {
    entregarOS.execute.mockResolvedValue({ success: true });
    await expect(controller.entregarOS('o1')).resolves.toEqual({
      success: true,
    });
    expect(entregarOS.execute).toHaveBeenCalledWith('o1');
  });
});
