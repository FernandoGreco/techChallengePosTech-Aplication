# ADR-001 — Monólito Modular com Clean Architecture

| Campo | Valor |
|---|---|
| Status | **Aceita** (migrada da Fase 2) |
| Data | 2026-10-18 (reafirmada na Fase 3) |

## Contexto

O sistema de gestão de oficina mecânica precisa de alta testabilidade, separação
de responsabilidades e baixo acoplamento entre regras de negócio e frameworks.
A Fase 3 **não** exige microsserviços — exige evolução do monólito existente.

## Decisão

Manter o **monólito modular** em NestJS, com cada módulo de domínio organizado
em camadas de Clean Architecture:

```
modules/<dominio>/
  domain/         # entities, rules, repository interfaces (sem framework)
  application/    # use cases, DTOs
  infrastructure/ # repositories Prisma, services (email)
  presentation/   # controllers
```

Regra estrita: **domínio nunca depende de framework ou ORM** — depende apenas de
interfaces definidas no próprio domínio.

## Consequências

- 261 testes unitários com alta cobertura; regras de negócio testáveis isoladas.
- Troca de ORM/framework afeta apenas a camada de infrastructure.
- Deploy único (um pod, um banco) — simples de operar.
- Se um dia houver necessidade de extrair um módulo (ex.: OS), a separação por
  módulos e interfaces facilita.

## Alternativas rejeitadas

- **Microsserviços** — não exigidos pela Fase 3; overhead operacional não se paga.
- **Arquitetura em camadas tradicional** (controllers → services → repositories
  transversais) — acopla regras de negócio ao framework.
