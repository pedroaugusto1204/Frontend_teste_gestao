import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../../store';
import { ObraStatus } from '../../types';
import { Card, Button, StatusBadge, Modal, Input, Select, EmptyState } from '../../components/ui';
import { HardHat, Plus, Users, Calendar, DollarSign, ArrowRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const ObraListPage = () => {
  const { obras, addObra, contracts } = useAppState();
  const navigate = useNavigate();

  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budgetPlanned, setBudgetPlanned] = useState(0);
  const [contractId, setContractId] = useState('');

  // 1. Calculations
  const total = obras.length;
  const emAndamento = obras.filter(o => o.status === ObraStatus.EM_ANDAMENTO).length;
  const concluida = obras.filter(o => o.status === ObraStatus.CONCLUIDA).length;
  const pausada = obras.filter(o => o.status === ObraStatus.PAUSADA).length;

  const handleCreateObra = () => {
    if (!name || !manager || !dueDate || budgetPlanned <= 0) {
      toast.error('Preencha todos os campos do formulário antes de abrir a obra!');
      return;
    }

    const linkedContract = contracts.find(c => c.id === contractId);

    addObra({
      name,
      status: ObraStatus.PLANEJAMENTO,
      manager,
      dueDate,
      budgetPlanned,
      budgetRealized: 0,
      contractId: contractId || undefined,
      contractTitle: linkedContract?.title
    });

    toast.success('Novo canteiro de obra registrado e programado no sistema!');
    setIsNewOpen(false);

    // Reset Fields
    setName('');
    setManager('');
    setDueDate('');
    setBudgetPlanned(0);
    setContractId('');
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight font-sans">Gestão de Obras</h1>
          <p className="text-sm text-slate-500 font-medium">Controle físico-financeiro de canteiros e frentes de serviço.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-1.5" onClick={() => setIsNewOpen(true)}>
          <Plus size={16} /> Nova Obra
        </Button>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total de Obras</span>
          <h3 className="text-2xl font-bold text-slate-800">{total}</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-between text-left border-l-4 border-emerald-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Em Andamento</span>
          <h3 className="text-2xl font-bold text-emerald-600">{emAndamento}</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-between text-left border-l-4 border-blue-500">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Concluídas</span>
          <h3 className="text-2xl font-bold text-blue-600">{concluida}</h3>
        </Card>
        <Card className="p-4 flex flex-col justify-between text-left border-l-4 border-amber-500 font-sans">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pausadas / Paradas</span>
          <h3 className="text-2xl font-bold text-amber-600">{pausada}</h3>
        </Card>
      </div>

      {/* Grid List representation */}
      {obras.length === 0 ? (
        <EmptyState message="Nenhum canteiro registrado ainda. Deseja iniciar um?" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map(o => {
            const desvio = o.budgetPlanned - o.budgetRealized;
            const percentRealized = o.budgetPlanned > 0 ? Math.round((o.budgetRealized / o.budgetPlanned) * 100) : 0;

            return (
              <div key={o.id} className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col justify-between hover:shadow-lg transition-all text-left">
                {/* Header info */}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                      <HardHat size={18} />
                    </span>
                    <StatusBadge status={o.status} />
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mt-4">{o.name}</h3>
                  
                  {/* Progress Indicator */}
                  <div className="space-y-1.5 mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Progresso Físico</span>
                      <span className="text-accent">{o.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${o.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Micro Progress mini graphics */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
                      <span>Orçamento Utilizado</span>
                      <span className={percentRealized > 90 ? 'text-red-600' : 'text-slate-500'}>
                        {percentRealized}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>R$ {o.budgetRealized.toLocaleString('pt-BR')}</span>
                      <span className="text-slate-400 font-normal">de R$ {o.budgetPlanned.toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${percentRealized > 90 ? 'bg-red-500' : 'bg-accent'}`}
                        style={{ width: `${Math.min(percentRealized, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata labels info */}
                  <div className="mt-4 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      <span>Gestor: <strong>{o.manager}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Prazo de Entrega: <strong>{o.dueDate}</strong></span>
                    </div>
                    {o.contractTitle && (
                      <div className="flex items-center gap-1.5 font-sans font-medium text-primary">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-primary rounded text-[9px] font-bold">CONTRATO</span>
                        <span className="truncate max-w-[170px]">{o.contractTitle}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Open details action */}
                <div className="mt-6 border-t border-slate-50 pt-3">
                  <Link to={`/obras/${o.id}`} className="w-full">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-1.5 text-xs">
                      Detalhamento de Gastos & Fotos <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==========================================
          MODAL: NOVA OBRA
          ========================================== */}
      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="Lançar Novo Empreendimento / Obra">
        <div className="space-y-4 text-left font-sans">
          <p className="text-xs text-slate-500 leading-normal">
            Cadastre os planejores e orçamentos estimados. As ordens de compra e relatórios fiscais consolidarão custos nesta unidade.
          </p>

          <Input 
            label="Identificação da Unidade / Nome da Obra" 
            placeholder="Ex: Edifício Residencial Bela Vista" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Engenheiro Responsável" 
              placeholder="Ex: Eng. Marcos Rezende" 
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />
            <Input 
              label="Data Prevista para Conclusão" 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Orçamento Orçado Estimado (R$)" 
              type="number" 
              placeholder="Ex: 500000" 
              value={budgetPlanned}
              onChange={(e) => setBudgetPlanned(Number(e.target.value))}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contrato Principal Vinculado (Opcional)</label>
              <select
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
              >
                <option value="">Nenhum</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.relatedParty})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-right">
            <Button variant="secondary" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateObra}>Criar Canteiro</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ObraListPage;
