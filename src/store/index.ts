import { create } from 'zustand';
import { 
  Contract, 
  ContractTemplate, 
  ContractStatus, 
  ContractType, 
  Obra, 
  ObraStatus, 
  PurchaseOrder, 
  SignatureRequest, 
  SignatureStatus, 
  SignatureChannel,
  User, 
  Company, 
  Role,
  ObraStep,
  ObraCusto,
  ObraVistoria,
  AppNotification
} from '../types';
import { api } from './api';
import toast from 'react-hot-toast';

// IDs fixos (UUIDs) compatíveis com o seed do banco de dados para evitar inconsistência
const COMPANY_ID = 'da92bbf3-4613-4bb4-bc70-e696f049d53c';

const USER_ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const USER_MANAGER_ID = '22222222-2222-2222-2222-222222222222';
const USER_OPERATOR_ID = '33333333-3333-3333-3333-333333333333';
const USER_VIEWER_ID = '44444444-4444-4444-4444-444444444444';

const TMPL_1_ID = '9c1d0f5e-1111-460d-8547-0bfa7c58ab01';
const TMPL_2_ID = '9c1d0f5e-2222-460d-8547-0bfa7c58ab02';
const TMPL_3_ID = '9c1d0f5e-3333-460d-8547-0bfa7c58ab03';
const TMPL_4_ID = '9c1d0f5e-4444-460d-8547-0bfa7c58ab04';
const TMPL_5_ID = '9c1d0f5e-5555-460d-8547-0bfa7c58ab05';
const TMPL_6_ID = '9c1d0f5e-6666-460d-8547-0bfa7c58ab06';

const CTR_1_ID = 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
const CTR_2_ID = 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa';
const CTR_3_ID = 'aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa';
const CTR_4_ID = 'aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa';
const CTR_5_ID = 'aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa';

const OBR_1_ID = 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb';
const OBR_2_ID = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
const OBR_3_ID = 'bbbbbbbb-3333-3333-3333-bbbbbbbbbbbb';

const PO_1_ID = 'cccccccc-1111-1111-1111-cccccccccccc';
const PO_2_ID = 'cccccccc-2222-2222-2222-cccccccccccc';

// Pre-seeded localstorage key helpers
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`contratos_pro_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(`contratos_pro_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

// Initial Company Data
const defaultCompany: Company = {
  name: 'Constructora Sólida Ltda',
  cnpj: '12.345.678/0001-90',
  email: 'diretoria@solida.com.br',
  phone: '(11) 4002-8922',
  address: 'Rua das Flores, 123, São Paulo - SP'
};

// Initial User Data
const defaultUsers: User[] = [
  { id: USER_ADMIN_ID, name: 'Pedro Clash Kiil', email: 'pedroclashkiil@gmail.com', role: Role.ADMIN, isActive: true, lastActive: 'Hoje, 15:30' },
  { id: USER_MANAGER_ID, name: 'Marcos Rezende', email: 'marcos@solida.com.br', role: Role.MANAGER, isActive: true, lastActive: 'Hoje, 11:20' },
  { id: USER_OPERATOR_ID, name: 'Mariana Costa', email: 'mariana.costa@solida.com.br', role: Role.OPERATOR, isActive: true, lastActive: 'Ontem, 17:45' },
  { id: USER_VIEWER_ID, name: 'Ricardo Dias', email: 'ricardo@solida.com.br', role: Role.VIEWER, isActive: false, lastActive: 'Há 5 dias' }
];

// Initial Templates Data
const defaultTemplates: ContractTemplate[] = [
  {
    id: TMPL_1_ID,
    name: 'Prestação de Serviço de Engenharia',
    type: ContractType.SERVICO,
    description: 'Template de contrato padrão para consultoria e suporte técnico em engenharia civil.',
    fields: [
      { id: 'f-1', label: 'Nome do Consultor', key: 'nome_consultor', type: 'text', required: true, placeholder: 'Ex: Eng. Fulano de Tal' },
      { id: 'f-2', label: 'Registro CREA', key: 'crea_registro', type: 'text', required: true, placeholder: 'Ex: CREA-SP 123456' },
      { id: 'f-3', label: 'Escopo detalhado', key: 'escopo_detalhado', type: 'text', required: true, placeholder: 'Descreva os serviços' },
      { id: 'f-4', label: 'Valor da Parcela Mensal', key: 'valor_mensal', type: 'number', required: true, placeholder: 'Ex: 5000' }
    ],
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 24px; color: #1e3a5f;">{{titulo_contrato}}</h2>
        
        <p>Pelo presente instrumento particular, de um lado <strong>{{empresa_contratante}}</strong>, inscrita no CNPJ sob o n° <strong>{{cnpj_contratante}}</strong>, neste ato representada conforme seus poderes estatutários, doravante denominada <strong>CONTRATANTE</strong>.</p>
        
        <p>E de outro lado, <strong>{{parte_relacionada}}</strong>, doravante denominada <strong>CONTRATADA</strong>, devidamente qualificada pelo profissional <strong>{{nome_consultor}}</strong>, portador do CREA nº <strong>{{crea_registro}}</strong>.</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 18px; color: #1e3a5f;">CLÁUSULA PRIMEIRA - OBJETO</h3>
        <p>O presente contrato tem por objeto a prestação de serviços de engenharia civil voltados para: <em>{{escopo_detalhado}}</em>.</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 18px; color: #1e3a5f;">CLÁUSULA SEGUNDA - VALORES E CONDIÇÕES</h3>
        <p>Pelo serviço efetivamente prestado, a CONTRATANTE pagará à CONTRATADA o montante global de <strong>R$ {{valor_total}}</strong>, ou sob parcelas operadas no valor de <strong>R$ {{valor_mensal}}</strong> vigentes até a data de encerramento contratual informada em <strong>{{data_fim}}</strong>.</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 18px; color: #1e3a5f;">CLÁUSULA TERCEIRA - ASSINATURAS</h3>
        <p>E por estarem de pleno acordo, firmam as partes o presente instrumento por assinatura digital certificada.</p>
        
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;">
            <p><strong>CONTRATANTE</strong><br/>{{empresa_contratante}}</p>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;">
            <p><strong>CONTRATADA</strong><br/>{{parte_relacionada}}</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: TMPL_2_ID,
    name: 'Locação de Equipamento Pesado',
    type: ContractType.LOCACAO,
    description: 'Contrato de locação comercial de escavadeiras, tratores ou betoneiras por período determinado.',
    fields: [
      { id: 'f-5', label: 'Equipamento e Modelo', key: 'modelo_equipamento', type: 'text', required: true, placeholder: 'Ex: Retroescavadeira CAT 320L' },
      { id: 'f-6', label: 'Franquia de Horas (Mensal)', key: 'franquia_horas', type: 'number', required: true, placeholder: 'Ex: 120' },
      { id: 'f-7', label: 'Local de Entrega', key: 'local_obra', type: 'text', required: true, placeholder: 'Ex: Obra Residencial Bela Vista' }
    ],
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 24px; color: #1e3a5f;">{{titulo_contrato}}</h2>
        
        <p><strong>CONTRATANTE:</strong> <strong>{{empresa_contratante}}</strong>, filial sediada com CNPJ <strong>{{cnpj_contratante}}</strong>.</p>
        <p><strong>CONTRATADA / LOCADORA:</strong> <strong>{{parte_relacionada}}</strong>.</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 18px; color: #1e3a5f;">OBJETO</h3>
        <p>A LOCADORA cede para locação temporária o equipamento <strong>{{modelo_equipamento}}</strong>, a ser instalado e operado na localidade de destinação: <strong>{{local_obra}}</strong>, respeitando a franquia estipulada de <strong>{{franquia_horas}} horas</strong> mensais excedentes.</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 18px; color: #1e3a5f;">VIGÊNCIA E VALOR</h3>
        <p>A taxa de locação pactuada é de <strong>R$ {{valor_total}}</strong>, compreendida no período de <strong>{{data_inicio}}</strong> até <strong>{{data_fim}}</strong>.</p>
        
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;">
            <p><strong>LOCATÁRIO (CONTRATANTE)</strong></p>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;">
            <p><strong>LOCADOR (CONTRATADA)</strong></p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: TMPL_3_ID,
    name: 'Prestação de Serviço Geral',
    type: ContractType.SERVICO,
    description: 'Template genérico para prestação de serviços entre empresas ou profissionais autônomos.',
    fields: [
      { id: 'f3-1', label: 'Nome / Razão Social da Prestadora', key: 'razao_prestadora', type: 'text', required: true, placeholder: 'Ex: Tech Solutions Ltda' },
      { id: 'f3-2', label: 'CNPJ ou CPF da Prestadora', key: 'cnpj_prestadora', type: 'text', required: true, placeholder: 'Ex: 12.345.678/0001-00' },
      { id: 'f3-3', label: 'Descrição Detalhada do Serviço', key: 'descricao_servico', type: 'text', required: true, placeholder: 'Ex: Desenvolvimento de sistema web customizado' },
      { id: 'f3-4', label: 'Prazo de Entrega (dias)', key: 'prazo_entrega_dias', type: 'number', required: true, placeholder: 'Ex: 90' },
      { id: 'f3-5', label: 'Forma de Pagamento', key: 'forma_pagamento', type: 'select', required: true, options: ['À vista', 'Parcelado mensalmente', '30/60/90 dias', 'Sob medição'] }
    ],
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.7; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px;">
          <h2 style="font-size: 22px; font-weight: bold; color: #1e3a5f; margin: 0;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
          <p style="font-size: 13px; color: #64748b; margin-top: 4px;">{{titulo_contrato}}</p>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-bottom: 4px;">QUALIFICAÇÃO DAS PARTES</h3>
        <p><strong>CONTRATANTE:</strong> <strong>{{empresa_contratante}}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <strong>{{cnpj_contratante}}</strong>, doravante denominada simplesmente <strong>CONTRATANTE</strong>.</p>
        <p><strong>CONTRATADA:</strong> <strong>{{razao_prestadora}}</strong>, inscrita no CNPJ/CPF nº <strong>{{cnpj_prestadora}}</strong>, representada pela parte <strong>{{parte_relacionada}}</strong>, doravante denominada <strong>CONTRATADA</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 1ª — DO OBJETO</h3>
        <p>O presente instrumento tem por objeto a prestação dos seguintes serviços pela CONTRATADA: <em>{{descricao_servico}}</em>. Os serviços deverão ser entregues no prazo máximo de <strong>{{prazo_entrega_dias}} dias</strong> corridos a contar da assinatura deste contrato.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 2ª — DO VALOR E FORMA DE PAGAMENTO</h3>
        <p>Pelos serviços ora contratados, a CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {{valor_total}}</strong>, mediante <strong>{{forma_pagamento}}</strong>. O período contratual compreende <strong>{{data_inicio}}</strong> a <strong>{{data_fim}}</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 3ª — DAS OBRIGAÇÕES DA CONTRATADA</h3>
        <p>A CONTRATADA obriga-se a: (i) executar os serviços com qualidade e dentro do prazo estipulado; (ii) manter sigilo sobre informações confidenciais da CONTRATANTE; (iii) designar profissionais habilitados para a execução dos serviços; (iv) corrigir, sem ônus adicional, eventuais falhas nos serviços prestados.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 4ª — DAS OBRIGAÇÕES DA CONTRATANTE</h3>
        <p>A CONTRATANTE obriga-se a: (i) efetuar os pagamentos nas datas acordadas; (ii) fornecer todas as informações e acessos necessários à prestação dos serviços; (iii) designar um responsável para acompanhamento e aprovação das entregas.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 5ª — DA RESCISÃO</h3>
        <p>O presente contrato poderá ser rescindido por qualquer das partes mediante notificação prévia de 30 (trinta) dias, por escrito. Em caso de rescisão imotivada pela CONTRATANTE, esta deverá pagar os serviços já executados proporcionalmente, acrescidos de multa de 10% sobre o valor total remanescente.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 6ª — DO FORO</h3>
        <p>As partes elegem o Foro da Comarca de São Paulo/SP para dirimir quaisquer litígios oriundos do presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.</p>

        <p style="margin-top: 24px; font-size: 13px; color: #64748b;">E por estarem justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas.</p>

        <div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>CONTRATANTE</strong><br/>{{empresa_contratante}}</p>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>CONTRATADA</strong><br/>{{razao_prestadora}}</p>
          </div>
        </div>
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 1 — Nome e CPF</p></div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 2 — Nome e CPF</p></div>
        </div>
      </div>
    `
  },
  {
    id: TMPL_4_ID,
    name: 'Contrato de Trabalho (CLT)',
    type: ContractType.TRABALHO,
    description: 'Contrato individual de trabalho por prazo indeterminado, regido pela CLT, para admissão de colaboradores.',
    fields: [
      { id: 'f4-1', label: 'Nome Completo do Empregado', key: 'nome_empregado', type: 'text', required: true, placeholder: 'Ex: Carlos Eduardo Pereira' },
      { id: 'f4-2', label: 'CPF do Empregado', key: 'cpf_empregado', type: 'text', required: true, placeholder: 'Ex: 123.456.789-00' },
      { id: 'f4-3', label: 'Carteira de Trabalho (CTPS)', key: 'ctps_numero', type: 'text', required: true, placeholder: 'Ex: 000123 Série 001-SP' },
      { id: 'f4-4', label: 'Cargo / Função', key: 'cargo_funcao', type: 'text', required: true, placeholder: 'Ex: Engenheiro Civil Pleno' },
      { id: 'f4-5', label: 'Salário Bruto Mensal (R$)', key: 'salario_bruto', type: 'number', required: true, placeholder: 'Ex: 8500' },
      { id: 'f4-6', label: 'Carga Horária Semanal (horas)', key: 'carga_horaria', type: 'number', required: true, placeholder: 'Ex: 44' },
      { id: 'f4-7', label: 'Local de Trabalho / Obra', key: 'local_trabalho', type: 'text', required: true, placeholder: 'Ex: Canteiro - Residencial Bela Vista' }
    ],
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.7; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px;">
          <h2 style="font-size: 22px; font-weight: bold; color: #1e3a5f; margin: 0;">CONTRATO INDIVIDUAL DE TRABALHO</h2>
          <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Regido pela Consolidação das Leis do Trabalho — CLT (Decreto-Lei nº 5.452/1943)</p>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f;">IDENTIFICAÇÃO DAS PARTES</h3>
        <p><strong>EMPREGADOR:</strong> <strong>{{empresa_contratante}}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ nº <strong>{{cnpj_contratante}}</strong>, com sede em seu endereço registrado, doravante denominada <strong>EMPREGADOR</strong>.</p>
        <p><strong>EMPREGADO:</strong> <strong>{{nome_empregado}}</strong>, portador do CPF nº <strong>{{cpf_empregado}}</strong>, inscrito na Carteira de Trabalho nº <strong>{{ctps_numero}}</strong>, doravante denominado <strong>EMPREGADO</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 1ª — DO CARGO E LOCAL DE TRABALHO</h3>
        <p>O EMPREGADO é admitido para exercer a função de <strong>{{cargo_funcao}}</strong>, prestando seus serviços no local: <strong>{{local_trabalho}}</strong>, podendo ser transferido para outros locais de obras dentro do município, mediante acordo prévio.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 2ª — DA REMUNERAÇÃO</h3>
        <p>Pela prestação dos serviços, o EMPREGADOR pagará ao EMPREGADO o salário bruto mensal de <strong>R$ {{salario_bruto}}</strong>, sujeito aos descontos legais de INSS, IRRF e demais encargos previstos em lei, pagável até o 5º dia útil do mês subsequente.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 3ª — DA JORNADA DE TRABALHO</h3>
        <p>A jornada de trabalho será de <strong>{{carga_horaria}} horas semanais</strong>, distribuídas de segunda a sábado, em conformidade com o disposto no Art. 58 da CLT e a convenção coletiva da categoria. Horas extras serão remuneradas com adicional de 50% (cinquenta por cento) em dias úteis e 100% (cem por cento) aos domingos e feriados.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 4ª — DO PRAZO</h3>
        <p>O presente contrato é firmado por prazo <strong>indeterminado</strong>, com início em <strong>{{data_inicio}}</strong>, sendo regido integralmente pelas disposições da CLT e pela Convenção Coletiva de Trabalho vigente da categoria profissional do EMPREGADO.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 5ª — DOS BENEFÍCIOS</h3>
        <p>O EMPREGADO fará jus aos seguintes benefícios: (i) Vale-Transporte, conforme Lei nº 7.418/85; (ii) Vale-Refeição ou Alimentação nos termos da CCT; (iii) Plano de Saúde coletivo empresarial; (iv) 13º salário, férias proporcionais + 1/3 e FGTS, conforme legislação vigente.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 6ª — DAS DISPOSIÇÕES GERAIS</h3>
        <p>O EMPREGADO declara estar ciente e de acordo com o Regulamento Interno da empresa, Política de Segurança do Trabalho (NR-18 para canteiros de obra) e demais normas internas. A rescisão do presente contrato obedecerá ao disposto nos Arts. 477 e seguintes da CLT.</p>

        <div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>EMPREGADOR</strong><br/>{{empresa_contratante}}</p>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>EMPREGADO</strong><br/>{{nome_empregado}}<br/><span style="font-size:11px;color:#94a3b8;">CPF: {{cpf_empregado}}</span></p>
          </div>
        </div>
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 1 — Nome e CPF</p></div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 2 — Nome e CPF</p></div>
        </div>
      </div>
    `
  },
  {
    id: TMPL_5_ID,
    name: 'Contrato de Execução de Obra Civil',
    type: ContractType.OBRA,
    description: 'Contrato para execução de obra civil entre construtora e contratante, com cronograma e medições.',
    fields: [
      { id: 'f5-1', label: 'Endereço Completo da Obra', key: 'endereco_obra', type: 'text', required: true, placeholder: 'Ex: Rua das Palmeiras, 450, São Paulo - SP' },
      { id: 'f5-2', label: 'Tipo / Descrição da Obra', key: 'tipo_obra', type: 'text', required: true, placeholder: 'Ex: Construção de edifício residencial de 8 pavimentos' },
      { id: 'f5-3', label: 'Área Total Construída (m²)', key: 'area_construida', type: 'number', required: true, placeholder: 'Ex: 3200' },
      { id: 'f5-4', label: 'Engenheiro Responsável (CREA)', key: 'engenheiro_responsavel', type: 'text', required: true, placeholder: 'Ex: Eng. Fernando Lacerda - CREA-SP 654321' },
      { id: 'f5-5', label: 'Número do Alvará de Construção', key: 'alvara_construcao', type: 'text', required: true, placeholder: 'Ex: 2026/A-00123' },
      { id: 'f5-6', label: 'Regime de Contratação', key: 'regime_contratacao', type: 'select', required: true, options: ['Empreitada global (preço fixo)', 'Empreitada por preço unitário', 'Administração com reembolso de custos', 'Tarefa'] }
    ],
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.7; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px;">
          <h2 style="font-size: 22px; font-weight: bold; color: #1e3a5f; margin: 0;">CONTRATO DE EXECUÇÃO DE OBRA CIVIL</h2>
          <p style="font-size: 13px; color: #64748b; margin-top: 4px;">{{titulo_contrato}}</p>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f;">DAS PARTES CONTRATANTES</h3>
        <p><strong>CONTRATANTE:</strong> <strong>{{empresa_contratante}}</strong>, CNPJ nº <strong>{{cnpj_contratante}}</strong>, doravante denominada <strong>CONTRATANTE</strong>.</p>
        <p><strong>CONTRATADA (CONSTRUTORA):</strong> <strong>{{parte_relacionada}}</strong>, empresa especializada em construção civil, responsável técnica sob o Engenheiro <strong>{{engenheiro_responsavel}}</strong>, doravante denominada <strong>CONTRATADA</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 1ª — DO OBJETO</h3>
        <p>Constitui objeto do presente contrato a execução de <strong>{{tipo_obra}}</strong>, com área total de <strong>{{area_construida}} m²</strong>, localizada em <strong>{{endereco_obra}}</strong>, em conformidade com o projeto arquitetônico, memorial descritivo, planilha orçamentária e cronograma físico-financeiro, todos aprovados e parte integrante deste instrumento, tendo Alvará de Construção nº <strong>{{alvara_construcao}}</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 2ª — DO PREÇO E FORMA DE PAGAMENTO</h3>
        <p>O preço global da obra é de <strong>R$ {{valor_total}}</strong>, sob o regime de <strong>{{regime_contratacao}}</strong>. Os pagamentos serão realizados mediante medições mensais, aprovadas pelo CONTRATANTE, dentro de 10 (dez) dias úteis após aprovação do boletim de medição. O prazo de execução é de <strong>{{data_inicio}}</strong> a <strong>{{data_fim}}</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 3ª — DAS OBRIGAÇÕES DA CONTRATADA</h3>
        <p>A CONTRATADA compromete-se a: (i) executar a obra com materiais de primeira qualidade, conforme especificações técnicas aprovadas; (ii) observar as Normas Brasileiras (ABNT) e legislação trabalhista (NR-18); (iii) manter o canteiro limpo e sinalizado; (iv) responsabilizar-se por todos os encargos trabalhistas e previdenciários dos seus empregados; (v) fornecer relatório fotográfico quinzenal do andamento da obra.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 4ª — DAS PENALIDADES E GARANTIAS</h3>
        <p>Em caso de atraso injustificado, a CONTRATADA sujeita-se à multa de 0,5% (meio por cento) ao dia sobre o valor total do contrato, limitada a 10% (dez por cento). A CONTRATADA prestará garantia de 5% (cinco por cento) sobre o valor total, liberada após o prazo de garantia da obra de 5 (cinco) anos, nos termos do Art. 618 do Código Civil.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 5ª — DO RECEBIMENTO DA OBRA</h3>
        <p>Concluída a obra, será realizada vistoria conjunta para emissão do Termo de Recebimento Provisório. Após 90 (noventa) dias sem vícios aparentes, será emitido o Termo de Recebimento Definitivo, encerrando as obrigações contratuais da CONTRATADA, salvo vícios redibitórios e garantia legal.</p>

        <div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>CONTRATANTE</strong><br/>{{empresa_contratante}}</p>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>CONTRATADA</strong><br/>{{parte_relacionada}}</p>
          </div>
        </div>
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 1 — Nome e CPF</p></div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 2 — Nome e CPF</p></div>
        </div>
      </div>
    `
  },
  {
    id: TMPL_6_ID,
    name: 'Contrato de Locação de Imóvel Comercial',
    type: ContractType.LOCACAO,
    description: 'Locação de imóvel comercial por prazo determinado, com reajuste anual pelo IGP-M/IGPM, regido pela Lei 8.245/91.',
    fields: [
      { id: 'f6-1', label: 'Endereço Completo do Imóvel', key: 'endereco_imovel', type: 'text', required: true, placeholder: 'Ex: Av. Paulista, 1500, Sala 302, São Paulo - SP' },
      { id: 'f6-2', label: 'Área do Imóvel (m²)', key: 'area_imovel', type: 'number', required: true, placeholder: 'Ex: 120' },
      { id: 'f6-3', label: 'Nome Completo do Locador', key: 'nome_locador', type: 'text', required: true, placeholder: 'Ex: Imobiliária Central SPE Ltda' },
      { id: 'f6-4', label: 'CPF/CNPJ do Locador', key: 'cpf_cnpj_locador', type: 'text', required: true, placeholder: 'Ex: 98.765.432/0001-11' },
      { id: 'f6-5', label: 'Valor do Aluguel Mensal (R$)', key: 'aluguel_mensal', type: 'number', required: true, placeholder: 'Ex: 4500' },
      { id: 'f6-6', label: 'Índice de Reajuste Anual', key: 'indice_reajuste', type: 'select', required: true, options: ['IGP-M (FGV)', 'IPCA (IBGE)', 'INPC (IBGE)', 'IPC-A'] },
      { id: 'f6-7', label: 'Meses de Carência (isenção inicial)', key: 'meses_carencia', type: 'number', required: false, placeholder: 'Ex: 2 (opcional)' }
    ],
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.7; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #1e3a5f; padding-bottom: 16px;">
          <h2 style="font-size: 22px; font-weight: bold; color: #1e3a5f; margin: 0;">CONTRATO DE LOCAÇÃO DE IMÓVEL COMERCIAL</h2>
          <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Lei do Inquilinato — Lei nº 8.245, de 18 de outubro de 1991</p>
        </div>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f;">DAS PARTES</h3>
        <p><strong>LOCADOR:</strong> <strong>{{nome_locador}}</strong>, inscrito no CPF/CNPJ nº <strong>{{cpf_cnpj_locador}}</strong>, proprietário do imóvel descrito neste contrato, doravante denominado <strong>LOCADOR</strong>.</p>
        <p><strong>LOCATÁRIO:</strong> <strong>{{empresa_contratante}}</strong>, pessoa jurídica inscrita no CNPJ nº <strong>{{cnpj_contratante}}</strong>, representada pela parte <strong>{{parte_relacionada}}</strong>, doravante denominada <strong>LOCATÁRIO</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 1ª — DO OBJETO E DESCRIÇÃO DO IMÓVEL</h3>
        <p>O LOCADOR cede ao LOCATÁRIO, para fins exclusivamente <strong>comerciais</strong>, o imóvel situado em <strong>{{endereco_imovel}}</strong>, com área total de <strong>{{area_imovel}} m²</strong>. O imóvel é entregue em perfeito estado de conservação, conforme laudo de vistoria inicial em anexo.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 2ª — DO PRAZO DE LOCAÇÃO</h3>
        <p>A locação é firmada pelo prazo determinado de <strong>{{data_inicio}}</strong> a <strong>{{data_fim}}</strong>. Havendo período de carência de <strong>{{meses_carencia}} meses</strong>, ficam os primeiros meses isentos de cobrança de aluguel, obrigando-se o LOCATÁRIO ao pagamento das despesas condominiais e IPTU nesse período.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 3ª — DO ALUGUEL E REAJUSTE</h3>
        <p>O aluguel mensal é fixado em <strong>R$ {{aluguel_mensal}}</strong>, a ser pago pelo LOCATÁRIO até o dia 5 (cinco) de cada mês subsequente ao vencido, mediante depósito bancário ou boleto. O aluguel será reajustado anualmente pela variação positiva do índice <strong>{{indice_reajuste}}</strong>, com valor total do contrato estimado em <strong>R$ {{valor_total}}</strong>.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 4ª — DAS OBRIGAÇÕES DO LOCATÁRIO</h3>
        <p>O LOCATÁRIO obriga-se a: (i) pagar pontualmente o aluguel e encargos; (ii) usar o imóvel exclusivamente para finalidade comercial lícita; (iii) conservar o imóvel em bom estado, realizando reparos de uso; (iv) não sublocar, ceder ou emprestar o imóvel sem autorização prévia e por escrito do LOCADOR; (v) restituir o imóvel no estado em que o recebeu, ao término da locação.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 5ª — DA MULTA POR RESCISÃO ANTECIPADA</h3>
        <p>Em caso de devolução antecipada do imóvel, o LOCATÁRIO pagará ao LOCADOR multa equivalente a 3 (três) aluguéis vigentes, proporcional ao prazo remanescente do contrato, nos termos do Art. 4º da Lei 8.245/91, salvo acordo entre as partes.</p>

        <h3 style="font-size: 14px; font-weight: bold; color: #1e3a5f; margin-top: 20px;">CLÁUSULA 6ª — DO FORO</h3>
        <p>Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer questões oriundas do presente contrato, com renúncia a qualquer outro.</p>

        <div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>LOCADOR</strong><br/>{{nome_locador}}</p>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center;">
            <p><strong>LOCATÁRIO (CONTRATANTE)</strong></p>
          </div>
        </div>
        <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 1 — Nome e CPF</p></div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; text-align: center;"><p style="font-size:12px; color:#94a3b8;">Testemunha 2 — Nome e CPF</p></div>
        </div>
      </div>
    `
  }
];

// Initial Contracts Data
const defaultContracts: Contract[] = [
  {
    id: CTR_1_ID,
    title: 'Consultoria Estrutural Fundações',
    relatedParty: 'Geotécnica Solo Forte S/S',
    type: ContractType.SERVICO,
    value: 45000,
    startDate: '2026-01-10',
    endDate: '2026-06-15',
    status: ContractStatus.ATIVO,
    templateId: TMPL_1_ID,
    fieldValues: {
      nome_consultor: 'Dr. Arthur Mendes',
      crea_registro: 'CREA-PR 9821-D',
      escopo_detalhado: 'Análise de sondagem SPT e cálculo estrutural de fundações do bloco A e B.',
      valor_mensal: '9000'
    },
    htmlContent: 'Carregado de template estrutural.',
    attachments: [
      { name: 'sondagem_terreno.pdf', size: '2.4 MB', date: '2026-01-11', url: '#' },
      { name: 'laudo_calculista.pdf', size: '4.1 MB', date: '2026-01-15', url: '#' }
    ],
    history: [
      { date: '10/01/2026 09:12', user: 'Pedro Clash Kiil', action: 'Criação', details: 'Contrato criado com base no template de engenharia.' },
      { date: '10/01/2026 14:05', user: 'Marcos Rezende', action: 'Assinatura', details: 'Assinado eletronicamente por ambas as partes.' },
      { date: '10/01/2026 14:10', user: 'Sistema', action: 'Ativação', details: 'Status alterado para Ativo.' }
    ]
  },
  {
    id: CTR_2_ID,
    title: 'Locação Escavadeira Hidráulica 20T',
    relatedParty: 'RentMachines Engenharia & Locações',
    type: ContractType.LOCACAO,
    value: 120000,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    status: ContractStatus.ATIVO,
    templateId: TMPL_2_ID,
    fieldValues: {
      modelo_equipamento: 'Escavadeira CAT 320 Next Gen',
      franquia_horas: '160',
      local_obra: 'Sede Corporativa ACME'
    },
    htmlContent: 'Contrato de locação comercial para escavadeira hidráulica de grande porte.',
    attachments: [
      { name: 'venda_locacao_vistoria_inicial.pdf', size: '1.8 MB', date: '2026-02-28', url: '#' }
    ],
    history: [
      { date: '28/02/2026 11:00', user: 'Marcos Rezende', action: 'Criação', details: 'Contrato criado do zero.' },
      { date: '01/03/2026 09:00', user: 'Sistema', action: 'Ativação', details: 'Ativado em virtude do início da vigência.' }
    ]
  },
  {
    id: CTR_3_ID,
    title: 'Fornecimento de Cimento Campeão Votoran',
    relatedParty: 'Distribuidora São Paulo Matcon',
    type: ContractType.OBRA,
    value: 85400,
    startDate: '2026-05-15',
    endDate: '2026-07-15',
    status: ContractStatus.AGUARDANDO,
    fieldValues: {},
    htmlContent: `
      <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
        <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 24px; color: #1e3a5f;">CONTRATO DE FORNECIMENTO DE MATERIAIS - CIMENTO COPO</h2>
        <p>A <strong>Constructora Sólida Ltda</strong> contrata o fornecimento de 2000 sacos de Cimento Campeão Votoran com a <strong>Distribuidora São Paulo Matcon</strong>.</p>
        <p><strong>Valor: R$ 85.400,00</strong>. Entrega de 10 lotes de 200 sacos sob demanda técnica.</p>
        <p>Status: Aguardando assinatura do fornecedor no canal Whatsapp.</p>
      </div>
    `,
    attachments: [],
    history: [
      { date: '15/05/2026 14:00', user: 'Pedro Clash Kiil', action: 'Criado', details: 'Aguardando fluxo de assinaturas' },
      { date: '15/05/2026 14:15', user: 'Sistema', action: 'Envio WhatsApp', details: 'Notificação enviada para o Whatsapp cadastrado.' }
    ]
  },
  {
    id: CTR_4_ID,
    title: 'Aditivo 01 - Sede Corporativa ACME',
    relatedParty: 'ACME Real Estate S/A',
    type: ContractType.OBRA,
    value: 32000,
    startDate: '2026-05-01',
    endDate: '2026-06-25',
    status: ContractStatus.ATIVO,
    fieldValues: {},
    htmlContent: '<p>Termo de Aditivo de readequação de layout do 3º pavimento e acréscimo de climatização temporária.</p>',
    attachments: [],
    history: [
      { date: '28/04/2026 15:30', user: 'Marcos Rezende', action: 'Criação', details: 'Criação de aditivo.' }
    ]
  },
  {
    id: CTR_5_ID,
    title: 'Pintura Fachada Residencial Bela Vista',
    relatedParty: 'Pintores Associados ABC Ltda',
    type: ContractType.SERVICO,
    value: 58000,
    startDate: '2026-05-20',
    endDate: '2026-09-30',
    status: ContractStatus.RASCUNHO,
    fieldValues: {},
    htmlContent: '<p>Rascunho do escopo para aplicação de impermeabilização e pintura geral na fachada do Bloco C do Residencial Bela Vista.</p>',
    attachments: [],
    history: [
      { date: '20/05/2026 10:20', user: 'Mariana Costa', action: 'Rascunho', details: 'Minuta de contrato rascunhada.' }
    ]
  }
];

// Initial Signatures Queue
const defaultSignatures: SignatureRequest[] = [
  {
    id: 'sig-1',
    contractId: CTR_3_ID,
    contractTitle: 'Fornecimento de Cimento Campeão Votoran',
    recipientName: 'Geraldo Alckmin (Dir. Comercial)',
    recipientEmail: 'geraldo.matcon@gmail.com',
    recipientPhone: '(11) 98765-4321',
    channel: SignatureChannel.WHATSAPP,
    status: SignatureStatus.AGUARDANDO_ASSINATURA,
    sentAt: '2026-05-15T14:15:00Z',
    viewedAt: '2026-05-16T10:30:00Z',
    expiresAt: '2026-06-15T14:15:00Z',
    token: 'token-cimento-9988'
  },
  {
    id: 'sig-2',
    contractId: CTR_5_ID,
    contractTitle: 'Pintura Fachada Residencial Bela Vista',
    recipientName: 'Manoel da Silva (Pintores ABC)',
    recipientEmail: 'manoel@pintoresabc.com.br',
    recipientPhone: '(11) 97766-1212',
    channel: SignatureChannel.EMAIL,
    status: SignatureStatus.AGUARDANDO_ASSINATURA,
    sentAt: '2026-05-20T10:30:00Z',
    expiresAt: '2026-06-20T10:30:00Z',
    token: 'token-pintura-5544'
  }
];

// Initial Obras Data
const defaultObras: Obra[] = [
  {
    id: OBR_1_ID,
    name: 'Residencial Bela Vista (Bloco C)',
    status: ObraStatus.EM_ANDAMENTO,
    progress: 75,
    contractId: CTR_1_ID,
    contractTitle: 'Consultoria Estrutural Fundações',
    manager: 'Engº Marcos Rezende',
    dueDate: '2026-08-30',
    budgetPlanned: 500000,
    budgetRealized: 410000,
    steps: [
      { id: 'st-1', phase: 'Fase 1: Fundação', title: 'Sondagem SPT concluída', isCompleted: true, dueDate: '2026-01-20', notes: 'Sondagem OK' },
      { id: 'st-2', phase: 'Fase 1: Fundação', title: 'Estaqueamento de concreto', isCompleted: true, dueDate: '2026-02-15', notes: 'Concluído no prazo' },
      { id: 'st-3', phase: 'Fase 2: Estrutural', title: 'Lajes do 1º ao 4º Pavimento', isCompleted: true, dueDate: '2026-04-10', notes: 'Cura rápida operada' },
      { id: 'st-4', phase: 'Fase 2: Estrutural', title: 'Laje Técnica de Cobertura', isCompleted: false, dueDate: '2026-06-30', notes: 'Aguardando guindaste' },
      { id: 'st-5', phase: 'Fase 3: Acabamento', title: 'Pintura e fachada', isCompleted: false, dueDate: '2026-08-15', notes: 'Contrato ctr-5 em rascunho vinculado a esta fase.' }
    ],
    costs: [
      { id: 'cst-1', obraId: OBR_1_ID, date: '2026-01-15', description: 'Nota Fiscal Sondagem Geotécnica', category: 'Fundação', value: 35000 },
      { id: 'cst-2', obraId: OBR_1_ID, date: '2026-02-10', description: 'Aquisição de vergalhões de aço Gerdau', category: 'Estrutura', value: 180000 },
      { id: 'cst-3', obraId: OBR_1_ID, date: '2026-03-05', description: 'Lançamento de Concreto Usinado', category: 'Estrutura', value: 120000 },
      { id: 'cst-4', obraId: OBR_1_ID, date: '2026-04-20', description: 'Aluguel de Betoneiras e Andaimes', category: 'Locação', value: 75000 }
    ],
    vistorias: [
      {
        id: 'vis-1',
        date: '2026-02-20',
        type: 'Inicial',
        inspector: 'Eng. Reinaldo Santos',
        description: 'Vistoria técnica de liberação das fundações profundas para arranque dos pilares principais.',
        photoUrls: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop']
      },
      {
        id: 'vis-2',
        date: '2026-04-15',
        type: 'Parcial',
        inspector: 'Eng. Marcos Rezende',
        description: 'Concorrência de verticalidade e prumo da estrutura de concreto armado. Tolerâncias em conformidade.',
        photoUrls: ['https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop']
      }
    ]
  },
  {
    id: OBR_2_ID,
    name: 'Sede Corporativa ACME (Retrofit)',
    status: ObraStatus.EM_ANDAMENTO,
    progress: 40,
    contractId: CTR_2_ID,
    contractTitle: 'Locação Escavadeira Hidráulica 20T',
    manager: 'Eng. Arthur Mendes',
    dueDate: '2026-11-15',
    budgetPlanned: 850000,
    budgetRealized: 390000,
    steps: [
      { id: 'st-6', phase: 'Fase 1: Demolição', title: 'Remoção de paredes internas antigas', isCompleted: true, dueDate: '2026-03-20' },
      { id: 'st-7', phase: 'Fase 1: Demolição', title: 'Descarte de resíduos e caçambas', isCompleted: true, dueDate: '2026-04-05' },
      { id: 'st-8', phase: 'Fase 2: Infraestrutura', title: 'Rede Elétrica Secundária trifásica', isCompleted: false, dueDate: '2026-07-20' },
      { id: 'st-9', phase: 'Fase 3: Climatização', title: 'Instalação de chillers centrais VRF', isCompleted: false, dueDate: '2026-10-10' }
    ],
    costs: [
      { id: 'cst-5', obraId: OBR_2_ID, date: '2026-03-15', description: 'Pagamento de Caçambas and Demolição Civil', category: 'Limpeza/Demolição', value: 140000 },
      { id: 'cst-6', obraId: OBR_2_ID, date: '2026-04-10', description: 'Primeira Parcela Climatização Aditiva', category: 'Climatização', value: 150000 },
      { id: 'cst-7', obraId: OBR_2_ID, date: '2026-05-02', description: 'Locação Escavadeira CAT Terceira Franquia', category: 'Locação', value: 100000 }
    ],
    vistorias: []
  },
  {
    id: OBR_3_ID,
    name: 'Condomínio Villas del Sol',
    status: ObraStatus.PLANEJAMENTO,
    progress: 5,
    manager: 'Engª Mariana Costa',
    dueDate: '2027-05-30',
    budgetPlanned: 2500000,
    budgetRealized: 120000,
    steps: [
      { id: 'st-10', phase: 'Fase 1: Licenças', title: 'Liberação de alvará de construção', isCompleted: true, dueDate: '2026-05-10', notes: 'Alvará expedido pela prefeitura.' },
      { id: 'st-11', phase: 'Fase 1: Licenças', title: 'Estudo de impacto ambiental FATMA', isCompleted: false, dueDate: '2026-06-30' },
      { id: 'st-12', phase: 'Fase 2: Serviços preliminares', title: 'Terraplanagem e cercamento', isCompleted: false, dueDate: '2026-08-30' }
    ],
    costs: [
      { id: 'cst-8', obraId: OBR_3_ID, date: '2026-05-08', description: 'Taxas Prefeitura Alvarás e Licenças', category: 'Administrativo', value: 120000 }
    ],
    vistorias: []
  }
];

// Initial Purchase Orders (Ordens de Compra)
const defaultPurchaseOrders: PurchaseOrder[] = [
  {
    id: PO_1_ID,
    obraId: OBR_1_ID,
    obraName: 'Residencial Bela Vista (Bloco C)',
    providerName: 'Gerdau Aços Brasil S/A',
    providerCnpj: '01.203.405/0001-88',
    payerCnpj: '12.345.678/0001-90',
    items: [
      { id: 'poi-1', description: 'Vergalhão de Aço CA-50 10mm', quantity: 500, unit: 'barra', unitPrice: 85, totalPrice: 42500 },
      { id: 'poi-2', description: 'Vergalhão de Aço CA-50 12.5mm', quantity: 300, unit: 'barra', unitPrice: 110, totalPrice: 33000 },
      { id: 'poi-3', description: 'Arame Recozido Gerdau BWG 18', quantity: 200, unit: 'roll', unitPrice: 45, totalPrice: 9000 }
    ],
    subtotal: 84500,
    taxes: 4225,
    discount: 2500,
    total: 86225,
    deliveryDate: '2026-06-10',
    notes: 'Entrega imediata programada para canteiro central sob responsabilidade da obra.',
    status: 'Aprovado'
  },
  {
    id: PO_2_ID,
    obraId: OBR_2_ID,
    obraName: 'Sede Corporativa ACME (Retrofit)',
    providerName: 'Ar Condicionado Continental S/A',
    providerCnpj: '05.678.910/0001-33',
    payerCnpj: '12.345.678/0001-90',
    items: [
      { id: 'poi-4', description: 'Evaporadora Split Inverter 12.000 BTU/h', quantity: 8, unit: 'unidade', unitPrice: 2200, totalPrice: 17600 },
      { id: 'poi-5', description: 'Condensadora Central Multi-Split VRF 8HP', quantity: 2, unit: 'unidade', unitPrice: 18500, totalPrice: 37000 }
    ],
    subtotal: 54600,
    taxes: 2730,
    discount: 1000,
    total: 56330,
    deliveryDate: '2026-07-25',
    notes: 'Aguardando conferência do eng. de climatização antes de liberar faturamento.',
    status: 'Pendente Aprovação'
  }
];

// Zustand Store Types
interface AppState {
  // Auth Store
  user: User | null;
  users: User[];
  company: Company;
  token: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  addUser: (name: string, email: string, role: Role, password: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  updateCompany: (company: Company) => void;
  syncWithAPI: () => Promise<void>;

  // Contracts Store
  contracts: Contract[];
  activeContractId: string | null;
  contractQuery: string;
  contractFilterType: string;
  contractFilterStatus: string;
  setContractFilters: (query?: string, type?: string, status?: string) => void;
  addContract: (contract: Omit<Contract, 'id' | 'attachments' | 'history'>) => Promise<Contract>;
  updateContract: (id: string, updated: Partial<Contract>) => Promise<void>;
  renewContract: (id: string, newEndDate: string, newValue: number) => Promise<void>;
  terminateContract: (id: string) => Promise<void>;
  uploadContractFile: (contractId: string, name: string, size: string) => Promise<void>;

  // Templates Store
  templates: ContractTemplate[];
  addTemplate: (template: Omit<ContractTemplate, 'id'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<ContractTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Signature Requests Store
  signatures: SignatureRequest[];
  addSignatureRequest: (req: Omit<SignatureRequest, 'id' | 'status' | 'sentAt' | 'token'>) => Promise<void>;
  updateSignatureStatus: (id: string, status: SignatureStatus, drawName?: string, drawnSignature?: string) => Promise<void>;

  // Obras Store
  obras: Obra[];
  activeObraId: string | null;
  setActiveObraId: (id: string | null) => void;
  addObra: (obra: Omit<Obra, 'id' | 'progress' | 'steps' | 'costs' | 'vistorias'>) => Promise<void>;
  updateObra: (id: string, data: Partial<Obra>) => Promise<void>;
  addCostToObra: (obraId: string, description: string, category: string, value: number) => Promise<void>;
  toggleObraStep: (obraId: string, stepId: string) => Promise<void>;
  generateDefaultSteps: (obraId: string) => Promise<void>;
  addObraStep: (obraId: string, step: Omit<ObraStep, 'id' | 'isCompleted'>) => Promise<void>;
  updateObraStep: (obraId: string, stepId: string, data: Partial<ObraStep>) => Promise<void>;
  deleteObraStep: (obraId: string, stepId: string) => Promise<void>;
  addVistoriaToObra: (obraId: string, vistoria: Omit<ObraVistoria, 'id'>) => Promise<void>;

  // Purchase Order Store
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'subtotal' | 'total'>) => Promise<void>;
  approvePurchaseOrder: (id: string) => Promise<void>;
  sendPurchaseOrderToProvider: (id: string) => Promise<void>;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status']) => Promise<void>;

  // Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // UI UIStore
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  modalActive: string | null;
  setModalActive: (id: string | null) => void;
}

// Helper translation maps
const contractStatusMap = {
  toBack: (s: ContractStatus): string => {
    switch (s) {
      case ContractStatus.RASCUNHO: return 'DRAFT';
      case ContractStatus.AGUARDANDO: return 'PENDING_SIGNATURE';
      case ContractStatus.ASSINADO: return 'SIGNED';
      case ContractStatus.ATIVO: return 'ACTIVE';
      case ContractStatus.VENCENDO: return 'EXPIRING_SOON';
      case ContractStatus.ENCERRADO: return 'EXPIRED';
      default: return 'DRAFT';
    }
  },
  toFront: (s: string): ContractStatus => {
    switch (s) {
      case 'DRAFT': return ContractStatus.RASCUNHO;
      case 'PENDING_SIGNATURE': return ContractStatus.AGUARDANDO;
      case 'SIGNED': return ContractStatus.ASSINADO;
      case 'ACTIVE': return ContractStatus.ATIVO;
      case 'EXPIRING_SOON': return ContractStatus.VENCENDO;
      case 'EXPIRED': return ContractStatus.ENCERRADO;
      case 'CANCELLED': return ContractStatus.ENCERRADO;
      case 'ARCHIVED': return ContractStatus.ENCERRADO;
      default: return ContractStatus.RASCUNHO;
    }
  }
};

const contractTypeMap = {
  toBack: (t: ContractType): string => {
    switch (t) {
      case ContractType.SERVICO: return 'SERVICO';
      case ContractType.TRABALHO: return 'TRABALHO';
      case ContractType.OBRA: return 'OBRA';
      case ContractType.LOCACAO: return 'LOCACAO';
      case ContractType.OUTRO: return 'OUTROS';
      default: return 'SERVICO';
    }
  },
  toFront: (t: string): ContractType => {
    switch (t) {
      case 'SERVICO': return ContractType.SERVICO;
      case 'TRABALHO': return ContractType.TRABALHO;
      case 'OBRA': return ContractType.OBRA;
      case 'LOCACAO': return ContractType.LOCACAO;
      case 'OUTROS': return ContractType.OUTRO;
      default: return ContractType.SERVICO;
    }
  }
};

const signatureStatusMap = {
  toBack: (s: SignatureStatus): string => {
    switch (s) {
      case SignatureStatus.AGUARDANDO_ASSINATURA: return 'PENDING';
      case SignatureStatus.ASSINADO: return 'SIGNED';
      case SignatureStatus.EXPIRADO: return 'EXPIRED';
      default: return 'PENDING';
    }
  },
  toFront: (s: string): SignatureStatus => {
    switch (s) {
      case 'PENDING':
      case 'SENT':
      case 'VIEWED': return SignatureStatus.AGUARDANDO_ASSINATURA;
      case 'SIGNED': return SignatureStatus.ASSINADO;
      case 'EXPIRED':
      case 'CANCELLED': return SignatureStatus.EXPIRADO;
      default: return SignatureStatus.AGUARDANDO_ASSINATURA;
    }
  }
};

const signatureChannelMap = {
  toBack: (c: SignatureChannel): string => {
    switch (c) {
      case SignatureChannel.EMAIL: return 'EMAIL';
      case SignatureChannel.WHATSAPP: return 'WHATSAPP';
      case SignatureChannel.AMBOS: return 'BOTH';
      default: return 'EMAIL';
    }
  },
  toFront: (c: string): SignatureChannel => {
    switch (c) {
      case 'EMAIL': return SignatureChannel.EMAIL;
      case 'WHATSAPP': return SignatureChannel.WHATSAPP;
      case 'BOTH': return SignatureChannel.AMBOS;
      default: return SignatureChannel.EMAIL;
    }
  }
};

const fieldTypeMap = {
  toBack: (t: string): string => {
    switch (t) {
      case 'text': return 'TEXT';
      case 'number': return 'NUMBER';
      case 'date': return 'DATE';
      case 'select': return 'SELECT';
      case 'signature': return 'SIGNATURE';
      default: return 'TEXT';
    }
  },
  toFront: (t: string): 'text' | 'number' | 'date' | 'select' | 'signature' => {
    switch (t) {
      case 'TEXT': return 'text';
      case 'NUMBER': return 'number';
      case 'DATE': return 'date';
      case 'SELECT': return 'select';
      case 'SIGNATURE': return 'signature';
      default: return 'text';
    }
  }
};

const obraStatusMap = {
  toBack: (s: ObraStatus): string => {
    switch (s) {
      case ObraStatus.PLANEJAMENTO: return 'PLANNING';
      case ObraStatus.EM_ANDAMENTO: return 'IN_PROGRESS';
      case ObraStatus.CONCLUIDA: return 'COMPLETED';
      case ObraStatus.PAUSADA: return 'ON_HOLD';
      default: return 'PLANNING';
    }
  },
  toFront: (s: string): ObraStatus => {
    switch (s) {
      case 'PLANNING': return ObraStatus.PLANEJAMENTO;
      case 'IN_PROGRESS': return ObraStatus.EM_ANDAMENTO;
      case 'COMPLETED': return ObraStatus.CONCLUIDA;
      case 'ON_HOLD': return ObraStatus.PAUSADA;
      case 'CANCELLED': return ObraStatus.PAUSADA;
      default: return ObraStatus.PLANEJAMENTO;
    }
  }
};

const costCategoryMap = {
  toBack: (cat: string): string => {
    const c = cat.toLowerCase();
    if (c.includes('funda') || c.includes('mat')) return 'MATERIAL';
    if (c.includes('mão') || c.includes('mao') || c.includes('equipe')) return 'MAO_DE_OBRA';
    if (c.includes('equip') || c.includes('loca')) return 'EQUIPAMENTO';
    if (c.includes('serv')) return 'SERVICO_TERCEIRO';
    if (c.includes('tax') || c.includes('lic')) return 'LICENCA_TAXA';
    if (c.includes('trans')) return 'TRANSPORTE';
    return 'OUTROS';
  },
  toFront: (cat: string): string => {
    switch (cat) {
      case 'MATERIAL': return 'Material';
      case 'MAO_DE_OBRA': return 'Mão de Obra';
      case 'EQUIPAMENTO': return 'Locação';
      case 'SERVICO_TERCEIRO': return 'Serviço Terceiro';
      case 'LICENCA_TAXA': return 'Taxas e Licenças';
      case 'TRANSPORTE': return 'Transporte';
      default: return 'Outros';
    }
  }
};

const phaseMap = {
  toBack: (pStr: string): string => {
    const p = pStr.toLowerCase();
    if (p.includes('plan')) return 'PLANEJAMENTO';
    if (p.includes('pré') || p.includes('pre')) return 'PRE_OBRA';
    if (p.includes('funda') || p.includes('demoli')) return 'FUNDACAO';
    if (p.includes('alvenar') || p.includes('estrutur')) return 'ALVENARIA';
    if (p.includes('instala') || p.includes('infra')) return 'INSTALACOES';
    if (p.includes('acaba') || p.includes('clima') || p.includes('pintur')) return 'ACABAMENTO';
    return 'ENTREGA';
  },
  toFront: (pEnum: string): string => {
    switch (pEnum) {
      case 'PLANEJAMENTO': return 'Planejamento';
      case 'PRE_OBRA': return 'Pré-obra';
      case 'FUNDACAO': return 'Fundações';
      case 'ALVENARIA': return 'Alvenaria / Estrutura';
      case 'INSTALACOES': return 'Instalações / Climatização';
      case 'ACABAMENTO': return 'Acabamento';
      case 'ENTREGA': return 'Entrega';
      default: return 'Planejamento';
    }
  }
};

export const useAppState = create<AppState>((set, get) => ({
  // Auth state init
  user: getStorageItem<User | null>('user', { id: USER_ADMIN_ID, name: 'Pedro Clash Kiil', email: 'pedroclashkiil@gmail.com', role: Role.ADMIN, isActive: true, lastActive: 'Agora' }),
  users: getStorageItem<User[]>('users', defaultUsers),
  company: getStorageItem<Company>('company', defaultCompany),
  token: getStorageItem<string | null>('token', 'fictional-token-12345'),
  
  syncWithAPI: async () => {
    const token = get().token;
    if (!token || token.startsWith('fictional-') || token.startsWith('token-')) return;
    
    try {
      const [
        contractsRes,
        templatesRes,
        obrasRes,
        poRes,
        sigsRes,
        usersRes
      ] = await Promise.all([
        api.get('/api/contracts?limit=100'),
        api.get('/api/templates'),
        api.get('/api/obras'),
        api.get('/api/purchase-orders'),
        api.get('/api/signatures'),
        api.get('/api/users')
      ]);

      // Mapear Contratos
      const mappedContracts: Contract[] = contractsRes.data.data.map((c: any) => ({
        id: c.id,
        title: c.title,
        relatedParty: c.related_party,
        type: contractTypeMap.toFront(c.type),
        value: Number(c.value),
        startDate: c.start_date ? c.start_date.split('T')[0] : '',
        endDate: c.end_date ? c.end_date.split('T')[0] : '',
        status: contractStatusMap.toFront(c.status),
        templateId: c.template_id || undefined,
        fieldValues: c.field_values || {},
        htmlContent: c.html_content || '',
        attachments: (c.uploads || []).map((u: any) => ({
          name: u.original_name,
          size: `${(u.size / (1024 * 1024)).toFixed(2)} MB`,
          date: u.createdAt ? u.createdAt.split('T')[0] : '',
          url: u.url
        })),
        history: (c.auditLogs || []).map((l: any) => ({
          date: new Date(l.createdAt).toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}),
          user: l.user?.name || 'Sistema',
          action: l.action === 'CREATE' ? 'Criação' : 'Edição',
          details: l.new_value ? JSON.stringify(l.new_value) : 'Trâmite registrado.'
        }))
      }));

      // Mapear Templates
      const mappedTemplates: ContractTemplate[] = templatesRes.data.data.map((t: any) => ({
        id: t.id,
        name: t.name,
        type: contractTypeMap.toFront(t.type),
        description: t.description || '',
        htmlContent: t.html_content || '',
        fields: (t.fields || []).map((f: any) => ({
          id: f.id,
          label: f.label,
          key: f.field_key,
          type: fieldTypeMap.toFront(f.field_type),
          required: f.required,
          placeholder: f.placeholder || '',
          options: f.options || []
        }))
      }));

      // Mapear Obras
      const mappedObras: Obra[] = obrasRes.data.data.map((o: any) => ({
        id: o.id,
        name: o.name,
        status: obraStatusMap.toFront(o.status),
        progress: o.completion_pct,
        contractId: o.contract_id || undefined,
        contractTitle: mappedContracts.find(c => c.id === o.contract_id)?.title || '',
        manager: o.responsible || '',
        dueDate: o.end_date ? o.end_date.split('T')[0] : '',
        budgetPlanned: Number(o.budget),
        budgetRealized: Number(o.actual_cost),
        steps: (o.steps || []).map((s: any) => ({
          id: s.id,
          phase: phaseMap.toFront(s.phase),
          title: s.title,
          isCompleted: s.status === 'COMPLETED',
          dueDate: s.due_date ? s.due_date.split('T')[0] : '',
          notes: s.notes || ''
        })),
        costs: (o.custos || []).map((c: any) => ({
          id: c.id,
          obraId: o.id,
          date: c.date ? c.date.split('T')[0] : '',
          description: c.description || '',
          category: costCategoryMap.toFront(c.category),
          value: Number(c.value)
        })),
        vistorias: (o.vistorias || []).map((v: any) => ({
          id: v.id,
          date: v.date ? v.date.split('T')[0] : '',
          type: v.type === 'INICIAL' ? 'Inicial' : v.type === 'FINAL' ? 'Final' : 'Parcial',
          inspector: v.inspector || '',
          description: v.description || '',
          photoUrls: v.conditions?.photoUrls || []
        }))
      }));

      // Mapear Signature Requests
      const mappedSignatures: SignatureRequest[] = sigsRes.data.data.map((s: any) => ({
        id: s.id,
        contractId: s.contract_id,
        contractTitle: mappedContracts.find(c => c.id === s.contract_id)?.title || 'Contrato',
        recipientName: s.recipient_name,
        recipientEmail: s.recipient_email || '',
        recipientPhone: s.recipient_phone || '',
        channel: signatureChannelMap.toFront(s.channel),
        status: signatureStatusMap.toFront(s.status),
        sentAt: s.sent_at || '',
        viewedAt: s.viewed_at || '',
        signedAt: s.signed_at || '',
        expiresAt: s.expires_at || '',
        token: s.token || ''
      }));

      // Mapear Purchase Orders
      const mappedPOs: PurchaseOrder[] = poRes.data.data.map((p: any) => {
        let items = [];
        try {
          items = typeof p.items === 'string' ? JSON.parse(p.items) : p.items;
        } catch {
          items = p.items || [];
        }

        const formattedItems = items.map((i: any) => ({
          id: i.id || `item-${Math.random()}`,
          description: i.description,
          quantity: i.qty,
          unit: i.unit,
          unitPrice: i.unit_price,
          totalPrice: i.total
        }));

        let poStatus: PurchaseOrder['status'] = 'Rascunho';
        if (p.status === 'APPROVED') poStatus = 'Aprovado';
        else if (p.status === 'PENDING_APPROVAL') poStatus = 'Pendente Aprovação';
        else if (p.status === 'SENT_TO_SUPPLIER') poStatus = 'Enviado Fornecedor';

        return {
          id: p.id,
          obraId: p.obra_id || '',
          obraName: mappedObras.find(o => o.id === p.obra_id)?.name || 'Obra',
          providerName: p.supplier || '',
          providerCnpj: p.supplier_cnpj || '',
          payerCnpj: p.payer_cnpj || '',
          items: formattedItems,
          subtotal: Number(p.subtotal),
          taxes: Number(p.taxes),
          discount: Number(p.discount),
          total: Number(p.total),
          deliveryDate: p.delivery_date ? p.delivery_date.split('T')[0] : '',
          notes: p.notes || '',
          status: poStatus
        };
      });

      // Mapear Usuários
      const mappedUsers: User[] = usersRes.data.data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role === 'ADMIN' ? Role.ADMIN : u.role === 'MANAGER' ? Role.MANAGER : u.role === 'OPERATOR' ? Role.OPERATOR : Role.VIEWER,
        isActive: u.active,
        lastActive: 'Hoje'
      }));

      // Detecta transições de status nas assinaturas para gerar notificações em tempo real
      const oldSignatures = get().signatures || [];
      if (oldSignatures.length > 0) {
        oldSignatures.forEach(oldSig => {
          const newSig = mappedSignatures.find(n => n.id === oldSig.id || (n.token && n.token === oldSig.token));
          if (newSig && oldSig.status !== SignatureStatus.ASSINADO && newSig.status === SignatureStatus.ASSINADO) {
            toast.success(`Contrato Assinado: "${newSig.contractTitle}" por ${newSig.recipientName}!`, {
              duration: 5000,
              icon: '🔐'
            });

            get().addNotification({
              title: 'Contrato Assinado!',
              message: `O contrato "${newSig.contractTitle}" vinculado a ${newSig.recipientName} foi assinado.`,
              type: 'success',
              link: '/signatures/queue'
            });
          }
        });
      }

      set({
        contracts: mappedContracts,
        templates: mappedTemplates,
        obras: mappedObras,
        signatures: mappedSignatures,
        purchaseOrders: mappedPOs,
        users: mappedUsers
      });

      // Atualiza caches no localStorage
      setStorageItem('contracts', mappedContracts);
      setStorageItem('templates', mappedTemplates);
      setStorageItem('obras', mappedObras);
      setStorageItem('signatures', mappedSignatures);
      setStorageItem('purchase_orders', mappedPOs);
      setStorageItem('users', mappedUsers);

    } catch (err) {
      console.error('Falha na sincronização da API:', err);
    }
  },
  
  login: async (email: string, password?: string) => {
    try {
      // Tenta login real no backend usando a senha digitada ou a padrão
      const pass = password || 'senha123!';
      const response = await api.post('/api/auth/login', { email, password: pass });
      const { accessToken, user, company } = response.data.data;
      
      const mappedRole = user.role === 'ADMIN' ? Role.ADMIN : 
                         user.role === 'MANAGER' ? Role.MANAGER :
                         user.role === 'OPERATOR' ? Role.OPERATOR : Role.VIEWER;

      const currentUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: mappedRole,
        isActive: user.active,
        lastActive: 'Agora'
      };

      const currentCompany: Company = {
        name: company.name,
        cnpj: company.cnpj,
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || ''
      };

      set({ user: currentUser, token: accessToken, company: currentCompany });
      setStorageItem('user', currentUser);
      setStorageItem('token', accessToken);
      setStorageItem('company', currentCompany);

      // Sincroniza dados do banco com a store
      await get().syncWithAPI();

    } catch (e: any) {
      console.error('Falha no login com o banco. Iniciando modo offline local.', e);
      
      // Fallback local caso o servidor/banco esteja fora do ar temporariamente
      const matchedUser = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const inferredRole = email.includes('admin') || email.includes('pedro') ? Role.ADMIN :
                           email.includes('gerente') || email.includes('marcos') ? Role.MANAGER :
                           email.includes('operador') || email.includes('mariana') ? Role.OPERATOR : Role.VIEWER;

      const currentUser = matchedUser ? { ...matchedUser, isActive: true, lastActive: 'Agora' } : {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email,
        role: inferredRole,
        isActive: true,
        lastActive: 'Agora'
      };
      
      let updatedUsers = [...get().users];
      if (!matchedUser) {
        updatedUsers.push(currentUser);
        setStorageItem('users', updatedUsers);
      }

      set({ user: currentUser, token: `token-${Date.now()}`, users: updatedUsers });
      setStorageItem('user', currentUser);
      setStorageItem('token', `token-${Date.now()}`);
    }
  },
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('contratos_pro_user');
    localStorage.removeItem('contratos_pro_token');
    window.location.href = '/#/login';
  },

  addUser: async (name, email, role, password) => {
    try {
      const payload = {
        name,
        email,
        password: password || 'senha123!',
        role: role.toUpperCase()
      };
      await api.post('/api/users', payload);
      await get().syncWithAPI();
    } catch {
      // Fallback: gera ID numérico curto sequencial
      const existingIds = get().users
        .map(u => parseInt(u.id, 10))
        .filter(n => !isNaN(n));
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1001;
      const newUser: User = {
        id: String(nextId),
        name,
        email,
        role,
        isActive: true,
        lastActive: 'Nunca'
      };
      const updated = [...get().users, newUser];
      set({ users: updated });
      setStorageItem('users', updated);
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const u = get().users.find(usr => usr.id === id);
      if (u) {
        await api.put(`/api/users/${id}`, { active: !u.isActive });
        await get().syncWithAPI();
      }
    } catch {
      const updated = get().users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
      set({ users: updated });
      setStorageItem('users', updated);
    }
  },

  updateCompany: (comp) => {
    set({ company: comp });
    setStorageItem('company', comp);
  },

  // Contracts
  contracts: getStorageItem<Contract[]>('contracts', defaultContracts),
  activeContractId: null,
  contractQuery: '',
  contractFilterType: 'ALL',
  contractFilterStatus: 'ALL',

  setContractFilters: (query, type, status) => {
    set({
      contractQuery: query !== undefined ? query : get().contractQuery,
      contractFilterType: type !== undefined ? type : get().contractFilterType,
      contractFilterStatus: status !== undefined ? status : get().contractFilterStatus
    });
  },

  addContract: async (newCtrData) => {
    // Compilação do HTML (Mantida idêntica à do frontend original)
    let compiledHtml = newCtrData.htmlContent;
    if (newCtrData.templateId) {
      const template = get().templates.find(t => t.id === newCtrData.templateId);
      if (template) {
        compiledHtml = template.htmlContent;
        compiledHtml = compiledHtml
          .replace(/\{\{titulo_contrato\}\}/g, newCtrData.title || '[Título do Contrato]')
          .replace(/\{\{titulo_documento\}\}/g, newCtrData.title || '[Título do Contrato]')
          .replace(/\{\{titulo\}\}/g, newCtrData.title || '[Título do Contrato]')
          .replace(/\{\{empresa_contratante\}\}/g, get().company.name)
          .replace(/\{\{cnpj_contratante\}\}/g, get().company.cnpj)
          .replace(/\{\{parte_relacionada\}\}/g, newCtrData.relatedParty)
          .replace(/\{\{valor_total\}\}/g, newCtrData.value.toLocaleString('pt-BR', {minimumFractionDigits: 2}))
          .replace(/\{\{data_inicio\}\}/g, newCtrData.startDate)
          .replace(/\{\{data_fim\}\}/g, newCtrData.endDate);

        Object.entries(newCtrData.fieldValues).forEach(([k, val]) => {
          compiledHtml = compiledHtml.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), val);
        });

        if (get().company.signatureUrl) {
          const companyName = get().company.name;
          const sigImgHtml = `<div style="text-align: center; margin-bottom: 5px;"><img src="${get().company.signatureUrl}" style="max-height: 48px; max-width: 140px; display: inline-block;" alt="Assinatura Corporativa" /></div>`;
          compiledHtml = compiledHtml
            .replace(new RegExp(`CONTRATANTE<\/strong><br\/>${companyName}`, 'g'), `CONTRATANTE</strong><br/>${sigImgHtml}${companyName}`)
            .replace(/LOCATÁRIO \(CONTRATANTE\)\<\/strong\>/g, `LOCATÁRIO (CONTRATANTE)</strong><br/>${sigImgHtml}`);
        }
      }
    }

    const payload = {
      title: newCtrData.title,
      related_party: newCtrData.relatedParty,
      type: contractTypeMap.toBack(newCtrData.type),
      value: newCtrData.value,
      start_date: newCtrData.startDate ? new Date(newCtrData.startDate).toISOString() : undefined,
      end_date: newCtrData.endDate ? new Date(newCtrData.endDate).toISOString() : undefined,
      status: contractStatusMap.toBack(newCtrData.status),
      template_id: newCtrData.templateId || undefined,
      field_values: newCtrData.fieldValues,
      html_content: compiledHtml,
      notes: newCtrData.parentId ? `Aditivo vinculado ao contrato parent ${newCtrData.parentId}` : undefined
    };

    let createdContract: Contract | null = null;
    try {
      const res = await api.post('/api/contracts', payload);
      const c = res.data.data;
      
      createdContract = {
        id: c.id,
        title: c.title,
        relatedParty: c.related_party,
        type: contractTypeMap.toFront(c.type),
        value: Number(c.value),
        startDate: c.start_date ? c.start_date.split('T')[0] : '',
        endDate: c.end_date ? c.end_date.split('T')[0] : '',
        status: contractStatusMap.toFront(c.status),
        templateId: c.template_id || undefined,
        fieldValues: c.field_values || {},
        htmlContent: c.html_content || '',
        attachments: [],
        history: [{ date: 'Hoje', user: get().user?.name || 'Administrador', action: 'Criação', details: 'Contrato persistido no banco.' }]
      };
      
      await get().syncWithAPI();
    } catch (err) {
      console.error(err);
      // Fallback local
      const newId = `ctr-${Date.now()}`;
      createdContract = {
        ...newCtrData,
        id: newId,
        htmlContent: compiledHtml,
        attachments: [],
        history: [{ date: new Date().toLocaleString(), user: get().user?.name || 'Administrador', action: 'Criação', details: 'Contrato salvo offline.' }]
      };
      const updated = [createdContract, ...get().contracts];
      set({ contracts: updated });
      setStorageItem('contracts', updated);
    }

    return createdContract;
  },

  updateContract: async (id, updatedFields) => {
    try {
      const payload: any = {};
      if (updatedFields.title) payload.title = updatedFields.title;
      if (updatedFields.relatedParty) payload.related_party = updatedFields.relatedParty;
      if (updatedFields.value) payload.value = updatedFields.value;
      if (updatedFields.startDate) payload.start_date = new Date(updatedFields.startDate).toISOString();
      if (updatedFields.endDate) payload.end_date = new Date(updatedFields.endDate).toISOString();
      if (updatedFields.htmlContent) payload.html_content = updatedFields.htmlContent;
      if (updatedFields.fieldValues) payload.field_values = updatedFields.fieldValues;

      await api.put(`/api/contracts/${id}`, payload);
      await get().syncWithAPI();
    } catch {
      const updated = get().contracts.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...updatedFields,
            history: [{ date: new Date().toLocaleString(), user: get().user?.name || 'Sistema', action: 'Edição', details: 'Campos alterados localmente.' }, ...c.history]
          };
        }
        return c;
      });
      set({ contracts: updated });
      setStorageItem('contracts', updated);
    }
  },

  renewContract: async (id, newEndDate, newValue) => {
    try {
      // O backend não permite editar contratos ativos. Mapeamos temporariamente para DRAFT, alteramos e voltamos para ACTIVE
      await api.put(`/api/contracts/${id}/status`, { status: 'DRAFT' });
      await api.put(`/api/contracts/${id}`, {
        end_date: new Date(newEndDate).toISOString(),
        value: newValue
      });
      await api.put(`/api/contracts/${id}/status`, { status: 'ACTIVE' });
      await get().syncWithAPI();
    } catch {
      const updated = get().contracts.map(c => {
        if (c.id === id) {
          return {
            ...c,
            endDate: newEndDate,
            value: newValue,
            status: ContractStatus.ATIVO,
            history: [
              {
                date: new Date().toLocaleString(),
                user: get().user?.name || 'Operador',
                action: 'Renovação',
                details: `Contrato renovado offline até ${newEndDate} com valor R$ ${newValue}.`
              },
              ...c.history
            ]
          };
        }
        return c;
      });
      set({ contracts: updated });
      setStorageItem('contracts', updated);
    }
  },

  terminateContract: async (id) => {
    try {
      await api.put(`/api/contracts/${id}/status`, { status: 'EXPIRED' });
      await get().syncWithAPI();
    } catch {
      const updated = get().contracts.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: ContractStatus.ENCERRADO,
            history: [
              {
                date: new Date().toLocaleString(),
                user: get().user?.name || 'Operador',
                action: 'Encerramento',
                details: 'Contrato encerrado localmente.'
              },
              ...c.history
            ]
          };
        }
        return c;
      });
      set({ contracts: updated });
      setStorageItem('contracts', updated);
    }
  },

  uploadContractFile: async (contractId, name, size) => {
    // Simulado no backend pois o frontend original só repassa o nome/tamanho simulado
    const updated = get().contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          attachments: [
            ...c.attachments,
            { name, size, date: new Date().toISOString().split('T')[0], url: '#' }
          ],
          history: [
            {
              date: new Date().toLocaleString(),
              user: get().user?.name || 'Sistema',
              action: 'Upload de Arquivos',
              details: `Arquivo ${name} anexado.`
            },
            ...c.history
          ]
        };
      }
      return c;
    });
    set({ contracts: updated });
    setStorageItem('contracts', updated);
  },

  // Templates
  templates: getStorageItem<ContractTemplate[]>('templates', defaultTemplates),
  addTemplate: async (tmpl) => {
    try {
      const payload = {
        name: tmpl.name,
        type: contractTypeMap.toBack(tmpl.type),
        description: tmpl.description,
        html_content: tmpl.htmlContent,
        fields: tmpl.fields.map((f, i) => ({
          label: f.label,
          field_key: f.key,
          field_type: fieldTypeMap.toBack(f.type),
          required: f.required,
          placeholder: f.placeholder || '',
          options: f.options || [],
          order: i
        }))
      };
      await api.post('/api/templates', payload);
      await get().syncWithAPI();
    } catch {
      const newTmpl: ContractTemplate = {
        ...tmpl,
        id: `tmpl-${Date.now()}`
      };
      const updated = [...get().templates, newTmpl];
      set({ templates: updated });
      setStorageItem('templates', updated);
    }
  },
  
  updateTemplate: async (id, tmplFields) => {
    try {
      const payload: any = {};
      if (tmplFields.name) payload.name = tmplFields.name;
      if (tmplFields.description) payload.description = tmplFields.description;
      if (tmplFields.htmlContent) payload.html_content = tmplFields.htmlContent;
      
      await api.put(`/api/templates/${id}`, payload);
      await get().syncWithAPI();
    } catch {
      const updated = get().templates.map(t => t.id === id ? { ...t, ...tmplFields } : t);
      set({ templates: updated });
      setStorageItem('templates', updated);
    }
  },

  deleteTemplate: async (id) => {
    try {
      await api.delete(`/api/templates/${id}`);
      await get().syncWithAPI();
    } catch {
      const updated = get().templates.filter(t => t.id !== id);
      set({ templates: updated });
      setStorageItem('templates', updated);
    }
  },

  // Signatures Queue
  signatures: getStorageItem<SignatureRequest[]>('signatures', defaultSignatures),
  
  addSignatureRequest: async (newReq) => {
    try {
      const payload = {
        recipient_name: newReq.recipientName,
        recipient_email: newReq.recipientEmail || undefined,
        recipient_phone: newReq.recipientPhone || undefined,
        channel: signatureChannelMap.toBack(newReq.channel),
        expiresAt: newReq.expiresAt
      };
      await api.post(`/api/signatures/contracts/${newReq.contractId}/send`, payload);
      await get().syncWithAPI();
    } catch {
      const newId = `sig-${Date.now()}`;
      const generatedToken = `token-${Math.floor(1000 + Math.random() * 9000)}`;
      const fullReq: SignatureRequest = {
        ...newReq,
        id: newId,
        status: SignatureStatus.AGUARDANDO_ASSINATURA,
        sentAt: new Date().toISOString(),
        token: generatedToken
      };
      
      get().updateContract(newReq.contractId, { 
        status: ContractStatus.AGUARDANDO
      });

      const updated = [fullReq, ...get().signatures];
      set({ signatures: updated });
      setStorageItem('signatures', updated);
    }
  },

  updateSignatureStatus: async (id, status, drawName, drawnSignature) => {
    try {
      // Fluxo público de assinatura
      if (status === SignatureStatus.ASSINADO) {
        await api.post(`/api/signatures/sign/${id}`, {
          inspector: drawName || 'Signatário Externo',
          drawn_signature: drawnSignature
        });
        await get().syncWithAPI();
        
        // Also update local drawnSignature in case the backend doesn't save/return it
        if (drawnSignature) {
          const updated = get().signatures.map(s => {
            if (s.id === id || s.token === id) {
              return { ...s, drawnSignature };
            }
            return s;
          });
          set({ signatures: updated });
          setStorageItem('signatures', updated);
        }
      }
    } catch {
      const updated = get().signatures.map(s => {
        if (s.id === id || s.token === id) {
          if (status === SignatureStatus.ASSINADO) {
            get().updateContract(s.contractId, { 
              status: ContractStatus.ATIVO
            });
            
            get().addNotification({
              title: 'Contrato Assinado!',
              message: `O contrato vinculado a ${s.recipientName} acabou de ser assinado.`,
              type: 'success',
              link: '/signatures/queue'
            });
          }
          
          return {
            ...s,
            status,
            drawnSignature,
            viewedAt: s.viewedAt,
            signedAt: status === SignatureStatus.ASSINADO ? new Date().toISOString() : s.signedAt
          };
        }
        return s;
      });
      set({ signatures: updated });
      setStorageItem('signatures', updated);
    }
  },

  // Obras Store
  obras: getStorageItem<Obra[]>('obras', defaultObras),
  activeObraId: null,
  setActiveObraId: (id) => set({ activeObraId: id }),
  
  addObra: async (newObraData) => {
    try {
      const payload = {
        name: newObraData.name,
        description: newObraData.description || '',
        address: newObraData.address || '',
        status: obraStatusMap.toBack(newObraData.status),
        budget: newObraData.budgetPlanned,
        responsible: newObraData.manager || '',
        end_date: newObraData.dueDate ? new Date(newObraData.dueDate).toISOString() : undefined,
        contract_id: newObraData.contractId || undefined
      };
      await api.post('/api/obras', payload);
      await get().syncWithAPI();
    } catch {
      const newObra: Obra = {
        ...newObraData,
        id: `obr-${Date.now()}`,
        progress: 0,
        steps: [],
        costs: [],
        vistorias: []
      };
      const updated = [...get().obras, newObra];
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  updateObra: async (id, updatedFields) => {
    try {
      const payload: any = {};
      if (updatedFields.name) payload.name = updatedFields.name;
      if (updatedFields.description) payload.description = updatedFields.description;
      if (updatedFields.status) payload.status = obraStatusMap.toBack(updatedFields.status);
      if (updatedFields.budgetPlanned) payload.budget = updatedFields.budgetPlanned;
      if (updatedFields.manager) payload.responsible = updatedFields.manager;
      if (updatedFields.dueDate) payload.end_date = new Date(updatedFields.dueDate).toISOString();

      await api.put(`/api/obras/${id}`, payload);
      await get().syncWithAPI();
    } catch {
      const updated = get().obras.map(o => o.id === id ? { ...o, ...updatedFields } : o);
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  addCostToObra: async (obraId, description, category, value) => {
    try {
      const payload = {
        category: costCategoryMap.toBack(category),
        description,
        value,
        date: new Date().toISOString(),
        payment_status: 'PAID'
      };
      await api.post(`/api/obras/${obraId}/custos`, payload);
      await get().syncWithAPI();
    } catch {
      const newCost: ObraCusto = {
        id: `cst-${Date.now()}`,
        obraId,
        date: new Date().toISOString().split('T')[0],
        description,
        category,
        value
      };

      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          const newCosts = [...o.costs, newCost];
          const newRealized = o.budgetRealized + value;
          return {
            ...o,
            costs: newCosts,
            budgetRealized: newRealized
          };
        }
        return o;
      });

      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  toggleObraStep: async (obraId, stepId) => {
    try {
      await api.put(`/api/obras/${obraId}/steps/${stepId}/toggle`);
      await get().syncWithAPI();
    } catch {
      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          const nextSteps = o.steps.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s);
          const completedCount = nextSteps.filter(s => s.isCompleted).length;
          const totalCount = nextSteps.length;
          const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return {
            ...o,
            steps: nextSteps,
            progress: newProgress
          };
        }
        return o;
      });
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  generateDefaultSteps: async (obraId) => {
    try {
      await api.post(`/api/obras/${obraId}/steps/generate`);
      await get().syncWithAPI();
    } catch {
      const defaults: Omit<ObraStep, 'id'>[] = [
        { phase: '1. Planejamento', title: 'Estudo de Viabilidade e Orçamento', isCompleted: false, dueDate: '2026-06-15' },
        { phase: '1. Planejamento', title: 'Aprovação de Projetos e Alvarás', isCompleted: false, dueDate: '2026-07-05' },
        { phase: '2. Infraestrutura', title: 'Preparação do Terreno e Gabarito', isCompleted: false, dueDate: '2026-08-10' },
        { phase: '2. Infraestrutura', title: 'Fundação profunda e Estacas', isCompleted: false, dueDate: '2026-09-10' },
        { phase: '3. Estrutural', title: 'Pilares, Vigas e Primeira Laje', isCompleted: false, dueDate: '2026-11-20' },
        { phase: '4. Acabamento', title: 'Alvenarias e Esquadrias Externas', isCompleted: false, dueDate: '2027-01-30' },
        { phase: '4. Acabamento', title: 'Instalações Especiais e Pintura', isCompleted: false, dueDate: '2027-04-15' }
      ];

      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          const generated: ObraStep[] = defaults.map((d, index) => ({
            ...d,
            id: `step-gen-${index}-${Date.now()}`
          }));
          return {
            ...o,
            steps: generated,
            progress: 0
          };
        }
        return o;
      });
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  addObraStep: async (obraId, step) => {
    try {
      await api.post(`/api/obras/${obraId}/steps`, {
        title: step.title,
        phase: phaseMap.toBack(step.phase),
        due_date: step.dueDate ? new Date(step.dueDate).toISOString() : undefined,
        notes: step.notes || ''
      });
      await get().syncWithAPI();
    } catch {
      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          const newStep: ObraStep = {
            id: `step-new-${Date.now()}`,
            title: step.title,
            phase: step.phase,
            dueDate: step.dueDate,
            notes: step.notes || '',
            isCompleted: false
          };
          const nextSteps = [...o.steps, newStep];
          const completedCount = nextSteps.filter(s => s.isCompleted).length;
          const totalCount = nextSteps.length;
          const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return {
            ...o,
            steps: nextSteps,
            progress: newProgress
          };
        }
        return o;
      });
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  updateObraStep: async (obraId, stepId, data) => {
    try {
      const payload: any = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.phase !== undefined) payload.phase = phaseMap.toBack(data.phase);
      if (data.dueDate !== undefined) payload.due_date = data.dueDate ? new Date(data.dueDate).toISOString() : undefined;
      if (data.notes !== undefined) payload.notes = data.notes;
      if (data.isCompleted !== undefined) payload.status = data.isCompleted ? 'COMPLETED' : 'PENDING';

      await api.put(`/api/obras/${obraId}/steps/${stepId}`, payload);
      await get().syncWithAPI();
    } catch {
      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          const nextSteps = o.steps.map(s => {
            if (s.id === stepId) {
              return {
                ...s,
                title: data.title !== undefined ? data.title : s.title,
                phase: data.phase !== undefined ? data.phase : s.phase,
                dueDate: data.dueDate !== undefined ? data.dueDate : s.dueDate,
                notes: data.notes !== undefined ? data.notes : s.notes,
                isCompleted: data.isCompleted !== undefined ? data.isCompleted : s.isCompleted
              };
            }
            return s;
          });
          const completedCount = nextSteps.filter(s => s.isCompleted).length;
          const totalCount = nextSteps.length;
          const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return {
            ...o,
            steps: nextSteps,
            progress: newProgress
          };
        }
        return o;
      });
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  deleteObraStep: async (obraId, stepId) => {
    try {
      await api.delete(`/api/obras/${obraId}/steps/${stepId}`);
      await get().syncWithAPI();
    } catch {
      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          const nextSteps = o.steps.filter(s => s.id !== stepId);
          const completedCount = nextSteps.filter(s => s.isCompleted).length;
          const totalCount = nextSteps.length;
          const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return {
            ...o,
            steps: nextSteps,
            progress: newProgress
          };
        }
        return o;
      });
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  addVistoriaToObra: async (obraId, vistoriaData) => {
    try {
      const payload = {
        type: vistoriaData.type === 'Inicial' ? 'INICIAL' : vistoriaData.type === 'Final' ? 'FINAL' : 'PARCIAL',
        date: new Date(vistoriaData.date).toISOString(),
        inspector: vistoriaData.inspector,
        description: vistoriaData.description,
        conditions: { photoUrls: vistoriaData.photoUrls }
      };
      await api.post(`/api/obras/${obraId}/vistorias`, payload);
      await get().syncWithAPI();
    } catch {
      const newVistoria: ObraVistoria = {
        ...vistoriaData,
        id: `vis-${Date.now()}`
      };
      const updated = get().obras.map(o => {
        if (o.id === obraId) {
          return {
            ...o,
            vistorias: [newVistoria, ...o.vistorias]
          };
        }
        return o;
      });
      set({ obras: updated });
      setStorageItem('obras', updated);
    }
  },

  // Purchase Order
  purchaseOrders: getStorageItem<PurchaseOrder[]>('purchase_orders', defaultPurchaseOrders),
  addPurchaseOrder: async (poData) => {
    const subtotal = poData.items.reduce((acc, current) => acc + current.totalPrice, 0);
    const taxes = Math.round(subtotal * 0.05);
    const discount = poData.discount || 0;
    const total = subtotal + taxes - discount;

    try {
      const payload = {
        obra_id: poData.obraId || undefined,
        number: `po-${Date.now()}`,
        title: poData.providerName,
        supplier: poData.providerName,
        supplier_cnpj: poData.providerCnpj,
        payer_cnpj: poData.payerCnpj,
        status: 'DRAFT',
        subtotal,
        taxes,
        discount,
        total,
        delivery_date: poData.deliveryDate ? new Date(poData.deliveryDate).toISOString() : undefined,
        notes: poData.notes || '',
        items: poData.items.map(item => ({
          description: item.description,
          qty: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          total: item.totalPrice
        }))
      };
      await api.post('/api/purchase-orders', payload);
      await get().syncWithAPI();
    } catch {
      const newId = `po-${Date.now()}`;
      const newPO: PurchaseOrder = {
        ...poData,
        id: newId,
        subtotal,
        taxes,
        total,
        status: 'Rascunho'
      };

      const updated = [newPO, ...get().purchaseOrders];
      set({ purchaseOrders: updated });
      setStorageItem('purchase_orders', updated);
    }
  },

  approvePurchaseOrder: async (id) => {
    try {
      await api.post(`/api/purchase-orders/${id}/approve`);
      await get().syncWithAPI();
    } catch {
      const updated = get().purchaseOrders.map(po => {
        if (po.id === id) {
          get().addCostToObra(po.obraId, `Ordem de Compra Aprovada: ${po.providerName}`, 'Compra Corporativa', po.total);
          return {
            ...po,
            status: 'Aprovado' as const
          };
        }
        return po;
      });
      set({ purchaseOrders: updated });
      setStorageItem('purchase_orders', updated);
    }
  },

  sendPurchaseOrderToProvider: async (id) => {
    try {
      await api.put(`/api/purchase-orders/${id}/status`, { status: 'SENT_TO_SUPPLIER' });
      await get().syncWithAPI();
    } catch {
      const updated = get().purchaseOrders.map(po => {
        if (po.id === id) {
          return {
            ...po,
            status: 'Enviado Fornecedor' as const
          };
        }
        return po;
      });
      set({ purchaseOrders: updated });
      setStorageItem('purchase_orders', updated);
    }
  },

  updatePurchaseOrderStatus: async (id, status) => {
    try {
      let backStatus = 'DRAFT';
      if (status === 'Aprovado') backStatus = 'APPROVED';
      else if (status === 'Pendente Aprovação') backStatus = 'PENDING_APPROVAL';
      else if (status === 'Enviado Fornecedor') backStatus = 'SENT_TO_SUPPLIER';

      await api.put(`/api/purchase-orders/${id}/status`, { status: backStatus });
      await get().syncWithAPI();
    } catch {
      const updated = get().purchaseOrders.map(po => {
        if (po.id === id) {
          return { ...po, status };
        }
        return po;
      });
      set({ purchaseOrders: updated });
      setStorageItem('purchase_orders', updated);
    }
  },

  // Sidebar  // UI UIStore
  sidebarOpen: getStorageItem<boolean>('sidebarOpen', true),
  setSidebarOpen: (sidebarOpen) => {
    set({ sidebarOpen });
    setStorageItem('sidebarOpen', sidebarOpen);
  },
  modalActive: null,
  setModalActive: (id) => set({ modalActive: id }),

  // Notifications
  notifications: getStorageItem<AppNotification[]>('notifications', []),
  addNotification: (notifData) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      date: new Date().toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}),
      read: false
    };
    const updated = [newNotif, ...get().notifications];
    set({ notifications: updated });
    setStorageItem('notifications', updated);
  },
  markNotificationAsRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, read: true } : n);
    set({ notifications: updated });
    setStorageItem('notifications', updated);
  },
  markAllNotificationsAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read: true }));
    set({ notifications: updated });
    setStorageItem('notifications', updated);
  }
}));

// Inicia sincronização em segundo plano no carregamento do applet se houver um token real ativo
if (typeof window !== 'undefined') {
  const activeToken = getStorageItem<string | null>('token', null);
  if (activeToken && !activeToken.startsWith('fictional-') && !activeToken.startsWith('token-')) {
    setTimeout(() => {
      useAppState.getState().syncWithAPI();
    }, 100);
  }
}
