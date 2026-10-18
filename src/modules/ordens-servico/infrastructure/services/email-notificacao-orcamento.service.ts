import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { INotificacaoOrcamentoService } from '../../domain/services/notificacao-orcamento.service.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';

@Injectable()
export class EmailNotificacaoOrcamentoService implements INotificacaoOrcamentoService {
  private readonly logger = new Logger(EmailNotificacaoOrcamentoService.name);
  private transporterPromise: Promise<nodemailer.Transporter> | null = null;

  /**
   * Cria o transporter sob demanda (lazy). Se SMTP_USER/SMTP_PASS não estiverem
   * configurados, gera automaticamente uma conta de teste no Ethereal
   * (https://ethereal.email) — útil para desenvolvimento local sem precisar
   * de credenciais reais de SMTP.
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporterPromise === null) {
      this.transporterPromise = this.criarTransporter();
    }
    return this.transporterPromise;
  }

  private async criarTransporter(): Promise<nodemailer.Transporter> {
    let host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    let port = Number(process.env.SMTP_PORT) || 587;
    let user = process.env.SMTP_USER || '';
    let pass = process.env.SMTP_PASS || '';

    if (!user || !pass) {
      const testAccount = await nodemailer.createTestAccount();
      host = testAccount.smtp.host;
      port = testAccount.smtp.port;
      user = testAccount.user;
      pass = testAccount.pass;
      this.logger.log(
        `Nenhuma credencial SMTP configurada — conta de teste Ethereal criada automaticamente (${user})`,
      );
    }

    // Em redes corporativas com inspeção SSL (antivírus/proxy), a cadeia de
    // certificado pode ser substituída por um certificado self-signed, causando
    // falha de handshake TLS. SMTP_TLS_REJECT_UNAUTHORIZED=false contorna isso
    // apenas em ambiente de desenvolvimento — nunca desabilitar em produção.
    const rejectUnauthorized =
      process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false';

    return nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized },
    });
  }

  async notificarOrcamentoPendente(
    os: IOrdemServico,
    valorTotal: number,
  ): Promise<void> {
    const emailCliente = os.cliente?.email;

    if (!emailCliente) {
      this.logger.warn(
        `OS #${os.numero}: cliente sem email cadastrado — notificação ignorada`,
      );
      return;
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const urlAprovar = `${appUrl}/ordens-servico/${os.id}/aprovar-orcamento`;
    const urlRecusar = `${appUrl}/ordens-servico/${os.id}/recusar-orcamento`;

    const html = this.montarHtmlOrcamento(
      os,
      valorTotal,
      urlAprovar,
      urlRecusar,
    );

    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: this.montarRemetente(),
      to: emailCliente,
      subject: `[OS #${os.numero}] Orçamento pronto — aguardando sua aprovação`,
      html,
    });

    this.logger.log(
      `Email de orçamento enviado para ${emailCliente} | OS #${os.numero} | messageId: ${info.messageId}`,
    );

    // Em ambiente de desenvolvimento com Ethereal, o link de preview fica disponível
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`Preview do email (Ethereal): ${previewUrl}`);
    }
  }

  /**
   * Monta o remetente como objeto { name, address } — evita problemas de
   * parsing quando o valor de SMTP_FROM vem apenas como email puro
   * (ex.: "seuemail@gmail.com") ou já formatado ("Nome <email@dominio.com>").
   */
  private montarRemetente(): { name: string; address: string } {
    const raw = (process.env.SMTP_FROM || 'noreply@oficina.com').trim();
    const match = raw.match(/^"?([^"<]*)"?\s*<(.+)>$/);

    if (match) {
      return {
        name: match[1].trim() || 'Oficina Mecânica',
        address: match[2].trim(),
      };
    }

    return { name: 'Oficina Mecânica', address: raw };
  }

  private montarHtmlOrcamento(
    os: IOrdemServico,
    valorTotal: number,
    urlAprovar: string,
    urlRecusar: string,
  ): string {
    const nomeCliente = os.cliente?.nome ?? 'Cliente';
    const veiculo = os.veiculo
      ? `${os.veiculo.marca} ${os.veiculo.modelo} (${os.veiculo.placa})`
      : 'veículo';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Orçamento pronto para aprovação</h2>
        <p>Olá, <strong>${nomeCliente}</strong>!</p>
        <p>O orçamento da sua Ordem de Serviço está pronto.</p>

        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background:#f5f5f5;">
            <td style="padding:8px; border:1px solid #ddd;"><strong>OS</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">#${os.numero}</td>
          </tr>
          <tr>
            <td style="padding:8px; border:1px solid #ddd;"><strong>Veículo</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${veiculo}</td>
          </tr>
          <tr style="background:#f5f5f5;">
            <td style="padding:8px; border:1px solid #ddd;"><strong>Valor total</strong></td>
            <td style="padding:8px; border:1px solid #ddd; font-size:18px; color:#2c7be5;">
              <strong>R$ ${valorTotal.toFixed(2)}</strong>
            </td>
          </tr>
        </table>

        <p>Clique em um dos botões abaixo para responder:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${urlAprovar}"
             style="background:#28a745; color:#fff; padding:14px 32px; border-radius:6px;
                    text-decoration:none; font-size:16px; margin-right:16px;">
            ✅ Aprovar orçamento
          </a>
          <a href="${urlRecusar}"
             style="background:#dc3545; color:#fff; padding:14px 32px; border-radius:6px;
                    text-decoration:none; font-size:16px;">
            ❌ Recusar orçamento
          </a>
        </div>

        <p style="color:#888; font-size:12px; margin-top:40px;">
          Este email foi gerado automaticamente pela Oficina Mecânica.<br>
          Ao clicar em "Aprovar", o serviço será iniciado.<br>
          Ao clicar em "Recusar", a OS retornará para diagnóstico.
        </p>
      </div>
    `;
  }
}
