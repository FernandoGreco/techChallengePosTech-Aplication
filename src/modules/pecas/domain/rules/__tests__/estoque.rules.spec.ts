import { EstoqueRules } from '../estoque.rules';
import { BusinessException } from '../../../../../shared/exceptions';

describe('EstoqueRules', () => {
  describe('validarDisponibilidade', () => {
    it('deve permitir reserva quando há estoque disponível', () => {
      expect(() => EstoqueRules.validarDisponibilidade(10, 2, 5)).not.toThrow();
    });

    it('deve permitir reserva exata do disponível', () => {
      expect(() => EstoqueRules.validarDisponibilidade(10, 2, 8)).not.toThrow();
    });

    it('deve rejeitar reserva quando estoque insuficiente', () => {
      expect(() => EstoqueRules.validarDisponibilidade(10, 8, 5)).toThrow(
        BusinessException,
      );
    });

    it('deve rejeitar reserva quando tudo já está reservado', () => {
      expect(() => EstoqueRules.validarDisponibilidade(10, 10, 1)).toThrow(
        BusinessException,
      );
    });
  });

  describe('validarBaixaEstoque', () => {
    it('deve permitir baixa quando há estoque suficiente', () => {
      expect(() => EstoqueRules.validarBaixaEstoque(10, 5)).not.toThrow();
    });

    it('deve permitir baixa exata do estoque', () => {
      expect(() => EstoqueRules.validarBaixaEstoque(10, 10)).not.toThrow();
    });

    it('deve rejeitar baixa quando estoque insuficiente', () => {
      expect(() => EstoqueRules.validarBaixaEstoque(5, 10)).toThrow(
        BusinessException,
      );
    });
  });
});
