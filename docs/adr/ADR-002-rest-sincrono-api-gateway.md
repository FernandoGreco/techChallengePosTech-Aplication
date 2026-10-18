# ADR-002 — Comunicação Síncrona REST via API Gateway

| Campo | Valor |
|---|---|
| Status | **Aceita** |
| Data | 2026-10-18 |

## Contexto

A Fase 3 exige que a aplicação fique atrás de um API Gateway, com autenticação
de clientes via Lambda (CPF). O sistema não tem requisitos de processamento
assíncrono de alta volumetria nem de eventos entre serviços.

## Decisão

**Comunicação síncrona REST/HTTP**, com todo o tráfego externo passando pelo
**API Gateway** (roteamento, CORS, rate limit, propagação de `x-correlation-id`).
A Lambda consulta a app por HTTP (`GET /clientes/documento/:documento`).

## Consequências

- Simplicidade operacional — sem brokers, filas ou tópicos.
- Correlação ponta a ponta via header `x-correlation-id` (ver [ADR-004](ADR-004-logs-estruturados.md)).
- Timeouts e retentativas tratados no gateway e na Lambda.
- Se surgir necessidade de eventos (ex.: notificações assíncronas em massa),
  uma fila pode ser adicionada pontualmente sem refazer a arquitetura.

## Alternativas rejeitadas

- **Mensageria/eventos (SQS, Kafka)** — não exigido; complexidade sem benefício
  para o volume do sistema.
- **gRPC** — ótimo para service-to-service interno, mas o PDF pede APIs REST
  e Swagger; REST é suficiente.
