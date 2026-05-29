import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../../store';
import { ContractStatus } from '../../types';
import { Card, Button, StatusBadge, Modal, Input } from '../../components/ui';
import { AlertCircle, RefreshCw, Trash2, Sliders, Play, Eye, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export const ContractManagerPage = () => {
  const { contracts, renewContract, terminateContract } = useAppState();
  const navigate = useNavigate();

  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewValue, setRenewValue] = useState(0);

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  // Vigência approximation helpers
  const calculateDaysLeft = (endStr: string) => {
    const end = new Date(endStr);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeContracts = contracts.filter(c => c.status === ContractStatus.ATIVO);
  
  // Contracts expiring within 30 days
  const expiringContracts = activeContracts.filter(c => {
    const days = calculateDaysLeft(c.endDate);
    return days >= 0 && days <= 30;
  });

  const handleOpenRenew = (ctrId: string, val: number) => {
    setSelectedContractId(ctrId);
    setRenewValue(val);
    setRenewEndDate('');
    setIsRenewOpen(true);
  };

  const submitRenew = () => {
    if (!renewEndDate) {
      toast.error('Informe a data final do contrato para a aditiva!');
      return;
    }
    if (selectedContractId) {
      renewContract(selectedContractId, renewEndDate, Number(renewValue));
      toast.success('Prorrogado com sucesso!');
      setIsRenewOpen(false);
    }
  };

  const handleTerminate = (ctrId: string) => {
    const doubleCheck = window.confirm('Alerta! Tem certeza que deseja rescindir este contrato antecipadamente?');
    if (doubleCheck) {
      terminateContract(ctrId);
      toast.success('Contrato cancelado / encerrado.');
    }
  };

  const handleGenerateAdditive = (cTitle: string) => {
    toast.success(`Aditivo gerado para rascunho com o título: "Aditivo - ${cTitle}"`, {
      icon: '📑',
      duration: 4000
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left">
        <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">Gerenciador de Contratos</h1>
        <p className="text-sm text-slate-500 font-medium">Controle executivo avançado de vigências de serviços e reajustes financeiros.</p>
      </div>

      {/* Expiry Alert Banner */}
      {expiringContracts.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="shrink-0 text-amber-600 animate-pulse" size={20} />
            <h3 className="font-bold text-sm">Contratos Expirando nos próximos 30 dias</h3>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            Há <strong>{expiringContracts.length} contratos ativos</strong> se aproximando da data de encerramento contratual. Avalie os reajustes ou inicie processos de aditivo para evitar paralisações operacionais.
          </p>
          <div className="flex items-center gap-2 flex-wrap pt-1.5">
            {expiringContracts.map(c => {
              const days = calculateDaysLeft(c.endDate);
              return (
                <div key={c.id} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-sm">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-800 truncate max-w-[160px]">{c.title}</p>
                    <p className="text-[10px] text-amber-700 font-semibold font-mono">Restam {days} dias</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="bg-amber-600 hover:bg-amber-700 h-7 text-[10px]"
                    onClick={() => handleOpenRenew(c.id, c.value)}
                  >
                    Renovar
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main active table list */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm text-left">Foco em Contratos Ativos de Trabalho ({activeContracts.length})</h3>
          <span className="text-[10px] text-slate-400 font-semibold">Tabela de conformidade SLA</span>
        </div>
        
        {activeContracts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhum contrato ativo formalizado no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Parte Relacionada</th>
                  <th className="px-5 py-3">Tipo Contratual</th>
                  <th className="px-5 py-3 text-right">Valor Global</th>
                  <th className="px-5 py-3">Data Início</th>
                  <th className="px-5 py-3">Vencimento</th>
                  <th className="px-5 py-3">Dias Restantes</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Controle Rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {activeContracts.map(c => {
                  const daysLeft = calculateDaysLeft(c.endDate);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-left font-semibold text-slate-900">
                          {c.relatedParty}
                          <span className="block text-[10px] font-normal text-slate-400 font-mono italic">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{c.type}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800 text-right">
                        R$ {c.value.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs font-mono">{c.startDate}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs font-mono">{c.endDate}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          daysLeft < 30 ? 'bg-red-50 text-red-700 border border-red-200' :
                          daysLeft <= 90 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {daysLeft} dias
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <button 
                            onClick={() => navigate(`/contracts/${c.id}`)}
                            title="Visualizar Contrato"
                            className="p-1 px-1.5 text-slate-400 hover:text-accent hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            onClick={() => handleOpenRenew(c.id, c.value)}
                            title="Prorrogar"
                            className="p-1 px-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button 
                            onClick={() => handleGenerateAdditive(c.title)}
                            title="Gerar Termo Aditivo"
                            className="p-1 px-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FileSpreadsheet size={15} />
                          </button>
                          <button 
                            onClick={() => handleTerminate(c.id)}
                            title="Encerrar Rescisão"
                            className="p-1 px-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Renew Modal */}
      <Modal isOpen={isRenewOpen} onClose={() => setIsRenewOpen(false)} title="Prorrogar Contrato Vigente">
        <div className="space-y-4">
          <Input 
            label="Escolher Nova Data de Encerramento" 
            type="date"
            value={renewEndDate}
            onChange={(e) => setRenewEndDate(e.target.value)}
          />
          <Input 
            label="Adicionar Valor Acruado (R$)" 
            type="number"
            value={renewValue}
            onChange={(e) => setRenewValue(Number(e.target.value))}
          />
          <div className="pt-3 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsRenewOpen(false)}>Recusar</Button>
            <Button variant="primary" onClick={submitRenew}>Salvar Prorrogação</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractManagerPage;
