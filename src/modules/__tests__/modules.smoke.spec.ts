import { AppModule } from '../../app.module';
import { ClientesModule } from '../clientes/clientes.module';
import { VeiculosModule } from '../veiculos/veiculos.module';
import { ServicosModule } from '../servicos/servicos.module';
import { PecasModule } from '../pecas/pecas.module';
import { OrdensServicoModule } from '../ordens-servico/ordens-servico.module';
import { OrcamentosModule } from '../orcamentos/orcamentos.module';
import { RelatoriosModule } from '../relatorios/relatorios.module';

describe('Modules smoke test', () => {
  it('importa módulos principais sem erro', () => {
    expect(AppModule).toBeDefined();
    expect(ClientesModule).toBeDefined();
    expect(VeiculosModule).toBeDefined();
    expect(ServicosModule).toBeDefined();
    expect(PecasModule).toBeDefined();
    expect(OrdensServicoModule).toBeDefined();
    expect(OrcamentosModule).toBeDefined();
    expect(RelatoriosModule).toBeDefined();
  });
});
