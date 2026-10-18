# Diagramas de Sequência — Auth via CPF e Abertura de OS

> Fase 3 — Fluxos críticos do sistema.

## 1. Autenticação de cliente via CPF (Lambda)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant GW as API Gateway
    participant L as Lambda (repo 1)
    participant API as API NestJS (repo 4)
    participant DB as RDS PostgreSQL (repo 3)

    Cliente->>GW: POST /auth/cpf { cpf }
    GW->>L: invoca Lambda com CPF
    L->>API: GET /clientes/documento/{cpf}
    API->>DB: SELECT ... WHERE documento = cpf AND ativo = true
    DB-->>API: cliente encontrado (ou null)
    API-->>L: 200 { id, nome, ativo } | 404

    alt cliente existe e está ativo
        L->>L: assina JWT HS256<br/>{ sub: clienteId, cpf, iss: 'lambda-auth', iat, exp }
        L-->>GW: 200 { accessToken }
        GW-->>Cliente: 200 { accessToken }
    else cliente não encontrado ou inativo
        L-->>GW: 401 Unauthorized
        GW-->>Cliente: 401 Unauthorized
    end
```

**Contrato C1** (ver [RFC-003](../rfc/RFC-003-estrategia-autenticacao.md)):
HS256, secret compartilhado, claims `sub`/`cpf`/`iat`/`exp`/`iss=lambda-auth`.

## 2. Abertura de OS autenticada

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant GW as API Gateway
    participant API as API NestJS (repo 4)
    participant DB as RDS PostgreSQL (repo 3)
    participant DD as Datadog

    Cliente->>GW: POST /ordens-servico<br/>Authorization: Bearer {JWT Lambda}
    GW->>GW: propaga x-correlation-id
    GW->>API: encaminha request

    API->>API: JwtAuthGuard valida JWT<br/>(iss=lambda-auth → tipo=cliente)
    API->>API: CriarOrdemServicoUseCase<br/>valida clienteId/veiculoId
    API->>DB: INSERT ordem_servico (status=RECEBIDA)
    DB-->>API: OS criada
    API->>DD: métrica oficina.os.criada
    API->>DD: logs JSON com correlation-id + trace_id
    API-->>GW: 201 { id, numero, status: RECEBIDA }
    GW-->>Cliente: 201 Created
```

## 3. Fluxo completo da OS (visão de status)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    actor Staff
    participant API as API NestJS
    participant DB as RDS PostgreSQL
    participant EMAIL as Email (nodemailer)
    participant DD as Datadog

    Cliente->>API: POST /ordens-servico (RECEBIDA)
    Staff->>API: iniciar diagnóstico (EM_DIAGNOSTICO)
    Staff->>API: gerar orçamento (AGUARDANDO_APROVACAO)
    API->>EMAIL: notifica cliente (orçamento pronto)
    API->>DD: métricas status_transition

    alt cliente aprova
        Cliente->>API: POST /ordens-servico/:id/aprovar-orcamento
        API->>DB: reserva peças (valida estoque)
        API->>DB: status EM_EXECUCAO
        API->>DD: status_transition; falha_estoque_insuficiente se erro
    else cliente recusa
        Cliente->>API: POST /ordens-servico/:id/recusar-orcamento
        API->>DB: orçamento RECUSADO
    end

    Staff->>API: finalizar (FINALIZADA)
    Staff->>API: entregar (ENTREGUE)
```

Cada transição emite a métrica `oficina.os.status_transition` (tags `de`/`para`)
para o Datadog — base do dashboard "tempo médio por status" (R9).
