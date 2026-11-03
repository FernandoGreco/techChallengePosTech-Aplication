import { MetricsService } from '../metrics.service';

/**
 * Mock de MetricsService para testes unitários.
 * Todas as funções são jest.fn() sem efeito colateral.
 */
export const makeMetricsMock = (): jest.Mocked<MetricsService> =>
  ({
    increment: jest.fn(),
    histogram: jest.fn(),
    osCriada: jest.fn(),
    osStatusTransition: jest.fn(),
    osFalhaEstoqueInsuficiente: jest.fn(),
    integracaoEmailErro: jest.fn(),
    osTempoStatus: jest.fn(),
  }) as unknown as jest.Mocked<MetricsService>;
