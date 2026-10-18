import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IPecaRepository,
  PECA_REPOSITORY,
} from '../../domain/repositories/peca.repository.interface';
import { CreatePecaDto } from '../dto/create-peca.dto';
import { UpdatePecaDto } from '../dto/update-peca.dto';
import { EstoqueRules } from '../../domain/rules/estoque.rules';

@Injectable()
export class PecasUseCase {
  constructor(
    @Inject(PECA_REPOSITORY)
    private readonly pecaRepository: IPecaRepository,
  ) {}

  async criar(dto: CreatePecaDto) {
    return this.pecaRepository.create(dto);
  }

  async listarTodas() {
    return this.pecaRepository.findAll();
  }

  async buscarPorId(id: string) {
    const peca = await this.pecaRepository.findById(id);
    if (!peca) {
      throw new NotFoundException('Peça não encontrada');
    }
    return peca;
  }

  async atualizar(id: string, dto: UpdatePecaDto) {
    await this.buscarPorId(id);
    return this.pecaRepository.update(id, dto);
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    await this.pecaRepository.delete(id);
  }

  async entradaEstoque(id: string, quantidade: number) {
    const peca = await this.buscarPorId(id);
    return this.pecaRepository.update(id, {
      quantidadeEstoque: peca.quantidadeEstoque + quantidade,
    });
  }

  async reservar(id: string, quantidade: number) {
    const peca = await this.buscarPorId(id);
    EstoqueRules.validarDisponibilidade(
      peca.quantidadeEstoque,
      peca.quantidadeReservada,
      quantidade,
    );
    return this.pecaRepository.update(id, {
      quantidadeReservada: peca.quantidadeReservada + quantidade,
    });
  }

  async baixarEstoque(id: string, quantidade: number) {
    const peca = await this.buscarPorId(id);
    EstoqueRules.validarBaixaEstoque(peca.quantidadeEstoque, quantidade);
    const novaQuantidadeReservada = Math.max(
      0,
      peca.quantidadeReservada - quantidade,
    );
    return this.pecaRepository.update(id, {
      quantidadeEstoque: peca.quantidadeEstoque - quantidade,
      quantidadeReservada: novaQuantidadeReservada,
    });
  }
}
