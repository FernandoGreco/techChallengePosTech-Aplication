import { Injectable } from '@nestjs/common';
import { Cliente } from '@prisma/client';
import { PrismaService } from '../../../../shared/database';
import { IClienteRepository } from '../../domain/repositories/cliente.repository.interface';
import { CreateClienteDto } from '../../application/dto/create-cliente.dto';
import { UpdateClienteDto } from '../../application/dto/update-cliente.dto';

@Injectable()
export class ClientePrismaRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClienteDto): Promise<Cliente> {
    return this.prisma.cliente.create({ data });
  }

  async findAll(): Promise<Cliente[]> {
    return this.prisma.cliente.findMany({
      include: { veiculos: true },
    });
  }

  async findById(id: string): Promise<Cliente | null> {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: { veiculos: true },
    });
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    return this.prisma.cliente.findUnique({
      where: { documento },
      include: { veiculos: true },
    });
  }

  async update(id: string, data: UpdateClienteDto): Promise<Cliente> {
    return this.prisma.cliente.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cliente.delete({ where: { id } });
  }
}
