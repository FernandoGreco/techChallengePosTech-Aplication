import { Injectable } from '@nestjs/common';
import { Servico } from '@prisma/client';
import { PrismaService } from '../../../../shared/database';
import { IServicoRepository } from '../../domain/repositories/servico.repository.interface';
import { CreateServicoDto } from '../../application/dto/create-servico.dto';
import { UpdateServicoDto } from '../../application/dto/update-servico.dto';

@Injectable()
export class ServicoPrismaRepository implements IServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateServicoDto): Promise<Servico> {
    return this.prisma.servico.create({ data });
  }

  async findAll(): Promise<Servico[]> {
    return this.prisma.servico.findMany();
  }

  async findById(id: string): Promise<Servico | null> {
    return this.prisma.servico.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateServicoDto): Promise<Servico> {
    return this.prisma.servico.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.servico.delete({ where: { id } });
  }
}
