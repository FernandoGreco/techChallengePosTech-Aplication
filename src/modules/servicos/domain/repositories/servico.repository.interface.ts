import { Servico } from '@prisma/client';
import { CreateServicoDto } from '../../application/dto/create-servico.dto';
import { UpdateServicoDto } from '../../application/dto/update-servico.dto';

export interface IServicoRepository {
  create(data: CreateServicoDto): Promise<Servico>;
  findAll(): Promise<Servico[]>;
  findById(id: string): Promise<Servico | null>;
  update(id: string, data: UpdateServicoDto): Promise<Servico>;
  delete(id: string): Promise<void>;
}

export const SERVICO_REPOSITORY = 'SERVICO_REPOSITORY';
