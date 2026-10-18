import { EmailNotificacaoOrcamentoService } from '../email-notificacao-orcamento.service';
import * as nodemailer from 'nodemailer';
import { StatusOS } from '../../../domain/enums/status-os.enum';
import { IOrdemServico } from '../../../domain/entities/ordem-servico.entity';

jest.mock('nodemailer');

const makeOS = (emailCliente?: string): IOrdemServico => ({
  id: 'os-uuid',
  numero: 42,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: StatusOS.AGUARDANDO_APROVACAO,
  valorTotal: 350,
  dataCriacao: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  diagnostico: null,
  dataInicioDiagnostico: null,
  dataInicioExecucao: null,
  dataFinalizacao: null,
  dataEntrega: null,
  servicos: [],
  pecas: [],
  orcamentos: [],
  cliente: emailCliente
    ? {
        id: 'c1',
        nome: 'João Silva',
        documento: '123',
        telefone: '11999',
        email: emailCliente,
      }
    : undefined,
  veiculo: {
    id: 'v1',
    placa: 'ABC1D23',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2022,
  },
});

describe('EmailNotificacaoOrcamentoService', () => {
  let service: EmailNotificacaoOrcamentoService;
  let mockSendMail: jest.Mock;
  let mockCreateTransport: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      SMTP_HOST: 'smtp.test.com',
      SMTP_USER: 'test-user',
      SMTP_PASS: 'test-pass',
    };

    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id-123' });
    mockCreateTransport = nodemailer.createTransport as jest.Mock;
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });

    service = new EmailNotificacaoOrcamentoService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('deve enviar email com subject e destinatário corretos', async () => {
    await service.notificarOrcamentoPendente(makeOS('joao@test.com'), 350.0);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const args = mockSendMail.mock.calls[0][0];
    expect(args.to).toBe('joao@test.com');
    expect(args.subject).toContain('#42');
    expect(args.subject).toContain('aprovação');
  });

  it('deve incluir links de aprovar e recusar no body do email', async () => {
    await service.notificarOrcamentoPendente(makeOS('joao@test.com'), 350.0);

    const args = mockSendMail.mock.calls[0][0];
    expect(args.html).toContain('/ordens-servico/os-uuid/aprovar-orcamento');
    expect(args.html).toContain('/ordens-servico/os-uuid/recusar-orcamento');
  });

  it('deve incluir o valor total no body do email', async () => {
    await service.notificarOrcamentoPendente(makeOS('joao@test.com'), 350.5);

    const args = mockSendMail.mock.calls[0][0];
    expect(args.html).toContain('350.50');
  });

  it('deve usar remetente padrão quando SMTP_FROM não está configurado', async () => {
    delete process.env.SMTP_FROM;
    const serviceComFromPadrao = new EmailNotificacaoOrcamentoService();

    await serviceComFromPadrao.notificarOrcamentoPendente(
      makeOS('joao@test.com'),
      100,
    );

    const args = mockSendMail.mock.calls[0][0];
    expect(args.from).toEqual({
      name: 'Oficina Mecânica',
      address: 'noreply@oficina.com',
    });
  });

  it('deve montar remetente corretamente quando SMTP_FROM é um email puro (sem aspas/nome)', async () => {
    process.env.SMTP_FROM = 'meuemail@gmail.com';
    const serviceComEmailPuro = new EmailNotificacaoOrcamentoService();

    await serviceComEmailPuro.notificarOrcamentoPendente(
      makeOS('joao@test.com'),
      100,
    );

    const args = mockSendMail.mock.calls[0][0];
    expect(args.from).toEqual({
      name: 'Oficina Mecânica',
      address: 'meuemail@gmail.com',
    });
  });

  it('deve montar remetente corretamente quando SMTP_FROM tem nome e email formatados', async () => {
    process.env.SMTP_FROM = 'Minha Oficina <contato@minhaoficina.com>';
    const serviceComNomeEEmail = new EmailNotificacaoOrcamentoService();

    await serviceComNomeEEmail.notificarOrcamentoPendente(
      makeOS('joao@test.com'),
      100,
    );

    const args = mockSendMail.mock.calls[0][0];
    expect(args.from).toEqual({
      name: 'Minha Oficina',
      address: 'contato@minhaoficina.com',
    });
  });

  it('deve ignorar envio quando cliente não tem email cadastrado', async () => {
    await service.notificarOrcamentoPendente(makeOS(undefined), 100);

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('deve ignorar envio quando cliente é undefined', async () => {
    const os = makeOS();
    os.cliente = undefined;

    await service.notificarOrcamentoPendente(os, 100);

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('deve criar conta de teste Ethereal automaticamente quando SMTP_USER/PASS não configurados', async () => {
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';
    const mockCreateTestAccount = nodemailer.createTestAccount as jest.Mock;
    mockCreateTestAccount.mockResolvedValue({
      user: 'ethereal-user',
      pass: 'ethereal-pass',
      smtp: { host: 'smtp.ethereal.email', port: 587 },
    });

    const serviceSemCredenciais = new EmailNotificacaoOrcamentoService();
    await serviceSemCredenciais.notificarOrcamentoPendente(
      makeOS('joao@test.com'),
      100,
    );

    expect(mockCreateTestAccount).toHaveBeenCalledTimes(1);
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: { user: 'ethereal-user', pass: 'ethereal-pass' },
      }),
    );
  });

  it('deve reutilizar o mesmo transporter em chamadas subsequentes (lazy singleton)', async () => {
    await service.notificarOrcamentoPendente(makeOS('joao@test.com'), 100);
    await service.notificarOrcamentoPendente(makeOS('maria@test.com'), 200);

    expect(mockCreateTransport).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledTimes(2);
  });

  it('deve permitir desabilitar validação de certificado TLS via env var (redes corporativas)', async () => {
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED = 'false';

    const serviceComTlsFlexivel = new EmailNotificacaoOrcamentoService();
    await serviceComTlsFlexivel.notificarOrcamentoPendente(
      makeOS('joao@test.com'),
      100,
    );

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ tls: { rejectUnauthorized: false } }),
    );
  });
});
