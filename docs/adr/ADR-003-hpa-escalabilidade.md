# ADR-003 — Escalabilidade via HPA (Horizontal Pod Autoscaler)

| Campo | Valor |
|---|---|
| Status | **Aceita** (migrada da Fase 2) |
| Data | 2026-10-18 (reafirmada na Fase 3) |

## Contexto

A Fase 3 exige cluster Kubernetes com escalabilidade. A aplicação é stateless
(sessão em JWT, dados no RDS) — escalar horizontalmente é o caminho natural.

## Decisão

**HPA** baseado em CPU (com fallback para métricas customizadas se necessário),
com mínimo de 2 réplicas para disponibilidade. Ver [k8s/hpa.yaml](../../k8s/hpa.yaml).

## Consequências

- Escala automaticamente sob carga (ex.: pico de abertura de OS).
- Requer **Metrics Server** no cluster (pendente no repo 2 — ver PLANO-FASE-3, C3).
- Probes `/health` e `/ready` garantem que só pods saudáveis recebam tráfego.
- Banco (RDS) é o gargalo natural — conexões gerenciadas pelo Prisma.

## Alternativas rejeitadas

- **VPA (Vertical)** — não remove o ponto único de falha de um único pod grande.
- **Escalonamento manual** — não atende ao requisito de escalabilidade automática.
