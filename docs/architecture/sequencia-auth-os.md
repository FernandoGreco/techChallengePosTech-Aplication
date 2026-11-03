# Diagramas de Sequência — Auth via CPF e Abertura de OS

> Fase 3 — Fluxos críticos do sistema.

## 1. Autenticação de cliente via CPF (Lambda)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant GW as API Gateway
    participant L as Lambda (repo 1)
    participant DB as Aurora PostgreSQL (repo 3)

    Cliente->>GW: POST /auth/cpf { cpf }
    GW->>L: invoca Lambda com CPF
    L->>DB: SELECT id, nome, documento, ativo<br/>WHERE documento = cpf AND tipoDocumento = CPF
    DB-->>L: cliente encontrado e ativo (ou não encontrado/inativo)

    alt cliente existe e está ativo
        L->>L: assina JWT HS256<br/>{ sub: clienteId, cpf, iss: 'oficina-auth-lambda', iat, exp }
        L-->>GW: 200 { accessToken }
        GW-->>Cliente: 200 { accessToken }
    else cliente não encontrado ou inativo
        L-->>GW: 401 Unauthorized
        GW-->>Cliente: 401 Unauthorized
    end
```

**Contrato C1** (ver [RFC-003](../rfc/RFC-003-estrategia-autenticacao.md)):
HS256, secret compartilhado, claims `sub`/`cpf`/`iat`/`exp`/`iss=oficina-auth-lambda`.

## 2. Abertura de OS autenticada

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant GW as API Gateway
    participant API as API NestJS (repo 4)
    participant DB as Aurora PostgreSQL (repo 3)
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
    participant DB as Aurora PostgreSQL
    participant EMAIL as Email (nodemailer)
    participant DD as Datadog
    participant Browser as Navegador do cliente

    Cliente->>API: POST /ordens-servico (RECEBIDA)
    Staff->>API: iniciar diagnóstico (EM_DIAGNOSTICO)
    Staff->>API: gerar orçamento (AGUARDANDO_APROVACAO)
    API->>EMAIL: notifica cliente (orçamento pronto)
    API->>DD: métricas status_transition

    alt cliente aprova
        Cliente->>Browser: clica no link assinado do e-mail
        Browser->>API: GET /ordens-servico/:id/aprovar-orcamento
        Note over Browser,API: Token fica no fragmento da URL e não é enviado no GET
        API-->>Browser: página de confirmação (sem alterar estado)
        Cliente->>Browser: confirma aprovação
        Browser->>API: POST /ordens-servico/:id/aprovar-orcamento { actionToken }
        API->>API: valida assinatura, expiração, OS e ação
        API->>DB: reserva peças (valida estoque)
        API->>DB: status EM_EXECUCAO
        API->>DD: registra transição de status
        API->>DD: registra falha de estoque se houver erro
    else cliente recusa
        Cliente->>Browser: clica no link assinado do e-mail
        Browser->>API: GET /ordens-servico/:id/recusar-orcamento
        API-->>Browser: página de confirmação (sem alterar estado)
        Cliente->>Browser: confirma recusa
        Browser->>API: POST /ordens-servico/:id/recusar-orcamento { actionToken }
        API->>API: valida assinatura, expiração, OS e ação
        API->>DB: orçamento RECUSADO
    end

    Staff->>API: finalizar (FINALIZADA)
    Staff->>API: entregar (ENTREGUE)
```

A métrica `oficina.os.status_transition` conta as transições e inclui as tags
`de` e `para`. A duração por status é enviada separadamente pela métrica
histograma `oficina.os.tempo_status`, que alimenta o dashboard de tempo médio.
