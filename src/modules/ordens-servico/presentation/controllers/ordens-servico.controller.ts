import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../../../auth/domain/decorators/public.decorator';
import { CreateOrdemServicoDto } from '../../application/dto/create-ordem-servico.dto';
import { AddServicoOSDto } from '../../application/dto/add-servico-os.dto';
import { AddPecaOSDto } from '../../application/dto/add-peca-os.dto';
import { RegistrarDiagnosticoDto } from '../../application/dto/registrar-diagnostico.dto';
import { CriarOrdemServicoUseCase } from '../../application/use-cases/criar-ordem-servico.use-case';
import { ListarOrdensServicoUseCase } from '../../application/use-cases/listar-ordens-servico.use-case';
import { BuscarOrdemServicoPorIdUseCase } from '../../application/use-cases/buscar-ordem-servico-por-id.use-case';
import { ConsultarStatusOSUseCase } from '../../application/use-cases/consultar-status-os.use-case';
import { AdicionarServicoOSUseCase } from '../../application/use-cases/adicionar-servico-os.use-case';
import { AdicionarPecaOSUseCase } from '../../application/use-cases/adicionar-peca-os.use-case';
import { IniciarDiagnosticoUseCase } from '../../application/use-cases/iniciar-diagnostico.use-case';
import { RegistrarDiagnosticoUseCase } from '../../application/use-cases/registrar-diagnostico.use-case';
import { GerarOrcamentoUseCase } from '../../application/use-cases/gerar-orcamento.use-case';
import { AprovarOrcamentoUseCase } from '../../application/use-cases/aprovar-orcamento.use-case';
import { RecusarOrcamentoUseCase } from '../../application/use-cases/recusar-orcamento.use-case';
import { IniciarExecucaoUseCase } from '../../application/use-cases/iniciar-execucao.use-case';
import { FinalizarOSUseCase } from '../../application/use-cases/finalizar-os.use-case';
import { EntregarOSUseCase } from '../../application/use-cases/entregar-os.use-case';

@ApiTags('Ordens de Serviço')
@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(
    private readonly criarOS: CriarOrdemServicoUseCase,
    private readonly listarOS: ListarOrdensServicoUseCase,
    private readonly buscarOSPorId: BuscarOrdemServicoPorIdUseCase,
    private readonly consultarStatus: ConsultarStatusOSUseCase,
    private readonly adicionarServico: AdicionarServicoOSUseCase,
    private readonly adicionarPeca: AdicionarPecaOSUseCase,
    private readonly iniciarDiagnostico: IniciarDiagnosticoUseCase,
    private readonly registrarDiagnostico: RegistrarDiagnosticoUseCase,
    private readonly gerarOrcamento: GerarOrcamentoUseCase,
    private readonly aprovarOrcamento: AprovarOrcamentoUseCase,
    private readonly recusarOrcamento: RecusarOrcamentoUseCase,
    private readonly iniciarExecucao: IniciarExecucaoUseCase,
    private readonly finalizarOSUseCase: FinalizarOSUseCase,
    private readonly entregarOSUseCase: EntregarOSUseCase,
  ) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Criar nova ordem de serviço' })
  @ApiResponse({ status: 201, description: 'OS criada com status RECEBIDA' })
  criar(@Body() dto: CreateOrdemServicoDto) {
    return this.criarOS.execute(dto);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Listar ordens de serviço operacionais',
    description:
      'Exclui OS com status FINALIZADA e ENTREGUE. Ordenadas por prioridade: EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA. Mais antigas primeiro dentro do mesmo status.',
  })
  @ApiResponse({ status: 200, description: 'Lista operacional de OS' })
  listarTodas() {
    return this.listarOS.execute();
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem de serviço por ID' })
  @ApiResponse({ status: 200, description: 'OS encontrada' })
  @ApiResponse({ status: 404, description: 'OS não encontrada' })
  buscarPorId(@Param('id') id: string) {
    return this.buscarOSPorId.execute(id);
  }

  @Public()
  @Get(':id/status')
  @ApiOperation({ summary: 'Consultar status da OS (rota pública)' })
  @ApiResponse({ status: 200, description: 'Status atual da OS' })
  @ApiResponse({ status: 404, description: 'OS não encontrada' })
  consultarStatusOS(@Param('id') id: string) {
    return this.consultarStatus.execute(id);
  }

  @ApiBearerAuth()
  @Post(':id/servicos')
  @ApiOperation({ summary: 'Adicionar serviço à OS' })
  @ApiResponse({ status: 200, description: 'Serviço adicionado' })
  adicionarServicoOS(@Param('id') id: string, @Body() dto: AddServicoOSDto) {
    return this.adicionarServico.execute(id, dto);
  }

  @ApiBearerAuth()
  @Post(':id/pecas')
  @ApiOperation({ summary: 'Adicionar peça à OS' })
  @ApiResponse({ status: 200, description: 'Peça adicionada' })
  adicionarPecaOS(@Param('id') id: string, @Body() dto: AddPecaOSDto) {
    return this.adicionarPeca.execute(id, dto);
  }

  @ApiBearerAuth()
  @Post(':id/iniciar-diagnostico')
  @ApiOperation({ summary: 'Iniciar diagnóstico da OS' })
  @ApiResponse({ status: 200, description: 'Diagnóstico iniciado' })
  iniciarDiagnosticoOS(@Param('id') id: string) {
    return this.iniciarDiagnostico.execute(id);
  }

  @ApiBearerAuth()
  @Post(':id/registrar-diagnostico')
  @ApiOperation({ summary: 'Registrar diagnóstico da OS' })
  @ApiResponse({ status: 200, description: 'Diagnóstico registrado' })
  registrarDiagnosticoOS(
    @Param('id') id: string,
    @Body() dto: RegistrarDiagnosticoDto,
  ) {
    return this.registrarDiagnostico.execute(id, dto);
  }

  @ApiBearerAuth()
  @Post(':id/gerar-orcamento')
  @ApiOperation({ summary: 'Gerar orçamento para a OS' })
  @ApiResponse({ status: 200, description: 'Orçamento gerado' })
  gerarOrcamentoOS(@Param('id') id: string) {
    return this.gerarOrcamento.execute(id);
  }

  @Public()
  @Post(':id/aprovar-orcamento')
  @ApiOperation({
    summary: 'Aprovar orçamento da OS',
    description:
      'Endpoint público para notificações externas de aprovação do cliente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orçamento aprovado — OS movida para EM_EXECUCAO',
  })
  aprovarOrcamentoOS(@Param('id') id: string) {
    return this.aprovarOrcamento.execute(id);
  }

  @Public()
  @Post(':id/recusar-orcamento')
  @ApiOperation({
    summary: 'Recusar orçamento da OS',
    description:
      'Endpoint público para notificações externas de recusa do cliente. OS retorna para EM_DIAGNOSTICO.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orçamento recusado — OS retornada para EM_DIAGNOSTICO',
  })
  recusarOrcamentoOS(@Param('id') id: string) {
    return this.recusarOrcamento.execute(id);
  }

  @ApiBearerAuth()
  @Post(':id/iniciar-execucao')
  @ApiOperation({ summary: 'Iniciar execução da OS' })
  @ApiResponse({ status: 200, description: 'Execução iniciada' })
  iniciarExecucaoOS(@Param('id') id: string) {
    return this.iniciarExecucao.execute(id);
  }

  @ApiBearerAuth()
  @Post(':id/finalizar')
  @ApiOperation({
    summary: 'Finalizar OS — baixa estoque das peças utilizadas',
  })
  @ApiResponse({ status: 200, description: 'OS finalizada' })
  finalizarOS(@Param('id') id: string) {
    return this.finalizarOSUseCase.execute(id);
  }

  @ApiBearerAuth()
  @Post(':id/entregar')
  @ApiOperation({ summary: 'Entregar veículo ao cliente' })
  @ApiResponse({
    status: 200,
    description: 'Veículo entregue — OS marcada como ENTREGUE',
  })
  entregarOS(@Param('id') id: string) {
    return this.entregarOSUseCase.execute(id);
  }
}
