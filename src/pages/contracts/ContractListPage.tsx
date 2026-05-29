import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../../store';
import { ContractStatus, ContractType } from '../../types';
import { Button, Card, StatusBadge, EmptyState, Modal, Input, Select } from '../../components/ui';
import { 
  FileText, 
  Search, 
  Calendar, 
  Plus, 
  Trash2, 
  Eye, 
  Play, 
  RefreshCw, 
  FileCheck,
  AlertTriangle,
  AlertCircle,
  FilePlus
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ContractListPage = () => {
  const { 
    contracts, 
    addSignatureRequest, 
    renewContract, 
    terminateContract, 
    contractQuery, 
    contractFilterType, 
    contractFilterStatus, 
    setContractFilters 
  } = useAppState();

  const navigate = useNavigate();

  // Dialog State Controllers
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isSignOpen, setIsSignOpen] = useState(false);
  
  // Dialog Actions Inputs
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewValue, setRenewValue] = useState(0);

  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerPhone, setSignerPhone] = useState('');
  const [signatureChannel, setSignatureChannel] = useState<'Email' | 'WhatsApp' | 'Ambos'>('Email');

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  // Vigência approximation helper
  const calculateVigenciaRestante = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getVigenciaBadgeClass = (days: number) => {
    if (days < 0) return 'text-red-700 bg-red-50 border border-red-200 font-mono';
    if (days < 30) return 'text-red-600 bg-red-100 font-bold border border-red-200 font-mono';
    if (days <= 90) return 'text-amber-600 bg-amber-50 font-medium border border-amber-200 font-mono';
    return 'text-emerald-600 bg-emerald-50 border border-emerald-200 font-mono';
  };

  // Perform core filtering on client
  const filteredContracts = contracts.filter(c => {
    const query = contractQuery.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(query) || 
                          c.relatedParty.toLowerCase().includes(query) || 
                          c.id.toLowerCase().includes(query);
    
    const matchesType = contractFilterType === 'ALL' || c.type === contractFilterType;
    const matchesStatus = contractFilterStatus === 'ALL' || c.status === contractFilterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeContracts = contracts.filter(c => c.status === ContractStatus.ATIVO);
  const expiringContracts = activeContracts.filter(c => {
    const days = calculateVigenciaRestante(c.endDate);
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
      toast.error('Escolha a nova data de vencimento!');
      return;
    }
    if (selectedContractId) {
      renewContract(selectedContractId, renewEndDate, Number(renewValue));
      toast.success('Contrato renovado com sucesso!');
      setIsRenewOpen(false);
    }
  };

  const handleOpenSign = (ctrId: string) => {
    setSelectedContractId(ctrId);
    setSignerName('');
    setSignerEmail('');
    setSignerPhone('');
    setIsSignOpen(true);
  };

  const submitSignRequest = () => {
    if (!signerName || !signerEmail) {
      toast.error('Preencha nome e e-mail do destinatário!');
      return;
    }
    if (selectedContractId && selectedContract) {
      addSignatureRequest({
        contractId: selectedContractId,
        contractTitle: selectedContract.title,
        recipientName: signerName,
        recipientEmail: signerEmail,
        recipientPhone: signerPhone,
        channel: signatureChannel as any,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      toast.success(`Fila de assinaturas disparada via ${signatureChannel}!`);
      setIsSignOpen(false);
    }
  };

  const handleTerminate = (ctrId: string) => {
    const confirm = window.confirm('Deseja realmente encerrar este contrato? Esta ação é irreversível.');
    if (confirm) {
      terminateContract(ctrId);
      toast.success('Contrato encerrado formalmente.');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('ID do contrato copiado!', { id: 'copy-contract-id' });
  };

  const getContractSeqNum = (contractId: string) => {
    const sorted = [...contracts].sort((a, b) => a.id.localeCompare(b.id));
    const idx = sorted.findIndex(c => c.id === contractId);
    return idx !== -1 ? `#${String(idx + 1).padStart(2, '0')}` : '--';
  };



  return (
    <div className="space-y-6">
      {/* Page upper header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">Lista de Contratos</h1>
          <p className="text-sm text-slate-500 font-medium">Controle de minutas, rascunhos e vigências vigentes.</p>
        </div>
        <Link to="/contracts/new">
          <Button variant="primary" className="flex items-center gap-1.5 shadow-sm">
            <Plus size={16} /> Novo Contrato
          </Button>
        </Link>
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
              const days = calculateVigenciaRestante(c.endDate);
              return (
                <div key={c.id} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-sm">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-800 truncate max-w-[160px]">{c.title}</p>
                    <p className="text-[10px] text-amber-700 font-semibold font-mono">Restam {days} dias</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="bg-amber-600 hover:bg-amber-700 h-7 text-[10px] cursor-pointer"
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

      {/* Filter panel */}
      <Card className="p-4 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3.5 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Pesquisar por título, id ou parte relacionada..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              value={contractQuery}
              onChange={(e) => setContractFilters(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              value={contractFilterType}
              onChange={(e) => setContractFilters(undefined, e.target.value)}
            >
              <option value="ALL">Qualquer Tipo</option>
              {Object.values(ContractType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              value={contractFilterStatus}
              onChange={(e) => setContractFilters(undefined, undefined, e.target.value)}
            >
              <option value="ALL">Qualquer Status</option>
              {Object.values(ContractStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Contracts table section */}
      {filteredContracts.length === 0 ? (
        <EmptyState 
          message="Nenhum contrato corresponde aos filtros estabelecidos." 
          action={
            <Button variant="secondary" onClick={() => setContractFilters('', 'ALL', 'ALL')}>
              Limpar Filtros
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Contrato</th>
                  <th className="px-5 py-3">Parte Relacionada</th>
                  <th className="px-5 py-4">Tipo</th>
                  <th className="px-5 py-3 text-right">Valor Global</th>
                  <th className="px-5 py-3">Início</th>
                  <th className="px-5 py-3">Encerramento</th>
                  <th className="px-5 py-3">Vigência Restante</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredContracts.map(c => {
                  const daysLeft = calculateVigenciaRestante(c.endDate);
                  const showExpiringWarning = daysLeft >= 0 && daysLeft <= 30 && c.status === ContractStatus.ATIVO;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleCopyId(c.id)}
                          title={`ID completo: ${c.id}\nClique para copiar`}
                          className="text-slate-500 font-mono text-xs font-semibold hover:text-accent transition-colors text-left focus:outline-none flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60"
                        >
                          {getContractSeqNum(c.id)}
                        </button>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <FileText size={16} className="text-slate-400" />
                          <Link to={`/contracts/${c.id}`} className="hover:text-accent font-semibold">
                            {c.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">{c.relatedParty}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs truncate max-w-[140px]">{c.type}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800 text-right">
                        R$ {c.value.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{c.startDate}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{c.endDate}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getVigenciaBadgeClass(daysLeft)}`}>
                          {daysLeft < 0 ? 'Vencido' : `${daysLeft} dias`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <StatusBadge status={c.status} />
                          {showExpiringWarning && (
                            <span className="p-0.5 bg-amber-100 text-amber-700 rounded-full animate-bounce">
                              <AlertTriangle size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button 
                            onClick={() => navigate(`/contracts/${c.id}`)}
                            title="Visualizar Detalhe" 
                            className="p-1 px-1.5 text-slate-500 hover:text-accent hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Send for signature */}
                          {c.status === ContractStatus.RASCUNHO && (
                            <button 
                              onClick={() => handleOpenSign(c.id)}
                              title="Solicitar Assinatura" 
                              className="p-1 px-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded transition-colors"
                            >
                              <Play size={16} />
                            </button>
                          )}

                          {/* Renew contract */}
                          {c.status === ContractStatus.ATIVO && (
                            <>
                              <button 
                                onClick={() => handleOpenRenew(c.id, c.value)}
                                title="Renovar Vigência" 
                                className="p-1 px-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <RefreshCw size={16} />
                              </button>
                              
                              <button 
                                onClick={() => navigate(`/contracts/new?parent=${c.id}`)}
                                title="Novo Aditivo" 
                                className="p-1 px-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              >
                                <FilePlus size={16} />
                              </button>
                            </>
                          )}

                          {/* Terminate */}
                          {c.status !== ContractStatus.ENCERRADO && (
                            <button
                              onClick={() => handleTerminate(c.id)}
                              title="Encerrar"
                              className="p-1 px-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ==========================================
          RENEW MODAL
          ========================================== */}
      <Modal isOpen={isRenewOpen} onClose={() => setIsRenewOpen(false)} title="Renovação Contratual">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Informe o novo período e valor que serão fixados na aditiva do documento 
            <strong> {selectedContract?.title}</strong>.
          </p>

          <Input 
            label="Novo Vencimento do Contrato" 
            type="date"
            value={renewEndDate}
            onChange={(e) => setRenewEndDate(e.target.value)}
          />

          <Input 
            label="Novo Valor Ajustado (R$)" 
            type="number"
            value={renewValue}
            onChange={(e) => setRenewValue(Number(e.target.value))}
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsRenewOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={submitRenew}>Salvar Prorrogação</Button>
          </div>
        </div>
      </Modal>

      {/* ==========================================
          SIGNATURE FLOW REQ MODAL
          ========================================== */}
      <Modal isOpen={isSignOpen} onClose={() => setIsSignOpen(false)} title="Enviar Para Assinatura">
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-500 mb-2">
            Dispare o trâmite formal de validade jurídica para o signatário.
          </p>

          <Input 
            label="Nome do Signatário" 
            placeholder="Ex: Dr. Geraldo Alckmin"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
          />

          <Input 
            label="E-mail" 
            type="email"
            placeholder="geraldo@empresa.com"
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
          />

          <Input 
            label="Telefone (Opcional - WhatsApp)" 
            placeholder="(11) 98765-4321" 
            value={signerPhone}
            onChange={(e) => setSignerPhone(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Qual canal de acionamento?</label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              value={signatureChannel}
              onChange={(e) => setSignatureChannel(e.target.value as any)}
            >
              <option value="Email">E-mail</option>
              <option value="WhatsApp">WhatsApp Link</option>
              <option value="Ambos">Ambos (E-mail + WhatsApp)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 text-right">
            <Button variant="secondary" onClick={() => setIsSignOpen(false)}>Voltar</Button>
            <Button variant="primary" onClick={submitSignRequest}>Disparar Envio</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractListPage;
