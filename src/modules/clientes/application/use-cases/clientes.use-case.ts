import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  IClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../domain/repositories/cliente.repository.interface';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';

@Injectable()
export class ClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async criar(dto: CreateClienteDto) {
    const existente = await this.clienteRepository.findByDocumento(
      dto.documento,
    );
    if (existente) {
      throw new ConflictException('Já existe um cliente com este documento');
    }
    return this.clienteRepository.create(dto);
  }

  async listarTodos() {
    return this.clienteRepository.findAll();
  }

  async buscarPorId(id: string) {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }

  async buscarPorDocumento(documento: string) {
    const cliente = await this.clienteRepository.findByDocumento(documento);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }

  async atualizar(id: string, dto: UpdateClienteDto) {
    await this.buscarPorId(id);
    return this.clienteRepository.update(id, dto);
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    await this.clienteRepository.delete(id);
  }
}
