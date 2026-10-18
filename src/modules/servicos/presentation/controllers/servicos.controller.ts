import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicosUseCase } from '../../application/use-cases/servicos.use-case';
import { CreateServicoDto } from '../../application/dto/create-servico.dto';
import { UpdateServicoDto } from '../../application/dto/update-servico.dto';

@ApiTags('Serviços')
@ApiBearerAuth()
@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosUseCase: ServicosUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo serviço' })
  @ApiResponse({ status: 201, description: 'Serviço criado' })
  async criar(@Body() dto: CreateServicoDto) {
    return this.servicosUseCase.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os serviços' })
  @ApiResponse({ status: 200, description: 'Lista de serviços' })
  async listarTodos() {
    return this.servicosUseCase.listarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async buscarPorId(@Param('id') id: string) {
    return this.servicosUseCase.buscarPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdateServicoDto) {
    return this.servicosUseCase.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover serviço' })
  @ApiResponse({ status: 200, description: 'Serviço removido' })
  async remover(@Param('id') id: string) {
    return this.servicosUseCase.remover(id);
  }
}
