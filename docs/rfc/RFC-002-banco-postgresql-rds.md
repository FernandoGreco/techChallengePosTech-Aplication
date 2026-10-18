# RFC-002 — Banco de Dados: PostgreSQL (RDS)

| Campo | Valor |
|---|---|
| Status | **Aceita** |
| Data | 2026-10-18 |
| Autora | Fernando Greco (líder do projeto) |

## Contexto

A Fase 3 exige banco de dados gerenciado. A Fase 2 já usava PostgreSQL (Docker
local) com Prisma ORM, modelo relacional consolidado (10 entidades, 4 enums,
integridade referencial, transações multi-agregado).

## Decisão

**PostgreSQL gerenciado via Amazon RDS** (repo 3), mantendo o modelo da Fase 2
e o Prisma como ORM.

## Alternativas consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **RDS PostgreSQL** ✅ | Gerenciado (backup, patching); compatível com Prisma; modelo relacional consolidado | Custo |
| PostgreSQL em EC2 | Controle total | Gerenciamento manual (backup, patching, failover) |
| NoSQL (DynamoDB/Mongo) | Escalabilidade horizontal | Migração do modelo relacional; perda de integridade referencial e transações multi-agregado (orçamento/estoque) |

## Consequências

- `DATABASE_URL` consumida via K8s Secret (não hardcoded).
- `prisma migrate deploy` executado no pipeline de deploy (a combinar com repo 3).
- Modelo relacional mantido — justificativa em [docs/database/modelo-er.md](../database/modelo-er.md).
- Pequena evolução do modelo: campo `ativo` em `Cliente` (WS1, RFC-003).

## Referências

- [PLANO-FASE-3.md](../../PLANO-FASE-3.md) — seção 2, R5; ADR-01 da Fase 2 (base)
- [docs/database/modelo-er.md](../database/modelo-er.md)
