import { BusinessException } from '../../../../shared/exceptions';

export class EstoqueRules {
  static validarDisponibilidade(
    quantidadeEstoque: number,
    quantidadeReservada: number,
    quantidadeSolicitada: number,
  ): void {
    const disponivel = quantidadeEstoque - quantidadeReservada;
    if (quantidadeSolicitada > disponivel) {
      throw new BusinessException(
        `Estoque insuficiente. Disponível: ${disponivel}, Solicitado: ${quantidadeSolicitada}`,
      );
    }
  }

  static validarBaixaEstoque(
    quantidadeEstoque: number,
    quantidadeBaixa: number,
  ): void {
    if (quantidadeBaixa > quantidadeEstoque) {
      throw new BusinessException(
        `Estoque insuficiente para baixa. Estoque: ${quantidadeEstoque}, Solicitado: ${quantidadeBaixa}`,
      );
    }
  }
}
