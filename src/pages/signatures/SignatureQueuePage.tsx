import { useState } from 'react';
import { useAppState } from '../../store';
import { SignatureStatus, SignatureChannel } from '../../types';
import { Card, Button, StatusBadge, Modal, Input } from '../../components/ui';
import { 
  PenTool, 
  Mail, 
  Smartphone, 
  ExternalLink, 
  Send, 
  Calendar, 
  X,
  Clock,
  RefreshCw,
  Search,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SignatureQueuePage = () => {
  const { signatures, addSignatureRequest, updateSignatureStatus, contracts } = useAppState();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('ID do contrato copiado!', { id: 'copy-contract-id-sig' });
  };

  const getContractSeqNum = (contractId: string) => {
    const sorted = [...contracts].sort((a, b) => a.id.localeCompare(b.id));
    const idx = sorted.findIndex(c => c.id === contractId);
    return idx !== -1 ? `#${String(idx + 1).padStart(2, '0')}` : '--';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequestToken, setSelectedRequestToken] = useState<string | null>(null);

  // Form parameters
  const [contractId, setContractId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [channel, setChannel] = useState<SignatureChannel>(SignatureChannel.EMAIL);

  const handleOpenNew = () => {
    // Lock onto first contract if exists
    if (contracts.length > 0) {
      setContractId(contracts[0].id);
    }
    setRecipientName('');
    setRecipientEmail('');
    setRecipientPhone('');
    setChannel(SignatureChannel.EMAIL);
    setIsNewRequestOpen(true);
  };

  const handleCreateRequest = () => {
    if (!contractId || !recipientName || !recipientEmail) {
      toast.error('Preencha pelo menos o contrato, nome e o e-mail do destinatário!');
      return;
    }

    const matchedContract = contracts.find(c => c.id === contractId);
    if (!matchedContract) return;

    // Dispatch
    addSignatureRequest({
      contractId,
      contractTitle: matchedContract.title,
      recipientName,
      recipientEmail,
      recipientPhone,
      channel,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    const generatedToken = `token-${Math.floor(1000 + Math.random() * 9000)}`;
    const signUrl = `${window.location.origin}/#/sign/${generatedToken}`;
    
    const emailSubject = encodeURIComponent(`Assinatura de Contrato: ${matchedContract.title}`);
    const emailBody = encodeURIComponent(`Olá, por favor assine o contrato acessando o link:\n${signUrl}`);
    const waText = encodeURIComponent(`Olá, por favor assine o contrato acessando o link:\n${signUrl}`);

    if (channel === SignatureChannel.EMAIL || channel === SignatureChannel.AMBOS) {
      window.open(`mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`);
    }
    if (channel === SignatureChannel.WHATSAPP || channel === SignatureChannel.AMBOS) {
      const cleanPhone = recipientPhone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${waText}`);
    }

    toast.success('Solicitação de assinatura registrada e link aberto para envio manual!');
    setIsNewRequestOpen(false);
  };

  const getChannelIcon = (ch: SignatureChannel) => {
    if (ch === SignatureChannel.EMAIL) {
      return (
        <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-xs">
          <Mail size={14} className="text-blue-500" /> E-mail
        </span>
      );
    }
    if (ch === SignatureChannel.WHATSAPP) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
          <Smartphone size={14} className="text-emerald-500" /> WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs">
        <Mail size={14} className="text-blue-500" /> <Smartphone size={14} className="text-emerald-500" /> Ambos
      </span>
    );
  };

  const handleCopyLink = (token: string) => {
    const publicUrl = `${window.location.origin}/#/sign/${token}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link de Assinatura copiado para a área de transferência! Envie para o cliente.', {
      icon: '🔗'
    });
  };

  const handleResend = (s: any) => {
    const signUrl = `${window.location.origin}/#/sign/${s.token}`;
    
    const emailSubject = encodeURIComponent(`Reenvio - Assinatura de Contrato: ${s.contractTitle}`);
    const emailBody = encodeURIComponent(`Olá, estamos reenviando o link para assinatura do contrato:\n${signUrl}`);
    const waText = encodeURIComponent(`Olá, estamos reenviando o link para assinatura do contrato:\n${signUrl}`);

    if (s.channel === SignatureChannel.EMAIL || s.channel === SignatureChannel.AMBOS) {
      window.open(`mailto:${s.recipientEmail}?subject=${emailSubject}&body=${emailBody}`);
    }
    if (s.channel === SignatureChannel.WHATSAPP || s.channel === SignatureChannel.AMBOS) {
      const cleanPhone = s.recipientPhone ? s.recipientPhone.replace(/\D/g, '') : '';
      window.open(`https://wa.me/55${cleanPhone}?text=${waText}`);
    }

    // Add a log to the contract history representing the resend attempt
    const matchedContract = contracts.find(c => c.id === s.contractId);
    if (matchedContract) {
       useAppState.getState().updateContract(matchedContract.id, {
         history: [
           {
             date: new Date().toLocaleString([], {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}),
             user: 'Sistema',
             action: 'Reenvio de Assinatura',
             details: `Tentativa de reenvio de assinatura disparada via ${s.channel} para ${s.recipientName}.`
           },
           ...matchedContract.history
         ]
       });
    }

    toast.success('Tentativa de reenvio registrada no histórico do contrato.');
  };

  // Search filtering
  const filteredSignatures = signatures.filter(s => {
    const q = searchQuery.toLowerCase();
    const seqNum = getContractSeqNum(s.contractId).toLowerCase();
    return (
      s.recipientName.toLowerCase().includes(q) ||
      (s.recipientEmail && s.recipientEmail.toLowerCase().includes(q)) ||
      s.contractTitle.toLowerCase().includes(q) ||
      s.contractId.toLowerCase().includes(q) ||
      seqNum.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Upper bar */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">Fila de Assinaturas</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">Acompanhe canais e status dos termos remetidos a terceiros.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-1.5" onClick={handleOpenNew}>
          <Send size={15} /> Nova Assinatura
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="p-4 bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar por signatário, e-mail, título do contrato ou ID..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </Card>

      {/* Signature Requests Table */}
      {filteredSignatures.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-500">Nenhuma solicitação de assinatura corresponde à pesquisa na fila.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Contrato Vinculado</th>
                  <th className="px-5 py-3">Destinatário</th>
                  <th className="px-5 py-3">Canal de Envio</th>
                  <th className="px-5 py-3">Enviado em</th>
                  <th className="px-5 py-3">Expira em</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Link Público / Trâmites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSignatures.map(s => {
                  const formattedSent = new Date(s.sentAt).toLocaleDateString('pt-BR');
                  const formattedExpr = new Date(s.expiresAt).toLocaleDateString('pt-BR');

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-900 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => handleCopyId(s.contractId)}
                            title={`ID do Contrato: ${s.contractId}\nClique para copiar`}
                            className="text-slate-500 font-mono text-xs font-semibold hover:text-accent transition-colors text-left focus:outline-none flex items-center gap-1 cursor-pointer bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60"
                          >
                            {getContractSeqNum(s.contractId)}
                          </button>
                        </div>
                        <span className="text-xs font-medium text-slate-800">{s.contractTitle}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 leading-snug">{s.recipientName}</p>
                          <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{s.recipientEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">{getChannelIcon(s.channel)}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs font-mono">{formattedSent}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs font-mono">{formattedExpr}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === SignatureStatus.ASSINADO ? (
                            <a 
                              href={`/#/sign/${s.token}`} 
                              target="_blank" 
                              rel="noreferrer"
                            >
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="bg-emerald-50 hover:bg-emerald-100 font-semibold py-1 flex items-center gap-1 text-emerald-700 border border-emerald-100 cursor-pointer"
                              >
                                <Eye size={12} /> Visualizar Termo
                              </Button>
                            </a>
                          ) : (
                            <>
                              {/* Copy Link wrapper */}
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="bg-slate-50 font-semibold py-1 hover:bg-slate-100 flex items-center gap-1 text-slate-700 cursor-pointer"
                                onClick={() => handleCopyLink(s.token)}
                              >
                                Copiar Link
                              </Button>
                              
                              {/* Resend Link button */}
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="bg-slate-50 font-semibold py-1 hover:bg-slate-100 flex items-center gap-1 text-slate-700 cursor-pointer"
                                onClick={() => handleResend(s)}
                              >
                                <RefreshCw size={12} /> Reenviar
                              </Button>
                              
                              {/* Open sign directly */}
                              <a 
                                href={`/#/sign/${s.token}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-1 px-1.5 hover:bg-slate-50 text-slate-500 hover:text-accent rounded transition-colors"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </>
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
          MODAL: NOVO TRÂMITE / SEPARATE ENV
          ========================================== */}
      <Modal isOpen={isNewRequestOpen} onClose={() => setIsNewRequestOpen(false)} title="Disparar Solicitação de Assinatura">
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-500 leading-normal">
            Escolha um contrato ativo ou minuta existente e preencha o destinatário que receberá o aviso para assinar o termo digitalmente.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contrato a Ser Assinado</label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.relatedParty})</option>
              ))}
            </select>
          </div>

          <Input 
            label="Nome do Destinatário Completo" 
            placeholder="Ex: Geraldo Alckmin" 
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="E-mail" 
              type="email"
              placeholder="geraldo@empresa.com" 
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <Input 
              label="Telefone (WhatsApp)" 
              placeholder="(11) 98765-4321" 
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Canal de Acionamento Técnico</label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
            >
              <option value={SignatureChannel.EMAIL}>Apenas E-mail</option>
              <option value={SignatureChannel.WHATSAPP}>Apenas WhatsApp</option>
              <option value={SignatureChannel.AMBOS}>Ambos (E-mail + WhatsApp)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsNewRequestOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateRequest}>Concluir e Disparar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SignatureQueuePage;
