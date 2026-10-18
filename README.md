# Oficina Mecânica - Sistema de Gestão (Fase 2)

## 1. Objetivo

Evolução do MVP acadêmico da Fase 1 para a **Fase 2 do Tech Challenge de pós-graduação em Arquitetura de Software**, com foco em:

- **Clean Code**: nomes claros, funções curtas e coesas, eliminação de duplicidade
- **Clean Architecture**: separação em camadas Domain → Application → Infrastructure → Presentation, com regras de dependência estritas (domínio nunca depende de framework ou ORM)
- **Testes automatizados**: cobertura dos fluxos críticos de negócio (abertura de OS, orçamento, aprovação/recusa, estoque, listagem)
- **Novas APIs obrigatórias da Fase 2**:
  - Abertura de OS retornando identificação única
  - Consulta pública de status da OS
  - Aprovação/recusa de orçamento via endpoint público (webhook de notificação externa)
  - Listagem operacional de OS ordenada por prioridade de status, excluindo (logicamente) OS finalizadas/entregues
  - **Atualização de status da OS via email** — notificação automática ao cliente quando o orçamento é gerado, com links de aprovação/recusa
- **Infraestrutura da Fase 2**: containerização com Docker, orquestração com Kubernetes (Deployments, Services, ConfigMaps, Secrets e HPA), provisionamento como código com Terraform (AWS) e pipeline de CI/CD completo via GitHub Actions

O sistema permite:
- Gestão de clientes e veículos
- Criação e acompanhamento de ordens de serviço (OS)
- Inclusão de serviços e peças/insumos
- Geração e aprovação de orçamentos, com **notificação automática por email**
- Controle de estoque
- Autenticação JWT para rotas administrativas
- Documentação completa via Swagger

## 2. Desenho da Arquitetura Proposta

### 2.1 Componentes da Aplicação

A API é um **monólito modular** em NestJS, organizado em camadas de Clean Architecture por módulo de domínio.

```mermaid
flowchart TB
    subgraph Client["Cliente / Consumidor da API"]
        SW["Swagger UI"]
        EXT["Sistema externo<br/>(clique no email de aprovação/recusa)"]
    end

    subgraph API["API NestJS — Monólito Modular"]
        direction TB
        GUARD["JwtAuthGuard + @Public()"]

        subgraph Modules["Módulos de Domínio"]
            AUTH["auth"]
            CLI["clientes"]
            VEI["veiculos"]
            SERV["servicos"]
            PEC["pecas"]
            OS["ordens-servico"]
            ORC["orcamentos"]
            REL["relatorios"]
        end

        subgraph Layers["Camadas (Clean Architecture) — por módulo"]
            PRES["Presentation<br/>Controllers + DTOs"]
            APP["Application<br/>Use Cases"]
            DOM["Domain<br/>Entities, Rules, Interfaces"]
            INFRA["Infrastructure<br/>Repositories Prisma + EmailService"]
        end

        PRES --> APP --> DOM
        INFRA -.implementa interface.-> DOM
    end

    subgraph Data["Persistência"]
        PG[("PostgreSQL")]
    end

    subgraph Notif["Notificação"]
        SMTP["Servidor SMTP<br/>(Ethereal / Gmail / SES)"]
    end

    subgraph Obs["Observabilidade"]
        JAEGER["Jaeger<br/>(tracing OpenTelemetry)"]
    end

    SW -->|HTTPS| GUARD --> Modules
    EXT -->|POST aprovar/recusar orçamento| GUARD
    Modules --> PRES
    INFRA -->|Prisma Client| PG
    INFRA -->|Nodemailer| SMTP
    SMTP -.email com links.-> EXT
    API -.traces OTLP.-> JAEGER
```

### 2.2 Infraestrutura Provisionada

Infraestrutura como Código via **Terraform**, provisionando os recursos na **AWS**. Manifestos de **Kubernetes** também são mantidos no repositório (`/k8s`) para orquestração com auto-scaling (HPA), aplicáveis tanto em cluster local (Docker Desktop/kind) quanto em cluster cloud.

```mermaid
flowchart TB
    subgraph GH["GitHub"]
        REPO["Repositório"]
        GHCR["GitHub Container Registry<br/>(imagem Docker)"]
    end

    subgraph AWS["AWS (provisionado via Terraform — /infra)"]
        subgraph Net["Rede"]
            VPC["VPC + Subnets + Internet Gateway"]
        end
        subgraph Compute["Compute"]
            EC2["EC2 t3.medium<br/>Docker Engine<br/>Security Group: 22 (SSH), 3000 (API)"]
        end
        subgraph DB["Banco de Dados"]
            RDS[("RDS PostgreSQL 16<br/>db.t3.micro")]
        end
        subgraph Storage["Armazenamento"]
            S3["S3 Bucket<br/>(anexos/uploads da OS)"]
        end
        subgraph State["Estado do Terraform"]
            TFS3["S3 Bucket<br/>(tfstate remoto)"]
        end
        VPC -.rede.-> EC2
        VPC -.rede.-> RDS
    end

    subgraph K8s["Kubernetes (manifestos /k8s — namespace oficina)"]
        NS["Namespace: oficina"]
        DEPL["Deployment<br/>oficina-api — 2 réplicas"]
        SVC["Service<br/>ClusterIP :3000"]
        HPA["HPA<br/>2-6 réplicas @ 70% CPU"]
        CM["ConfigMap"]
        SEC["Secret"]
        PGK8S["Postgres<br/>Deployment + PVC + Service"]
        NS --> DEPL --> SVC
        HPA -.escala.-> DEPL
        CM & SEC -.env vars.-> DEPL
        DEPL -.conecta.-> PGK8S
    end

    REPO -->|build| GHCR
    GHCR -->|docker pull| EC2
    EC2 -->|DATABASE_URL| RDS
    EC2 -.uploads.-> S3
    REPO -.terraform apply.-> AWS
    REPO -.kubectl apply.-> K8s
```

### 2.3 Fluxo de Deploy (CI/CD)

Pipeline em **GitHub Actions** (`.github/workflows/ci-cd.yml`), disparado em push para `main`, `develop` e `feature/*`.

```mermaid
flowchart LR
    subgraph CI["1. Continuous Integration"]
        direction TB
        C1["Checkout + Node 20"]
        C2["npm ci + prisma generate"]
        C3["ESLint"]
        C4["Jest — unitários + cobertura"]
        C5["E2E — Postgres efêmero"]
        C6["Build TypeScript"]
        C7["docker build (validação)"]
        C1-->C2-->C3-->C4-->C5-->C6-->C7
    end

    subgraph CD["2. Continuous Delivery"]
        direction TB
        D1["Build imagem Docker"]
        D2["Push para GHCR<br/>tags: sha, branch, latest/dev"]
        D3["Validar manifestos K8s (/k8s)"]
        D1-->D2-->D3
    end

    subgraph Deploy["3. Deploy AWS — apenas branch main"]
        direction TB
        E1["Terraform init<br/>(backend S3 remoto)"]
        E2["Terraform import<br/>(evita recursos duplicados)"]
        E3["Terraform apply<br/>(VPC + EC2 + RDS + S3 + SG)"]
        E4["Capturar outputs<br/>(IP EC2, endpoint RDS)"]
        E5["SSH na EC2:<br/>docker pull + docker run"]
        E1-->E2-->E3-->E4-->E5
    end

    CI -->|todas as branches| CD
    CD -->|somente main| Deploy
```

**Resumo do fluxo:**
1. Desenvolvedor faz push/PR → CI roda lint, testes unitários, cobertura, testes E2E (com Postgres efêmero) e build
2. Se CI passa, CD constrói a imagem Docker e publica no GHCR com tags (`latest` para `main`, `dev` para `develop`)
3. Manifestos Kubernetes são validados sintaticamente no pipeline
4. Apenas em push para `main`: Terraform provisiona/atualiza a infraestrutura AWS (idempotente via `terraform import`) e a nova imagem é implantada via SSH na instância EC2
5. Alternativamente, os mesmos manifestos `/k8s` podem ser aplicados manualmente em qualquer cluster Kubernetes (local ou cloud) — ver seção 8

## 3. Tecnologias Utilizadas e Justificativas

| Tecnologia | Versão | Por que foi escolhida |
|---|---|---|
| **Node.js** | 20.x LTS | Runtime JavaScript maduro com suporte a I/O assíncrono não-bloqueante — ideal para APIs REST que realizam muitas operações de banco em paralelo (transactions, includes). A equipe já domina o ecossistema Node por trabalhar com Angular no frontend, reduzindo a curva de aprendizado e permitindo compartilhar padrões e ferramentas entre back e front |
| **TypeScript** | 5.x | Tipagem estática elimina erros em tempo de desenvolvimento, é obrigatório no ecossistema NestJS e facilita o contrato entre camadas (domain ↔ application ↔ infra) sem casting em tempo de execução. Por ser a linguagem que toda a equipe já tem fluência, acelerando o desenvolvimento e o code review |
| **NestJS** | 11.x | Framework opinativo com suporte nativo a injeção de dependência, módulos, guards e decorators — permite separar camadas de forma declarativa sem boilerplate. Alinhado com a arquitetura hexagonal/Clean Architecture pela facilidade de registrar implementações por token (`useClass`) |
| **PostgreSQL** | 16 | Banco relacional com transações ACID, integridade referencial via FK e suporte a JSON — necessário para o domínio complexo com múltiplas relações (OS → Orçamentos → Histórico). Ver seção 17 para análise detalhada |
| **Prisma ORM** | 5.x | Gera tipos TypeScript automaticamente a partir do schema, simplifica migrations e oferece query builder type-safe. Isolado na camada de infra — use cases dependem de interfaces, não do Prisma diretamente |
| **JWT** (`@nestjs/jwt`) | 11.x | Stateless, sem necessidade de session store no servidor. Payload carrega `sub`, `email` e `papel`, eliminando roundtrip ao banco para autorização |
| **bcryptjs** | 3.x | Hash de senhas com salt adaptativo (fator de custo configurável). Resistente a ataques de rainbow table e força bruta |
| **Swagger** (`@nestjs/swagger`) | 11.x | Documentação gerada diretamente dos decorators NestJS, sempre sincronizada com o código. Reduz divergência entre código e spec |
| **Jest** | 30.x | Framework de testes padrão do ecossistema NestJS, com suporte a mocks, spies e cobertura integrada. Permite testar use cases em isolamento sem subir banco. A equipe tem experiencia com Jest ou Karma/Jasmine, tornando a escrita de testes mais natural e produtiva |
| **Nodemailer** | 7.x | Biblioteca padrão de mercado para envio de email via Node.js, com suporte nativo a SMTP, TLS e múltiplos provedores (Gmail, SendGrid, SES). Permite trocar de provedor apenas alterando variáveis de ambiente, sem alterar código — a implementação fica isolada em `infrastructure/services`, atrás da interface `INotificacaoOrcamentoService` |
| **Ethereal Email** | - | Serviço de SMTP fake voltado para testes, usado como *fallback* de desenvolvimento quando `SMTP_USER`/`SMTP_PASS` não estão configurados. Gera credenciais reais de teste sob demanda via `nodemailer.createTestAccount()`, captura o email "enviado" sem entregá-lo de fato e disponibiliza um link de preview público. Evita a necessidade de uma conta de email real só para demonstrar o requisito da Fase 2 em ambiente local/CI, e elimina o risco de disparar emails reais acidentalmente durante testes |
| **OpenTelemetry + Jaeger** | - | Instrumentação automática (`auto-instrumentations-node`) para tracing distribuído das requisições HTTP e queries Prisma, exportado via OTLP para o Jaeger. Permite visualizar a latência de cada camada (controller → use case → repository → banco) durante o desenvolvimento e depuração |
| **Docker / Docker Compose** | - | Garante ambiente reproduzível entre dev, CI e produção. `docker compose up` sobe API + PostgreSQL + Jaeger em um comando |
| **Kubernetes** | - | Orquestração de containers com auto-scaling horizontal (HPA), necessário para suportar picos de demanda de OS sem intervenção manual — requisito obrigatório da Fase 2 |
| **Terraform** | 1.9.x | Infraestrutura como código — provisionamento reproduzível e versionado da VPC, EC2, RDS e S3 na AWS, com estado remoto em S3 |
| **GitHub Actions** | - | Pipeline de CI/CD nativa do GitHub, sem custo adicional de ferramenta externa, com suporte a secrets, matrizes de jobs e integração direta com GHCR |
| **ESLint + Prettier** | - | Lint e formatação automática garantem consistência de estilo e evitam debates de formatação em code review |

## 4. Arquitetura

O projeto segue a arquitetura de **monolito modular** com conceitos de **Domain-Driven Design (DDD)** aplicados.

### Camadas
- **Domain**: Entidades, enums, regras de negócio e interfaces de repositórios
- **Application**: Casos de uso (use cases) e DTOs
- **Infrastructure**: Implementações de repositórios com Prisma
- **Presentation**: Controllers REST

## 5. Estrutura de Pastas

```
src/
├── modules/
│   ├── auth/                    # Autenticação JWT
│   │   ├── application/dto/
│   │   ├── application/use-cases/
│   │   ├── domain/decorators/
│   │   ├── domain/repositories/
│   │   ├── infrastructure/
│   │   └── presentation/controllers/
│   ├── clientes/                # Gestão de clientes
│   │   ├── application/dto/
│   │   ├── application/use-cases/
│   │   ├── domain/enums/
│   │   ├── domain/repositories/
│   │   ├── infrastructure/repositories/
│   │   └── presentation/controllers/
│   ├── veiculos/                # Gestão de veículos
│   ├── servicos/                # Catálogo de serviços
│   ├── pecas/                   # Peças e controle de estoque
│   │   ├── domain/rules/        # Regras de estoque
│   │   └── ...
│   ├── ordens-servico/          # Ordens de serviço
│   │   ├── domain/rules/        # Máquina de estados da OS
│   │   ├── domain/services/     # Interface de notificação por email
│   │   ├── infrastructure/services/ # Implementação Nodemailer
│   │   └── ...
│   ├── orcamentos/              # Orçamentos
│   └── relatorios/              # Relatórios
├── shared/
│   ├── database/                # PrismaService global
│   ├── exceptions/              # BusinessException
│   └── validators/              # CPF, CNPJ, Placa
├── app.module.ts
└── main.ts

k8s/                              # Manifestos Kubernetes
├── namespace.yaml
├── configmap.yaml
├── secret.yaml
├── app-deployment.yaml
├── app-service.yaml
├── hpa.yaml
└── postgres/

infra/                            # Terraform (IaC)
├── providers.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── vpc.tf
├── subnet.tf
└── internet-g.tf

.github/workflows/
└── ci-cd.yml                     # Pipeline de CI/CD
```

## 6. Como Rodar com Docker

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd oficina-mecanica

# Subir a aplicação com Docker Compose
docker compose up --build

# A aplicação estará disponível em:
# API: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
# Jaeger (tracing): http://localhost:16686
```

## 7. Como Rodar Localmente (sem Docker)

### Pré-requisitos
- Node.js 20+ LTS (22 LTS recomendado)
- PostgreSQL 16+
- npm

### Inicialização no PowerShell

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oficina_mecanica?schema=public"
$env:JWT_SECRET="oficina-mecanica-jwt-secret-dev"
$env:JWT_EXPIRES_IN="1d"
$env:PORT="3000"

npm ci
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

Observação: a aplicação lê as variáveis de ambiente do terminal atual. Se você abrir um novo PowerShell, defina os valores novamente antes de iniciar a API.

Se o banco já tiver dados antigos e você quiser reiniciar do zero, crie um banco novo ou limpe o schema antes de rodar a migration e o seed.

## 8. Deploy em Kubernetes

A aplicação pode ser executada em um cluster Kubernetes (local ou cloud). Os manifestos necessários estão disponíveis no diretório `/k8s`.

A solução utiliza Kubernetes para orquestração dos containers da API e do PostgreSQL, permitindo gerenciamento de réplicas, configuração centralizada, persistência de dados e escalabilidade horizontal automática.

### Arquitetura Kubernetes

```text
                    Kubernetes Cluster
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      oficina-api-service       postgres-service
              │                         │
              ▼                         ▼
       API Deployment          PostgreSQL Deployment
              │                         │
       ┌──────┴──────┐                  ▼
       ▼             ▼             PostgreSQL Pod
    API Pod        API Pod               │
       │             │                   ▼
       └──────┬──────┘                  PVC
              │
              ▼
             HPA
       min: 2 / max: 6
         CPU alvo: 70%
```

### Estrutura dos manifestos

```text
k8s/
├── namespace.yaml
├── configmap.yaml
├── secret.yaml
├── app-deployment.yaml
├── app-service.yaml
├── hpa.yaml
└── postgres/
    ├── postgres-deployment.yaml
    ├── postgres-service.yaml
    └── postgres-pvc.yaml
```

### Recursos utilizados

- **Namespace**: isolamento dos recursos da aplicação através do namespace `oficina`;
- **Deployment da API**: mantém as instâncias da API NestJS em execução;
- **Service da API**: fornece acesso estável aos pods da aplicação;
- **Deployment PostgreSQL**: executa o banco PostgreSQL dentro do cluster;
- **Service PostgreSQL**: permite a comunicação interna entre API e banco;
- **PersistentVolumeClaim (PVC)**: fornece persistência aos dados do PostgreSQL;
- **ConfigMap**: armazena configurações não sensíveis da aplicação;
- **Secret**: armazena configurações sensíveis utilizadas pela aplicação (JWT_SECRET, DATABASE_URL, credenciais SMTP);
- **Horizontal Pod Autoscaler (HPA)**: realiza escalabilidade automática dos pods da API.

### Pré-requisitos

Para execução local:

- Docker Desktop;
- Kubernetes habilitado no Docker Desktop (ou `kind`/`minikube`);
- `kubectl` configurado;
- Metrics Server instalado no cluster.

Verifique o cluster:

```bash
kubectl get nodes
```

### Deploy no Kubernetes

Primeiro aplique o namespace:

```bash
kubectl apply -f k8s/namespace.yaml
```

Depois aplique ConfigMap e Secret:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

Suba o PostgreSQL:

```bash
kubectl apply -f k8s/postgres/
```

Suba a aplicação:

```bash
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

Por último, configure o autoscaling:

```bash
kubectl apply -f k8s/hpa.yaml
```

### Verificando os recursos

```bash
# Todos os recursos do namespace
kubectl get all -n oficina

# Recursos específicos
kubectl get pods -n oficina
kubectl get deployments -n oficina
kubectl get services -n oficina
kubectl get pvc -n oficina
kubectl get configmaps -n oficina
kubectl get hpa -n oficina
```

### Acessando a API

```bash
kubectl port-forward service/oficina-api-service 3000:3000 -n oficina
```

A API ficará disponível em `http://localhost:3000` e o Swagger em `http://localhost:3000/api/docs`.

### Horizontal Pod Autoscaler (HPA)

A API utiliza **Horizontal Pod Autoscaler** para escalabilidade automática conforme o consumo de CPU.

| Configuração | Valor |
|---|---:|
| Réplicas mínimas | 2 |
| Réplicas máximas | 6 |
| CPU alvo | 70% |

O HPA monitora o consumo médio de CPU dos pods e ajusta automaticamente a quantidade de réplicas do Deployment `oficina-api`.

```bash
# Em um terminal
kubectl get hpa -n oficina -w

# Em outro terminal
kubectl get pods -n oficina -w
```

Durante testes de carga no ambiente local, a aplicação escalou automaticamente de **2 para 6 pods**, demonstrando o funcionamento do HPA.

### Metrics Server

O HPA depende da API de métricas do Kubernetes:

```bash
kubectl top nodes
kubectl top pods -n oficina
```

Caso o Metrics Server ainda não esteja instalado:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Em ambientes locais Docker Desktop/kind pode ser necessário permitir a comunicação do Metrics Server com o kubelet:

```bash
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/args/-",
    "value": "--kubelet-insecure-tls"
  }
]'
```

> O uso de `--kubelet-insecure-tls` é destinado somente ao ambiente local de desenvolvimento e não é recomendado em produção.

### Removendo o ambiente Kubernetes

```bash
kubectl delete namespace oficina
```

## 9. Variáveis de Ambiente

| Variável | Descrição | Valor padrão |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:postgres@localhost:5432/oficina_mecanica?schema=public` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `oficina-mecanica-jwt-secret-dev` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `1d` |
| `PORT` | Porta da aplicação | `3000` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint OTLP do Jaeger para tracing | `http://jaeger:4318/v1/traces` |
| `APP_URL` | URL base usada para montar os links de aprovar/recusar orçamento no email | `http://localhost:3000` |
| `SMTP_HOST` | Servidor SMTP para envio de email | `smtp.ethereal.email` |
| `SMTP_PORT` | Porta do servidor SMTP | `587` |
| `SMTP_USER` | Usuário de autenticação SMTP | *(vazio — gera conta de teste Ethereal automaticamente)* |
| `SMTP_PASS` | Senha de autenticação SMTP | *(vazio — gera conta de teste Ethereal automaticamente)* |
| `SMTP_FROM` | Endereço de email remetente (aceita `email@dominio.com` ou `Nome <email@dominio.com>`) | `noreply@oficina.com` |
| `SMTP_TLS_REJECT_UNAUTHORIZED` | Validação de certificado TLS. Definir `false` apenas em redes corporativas com inspeção SSL — **nunca em produção** | `true` |

> Ver seção 20 para detalhes completos da notificação por email.

## 10. Provisionamento de Infraestrutura com Terraform (`/infra`)

Os arquivos de infraestrutura como código (IaC) estão armazenados na pasta `/infra` e são gerenciados via **Terraform**. O estado é armazenado remotamente em um bucket S3 para garantir consistência entre execuções da esteira.

### Diagrama de Arquitetura AWS

```mermaid
flowchart TB
    User(["Usuário / Cliente"]) -->|HTTP/REST| EC2["EC2 Instance<br/>Docker + API Node.js"]

    subgraph AWS["AWS Cloud — us-east-1"]
        EC2 -->|"Conexão TCP :5432"| RDS[("RDS PostgreSQL 16")]
        EC2 -.->|"uploads futuros"| S3["S3 Bucket<br/>Storage"]

        subgraph Seguranca["Segurança"]
            SG_APP["Security Group App<br/>Liberado: 22, 3000"] -.-> EC2
            SG_RDS["Security Group RDS<br/>Liberado: 5432"] -.-> RDS
        end
    end

    GitHub["GitHub Actions<br/>CI/CD Pipeline"] -->|"SSH / Deploy"| EC2
    GitHub -->|"Terraform Apply"| AWS
```

### Recursos Provisionados
- **VPC**: rede virtual isolada para a infraestrutura do projeto (`vpc.tf`)
- **Subnets**: sub-redes públicas e privadas (`subnet.tf`)
- **Internet Gateway**: roteamento de tráfego para acesso à internet (`internet-g.tf`)
- **Security Groups**: liberação de portas 22 (SSH) e 3000 (API) para a EC2; porta 5432 (PostgreSQL) para o RDS
- **EC2 (`t3.medium`)**: instância que executa a aplicação containerizada via Docker
- **RDS PostgreSQL 16 (`db.t3.micro`)**: banco de dados gerenciado
- **S3 Bucket**: armazenamento de anexos/uploads da OS
- **Key Pair SSH**: gerada automaticamente para acesso à instância EC2

### Executando o Terraform

```bash
cd infra

# Inicializar os provedores e módulos
terraform init

# Validar os arquivos de configuração
terraform validate

# Visualizar o plano de execução
terraform plan

# Aplicar e criar a infraestrutura na cloud
terraform apply

# Consultar outputs (IP da EC2, endpoint do RDS)
terraform output
```

> **Iteração local rápida:** se quiser apenas validar mudanças sem usar o backend remoto em S3 (ex.: sem credenciais AWS configuradas), rode `terraform init -backend=false` no lugar do `init` padrão.

> Em produção, o pipeline de CI/CD (seção 21) executa esses mesmos comandos automaticamente, com backend remoto de estado em S3 e importação de recursos já existentes para evitar duplicação.

## 11. Como Executar Migrations

```bash
# Criar e aplicar migrations
npx prisma migrate dev --name init

# Apenas aplicar migrations existentes (produção)
npx prisma migrate deploy
```

## 12. Como Rodar Seed

```bash
npm run prisma:seed
```

O seed cria:
- Usuário admin (`admin@email.com` / `123456`)
- Usuário atendente (`atendente@email.com` / `123456`)
- Usuário mecânico (`mecanico@email.com` / `123456`)
- 5 serviços pré-cadastrados
- 5 peças/insumos com estoque
- 1 cliente de exemplo
- 1 veículo de exemplo

## 13. Como Executar Testes

```bash
# Testes unitários
npm test

# Testes com cobertura (gera relatório em coverage/lcov-report/index.html)
npm run test:cov

# Abrir relatório HTML de cobertura (Windows)
npm run test:cov:open

# Testes de integração (e2e) - requer banco PostgreSQL rodando
npm run test:e2e
```

### Resultado da execução (`npm test`)

```
Test Suites: 39 passed, 39 total
Tests:       251 passed, 251 total
Snapshots:   0 total
Time:        ~20s
```

### Cobertura (`npm run test:cov`)

```
=============================== Coverage summary ===============================
Statements   : 93.55%  ( 987/1055 )
Branches     : 80.35%  (  180/224 )
Functions    : 92.78%  (  193/208 )
Lines        : 93.12%  (  867/931 )
=================================================================================
```

### O que está coberto por módulo

| Módulo | Suítes | Testes | Cenários cobertos |
|---|:---:|:---:|---|
| `ordens-servico` use cases | 5 | 43 | Criar OS (status RECEBIDA obrigatório); listar operacionais; buscar por ID; consultar status; adicionar serviço/peça (status válido/inválido); iniciar diagnóstico; registrar diagnóstico; gerar orçamento (cálculo serviços + peças, dispara notificação); aprovar (reserva de estoque, **estoque insuficiente bloqueia**); recusar (retorna para EM_DIAGNOSTICO); iniciar execução (orçamento APROVADO obrigatório); finalizar (baixa de estoque); entregar; todas as **transições inválidas de status lançam exceção** |
| `ordens-servico` repository | 2 | 19 | `findOperacionais`: exclui FINALIZADA/ENTREGUE via WHERE Prisma; ordenação por prioridade de status; mais antigas primeiro no mesmo status. `criar`: valida cliente, veículo e pertencimento. `adicionarServico/Peca`: NotFoundException quando não existe. `transicionarStatus`: chama `$transaction`. `atualizarDiagnostico` |
| `ordens-servico` mapper | 1 | 9 | `toDomain` com todas as relações (cliente, veículo, serviços, peças, orçamentos, histórico); relações `undefined` retornam arrays vazios; `toStatusConsulta` expõe apenas campos de status |
| `ordens-servico` controller | 1 | 14 | Cada um dos 14 endpoints delega ao use case correto com os parâmetros exatos |
| `ordens-servico` domain rules | 1 | 18 | Todas as transições válidas e inválidas da máquina de estados (`StatusOSRules`) |
| `ordens-servico` DTOs | 1 | 7 | Validação de payload de criação de OS, adicionar serviço/peça e registrar diagnóstico |
| `ordens-servico` notificação por email | 1 | 11 | Envio com dados corretos; auto-provisionamento de conta Ethereal; remetente com/sem nome formatado; cliente sem email não bloqueia o fluxo |
| `pecas` use case + repository + rules + controller | 4 | 31 | Criar, listar, reservar, baixar estoque; disponibilidade insuficiente lança exceção; baixa não gera saldo negativo |
| `clientes` use case + repository + controller | 3 | 17 | CRUD; documento duplicado gera conflito; busca por CPF/CNPJ |
| `veiculos` use case + repository + controller | 3 | 21 | CRUD; validar pertencimento do veículo ao cliente |
| `servicos` use case + repository + controller | 3 | 16 | CRUD de catálogo de serviços |
| `auth` LoginUseCase + módulo | 2 | 7 | Credenciais válidas retornam JWT; e-mail não encontrado rejeita; senha errada rejeita; wiring do módulo |
| `auth` JwtStrategy + Guard + Controller | 3 | 4 | Validação de payload JWT; `@Public()` bypassa o guard; token inválido é rejeitado |
| `auth` UsuarioPrismaRepository | 1 | 3 | `findByEmail` encontrado/não encontrado; `select` busca apenas campos necessários (sem expor dados extras) |
| `relatorios` controller | 1 | 2 | Retorno do relatório de tempo médio de serviços |
| `shared` validators | 5 | 26 | CPF válido/inválido (algoritmo completo); CNPJ válido/inválido; documento genérico; placa formato antigo e Mercosul |
| `shared` PrismaService | 1 | 2 | Inicialização; desconexão em shutdown |
| smoke test | 1 | 1 | Todos os módulos da aplicação carregam sem erro de DI |

### Estratégia de testes

```
Presentation  ──► Controller tests: verifica que cada rota delega ao use case correto
Application   ──► Use case tests: usa MOCK de repository — zero banco, zero I/O
Domain        ──► Rule tests: TypeScript puro, sem dependências externas
Infrastructure──► Repository tests: usa MOCK do PrismaService — verifica queries geradas
```

**Por que mock de repository nos use cases?**
- Testa a lógica de negócio em isolamento total — um teste que falha indica problema no domínio, não no banco
- Execução em milissegundos (sem conexão real)
- Cenários difíceis de reproduzir no banco (estoque exato no limite, transições inválidas) são triviais com mocks

**Exemplo real — teste de aprovação com estoque insuficiente:**
```typescript
it('deve lançar BusinessException quando estoque insuficiente', async () => {
  repository.findById.mockResolvedValue(makeOS(StatusOS.AGUARDANDO_APROVACAO, {
    pecas: [{ pecaId: 'p1', quantidade: 10, peca: {
      quantidadeEstoque: 5,
      quantidadeReservada: 0,
    }}],
    orcamentos: [{ status: 'GERADO' }],
  }));

  await expect(useCase.execute('os1')).rejects.toThrow(BusinessException);
  expect(repository.aprovarOrcamento).not.toHaveBeenCalled(); // nada foi persistido
});
```

## 14. Como Acessar o Swagger

Após iniciar a aplicação, acesse:

```
http://localhost:3000/api/docs
```

Para autenticar no Swagger:
1. Execute `POST /auth/login` com as credenciais
2. Copie o `accessToken` retornado
3. Clique em "Authorize" no topo do Swagger
4. Cole o token no campo "Value"

## 15. Usuário Admin de Teste

| Campo | Valor |
|---|---|
| Email | `admin@email.com` |
| Senha | `123456` |
| Papel | `ADMIN` |

## 16. Principais Endpoints

### Autenticação
| Método | Rota | Descrição | Pública |
|---|---|---|---|
| POST | `/auth/login` | Login e obtenção de JWT | Sim |

### Clientes
| Método | Rota | Descrição |
|---|---|---|
| POST | `/clientes` | Criar cliente |
| GET | `/clientes` | Listar clientes |
| GET | `/clientes/:id` | Buscar por ID |
| GET | `/clientes/documento/:documento` | Buscar por CPF/CNPJ |
| PUT | `/clientes/:id` | Atualizar |
| DELETE | `/clientes/:id` | Remover |

### Veículos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/veiculos` | Criar veículo |
| GET | `/veiculos` | Listar veículos |
| GET | `/veiculos/:id` | Buscar por ID |
| GET | `/clientes/:clienteId/veiculos` | Veículos do cliente |
| PUT | `/veiculos/:id` | Atualizar |
| DELETE | `/veiculos/:id` | Remover |

### Serviços
| Método | Rota | Descrição |
|---|---|---|
| POST | `/servicos` | Criar serviço |
| GET | `/servicos` | Listar serviços |
| GET | `/servicos/:id` | Buscar por ID |
| PUT | `/servicos/:id` | Atualizar |
| DELETE | `/servicos/:id` | Remover |

### Peças / Insumos
| Método | Rota | Descrição |
|---|---|---|
| POST | `/pecas` | Criar peça |
| GET | `/pecas` | Listar peças |
| GET | `/pecas/:id` | Buscar por ID |
| PUT | `/pecas/:id` | Atualizar |
| DELETE | `/pecas/:id` | Remover |
| POST | `/pecas/:id/entrada-estoque` | Entrada de estoque |
| POST | `/pecas/:id/reservar` | Reservar peça |
| POST | `/pecas/:id/baixar-estoque` | Baixa de estoque |

### Ordens de Serviço
| Método | Rota | Descrição | Pública |
|---|---|---|---|
| POST | `/ordens-servico` | Criar OS | Não |
| GET | `/ordens-servico` | Listar OS (ordenada por prioridade, exclui FINALIZADA/ENTREGUE) | Não |
| GET | `/ordens-servico/:id` | Detalhar OS | Não |
| GET | `/ordens-servico/:id/status` | Status da OS | Sim |
| POST | `/ordens-servico/:id/servicos` | Adicionar serviço | Não |
| POST | `/ordens-servico/:id/pecas` | Adicionar peça | Não |
| POST | `/ordens-servico/:id/iniciar-diagnostico` | Iniciar diagnóstico | Não |
| POST | `/ordens-servico/:id/registrar-diagnostico` | Registrar diagnóstico | Não |
| POST | `/ordens-servico/:id/gerar-orcamento` | Gerar orçamento (dispara email) | Não |
| POST | `/ordens-servico/:id/aprovar-orcamento` | Aprovar orçamento | Sim |
| POST | `/ordens-servico/:id/recusar-orcamento` | Recusar orçamento (retorna OS para diagnóstico) | Sim |
| POST | `/ordens-servico/:id/iniciar-execucao` | Iniciar execução | Não |
| POST | `/ordens-servico/:id/finalizar` | Finalizar OS | Não |
| POST | `/ordens-servico/:id/entregar` | Entregar veículo | Não |

### Relatórios
| Método | Rota | Descrição |
|---|---|---|
| GET | `/relatorios/tempo-medio-servicos` | Tempo médio de execução |

## 17. Decisões Técnicas

### ADR-01 — Banco de Dados: PostgreSQL

**Contexto:** o domínio possui relações profundas (Cliente → Veículo → OS → Serviços/Peças → Orçamento → Histórico de status) e operações que exigem atomicidade (geração de orçamento, aprovação com reserva de estoque, finalização com baixa).

**Decisão:** PostgreSQL 16.

| Critério | Justificativa |
|---|---|
| **Integridade referencial** | FK garantidas pelo banco — inconsistências não chegam ao domínio |
| **Transações ACID** | Aprovação de orçamento reserva peças e muda status numa única transaction; rollback automático em falha |
| **Consultas analíticas** | Módulo de relatórios (tempo médio de serviços) usa agregações SQL nativas |
| **Integração com Prisma** | Suporte de primeira classe — migrations, seed e tipos TypeScript gerados automaticamente |
| **Maturidade** | Open-source, battle-tested, amplamente adotado em produção; LTS ativo |

**Alternativas descartadas:** MongoDB (sem joins nativos, dificulta transações multi-coleção); MySQL (menos recursos analíticos, sintaxe de FK menos robusta em versões antigas).

---

### ADR-02 — Framework: NestJS

**Contexto:** necessidade de estrutura que suporte DI, módulos independentes e integração com Passport/JWT sem boilerplate excessivo.

**Decisão:** NestJS 11.

- **Inversão de controle via DI container:** registrar `{ provide: ORDEM_SERVICO_REPOSITORY, useClass: OrdemServicoPrismaRepository }` no módulo desacopla use cases da implementação Prisma — use cases dependem de interfaces, não de concretos
- **Módulos como unidade de encapsulamento:** cada módulo (`ClientesModule`, `OrdensServicoModule`, etc.) declara seus providers e exports, impedindo acoplamento acidental entre módulos
- **Guards e decorators declarativos:** `@JwtAuthGuard()` e `@Public()` aplicados no controller sem lógica de autorização espalhada nos use cases
- **Geração de Swagger integrada:** `@ApiTags`, `@ApiOperation` e `@ApiResponse` geram documentação sempre sincronizada com o código

**Alternativas descartadas:** Express puro (sem DI nativo, requer mais boilerplate para arquitetura em camadas); Fastify standalone (ecosistema menor para autenticação e validação).

---

### ADR-03 — Arquitetura: Monolito Modular com Clean Architecture

**Contexto:** MVP acadêmico com prazo definido; equipe pequena; requisito de evolução sustentável.

**Decisão:** monolito modular com separação em camadas (Presentation → Application → Domain → Infrastructure).

| Camada | Dependências permitidas | O que NÃO pode entrar |
|---|---|---|
| **Domain** | TypeScript puro | NestJS, Prisma, DTOs HTTP |
| **Application** | Domain + interfaces | PrismaService, controllers, HTTP |
| **Infrastructure** | Prisma, adapters | Regras de negócio |
| **Presentation** | NestJS, DTOs, use cases | SQL, Prisma direto |

**Por que não microserviços:** overhead operacional alto para MVP; transações entre OS, Orçamentos e Estoque seriam distribuídas (problema de consistência eventual); prazo não comporta infraestrutura de service mesh.

**Caminho de evolução:** a separação por módulos permite extrair `ordens-servico` ou `pecas` para microserviços independentes no futuro, sem reescrever o domínio.

---

### ADR-04 — ORM: Prisma

**Contexto:** necessidade de migrations controladas, tipos TypeScript gerados automaticamente e suporte a transações complexas.

**Decisão:** Prisma 5.

- **Schema como fonte da verdade:** `schema.prisma` define models, enums e relações — os tipos TypeScript são gerados, não escritos à mão
- **Migrations rastreadas:** cada alteração no schema gera um arquivo SQL versionado em `prisma/migrations/`
- **Isolado na infraestrutura:** `PrismaService` só existe em `infrastructure/repositories/` e `shared/database/`; use cases injetam interfaces de domínio
- **Transactions com `$transaction`:** operações atômicas (gerar orçamento + mudar status, aprovar + reservar peças) encapsuladas no repository

**Alternativas descartadas:** TypeORM (decorators no domain, acoplamento com NestJS mais invasivo); Sequelize (menos type-safe).

---

### ADR-05 — Autenticação: JWT Stateless

**Contexto:** API REST sem estado; operações públicas (consulta de status, aprovação/recusa de orçamento via webhook externo) e protegidas (operações administrativas).

**Decisão:** JWT com `@nestjs/passport` + `passport-jwt`.

- **Stateless:** servidor não mantém sessão — escalabilidade horizontal sem session store compartilhado
- **Payload:** `{ sub, email, papel }` — autorização por papel (`ADMIN`, `ATENDENTE`, `MECANICO`) sem roundtrip ao banco
- **Rotas públicas via `@Public()`:** decorator que bypassa o guard globalmente, sem duplicação de lógica
- **Hash bcrypt:** senhas nunca armazenadas em plain text; salt adaptativo resistente a força bruta

---

### ADR-06 — Infraestrutura: Terraform + AWS + Kubernetes

**Contexto:** requisito obrigatório da Fase 2 de infraestrutura escalável, provisionada como código, com orquestração de containers e auto-scaling.

**Decisão:** Terraform para provisionar a infraestrutura base na AWS (VPC, EC2, RDS, S3), com manifestos Kubernetes complementares para orquestração com HPA.

- **Terraform:** estado remoto em S3, idempotente via `terraform import` no pipeline — evita duplicidade de recursos entre execuções
- **RDS gerenciado:** elimina a necessidade de operar o PostgreSQL manualmente (backups, patches, failover)
- **Kubernetes + HPA:** escalonamento automático de 2 a 6 réplicas conforme uso de CPU (70% de alvo), atendendo ao requisito de suportar picos de OS em horários de pico
- **ConfigMap/Secret:** separação entre configuração não sensível (ConfigMap) e sensível (Secret) — `JWT_SECRET`, `DATABASE_URL`, credenciais SMTP nunca versionadas em texto plano

---

### Relação com DDD
- **Linguagem Ubíqua**: termos do domínio (Cliente, OS, Orçamento, Peça, etc.) são usados no código, endpoints e banco
- **Camadas de domínio**: entidades, enums, regras de negócio e interfaces de repositório são separadas da infraestrutura
- **Regras de negócio no domínio**: StatusOSRules e EstoqueRules centralizam regras que não dependem de framework
- **Repositório como abstração**: interfaces definem contratos, implementações usam Prisma
- **Casos de uso**: orquestram o fluxo da aplicação sem misturar com a camada de apresentação

## 18. Regras de Negócio Principais

### Status da Ordem de Serviço (Máquina de Estados)
```
RECEBIDA → EM_DIAGNOSTICO → AGUARDANDO_APROVACAO → EM_EXECUCAO → FINALIZADA → ENTREGUE
                 ↑                    │ (recusa)
                 └────────────────────┘ (orçamento recusado retorna para diagnóstico)
```

### Regras Implementadas
1. CPF/CNPJ validados algoritmicamente
2. Placa validada nos formatos antigo e Mercosul
3. Veículo deve pertencer ao cliente informado na OS
4. Toda OS inicia com status RECEBIDA
5. Transições de status respeitam a máquina de estados
6. Orçamento calcula soma de serviços + (peças × quantidade)
7. Aprovação de orçamento reserva peças automaticamente e move OS para EM_EXECUCAO
8. Recusa de orçamento marca o orçamento como RECUSADO e retorna OS para EM_DIAGNOSTICO
9. Finalização da OS realiza baixa automática do estoque
10. Não permite reserva/baixa com estoque insuficiente
11. Senhas armazenadas com hash bcrypt
12. Rotas administrativas protegidas por JWT
13. Rotas públicas: consulta de status, aprovação e recusa de orçamento

## 19. Exemplos de Requests

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "senha": "123456"}'
```

### Criar Cliente
```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nome": "João da Silva",
    "documento": "12345678909",
    "tipoDocumento": "CPF",
    "telefone": "11999998888",
    "email": "joao@email.com"
  }'
```

### Criar OS
```bash
curl -X POST http://localhost:3000/ordens-servico \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "clienteId": "<uuid>",
    "veiculoId": "<uuid>",
    "servicos": [{"servicoId": "<uuid>"}],
    "pecas": [{"pecaId": "<uuid>", "quantidade": 2}]
  }'
```

### Consultar Status (Pública)
```bash
curl http://localhost:3000/ordens-servico/<id>/status
```

## 20. Notificação de Orçamento por Email (Atualização de Status — Fase 2)

Requisito da Fase 2: *"Atualização de status da OS via alguma ferramenta como email."*

### Como funciona

```
POST /ordens-servico/:id/gerar-orcamento
        │
        ▼
 Orçamento calculado e persistido (status → AGUARDANDO_APROVACAO)
        │
        ▼
 Email enviado automaticamente ao cliente com:
   - Resumo da OS (número, veículo, valor total)
   - Botão "Aprovar orçamento"  → POST /ordens-servico/:id/aprovar-orcamento (público)
   - Botão "Recusar orçamento" → POST /ordens-servico/:id/recusar-orcamento  (público)
        │
        ▼
 Cliente clica em um dos links → status da OS é atualizado automaticamente
   Aprovado → EM_EXECUCAO (reserva peças em estoque)
   Recusado → EM_DIAGNOSTICO
```

### Arquitetura (Clean Architecture aplicada)

| Camada | Componente | Responsabilidade |
|---|---|---|
| Domain | `INotificacaoOrcamentoService` | Interface pura — define o contrato sem conhecer nodemailer/SMTP |
| Application | `GerarOrcamentoUseCase` | Injeta a interface via `@Optional()` — funciona mesmo sem serviço de email configurado |
| Infrastructure | `EmailNotificacaoOrcamentoService` | Implementação concreta com `nodemailer`, isolada do domínio |

### Configuração

**Desenvolvimento (sem configurar nada):** ao deixar `SMTP_USER`/`SMTP_PASS` vazios, o serviço cria automaticamente uma conta de teste no [Ethereal](https://ethereal.email) e imprime no log um link de preview do email enviado — nenhum email real é entregue, ideal para demonstração.

```bash
docker compose up -d --build
docker logs oficina-app -f
```

Ao gerar um orçamento, o log mostra:
```
[EmailNotificacaoOrcamentoService] Nenhuma credencial SMTP configurada — conta de teste Ethereal criada automaticamente (xxxx@ethereal.email)
[EmailNotificacaoOrcamentoService] Email de orçamento enviado para cliente@email.com | OS #3 | messageId: ...
[EmailNotificacaoOrcamentoService] Preview do email (Ethereal): https://ethereal.email/message/xxxxx
```

**Produção / email real:** configure as variáveis SMTP com um provedor real (Gmail, SendGrid, Amazon SES, etc.):

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=senha-de-app          # Gmail exige "senha de app", não a senha da conta
SMTP_FROM=seuemail@gmail.com    # aceita "email@dominio.com" ou "Nome <email@dominio.com>"
APP_URL=https://sua-api-em-producao.com
```

> Em redes corporativas com inspeção SSL (antivírus/proxy que substitui o certificado do servidor), o handshake TLS pode falhar com `self-signed certificate in certificate chain`. Nesse caso, defina `SMTP_TLS_REJECT_UNAUTHORIZED=false` — **apenas em desenvolvimento, nunca em produção**.

### Resiliência

Se o serviço de notificação não estiver registrado no módulo (`@Optional()`), a geração do orçamento continua funcionando normalmente — o envio de email nunca bloqueia o fluxo principal de negócio. Se o cliente da OS não tiver email cadastrado, a notificação é apenas registrada como aviso no log, sem lançar exceção.

## 21. Esteira de CI/CD (GitHub Actions)

A pipeline de Integração, Entrega e Deploy Contínuo foi configurada no arquivo `.github/workflows/ci-cd.yml` e automatiza todo o ciclo de vida do software.

### Fluxo da Esteira (3 Estágios)

```mermaid
flowchart LR
    A["Push / PR"] --> B["1. CI — Testes & Build"]
    B -->|"Sucesso"| C["2. CD — Imagem Docker GHCR"]
    C -->|"Sucesso — apenas main"| D["3. Deploy — Terraform + SSH"]
```

1. **Integração Contínua (CI)**:
   - Disparado em todo `push` ou `Pull Request` para as branches `main`, `develop` e `feature/*`.
   - Sobe um PostgreSQL efêmero (Service Container).
   - Executa Linter, Testes Unitários (`npm run test`), Cobertura (`npm run test:cov`) e Testes E2E (`npm run test:e2e`).
   - Valida compilação TypeScript e construção da Imagem Docker.

2. **Entrega Contínua (CD)**:
   - Disparado no `push` para `main` e `develop`.
   - Autentica no GitHub Container Registry (GHCR).
   - Gera a imagem Docker otimizada e faz o push para o registro (`ghcr.io`).
   - Valida a sintaxe dos manifestos Kubernetes (`/k8s`).

3. **Infraestrutura e Deploy (Deploy AWS)**:
   - Disparado no `push` para `main` (Produção).
   - Verifica, inicializa e roda o **Terraform** para garantir que a infraestrutura AWS (EC2, RDS, S3) esteja provisionada e atualizada, importando recursos já existentes.
   - Captura os outputs dinâmicos da AWS (IP da EC2, credenciais RDS).
   - Conecta via SSH na instância EC2, faz o login no GHCR, baixa a nova imagem e reinicia a API com zero intervenção manual.

## 22. Entregáveis da Fase 2

- **Repositório Git**: [FernandoGreco/techChallengePosTech](https://github.com/FernandoGreco/techChallengePosTech)
- **Manifestos Kubernetes**: `/k8s`
- **Scripts Terraform**: `/infra`
- **Pipeline CI/CD**: `.github/workflows/ci-cd.yml`
- **Documentação de APIs (Swagger)**: `http://localhost:3000/api/docs` (execução local)
- **Vídeo Demonstrativo da Fase 2**: [https://youtu.be/PhsfjCkVd_c](https://youtu.be/PhsfjCkVd_c)
