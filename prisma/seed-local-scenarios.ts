import 'dotenv/config';
import {
  PrismaClient,
  StatusOS,
  StatusOrcamento,
  TipoDocumento,
} from '@prisma/client';

const prisma = new PrismaClient();
const ids = {
  cliente: 'c1f10000-0000-4000-8000-000000000001',
  veiculo: 'c1f10000-0000-4000-8000-000000000002',
  servico: 'c1f10000-0000-4000-8000-000000000003',
  peca: 'c1f10000-0000-4000-8000-000000000004',
  osRecebida: 'c1f10000-0000-4000-8000-000000000011',
  osDiagnostico: 'c1f10000-0000-4000-8000-000000000012',
  osAguardando: 'c1f10000-0000-4000-8000-000000000013',
  osExecucao: 'c1f10000-0000-4000-8000-000000000014',
  osFinalizada: 'c1f10000-0000-4000-8000-000000000015',
};
const osIds = [
  ids.osRecebida,
  ids.osDiagnostico,
  ids.osAguardando,
  ids.osExecucao,
  ids.osFinalizada,
];

interface HistoryFixture {
  previous: StatusOS | null;
  next: StatusOS;
  ageMinutes: number;
}

interface ScenarioFixture {
  id: string;
  status: StatusOS;
  createdAge: number;
  diagnosisAge?: number;
  executionAge?: number;
  finalizationAge?: number;
  history: HistoryFixture[];
  budget?: StatusOrcamento;
}

function assertLocalDatabase(): void {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não configurada');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed de cenários bloqueado em produção');
  }
  const url = new URL(databaseUrl);
  if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    throw new Error('Seed de cenários permitido somente em banco local');
  }
  if (url.pathname !== '/oficina_mecanica') {
    throw new Error('Use apenas o banco local oficina_mecanica');
  }
}

const minutesAgo = (minutes: number): Date =>
  new Date(Date.now() - minutes * 60_000);

async function getFixtureCustomer(email: string) {
  const document = '52998224725';
  const byId = await prisma.cliente.findUnique({ where: { id: ids.cliente } });
  const byDocument = await prisma.cliente.findUnique({
    where: { documento: document },
  });
  if (byDocument && byDocument.id !== ids.cliente) {
    throw new Error('CPF da fixture pertence a outro cliente; nada alterado');
  }
  if (byId && byId.documento !== document) {
    throw new Error('ID da fixture pertence a outro cliente; nada alterado');
  }

  const data = {
    nome: 'Cliente de Teste da Oficina',
    telefone: '11999990000',
    email,
    ativo: true,
  };
  return byId
    ? prisma.cliente.update({ where: { id: ids.cliente }, data })
    : prisma.cliente.create({
        data: {
          id: ids.cliente,
          documento: document,
          tipoDocumento: TipoDocumento.CPF,
          ...data,
        },
      });
}

async function getFixtureVehicle(clienteId: string) {
  const plate = 'TST1A23';
  const byId = await prisma.veiculo.findUnique({ where: { id: ids.veiculo } });
  const byPlate = await prisma.veiculo.findUnique({ where: { placa: plate } });
  if (byPlate && byPlate.id !== ids.veiculo) {
    throw new Error('Placa da fixture pertence a outro veículo; nada alterado');
  }
  if (byId && byId.placa !== plate) {
    throw new Error('ID da fixture pertence a outro veículo; nada alterado');
  }

  const data = {
    marca: 'Toyota',
    modelo: 'Corolla de Teste',
    ano: 2022,
    clienteId,
  };
  return byId
    ? prisma.veiculo.update({ where: { id: ids.veiculo }, data })
    : prisma.veiculo.create({ data: { id: ids.veiculo, placa: plate, ...data } });
}

async function main(): Promise<void> {
  assertLocalDatabase();
  const email = process.env.SEED_CLIENT_EMAIL || 'cliente.teste@example.invalid';
  const cliente = await getFixtureCustomer(email);
  const veiculo = await getFixtureVehicle(cliente.id);

  const servico = await prisma.servico.upsert({
    where: { id: ids.servico },
    update: {
      nome: 'Serviço de Teste - Não remover',
      descricao: 'Serviço criado pelo seed local',
      precoBase: 150,
      tempoMedioMinutos: 60,
      ativo: true,
    },
    create: {
      id: ids.servico,
      nome: 'Serviço de Teste - Não remover',
      descricao: 'Serviço criado pelo seed local',
      precoBase: 150,
      tempoMedioMinutos: 60,
      ativo: true,
    },
  });
  const peca = await prisma.peca.upsert({
    where: { id: ids.peca },
    update: {
      nome: 'Peça de Teste - Não remover',
      descricao: 'Peça criada pelo seed local',
      precoUnitario: 35.9,
      quantidadeEstoque: 100,
      quantidadeReservada: 0,
      ativo: true,
    },
    create: {
      id: ids.peca,
      nome: 'Peça de Teste - Não remover',
      descricao: 'Peça criada pelo seed local',
      precoUnitario: 35.9,
      quantidadeEstoque: 100,
      quantidadeReservada: 0,
      ativo: true,
    },
  });

  const scenarios: ScenarioFixture[] = [
    {
      id: ids.osRecebida,
      status: StatusOS.RECEBIDA,
      createdAge: 5,
      history: [{ previous: null, next: StatusOS.RECEBIDA, ageMinutes: 5 }],
    },
    {
      id: ids.osDiagnostico,
      status: StatusOS.EM_DIAGNOSTICO,
      createdAge: 30,
      diagnosisAge: 20,
      history: [
        { previous: null, next: StatusOS.RECEBIDA, ageMinutes: 30 },
        { previous: StatusOS.RECEBIDA, next: StatusOS.EM_DIAGNOSTICO, ageMinutes: 20 },
      ],
    },
    {
      id: ids.osAguardando,
      status: StatusOS.AGUARDANDO_APROVACAO,
      createdAge: 90,
      diagnosisAge: 75,
      budget: StatusOrcamento.GERADO,
      history: [
        { previous: null, next: StatusOS.RECEBIDA, ageMinutes: 90 },
        { previous: StatusOS.RECEBIDA, next: StatusOS.EM_DIAGNOSTICO, ageMinutes: 75 },
        { previous: StatusOS.EM_DIAGNOSTICO, next: StatusOS.AGUARDANDO_APROVACAO, ageMinutes: 60 },
      ],
    },
    {
      id: ids.osExecucao,
      status: StatusOS.EM_EXECUCAO,
      createdAge: 180,
      diagnosisAge: 160,
      executionAge: 120,
      budget: StatusOrcamento.APROVADO,
      history: [
        { previous: null, next: StatusOS.RECEBIDA, ageMinutes: 180 },
        { previous: StatusOS.RECEBIDA, next: StatusOS.EM_DIAGNOSTICO, ageMinutes: 160 },
        { previous: StatusOS.EM_DIAGNOSTICO, next: StatusOS.AGUARDANDO_APROVACAO, ageMinutes: 140 },
        { previous: StatusOS.AGUARDANDO_APROVACAO, next: StatusOS.EM_EXECUCAO, ageMinutes: 120 },
      ],
    },
    {
      id: ids.osFinalizada,
      status: StatusOS.FINALIZADA,
      createdAge: 300,
      diagnosisAge: 270,
      executionAge: 210,
      finalizationAge: 60,
      budget: StatusOrcamento.APROVADO,
      history: [
        { previous: null, next: StatusOS.RECEBIDA, ageMinutes: 300 },
        { previous: StatusOS.RECEBIDA, next: StatusOS.EM_DIAGNOSTICO, ageMinutes: 270 },
        { previous: StatusOS.EM_DIAGNOSTICO, next: StatusOS.AGUARDANDO_APROVACAO, ageMinutes: 240 },
        { previous: StatusOS.AGUARDANDO_APROVACAO, next: StatusOS.EM_EXECUCAO, ageMinutes: 210 },
        { previous: StatusOS.EM_EXECUCAO, next: StatusOS.FINALIZADA, ageMinutes: 60 },
      ],
    },
  ];

  await prisma.$transaction(async (tx) => {
    await tx.orcamento.deleteMany({ where: { ordemServicoId: { in: osIds } } });
    await tx.historicoStatusOS.deleteMany({ where: { ordemServicoId: { in: osIds } } });
    await tx.ordemServicoServico.deleteMany({ where: { ordemServicoId: { in: osIds } } });
    await tx.ordemServicoPeca.deleteMany({ where: { ordemServicoId: { in: osIds } } });
    await tx.ordemServico.deleteMany({ where: { id: { in: osIds } } });

    for (const scenario of scenarios) {
      await tx.ordemServico.create({
        data: {
          id: scenario.id,
          clienteId: cliente.id,
          veiculoId: veiculo.id,
          status: scenario.status,
          diagnostico: 'Cenário sintético para teste local',
          valorTotal: 185.9,
          dataCriacao: minutesAgo(scenario.createdAge),
          dataInicioDiagnostico:
            scenario.diagnosisAge === undefined ? null : minutesAgo(scenario.diagnosisAge),
          dataInicioExecucao:
            scenario.executionAge === undefined ? null : minutesAgo(scenario.executionAge),
          dataFinalizacao:
            scenario.finalizationAge === undefined ? null : minutesAgo(scenario.finalizationAge),
        },
      });
      await tx.ordemServicoServico.create({
        data: { ordemServicoId: scenario.id, servicoId: servico.id, valor: 150 },
      });
      await tx.ordemServicoPeca.create({
        data: {
          ordemServicoId: scenario.id,
          pecaId: peca.id,
          quantidade: 1,
          valorUnitario: 35.9,
        },
      });

      for (const entry of scenario.history) {
        await tx.historicoStatusOS.create({
          data: {
            ordemServicoId: scenario.id,
            statusAnterior: entry.previous,
            statusNovo: entry.next,
            observacao: 'Histórico sintético do seed de cenários',
            createdAt: minutesAgo(entry.ageMinutes),
          },
        });
      }

      if (scenario.budget) {
        await tx.orcamento.create({
          data: {
            ordemServicoId: scenario.id,
            valorServicos: 150,
            valorPecas: 35.9,
            valorTotal: 185.9,
            status: scenario.budget,
            dataAprovacao:
              scenario.budget === StatusOrcamento.APROVADO
                ? minutesAgo(120)
                : null,
          },
        });
      }
    }
  });

  console.log('Cenários locais prontos:');
  console.log(`Cliente: ${cliente.id} | veículo: ${veiculo.id} (${veiculo.placa})`);
  for (const scenario of scenarios) {
    console.log(`${scenario.status}: ${scenario.id}`);
  }
  console.log(
    `Para testar notificação: POST /ordens-servico/${ids.osDiagnostico}/gerar-orcamento`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      'Falha ao criar cenários locais:',
      error instanceof Error ? error.message : 'erro desconhecido',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
