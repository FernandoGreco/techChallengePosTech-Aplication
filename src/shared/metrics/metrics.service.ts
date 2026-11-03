import { Injectable, Logger } from '@nestjs/common';
import tracer from 'dd-trace';

/**
 * MetricsService — métricas customizadas de negócio para o Datadog (R9/R10).
 *
 * Usa o dogstatsd embutido no dd-trace. Sem agente Datadog acessível
 * (dev local, testes), as chamadas são no-op e não lançam erro.
 *
 * Convenção de nomes: `oficina.<domínio>.<evento>` com tags de contexto.
 * As 5 métricas da tabela WS2/R9-R10 do PLANO-FASE-3.md:
 * - oficina.os.criada (counter)
 * - oficina.os.status_transition (counter, tags de/para)
 * - oficina.os.falha_estoque_insuficiente (counter)
 * - oficina.integracao.email.erro (counter)
 * - oficina.os.tempo_status (histogram, tag status)
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  /** Incrementa um contador. Tags no formato ['chave:valor']. */
  increment(metric: string, tags: string[] = []): void {
    try {
      tracer.dogstatsd.increment(metric, 1, tags);
    } catch (error) {
      // Nunca deixar métrica derrubar o fluxo de negócio
      this.logger.warn(
        `Falha ao emitir métrica ${metric}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /** Registra um valor em histograma (ex.: tempo em ms por status). */
  histogram(metric: string, value: number, tags: string[] = []): void {
    try {
      tracer.dogstatsd.histogram(metric, value, tags);
    } catch (error) {
      this.logger.warn(
        `Falha ao emitir histograma ${metric}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  // ── Atalhos semânticos (domínio) ──────────────────────────────────────────

  osCriada(): void {
    this.increment('oficina.os.criada');
  }

  osStatusTransition(de: string, para: string): void {
    this.increment('oficina.os.status_transition', [
      `de:${de}`,
      `para:${para}`,
    ]);
  }

  osFalhaEstoqueInsuficiente(): void {
    this.increment('oficina.os.falha_estoque_insuficiente');
  }

  integracaoEmailErro(): void {
    this.increment('oficina.integracao.email.erro');
  }

  osTempoStatus(status: string, tempoMs: number): void {
    this.histogram('oficina.os.tempo_status', tempoMs, [`status:${status}`]);
  }
}
