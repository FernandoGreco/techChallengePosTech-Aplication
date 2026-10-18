import { RelatoriosController } from '../relatorios.controller';

describe('RelatoriosController', () => {
  const mockPrisma: any = { ordemServico: { findMany: jest.fn() } };

  it('retorna zeros quando não há OS finalizadas', async () => {
    mockPrisma.ordemServico.findMany.mockResolvedValue([]);
    const controller = new RelatoriosController(mockPrisma);
    const res = await controller.tempoMedioServicos();
    expect(res.totalOS).toBe(0);
    expect(res.tempoMedioMinutos).toBe(0);
  });

  it('calcula tempo médio corretamente quando há OS finalizadas', async () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

    mockPrisma.ordemServico.findMany.mockResolvedValue([
      {
        id: '1',
        numero: 1,
        dataInicioExecucao: twentyMinutesAgo,
        dataFinalizacao: now,
      },
      {
        id: '2',
        numero: 2,
        dataInicioExecucao: tenMinutesAgo,
        dataFinalizacao: now,
      },
    ]);

    const controller = new RelatoriosController(mockPrisma);
    const res = await controller.tempoMedioServicos();
    expect(res.totalOS).toBe(2);
    expect(res.detalhes.length).toBe(2);
    expect(typeof res.tempoMedioHoras).toBe('number');
  });
});
