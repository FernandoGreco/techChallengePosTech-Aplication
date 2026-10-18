import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientesUseCase } from '../../application/use-cases/clientes.use-case';
import { CreateClienteDto } from '../../application/dto/create-cliente.dto';
import { UpdateClienteDto } from '../../application/dto/update-cliente.dto';

@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesUseCase: ClientesUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Cliente já existe' })
  async criar(@Body() dto: CreateClienteDto) {
    return this.clientesUseCase.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  // async listarTodos() {
  //   return this.clientesUseCase.listarTodos();
  // }
  async listarTodos(@Query('delay') delay?: string) {
    if (delay !== undefined) {
      // Se mandar apenas ?delay sem valor, assume 3000ms. Se passar ?delay=5000, usa 5000ms.
      const ms = parseInt(delay, 10) || 3000;
      await new Promise((resolve) => setTimeout(resolve, ms));
    }

    return this.clientesUseCase.listarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async buscarPorId(@Param('id') id: string) {
    return this.clientesUseCase.buscarPorId(id);
  }

  @Get('documento/:documento')
  @ApiOperation({ summary: 'Buscar cliente por documento (CPF/CNPJ)' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async buscarPorDocumento(@Param('documento') documento: string) {
    return this.clientesUseCase.buscarPorDocumento(documento);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clientesUseCase.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  @ApiResponse({ status: 200, description: 'Cliente removido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remover(@Param('id') id: string) {
    return this.clientesUseCase.remover(id);
  }
}
