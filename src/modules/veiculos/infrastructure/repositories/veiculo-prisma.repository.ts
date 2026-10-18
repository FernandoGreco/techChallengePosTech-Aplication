import { Injectable } from '@nestjs/common';
import { Veiculo } from '@prisma/client';
import { PrismaService } from '../../../../shared/database';
import { IVeiculoRepository } from '../../domain/repositories/veiculo.repository.interface';
import { CreateVeiculoDto } from '../../application/dto/create-veiculo.dto';
import { UpdateVeiculoDto } from '../../application/dto/update-veiculo.dto';

@Injectable()
export class VeiculoPrismaRepository implements IVeiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVeiculoDto): Promise<Veiculo> {
    return this.prisma.veiculo.create({ data });
  }

  async findAll(): Promise<Veiculo[]> {
    return this.prisma.veiculo.findMany({ include: { cliente: true } });
  }

  async findById(id: string): Promise<Veiculo | null> {
    return this.prisma.veiculo.findUnique({
      where: { id },
      include: { cliente: true },
    });
  }

  async findByClienteId(clienteId: string): Promise<Veiculo[]> {
    return this.prisma.veiculo.findMany({
      where: { clienteId },
      include: { cliente: true },
    });
  }

  async update(id: string, data: UpdateVeiculoDto): Promise<Veiculo> {
    return this.prisma.veiculo.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.veiculo.delete({ where: { id } });
  }
}
