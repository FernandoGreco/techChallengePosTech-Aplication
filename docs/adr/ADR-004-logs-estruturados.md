# ADR-004 — Logs Estruturados JSON com Correlation ID

| Campo | Valor |
|---|---|
| Status | **Aceita** |
| Data | 2026-10-18 |

## Contexto

A Fase 3 exige logs estruturados com correlação ponta a ponta (requisito R8),
integrados a uma ferramenta de observabilidade de mercado (Datadog — ver
[RFC-004](../rfc/RFC-004-observabilidade-datadog.md)).

## Decisão

**Logs JSON estruturados** via `nestjs-pino` (pino), com:

- Formato JSON (uma linha por log) em produção; `pino-pretty` em desenvolvimento
- **Correlation ID** propagado: header `x-correlation-id` vindo do API Gateway;
  gerado (UUID) se ausente; devolvido no header de resposta
- **Trace correlation**: `dd-trace` injeta `dd.trace_id` nos logs (logInjection)
- Nível configurável via `LOG_LEVEL`

Implementação: [src/shared/logging/](../../src/shared/logging/).

## Consequências

- Cada requisição tem um ID único rastreável do gateway até os logs da app.
- Datadog correlaciona logs ↔ traces automaticamente (via trace_id).
- Troubleshooting de uma OS/requisição específica é direto (grep por correlation-id).
- Logs legíveis por máquina (parseáveis) e por humanos (pino-pretty em dev).

## Alternativas rejeitadas

- **Logs de texto livre** — difíceis de parsear e correlacionar em escala.
- **Winston** — pino tem performance superior e integração nativa com NestJS.
