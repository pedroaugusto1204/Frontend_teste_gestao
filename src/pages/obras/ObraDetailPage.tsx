import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../../store';
import { ObraStatus, ObraStep, ObraVistoria, PurchaseOrder, VistoriaAttachment } from '../../types';
import { Card, Button, StatusBadge, Modal, EmptyState, Input, Select, Textarea } from '../../components/ui';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  FileText, 
  Camera, 
  ShoppingCart, 
  Upload, 
  ChevronLeft,
  Plus,
  Play,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Trash2,
  Edit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const ObraDetailPage = () => {
  const { id } = useParams();
  const { 
    obras, 
    toggleObraStep, 
    generateDefaultSteps, 
    addCostToObra, 
    addVistoriaToObra, 
    purchaseOrders,
    addPurchaseOrder,
    contracts,
    addObraStep,
    updateObraStep,
    deleteObraStep
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'roteiro' | 'orcamento' | 'vistorias' | 'compras' | 'documentos'>('roteiro');

  // Modal controls
  const [isCustoOpen, setIsCustoOpen] = useState(false);
  const [isVistoriaOpen, setIsVistoriaOpen] = useState(false);
  const [isOCOpen, setIsOCOpen] = useState(false);

  // Lançar Custo Fields
  const [custoDesc, setCustoDesc] = useState('');
  const [custoCategory, setCustoCategory] = useState('Estrutura');
  const [custoValue, setCustoValue] = useState(0);

  // Nova Vistoria Fields
  const [vistoriaType, setVistoriaType] = useState<'Inicial' | 'Parcial' | 'Final'>('Parcial');
  const [vistoriaInspector, setVistoriaInspector] = useState('');
  const [vistoriaDesc, setVistoriaDesc] = useState('');
  const [vistoriaPhoto, setVistoriaPhoto] = useState('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop');
  const [vistoriaAttachments, setVistoriaAttachments] = useState<VistoriaAttachment[]>([]);

  // Nova OC Fields
  const [ocProvider, setOcProvider] = useState('');
  const [ocProviderCnpj, setOcProviderCnpj] = useState('');
  const [ocDesc, setOcDesc] = useState('');
  const [ocQty, setOcQty] = useState(1);
  const [ocPrice, setOcPrice] = useState(0);

  // Modal de Etapa/Fase
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ObraStep | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [selectedPhaseType, setSelectedPhaseType] = useState('1. Planejamento');
  const [customPhase, setCustomPhase] = useState('');
  const [stepDueDate, setStepDueDate] = useState('');
  const [stepNotes, setStepNotes] = useState('');

  // Active work
  const obra = obras.find(o => o.id === id);

  if (!obra) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm font-semibold">Canteiro de obras não localizado em nosso banco corporativo.</p>
        <Link to="/obras" className="text-accent underline font-semibold mt-2 inline-block">
          Voltar para listagem
        </Link>
      </div>
    );
  }

  // Filter linked purchase orders
  const linkedPOs = purchaseOrders.filter(po => po.obraId === obra.id);

  // Calculate costs by category chart
  const categorySummary: Record<string, number> = {};
  obra.costs.forEach(c => {
    categorySummary[c.category] = (categorySummary[c.category] || 0) + c.value;
  });

  const chartData = Object.entries(categorySummary).map(([key, val]) => ({
    name: key,
    Gasto: val
  }));

  // Dispatches
  const handleToggleStep = (stepId: string) => {
    toggleObraStep(obra.id, stepId);
    toast.success('Checklist de rota física atualizado!');
  };

  const handleGenerateSteps = () => {
    generateDefaultSteps(obra.id);
    toast.success('Roteiro padrão com 7 etapas gerado!');
  };

  const typicalPhases = [
    '1. Planejamento',
    '2. Infraestrutura',
    '3. Estrutural',
    '4. Acabamento',
    '5. Instalações',
    '6. Cobertura',
    '7. Entrega'
  ];

  const handleOpenAddStep = () => {
    setEditingStep(null);
    setStepTitle('');
    setSelectedPhaseType('1. Planejamento');
    setCustomPhase('');
    setStepDueDate(new Date().toISOString().split('T')[0]);
    setStepNotes('');
    setIsStepModalOpen(true);
  };

  const handleOpenEditStep = (step: ObraStep) => {
    setEditingStep(step);
    setStepTitle(step.title);
    if (typicalPhases.includes(step.phase)) {
      setSelectedPhaseType(step.phase);
      setCustomPhase('');
    } else {
      setSelectedPhaseType('custom');
      setCustomPhase(step.phase);
    }
    setStepDueDate(step.dueDate);
    setStepNotes(step.notes || '');
    setIsStepModalOpen(true);
  };

  const handleSaveStep = async () => {
    const finalPhase = selectedPhaseType === 'custom' ? customPhase : selectedPhaseType;
    if (!stepTitle || !finalPhase) {
      toast.error('O título e a fase são campos obrigatórios!');
      return;
    }

    try {
      if (editingStep) {
        await updateObraStep(obra.id, editingStep.id, {
          title: stepTitle,
          phase: finalPhase,
          dueDate: stepDueDate,
          notes: stepNotes
        });
        toast.success('Etapa física atualizada com sucesso!');
      } else {
        await addObraStep(obra.id, {
          title: stepTitle,
          phase: finalPhase,
          dueDate: stepDueDate,
          notes: stepNotes
        });
        toast.success('Nova etapa adicionada ao cronograma físico!');
      }
      setIsStepModalOpen(false);
    } catch (err) {
      toast.error('Erro ao processar salvamento da etapa.');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta etapa do cronograma?')) {
      try {
        await deleteObraStep(obra.id, stepId);
        toast.success('Etapa física removida com sucesso!');
      } catch (err) {
        toast.error('Erro ao remover etapa.');
      }
    }
  };

  const handleReleaseCusto = () => {
    if (!custoDesc || custoValue <= 0) {
      toast.error('Preencha a descrição e defina o custo global!');
      return;
    }
    addCostToObra(obra.id, custoDesc, custoCategory, Number(custoValue));
    toast.success('Custo operacional lançado na dotação orçamentária!');
    setIsCustoOpen(false);
    setCustoDesc('');
    setCustoValue(0);
  };

  const handleReleaseVistoria = () => {
    if (!vistoriaInspector || !vistoriaDesc) {
      toast.error('Informe o inspetor e as descrições técnicas!');
      return;
    }
    
    let finalUrls: string[] = [];
    if (vistoriaAttachments.length === 0 && vistoriaPhoto) {
      finalUrls = [vistoriaPhoto];
    }
    
    addVistoriaToObra(obra.id, {
      date: new Date().toISOString().split('T')[0],
      type: vistoriaType,
      inspector: vistoriaInspector,
      description: vistoriaDesc,
      photoUrls: finalUrls,
      attachments: vistoriaAttachments
    });
    toast.success('Laudo de vistoria física inserida!');
    setIsVistoriaOpen(false);
    setVistoriaInspector('');
    setVistoriaDesc('');
    setVistoriaAttachments([]);
  };

  const handleReleaseOC = () => {
    if (!ocProvider || !ocDesc || ocQty <= 0 || ocPrice <= 0) {
      toast.error('Preencha os campos da Ordem de Compra!');
      return;
    }

    addPurchaseOrder({
      obraId: obra.id,
      obraName: obra.name,
      providerName: ocProvider,
      providerCnpj: ocProviderCnpj || '00.000.000/0001-00',
      payerCnpj: '12.345.678/0001-90',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Solicitação direta pelo painel técnico da Obra.',
      items: [
        {
          id: `item-${Date.now()}`,
          description: ocDesc,
          quantity: Number(ocQty),
          unit: 'unidade',
          unitPrice: Number(ocPrice),
          totalPrice: Number(ocQty) * Number(ocPrice)
        }
      ],
      discount: 0,
      taxes: 0,
      status: 'Rascunho'
    });

    toast.success('Ordem de Compra rascunhada com sucesso e filiada a esta obra!');
    setIsOCOpen(false);
    setOcProvider('');
    setOcProviderCnpj('');
    setOcDesc('');
    setOcQty(1);
    setOcPrice(0);
  };

  return (
    <div className="space-y-6">
      {/* Header section backing control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-4 text-left">
          <Link to="/obras" className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors shrink-0">
            <ChevronLeft size={16} />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-semibold">{obra.id}</span>
              <StatusBadge status={obra.status} />
            </div>
            <h2 className="font-display font-semibold text-xl text-slate-900 tracking-tight">{obra.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold text-slate-400">
          <span>Gestor Técnico: <strong className="text-slate-800">{obra.manager}</strong></span>
          <span className="text-slate-200">|</span>
          <span>Prazo Final: <strong className="text-slate-800">{obra.dueDate}</strong></span>
        </div>
      </div>

      {/* Structured core summaries Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <Card className="p-4 bg-slate-50 border border-slate-100 leading-snug">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Orçado Previsto</span>
          <p className="text-lg font-bold text-slate-700 font-mono mt-1">R$ {obra.budgetPlanned.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="p-4 bg-slate-50 border border-slate-100 leading-snug">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Realizado Consolidado</span>
          <p className="text-lg font-bold text-slate-700 font-mono mt-1">R$ {obra.budgetRealized.toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="p-4 bg-slate-50 border border-slate-100 leading-snug">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Saldo em Conta</span>
          <p className={`text-lg font-bold font-mono mt-1 ${obra.budgetPlanned - obra.budgetRealized < 0 ? 'text-red-600' : 'text-slate-700'}`}>
            R$ {(obra.budgetPlanned - obra.budgetRealized).toLocaleString('pt-BR')}
          </p>
        </Card>
        <Card className="p-4 bg-slate-50 border border-slate-100 leading-snug">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Progresso Físico</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-slate-800 font-mono">{obra.progress}%</span>
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${obra.progress}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs list indicators */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
        {[
          { id: 'roteiro', label: 'Evolução e Roteiro', icon: CheckSquare },
          { id: 'orcamento', label: 'Lançamentos Orçamentários', icon: DollarSign },
          { id: 'vistorias', label: 'Vistorias & Fotos', icon: Camera },
          { id: 'compras', label: 'Ordens de Compra', icon: ShoppingCart },
          { id: 'documentos', label: 'Documentos Gerais', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                isSelected 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          TAB 1: ROTEIRO (PHYSICAL CHECKLIST ROADMAP)
          ========================================== */}
      {activeTab === 'roteiro' && (
        <Card className="p-6 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Cronograma Físico de Conclusão</h3>
              <p className="text-xs text-slate-400 mt-0.5">Clique nas caixas de seleção para registrar conclusões e medir a evolução da obra.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="flex items-center gap-1" onClick={handleOpenAddStep}>
                <Plus size={14} /> Adicionar Etapa
              </Button>
              {obra.steps.length === 0 && (
                <Button variant="secondary" size="sm" onClick={handleGenerateSteps}>
                  Gerar Rota Padrão
                </Button>
              )}
            </div>
          </div>

          {obra.steps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma etapa cadastrada no cronograma. Clique acima no botão para popular as fases recomendadas automaticamente.
            </div>
          ) : (
            <div className="space-y-4">
              {obra.steps.map(s => (
                <div 
                  key={s.id} 
                  className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all ${
                    s.isCompleted ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={s.isCompleted}
                    onChange={() => handleToggleStep(s.id)}
                    className="mt-0.5 h-4.5 w-4.5 text-primary focus:ring-accent rounded border-slate-300 cursor-pointer"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wide">{s.phase}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">• Prazo: {s.dueDate}</span>
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${s.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {s.title}
                    </p>
                    {s.notes && <p className="text-[10px] text-slate-400 mt-0.5 italic">{s.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={() => handleOpenEditStep(s)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                      title="Editar Etapa"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(s.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remover Etapa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ==========================================
          TAB 2: ORÇAMENTO (CATEGORIES BAR CHART + EXPENSES TABLE)
          ========================================== */}
      {activeTab === 'orcamento' && (
        <div className="space-y-6">
          {/* Chart and releases summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Chart */}
            <Card className="p-5 lg:col-span-8 flex flex-col justify-between text-left">
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 text-sm">Gasto Concentrado por Categoria</h4>
                <p className="text-xs text-slate-400">Detalhamento dos insumos lançados neste projeto.</p>
              </div>
              <div className="h-52">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">Sem lançamentos</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tickFormatter={(v) => `R$${v/1000}k`} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`]} />
                      <Bar dataKey="Gasto" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Fast Actions Release panel */}
            <Card className="p-5 lg:col-span-4 flex flex-col justify-between text-left">
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-800 text-sm">Lançar Custo de Obra</h4>
                <p className="text-[11px] text-slate-400">Abata dotações de vergalhões, canteiro ou impostos gerais de medição técnica.</p>
              </div>
              <div className="pt-4 space-y-3.5">
                <Button variant="primary" className="w-full text-xs py-2.5" onClick={() => setIsCustoOpen(true)}>
                  Lançar Despesa / Desembolso
                </Button>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 leading-relaxed font-sans">
                  * Notas fiscais homologadas ou pagamentos de pessoal integram custos consolidados do balancete.
                </div>
              </div>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 text-left">
              <h4 className="font-semibold text-slate-800 text-sm">Histórico de Lançamentos de Custos Realizados</h4>
            </div>
            {obra.costs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Sem despesas registradas nesta obra.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Data</th>
                      <th className="px-5 py-3">Descrição da Despesa</th>
                      <th className="px-5 py-3">Categoria</th>
                      <th className="px-5 py-3 text-right">Valor Lançado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {obra.costs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{c.date}</td>
                        <td className="px-5 py-3 font-semibold text-slate-800">{c.description}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-primary text-[10px] font-bold">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900 text-right font-mono">
                          R$ {c.value.toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==========================================
          TAB 3: VISTORIAS & IMAGES GALLERY
          ========================================== */}
      {activeTab === 'vistorias' && (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Controle de Vistorias Técnicas</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Cadastre relatórios fotográficos de frentes concluídas.</p>
            </div>
            <Button variant="primary" size="sm" className="flex items-center gap-1" onClick={() => setIsVistoriaOpen(true)}>
              <Plus size={14} /> Registrar Vistoria
            </Button>
          </div>

          {obra.vistorias.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              Nenhuma vistoria física registrada pela engenharia.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {obra.vistorias.map(v => (
                <div key={v.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Photo display */}
                    {v.photoUrls?.[0] && (!v.attachments || v.attachments.length === 0) && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                        <img 
                          referrerPolicy="no-referrer"
                          src={v.photoUrls[0]} 
                          className="w-full h-full object-cover" 
                          alt="Fotografia de Vistoria"
                        />
                        <div className="absolute top-3.5 left-3.5 bg-slate-950/60 backdrop-blur text-white px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                          {v.type.toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {v.attachments && v.attachments.length > 0 && (
                      <div className="bg-slate-50 p-4 space-y-3 border-b border-slate-100 max-h-64 overflow-y-auto">
                        <div className="absolute top-3.5 left-3.5 z-10 bg-slate-950/60 backdrop-blur text-white px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                          {v.type.toUpperCase()}
                        </div>
                        {v.attachments.map((att, i) => (
                          <div key={i} className="relative z-0">
                            {att.type === 'image' ? (
                              <img src={att.url} alt={att.name} className="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-200" />
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                <div className="bg-red-50 p-2 rounded-lg text-red-500">
                                  <FileText size={18} />
                                </div>
                                <a href={att.url} download={att.name} className="text-xs font-bold text-slate-700 hover:text-accent underline truncate flex-1">
                                  {att.name}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="p-5 text-left space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold font-mono">
                        <span>Data: {v.date}</span>
                        <span>Inspetor: {v.inspector}</span>
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: ORDENS DE COMPRA (PO)
          ========================================== */}
      {activeTab === 'compras' && (
        <Card className="p-6 text-left space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Ordens de Compra (OCs) Vinculadas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Gestão de suprimentos emitidos especificamente para abastecer este canteiro.</p>
            </div>
            <Button variant="primary" size="sm" className="flex items-center gap-1" onClick={() => setIsOCOpen(true)}>
              <Plus size={14} /> Nova Ordem de Compra
            </Button>
          </div>

          {linkedPOs.length === 0 ? (
            <EmptyState message="Nenhuma despesa de suprimento ou ordem de compra vinculada a esta obra." />
          ) : (
            <div className="space-y-3">
              {linkedPOs.map(po => (
                <div key={po.id} className="p-4 border border-slate-100 rounded-xl hover:border-slate-250 transition-colors flex items-center justify-between bg-white text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500 font-mono">
                      {po.id}
                    </span>
                    <h4 className="font-bold text-slate-800 text-xs mt-1">{po.providerName}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Prazo de entrega: {po.deliveryDate}</p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="font-bold text-slate-800 text-sm font-mono leading-none">R$ {po.total.toLocaleString('pt-BR')}</p>
                    <div className="pt-1.5">
                      <StatusBadge status={po.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ==========================================
          TAB 5: DOCUMENTOS
          ========================================== */}
      {activeTab === 'documentos' && (
        <Card className="p-6 text-left space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">Documentos Gerais do Canteiro</h3>
          <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Upload className="mx-auto text-slate-300 mb-2" size={28} />
            <span className="block text-xs font-semibold text-slate-600">Arraste alvarás, relatórios estruturais ou PDFs de licença municipal</span>
            <p className="text-[10px] text-slate-400 mt-1">Capacidade de armazenamento local de 100MB por canteiro.</p>
          </div>
        </Card>
      )}

      {/* ==========================================
          MODALS FOR ACTIONS
          ========================================== */}
      {/* 1. Lançar Custo Modal */}
      <Modal isOpen={isCustoOpen} onClose={() => setIsCustoOpen(false)} title="Lançar Custos de Medição / Nota Fiscal">
        <div className="space-y-4 text-left">
          <Input 
            label="Insumo / Descrição do Lançamento" 
            placeholder="Ex: Nota Fiscal 1255 - Concreto Usinado" 
            value={custoDesc}
            onChange={(e) => setCustoDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Categoria Orçamentária"
              options={[
                { label: 'Estrutura / Pilares', value: 'Estrutura' },
                { label: 'Fundação / Sondagem', value: 'Fundação' },
                { label: 'Locações Equipamentos', value: 'Locação' },
                { label: 'Materiais de Acabamento', value: 'Acabamento' },
                { label: 'Projetos e Taxas', value: 'Administrativo' }
              ]}
              value={custoCategory}
              onChange={(e) => setCustoCategory(e.target.value)}
            />
            
            <Input 
              label="Valor Pago / Released (R$)" 
              type="number" 
              placeholder="Ex: 5000" 
              value={custoValue}
              onChange={(e) => setCustoValue(Number(e.target.value))}
            />
          </div>

          <div className="pt-3 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsCustoOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleReleaseCusto}>Liberar Lançamento</Button>
          </div>
        </div>
      </Modal>

      {/* 2. Nova Vistoria Modal */}
      <Modal isOpen={isVistoriaOpen} onClose={() => setIsVistoriaOpen(false)} title="Lançar Relatório de Vistoria Física">
        <div className="space-y-4 text-left font-sans">
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Tipo de Vistoria"
              options={[
                { label: 'Inicial / Liberação Terreno', value: 'Inicial' },
                { label: 'Parcial / Acompanhamento de Fases', value: 'Parcial' },
                { label: 'Final / Entrega de Chaves', value: 'Final' }
              ]}
              value={vistoriaType}
              onChange={(e) => setVistoriaType(e.target.value as any)}
            />
            <Input 
              label="Engenheiro Inspetor" 
              placeholder="Ex: Ricardo Dias" 
              value={vistoriaInspector}
              onChange={(e) => setVistoriaInspector(e.target.value)}
            />
          </div>

          <Textarea 
            label="Detalhes e Conformidades Observadas" 
            placeholder="Relate os progressos e eventuais desvios do cronograma físico observados na vistoria..." 
            value={vistoriaDesc}
            onChange={(e) => setVistoriaDesc(e.target.value)}
          />

          <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">Anexos Fotográficos ou Documentos (PDF)</label>
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white hover:border-primary transition-all cursor-pointer"
              onClick={() => document.getElementById('vistoria-file-upload')?.click()}
            >
              <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3">
                <Upload size={20} />
              </div>
              <span className="text-sm text-slate-800 font-bold">Clique para adicionar fotos ou laudos</span>
              <span className="text-xs text-slate-400 mt-1">Imagens (JPG, PNG) ou documentos (PDF)</span>
              <input 
                id="vistoria-file-upload" 
                type="file" 
                multiple 
                accept="image/*,application/pdf" 
                className="hidden" 
                onChange={(e) => {
                  const files = Array.from(e.target.files || []) as File[];
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setVistoriaAttachments(prev => [
                          ...prev, 
                          {
                            name: file.name,
                            type: file.type === 'application/pdf' ? 'pdf' : 'image',
                            url: event.target!.result as string
                          }
                        ]);
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </div>
            
            {vistoriaAttachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {vistoriaAttachments.map((att, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                      {att.type === 'pdf' ? <FileText size={16} className="text-red-500 flex-shrink-0" /> : <ImageIcon size={16} className="text-blue-500 flex-shrink-0" />}
                      <span className="text-xs font-semibold text-slate-700 truncate">{att.name}</span>
                    </div>
                    <button 
                      onClick={() => setVistoriaAttachments(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-slate-50 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 mt-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Ou selecione uma imagem padrão (Demonstração)</label>
                <select
                  className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-slate-600"
                  value={vistoriaPhoto}
                  onChange={(e) => setVistoriaPhoto(e.target.value)}
                >
                  <option value="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop">Fundação / Escavação</option>
                  <option value="https://images.unsplash.com/photo-1581094288338-2314dddb7eed?q=80&w=600&auto=format&fit=crop">Eletromecânica / Instalações</option>
                  <option value="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop">Acabamento / Fachada</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsVistoriaOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleReleaseVistoria}>Salvar Laudo</Button>
          </div>
        </div>
      </Modal>

      {/* 3. Nova OC Modal */}
      <Modal isOpen={isOCOpen} onClose={() => setIsOCOpen(false)} title="Nova Ordem de Compra Rápida para esta Obra">
        <div className="space-y-4 text-left font-sans">
          <Input 
            label="Fornecedor / Razão Social" 
            placeholder="Ex: Saint-Gobain Distribuição Ltda" 
            value={ocProvider}
            onChange={(e) => setOcProvider(e.target.value)}
          />
          <Input 
            label="CNPJ do Fornecedor" 
            placeholder="Ex: 01.233.455/0001-90" 
            value={ocProviderCnpj}
            onChange={(e) => setOcProviderCnpj(e.target.value)}
          />

          <div className="p-3 bg-blue-50/50 rounded-xl space-y-3.5">
            <Input 
              label="Descrição do Insumo a Adquirir" 
              placeholder="Ex: Placas de Drywall 120x240" 
              value={ocDesc}
              onChange={(e) => setOcDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Quantidade" 
                type="number" 
                value={ocQty}
                onChange={(e) => setOcQty(Number(e.target.value))}
              />
              <Input 
                label="Preço Unitário (R$)" 
                type="number" 
                value={ocPrice}
                onChange={(e) => setOcPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 text-right">
            <Button variant="secondary" onClick={() => setIsOCOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleReleaseOC}>Salvar Ordem em Rascunho</Button>
          </div>
        </div>
      </Modal>

      {/* 4. Gerenciar Etapa Modal */}
      <Modal 
        isOpen={isStepModalOpen} 
        onClose={() => setIsStepModalOpen(false)} 
        title={editingStep ? "Editar Etapa do Cronograma" : "Adicionar Nova Etapa ao Cronograma"}
      >
        <div className="space-y-4 text-left font-sans">
          <Input 
            label="Título da Etapa / Atividade" 
            placeholder="Ex: Assentamento de Alvenaria e Vergas" 
            value={stepTitle}
            onChange={(e) => setStepTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              label="Fase de Obras"
              options={[
                { label: '1. Planejamento', value: '1. Planejamento' },
                { label: '2. Infraestrutura', value: '2. Infraestrutura' },
                { label: '3. Estrutural', value: '3. Estrutural' },
                { label: '4. Acabamento', value: '4. Acabamento' },
                { label: '5. Instalações', value: '5. Instalações' },
                { label: '6. Cobertura', value: '6. Cobertura' },
                { label: '7. Entrega', value: '7. Entrega' },
                { label: 'Outra Fase...', value: 'custom' }
              ]}
              value={selectedPhaseType}
              onChange={(e) => setSelectedPhaseType(e.target.value)}
            />

            <Input 
              label="Prazo Limite / Due Date" 
              type="date" 
              value={stepDueDate}
              onChange={(e) => setStepDueDate(e.target.value)}
            />
          </div>

          {selectedPhaseType === 'custom' && (
            <Input 
              label="Especifique a Nova Fase" 
              placeholder="Ex: 8. Paisagismo / Urbanização" 
              value={customPhase}
              onChange={(e) => setCustomPhase(e.target.value)}
            />
          )}

          <Textarea 
            label="Observações / Detalhes de Engenharia" 
            placeholder="Diretrizes técnicas, referências de normas de qualidade ou notas sobre os materiais..." 
            value={stepNotes}
            onChange={(e) => setStepNotes(e.target.value)}
          />

          <div className="pt-3 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsStepModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveStep}>
              {editingStep ? "Salvar Alterações" : "Adicionar Etapa"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ObraDetailPage;
