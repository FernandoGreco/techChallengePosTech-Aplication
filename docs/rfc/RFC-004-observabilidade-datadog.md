# RFC-004 — Ferramenta de Observabilidade: Datadog

| Campo | Valor |
|---|---|
| Status | **Aceita** |
| Data | 2026-10-18 |
| Autora | Fernando Greco (líder do projeto) |
| Requisito | R7 (PDF Fase 3) |
| Decisão | D2 do [PLANO-FASE-3.md](../../PLANO-FASE-3.md) |

## Contexto

A Fase 3 exige monitoramento com ferramenta de mercado (Datadog **ou** New Relic),
substituindo o stack de desenvolvimento local (OpenTelemetry + Jaeger) usado na
Fase 2. Todos os repositórios do grupo (Lambda, infra K8s, infra DB e aplicação)
devem reportar no **mesmo** vendor para que dashboards e alertas sejam unificados.

## Decisão

**Datadog** como vendor único de observabilidade do grupo (APM, logs, métricas
customizadas, dashboards e alertas).

## Alternativas consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **Datadog** ✅ | Integração K8s madura (DaemonSet/Helm); dogstatsd simples para métricas de negócio; melhor story de dashboards/alertas | Free tier mais restrito |
| New Relic | Free tier generoso (100 GB/mês) | Integração K8s menos madura; ecossistema menos alinhado ao grupo |
| Manter OTel + Jaeger | Zero custo | Não atende ao requisito R7 (ferramenta de mercado); sem alertas/dashboards gerenciados |

## Consequências

- Remover dependências `@opentelemetry/*` e o bootstrap `src/tracing.ts`.
- Adicionar `dd-trace` (APM) inicializado **antes** de qualquer import no bootstrap.
- Métricas customizadas via `dd-trace` (dogstatsd): `oficina.os.*` e `oficina.integracao.*`.
- Logs JSON (nestjs-pino, já entregue no WS3) são coletados pelo agente Datadog
  (stdout em containers) e correlacionados ao trace via `trace_id`/`dd.trace_id`.
- Em ambiente sem `DD_API_KEY`/agente, o tracer entra em modo no-op — a aplicação
  continua funcional em dev local e nos testes.

## Referências

- [PLANO-FASE-3.md](../../PLANO-FASE-3.md) — WS2
- RFC-003 — Estratégia de autenticação (a escrever no WS1)
