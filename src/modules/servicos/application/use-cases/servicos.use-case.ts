import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IServicoRepository,
  SERVICO_REPOSITORY,
} from '../../domain/repositories/servico.repository.interface';
import { CreateServicoDto } from '../dto/create-servico.dto';
import { UpdateServicoDto } from '../dto/update-servico.dto';

@Injectable()
export class ServicosUseCase {
  constructor(
    @Inject(SERVICO_REPOSITORY)
    private readonly servicoRepository: IServicoRepository,
  ) {}

  async criar(dto: CreateServicoDto) {
    return this.servicoRepository.create(dto);
  }

  async listarTodos() {
    return this.servicoRepository.findAll();
  }

  async buscarPorId(id: string) {
    const servico = await this.servicoRepository.findById(id);
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return servico;
  }

  async atualizar(id: string, dto: UpdateServicoDto) {
    await this.buscarPorId(id);
    return this.servicoRepository.update(id, dto);
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    await this.servicoRepository.delete(id);
  }
}
