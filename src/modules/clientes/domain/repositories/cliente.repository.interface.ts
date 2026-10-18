import { Cliente } from '@prisma/client';
import { CreateClienteDto } from '../../application/dto/create-cliente.dto';
import { UpdateClienteDto } from '../../application/dto/update-cliente.dto';

export interface IClienteRepository {
  create(data: CreateClienteDto): Promise<Cliente>;
  findAll(): Promise<Cliente[]>;
  findById(id: string): Promise<Cliente | null>;
  findByDocumento(documento: string): Promise<Cliente | null>;
  update(id: string, data: UpdateClienteDto): Promise<Cliente>;
  delete(id: string): Promise<void>;
}

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';
