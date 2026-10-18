import { StatusOSRules } from '../status-os.rules';
import { StatusOS } from '../../enums/status-os.enum';
import { BusinessException } from '../../../../../shared/exceptions';

describe('StatusOSRules', () => {
  describe('validarTransicao', () => {
    it('deve permitir transição de RECEBIDA para EM_DIAGNOSTICO', () => {
      expect(() =>
        StatusOSRules.validarTransicao(
          StatusOS.RECEBIDA,
          StatusOS.EM_DIAGNOSTICO,
        ),
      ).not.toThrow();
    });

    it('deve permitir transição de EM_DIAGNOSTICO para AGUARDANDO_APROVACAO', () => {
      expect(() =>
        StatusOSRules.validarTransicao(
          StatusOS.EM_DIAGNOSTICO,
          StatusOS.AGUARDANDO_APROVACAO,
        ),
      ).not.toThrow();
    });

    it('deve permitir transição de AGUARDANDO_APROVACAO para EM_EXECUCAO', () => {
      expect(() =>
        StatusOSRules.validarTransicao(
          StatusOS.AGUARDANDO_APROVACAO,
          StatusOS.EM_EXECUCAO,
        ),
      ).not.toThrow();
    });

    it('deve permitir transição de EM_EXECUCAO para FINALIZADA', () => {
      expect(() =>
        StatusOSRules.validarTransicao(
          StatusOS.EM_EXECUCAO,
          StatusOS.FINALIZADA,
        ),
      ).not.toThrow();
    });

    it('deve permitir transição de FINALIZADA para ENTREGUE', () => {
      expect(() =>
        StatusOSRules.validarTransicao(StatusOS.FINALIZADA, StatusOS.ENTREGUE),
      ).not.toThrow();
    });

    it('deve rejeitar transição de RECEBIDA para FINALIZADA', () => {
      expect(() =>
        StatusOSRules.validarTransicao(StatusOS.RECEBIDA, StatusOS.FINALIZADA),
      ).toThrow(BusinessException);
    });

    it('deve rejeitar transição de ENTREGUE para qualquer status', () => {
      expect(() =>
        StatusOSRules.validarTransicao(StatusOS.ENTREGUE, StatusOS.RECEBIDA),
      ).toThrow(BusinessException);
    });

    it('deve rejeitar transição de EM_EXECUCAO para RECEBIDA', () => {
      expect(() =>
        StatusOSRules.validarTransicao(StatusOS.EM_EXECUCAO, StatusOS.RECEBIDA),
      ).toThrow(BusinessException);
    });
  });

  describe('validarIniciarDiagnostico', () => {
    it('deve permitir iniciar diagnóstico quando RECEBIDA', () => {
      expect(() =>
        StatusOSRules.validarIniciarDiagnostico(StatusOS.RECEBIDA),
      ).not.toThrow();
    });

    it('deve rejeitar iniciar diagnóstico quando não está RECEBIDA', () => {
      expect(() =>
        StatusOSRules.validarIniciarDiagnostico(StatusOS.EM_EXECUCAO),
      ).toThrow(BusinessException);
    });
  });

  describe('validarGerarOrcamento', () => {
    it('deve permitir gerar orçamento quando EM_DIAGNOSTICO', () => {
      expect(() =>
        StatusOSRules.validarGerarOrcamento(StatusOS.EM_DIAGNOSTICO),
      ).not.toThrow();
    });

    it('deve rejeitar gerar orçamento quando não está EM_DIAGNOSTICO', () => {
      expect(() =>
        StatusOSRules.validarGerarOrcamento(StatusOS.RECEBIDA),
      ).toThrow(BusinessException);
    });
  });

  describe('validarAprovarOrcamento', () => {
    it('deve permitir aprovar orçamento quando AGUARDANDO_APROVACAO', () => {
      expect(() =>
        StatusOSRules.validarAprovarOrcamento(StatusOS.AGUARDANDO_APROVACAO),
      ).not.toThrow();
    });

    it('deve rejeitar aprovar orçamento quando não está AGUARDANDO_APROVACAO', () => {
      expect(() =>
        StatusOSRules.validarAprovarOrcamento(StatusOS.RECEBIDA),
      ).toThrow(BusinessException);
    });
  });

  describe('validarFinalizar', () => {
    it('deve permitir finalizar quando EM_EXECUCAO', () => {
      expect(() =>
        StatusOSRules.validarFinalizar(StatusOS.EM_EXECUCAO),
      ).not.toThrow();
    });

    it('deve rejeitar finalizar quando não está EM_EXECUCAO', () => {
      expect(() => StatusOSRules.validarFinalizar(StatusOS.RECEBIDA)).toThrow(
        BusinessException,
      );
    });
  });

  describe('validarEntrega', () => {
    it('deve permitir entrega quando FINALIZADA', () => {
      expect(() =>
        StatusOSRules.validarEntrega(StatusOS.FINALIZADA),
      ).not.toThrow();
    });

    it('deve rejeitar entrega quando não está FINALIZADA', () => {
      expect(() => StatusOSRules.validarEntrega(StatusOS.EM_EXECUCAO)).toThrow(
        BusinessException,
      );
    });
  });
});
