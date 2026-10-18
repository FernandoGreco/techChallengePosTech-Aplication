import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const senhaHash = await bcrypt.hash('123456', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@email.com',
      senhaHash,
      papel: 'ADMIN',
    },
  });
  console.log('Usuário admin criado:', admin.email);

  const atendente = await prisma.usuario.upsert({
    where: { email: 'atendente@email.com' },
    update: {},
    create: {
      nome: 'Maria Atendente',
      email: 'atendente@email.com',
      senhaHash,
      papel: 'ATENDENTE',
    },
  });
  console.log('Usuário atendente criado:', atendente.email);

  const mecanico = await prisma.usuario.upsert({
    where: { email: 'mecanico@email.com' },
    update: {},
    create: {
      nome: 'José Mecânico',
      email: 'mecanico@email.com',
      senhaHash,
      papel: 'MECANICO',
    },
  });
  console.log('Usuário mecânico criado:', mecanico.email);

  const servicos = [
    {
      nome: 'Troca de óleo',
      descricao: 'Troca de óleo do motor com filtro',
      precoBase: 150.0,
      tempoMedioMinutos: 30,
    },
    {
      nome: 'Alinhamento e balanceamento',
      descricao: 'Alinhamento e balanceamento das 4 rodas',
      precoBase: 120.0,
      tempoMedioMinutos: 45,
    },
    {
      nome: 'Revisão completa',
      descricao: 'Revisão geral do veículo incluindo todos os sistemas',
      precoBase: 500.0,
      tempoMedioMinutos: 180,
    },
    {
      nome: 'Troca de pastilhas de freio',
      descricao: 'Troca das pastilhas de freio dianteiras e traseiras',
      precoBase: 200.0,
      tempoMedioMinutos: 60,
    },
    {
      nome: 'Troca de correia dentada',
      descricao: 'Substituição da correia dentada do motor',
      precoBase: 350.0,
      tempoMedioMinutos: 120,
    },
  ];

  const servicosCriados = await prisma.servico.createMany({
    data: servicos,
    skipDuplicates: true,
  });
  console.log(`${servicosCriados.count} serviços criados (duplicatas ignoradas)`);

  const pecas = [
    {
      nome: 'Filtro de óleo',
      descricao: 'Filtro de óleo motor universal',
      precoUnitario: 35.9,
      quantidadeEstoque: 50,
    },
    {
      nome: 'Óleo motor 5W30',
      descricao: 'Óleo sintético 5W30 - 1 litro',
      precoUnitario: 45.0,
      quantidadeEstoque: 100,
    },
    {
      nome: 'Pastilha de freio dianteira',
      descricao: 'Jogo de pastilhas de freio dianteira',
      precoUnitario: 89.9,
      quantidadeEstoque: 30,
    },
    {
      nome: 'Correia dentada',
      descricao: 'Correia dentada universal',
      precoUnitario: 120.0,
      quantidadeEstoque: 15,
    },
    {
      nome: 'Filtro de ar',
      descricao: 'Filtro de ar do motor',
      precoUnitario: 55.0,
      quantidadeEstoque: 40,
    },
  ];

  const pecasCriadas = await prisma.peca.createMany({
    data: pecas,
    skipDuplicates: true,
  });
  console.log(`${pecasCriadas.count} peças criadas (duplicatas ignoradas)`);

  const cliente = await prisma.cliente.upsert({
    where: { documento: '12345678909' },
    update: {},
    create: {
      nome: 'João da Silva',
      documento: '12345678909',
      tipoDocumento: 'CPF',
      telefone: '11999998888',
      email: 'joao@email.com',
    },
  });
  console.log('Cliente seed:', cliente.nome);

  const veiculo = await prisma.veiculo.upsert({
    where: { placa: 'ABC1D23' },
    update: {},
    create: {
      placa: 'ABC1D23',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2023,
      clienteId: cliente.id,
    },
  });
  console.log('Veículo seed:', veiculo.placa);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
