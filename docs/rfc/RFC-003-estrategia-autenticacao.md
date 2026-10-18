# RFC-003 — Estratégia de Autenticação: Lambda (CPF) + Staff Interno

| Campo | Valor |
|---|---|
| Status | **Aceita** |
| Data | 2026-10-18 |
| Autora | Fernando Greco (líder do projeto) |
| Requisitos | R1, R2 (PDF Fase 3) |
| Decisão | D1 do [PLANO-FASE-3.md](../../PLANO-FASE-3.md) |

## Contexto

Na Fase 2, a aplicação é **emissor e validador** do JWT — [login.use-case.ts](../../src/modules/auth/application/use-cases/login.use-case.ts)
valida email+senha (bcrypt) e assina o token com `JWT_SECRET`. Na Fase 3, o PDF
exige autenticação de **clientes via CPF** por uma **Lambda** (repo 1), com o app
atrás de um **API Gateway**.

O sistema também tem usuários **staff** (ADMIN, ATENDENTE, MECÂNICO) que não são
clientes e precisam continuar operando rotas internas.

## Decisão

**Modelo dual de autenticação (multi-issuer)**, validado no mesmo `JwtStrategy`:

| Origem | Emissor | Claims | Uso |
|---|---|---|---|
| **Cliente** | Lambda (repo 1) — auth por CPF | `sub` (clienteId), `cpf`, `iat`, `exp`, `iss=lambda-auth` | Rotas sensíveis do cliente |
| **Staff** | App (interno) — login email+senha | `sub` (usuarioId), `email`, `papel`, `iss=oficina-staff` | Rotas administrativas |

**Contrato C1 (proposto pela autora, aceito pelo grupo):**

- **Algoritmo:** HS256 com **secret compartilhado** (mesmo `JWT_SECRET`)
- **Claims mínimos:** `sub`, `cpf`, `iat`, `exp`, `iss`
- **Erros:** 401 para token inválido/expirado
- **Migração futura:** RS256/JWKS — a verificação fica abstraída no `JwtStrategy`
  para trocar o algoritmo sem refatorar o restante

## Alternativas consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **Multi-issuer no mesmo guard** ✅ | Menor ruptura com os 259 testes atuais; staff não depende da Lambda | Guard um pouco mais complexo |
| Tudo na Lambda (staff com claim de papel) | Emissor único | Acopla staff à Lambda; migração maior; fora do escopo do PDF |
| Dois guards separados | Separação clara | Duplica lógica de `@Public`; mais pontos de falha |

## Consequências

- `JwtStrategy` valida o `iss` claim e delega para o handler correto (cliente × staff).
- O secret HS256 é compartilhado — a Lambda assina e o app verifica com a mesma chave.
- Cliente ganha campo `ativo` (migration) para a Lambda consultar existência/status.
- `/auth/login` permanece **apenas para staff**; clientes obtêm token na Lambda.
- Swagger e README documentam o novo fluxo de autenticação.

## Referências

- [PLANO-FASE-3.md](../../PLANO-FASE-3.md) — WS1, C1, D1
- RFC-004 — Observabilidade (Datadog)
