# RFC-001 — Escolha da Nuvem: AWS

| Campo | Valor |
|---|---|
| Status | **Aceita** |
| Data | 2026-10-18 |
| Autora | Fernando Greco (líder do projeto) |

## Contexto

A Fase 3 exige deploy em nuvem com banco gerenciado, cluster Kubernetes e
observabilidade. O grupo já possuía experiência e créditos em um ambiente
específico.

## Decisão

**AWS**, utilizando o **AWS Academy Learner Lab** (ambiente educacional com
créditos e restrições controladas).

## Alternativas consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **AWS Academy** ✅ | Créditos educacionais; serviços maduros (EC2, RDS, Lambda); alinhado ao mercado | Restrições do Learner Lab (sem EKS; credenciais temporárias) |
| AWS conta completa | Acesso a EKS, IAM completo | Custo |
| Azure / GCP | Alternativas viáveis | Grupo já tinha familiaridade e créditos AWS |

## Consequências

- **Sem EKS** — o Learner Lab restringe; o cluster K8s é **autogerenciado em EC2**
  com kubeadm (repo 2).
- **RDS PostgreSQL** (repo 3) como banco gerenciado — ver [RFC-002](RFC-002-banco-postgresql-rds.md).
- **Lambda** (repo 1) para auth por CPF — ver [RFC-003](RFC-003-estrategia-autenticacao.md).
- Credenciais do Learner Lab expiram — deploys dependem de sessão ativa.

## Referências

- [PLANO-FASE-3.md](../../PLANO-FASE-3.md) — seção 2, R4/R5
