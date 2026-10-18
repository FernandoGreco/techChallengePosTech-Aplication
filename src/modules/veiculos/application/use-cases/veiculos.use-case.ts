import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  IVeiculoRepository,
  VEICULO_REPOSITORY,
} from '../../domain/repositories/veiculo.repository.interface';
import { CreateVeiculoDto } from '../dto/create-veiculo.dto';
import { UpdateVeiculoDto } from '../dto/update-veiculo.dto';
import { PrismaService } from '../../../../shared/database';

@Injectable()
export class VeiculosUseCase {
  constructor(
    @Inject(VEICULO_REPOSITORY)
    private readonly veiculoRepository: IVeiculoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async criar(dto: CreateVeiculoDto) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const existente = await this.prisma.veiculo.findUnique({
      where: { placa: dto.placa.toUpperCase() },
    });
    if (existente) {
      throw new ConflictException('Já existe um veículo com esta placa');
    }

    return this.veiculoRepository.create({
      ...dto,
      placa: dto.placa.toUpperCase(),
    });
  }

  async listarTodos() {
    return this.veiculoRepository.findAll();
  }

  async buscarPorId(id: string) {
    const veiculo = await this.veiculoRepository.findById(id);
    if (!veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }
    return veiculo;
  }

  async buscarPorClienteId(clienteId: string) {
    return this.veiculoRepository.findByClienteId(clienteId);
  }

  async atualizar(id: string, dto: UpdateVeiculoDto) {
    await this.buscarPorId(id);
    return this.veiculoRepository.update(id, {
      ...dto,
      placa: dto.placa ? dto.placa.toUpperCase() : undefined,
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    await this.veiculoRepository.delete(id);
  }
}
