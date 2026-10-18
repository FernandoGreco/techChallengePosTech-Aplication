import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/database';
import * as bcrypt from 'bcryptjs';

describe('Oficina Mecânica API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    await prisma.historicoStatusOS.deleteMany();
    await prisma.orcamento.deleteMany();
    await prisma.ordemServicoPeca.deleteMany();
    await prisma.ordemServicoServico.deleteMany();
    await prisma.ordemServico.deleteMany();
    await prisma.veiculo.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.peca.deleteMany();
    await prisma.usuario.deleteMany();

    const senhaHash = await bcrypt.hash('123456', 10);
    await prisma.usuario.create({
      data: {
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        senhaHash,
        papel: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.historicoStatusOS.deleteMany();
    await prisma.orcamento.deleteMany();
    await prisma.ordemServicoPeca.deleteMany();
    await prisma.ordemServicoServico.deleteMany();
    await prisma.ordemServico.deleteMany();
    await prisma.veiculo.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.peca.deleteMany();
    await prisma.usuario.deleteMany();
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('deve realizar login e retornar token JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@teste.com', senha: '123456' })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      accessToken = response.body.accessToken;
    });

    it('deve rejeitar login com credenciais inválidas', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@teste.com', senha: 'errada' })
        .expect(401);
    });
  });

  let clienteId: string;

  describe('POST /clientes', () => {
    it('deve criar um novo cliente', async () => {
      const response = await request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome: 'Maria Silva',
          documento: '12345678909',
          tipoDocumento: 'CPF',
          telefone: '11988887777',
          email: 'maria@email.com',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe('Maria Silva');
      clienteId = response.body.id;
    });

    it('deve rejeitar cliente sem token', async () => {
      await request(app.getHttpServer())
        .post('/clientes')
        .send({
          nome: 'Teste',
          documento: '99999999999',
          tipoDocumento: 'CPF',
          telefone: '11999999999',
          email: 'teste@email.com',
        })
        .expect(401);
    });
  });

  let veiculoId: string;

  describe('POST /veiculos', () => {
    it('deve criar um novo veículo', async () => {
      const response = await request(app.getHttpServer())
        .post('/veiculos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          placa: 'XYZ9A88',
          marca: 'Honda',
          modelo: 'Civic',
          ano: 2022,
          clienteId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.placa).toBe('XYZ9A88');
      veiculoId = response.body.id;
    });
  });

  let servicoId: string;
  let pecaId: string;

  describe('Serviços e Peças', () => {
    it('deve criar um serviço', async () => {
      const response = await request(app.getHttpServer())
        .post('/servicos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome: 'Troca de óleo',
          descricao: 'Troca de óleo completa',
          precoBase: 150,
          tempoMedioMinutos: 30,
        })
        .expect(201);

      servicoId = response.body.id;
    });

    it('deve criar uma peça', async () => {
      const response = await request(app.getHttpServer())
        .post('/pecas')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nome: 'Filtro de óleo',
          descricao: 'Filtro universal',
          precoUnitario: 35.9,
          quantidadeEstoque: 50,
        })
        .expect(201);

      pecaId = response.body.id;
    });
  });

  let ordemServicoId: string;

  describe('Fluxo completo de OS', () => {
    it('deve criar uma ordem de serviço', async () => {
      const response = await request(app.getHttpServer())
        .post('/ordens-servico')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          clienteId,
          veiculoId,
          servicos: [{ servicoId }],
          pecas: [{ pecaId, quantidade: 2 }],
        })
        .expect(201);

      expect(response.body.status).toBe('RECEBIDA');
      ordemServicoId = response.body.id;
    });

    it('deve consultar status da OS (rota pública)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ordens-servico/${ordemServicoId}/status`)
        .expect(200);

      expect(response.body.status).toBe('RECEBIDA');
    });

    it('deve iniciar diagnóstico', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/iniciar-diagnostico`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe('EM_DIAGNOSTICO');
    });

    it('deve registrar diagnóstico', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/registrar-diagnostico`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ diagnostico: 'Necessita troca de óleo e filtro' })
        .expect(201);

      expect(response.body.diagnostico).toBe(
        'Necessita troca de óleo e filtro',
      );
    });

    it('deve gerar orçamento', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/gerar-orcamento`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe('AGUARDANDO_APROVACAO');
      expect(response.body.orcamentos).toHaveLength(1);
      expect(response.body.orcamentos[0].valorTotal).toBe(150 + 35.9 * 2);
    });

    it('deve aprovar orçamento (rota pública)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/aprovar-orcamento`)
        .expect(201);

      expect(response.body.status).toBe('EM_EXECUCAO');
    });

    it('deve finalizar OS', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/finalizar`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe('FINALIZADA');
    });

    it('deve entregar veículo', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/entregar`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.status).toBe('ENTREGUE');
    });

    it('deve rejeitar transição inválida de status', async () => {
      await request(app.getHttpServer())
        .post(`/ordens-servico/${ordemServicoId}/iniciar-diagnostico`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422);
    });
  });
});
