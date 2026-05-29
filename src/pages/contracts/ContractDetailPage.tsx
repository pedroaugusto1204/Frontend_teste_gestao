import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../../store';
import { ContractStatus, SignatureStatus } from '../../types';
import { Card, Button, StatusBadge, Modal, Input } from '../../components/ui';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  ShieldAlert, 
  FileCheck, 
  History, 
  Layers, 
  Upload, 
  ExternalLink,
  Printer,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ContractDetailPage = () => {
  const { id } = useParams();
  const { contracts, uploadContractFile, renewContract, terminateContract, addSignatureRequest, company } = useAppState();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'contrato' | 'assinaturas' | 'documentos' | 'historico' | 'aditivos'>('contrato');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Controls
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewValue, setRenewValue] = useState(0);

  const contract = contracts.find(c => c.id === id);
  const aditivos = contracts.filter(c => c.parentId === id);

  if (!contract) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm font-semibold">Contrato não encontrado no sistema.</p>
        <Link to="/contracts" className="text-accent underline font-semibold mt-2 inline-block">
          Voltar para listagem
        </Link>
      </div>
    );
  }

  // File Upload Handlers (Drag & Drop + Input Click)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    // Add to store
    uploadContractFile(contract.id, file.name, `${sizeMb} MB`);
    toast.success(`Arquivo "${file.name}" anexado com sucesso!`);
  };

  const clickFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleOpenRenew = () => {
    setRenewValue(contract.value);
    setRenewEndDate('');
    setIsRenewOpen(true);
  };

  const submitRenew = () => {
    if (!renewEndDate) {
      toast.error('Informe a data de vencimento!');
      return;
    }
    renewContract(contract.id, renewEndDate, Number(renewValue));
    toast.success('Prorrogação estabelecida com sucesso!');
    setIsRenewOpen(false);
  };

  const handleTerminate = () => {
    const conf = window.confirm('Deseja realmente rescindir ou finalizar este contrato?');
    if (conf) {
      terminateContract(contract.id);
      toast.success('Contrato finalizado.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${contract.title}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div>${contract.htmlContent}</div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar and navigation back */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3 text-left">
          <Link to="/contracts" className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors shrink-0">
            <ChevronLeft size={16} />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 font-semibold">{contract.id}</span>
              <StatusBadge status={contract.status} />
            </div>
            <h2 className="font-display font-semibold text-xl text-slate-900 tracking-tight">{contract.title}</h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" className="flex items-center gap-1.5" onClick={handlePrint}>
            <Printer size={15} /> Imprimir / PDF
          </Button>

          {contract.status === ContractStatus.RASCUNHO && (
            <Button variant="primary" onClick={() => {
              addSignatureRequest({
                contractId: contract.id,
                contractTitle: contract.title,
                recipientName: `${contract.relatedParty} (Fiel Signatário)`,
                recipientEmail: 'assinaturas@empresa.com',
                recipientPhone: '(11) 99999-5555',
                channel: 'Email' as any,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              });
              toast.success('Solicitado fluxo de assinaturas jurídicas no e-mail cadastrado!');
            }}>
              Enviar para Assinatura
            </Button>
          )}

          {contract.status === ContractStatus.ATIVO && (
            <>
              <Button variant="success" className="flex items-center gap-1" onClick={handleOpenRenew}>
                Renovar Contrato
              </Button>
              <Button variant="danger" className="flex items-center gap-1" onClick={handleTerminate}>
                Encerrar Contrato
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Structured core details section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Core content block - Left */}
        <div className="lg:col-span-8 space-y-4">
          {/* Custom functional tabs indicator */}
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
            {[
              { id: 'contrato', label: 'Corpo do Contrato', icon: FileCheck },
              { id: 'assinaturas', label: 'Assinaturas', icon: Layers },
              { id: 'documentos', label: 'Documentos e Anexos', icon: Upload },
              { id: 'aditivos', label: `Aditivos (${aditivos.length})`, icon: FileText },
              { id: 'historico', label: 'Histórico de Trâmites', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
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
              TAB 1: CONTRATO (RENDERED HTML)
              ========================================== */}
          {activeTab === 'contrato' && (
            <Card className="p-8 font-serif leading-relaxed text-slate-800 bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')] min-h-[500px]">
              <div 
                className="prose prose-slate max-w-none text-left"
                dangerouslySetInnerHTML={{ __html: contract.htmlContent }} 
              />
            </Card>
          )}

          {/* ==========================================
              TAB 2: ASSINATURAS STATUS / LINKS
              ========================================== */}
          {activeTab === 'assinaturas' && (
            <Card className="p-6">
              <h4 className="font-semibold text-slate-800 text-sm mb-4">Acompanhamento de canais de aceitação legal</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    C1
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-slate-800">Assinatura Certificada Corporativa Sólida</p>
                    <p className="text-[10px] text-slate-400">Canal: Admin Interno</p>
                    {company.signatureUrl && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 inline-block">
                        <span className="block text-[8px] text-slate-400 uppercase font-mono mb-1">Assinatura Digital Corporativa</span>
                        <img 
                          src={company.signatureUrl} 
                          alt="Assinatura Corporativa" 
                          className="h-10 w-auto object-contain bg-transparent max-w-[160px]" 
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Assinado
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold text-xs">
                    C2
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-slate-800">{contract.relatedParty}</p>
                    <p className="text-[10px] text-slate-400">Contato primário designado</p>
                  </div>
                  <div>
                    {contract.status === ContractStatus.ATIVO ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Assinado
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                        Aguardando Trâmite
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ==========================================
              TAB 3: DOCUMENTOS (DRAG & DROP WITH LABELS)
              ========================================== */}
          {activeTab === 'documentos' && (
            <div className="space-y-4">
              {/* Drag and Drop Box */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive ? 'border-accent bg-accent/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={clickFileInput}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={fileSelected}
                  multiple={false}
                />
                
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">Arraste e solte o anexo auxiliar aqui</p>
                <p className="text-xs text-slate-400 mt-1">Ou clique para procurar em sua máquina (Suporta PDF, DOCX e Imagens)</p>
              </div>

              {/* Uploaded attachments list */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700 text-xs text-left uppercase tracking-wider">Documentos Anexados ({contract.attachments.length})</h4>
                {contract.attachments.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum anexo de suporte cadastrado.</p>
                ) : (
                  contract.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2 text-left">
                        <FileText size={16} className="text-primary" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{file.size} • Anexado em {file.date}</p>
                        </div>
                      </div>
                      <a href="#" className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-accent">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: ADITIVOS VINCULADOS
              ========================================== */}
          {activeTab === 'aditivos' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800 text-sm">Aditivos e Termos Vinculados</h4>
                <Button variant="primary" size="sm" onClick={() => navigate(`/contracts/new?parent=${contract.id}`)}>
                  + Novo Aditivo
                </Button>
              </div>
              
              <div className="space-y-3">
                {aditivos.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum aditivo vinculado a este processo principal.</p>
                ) : (
                  aditivos.map(adi => (
                    <div key={adi.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors gap-3">
                      <div className="flex items-start gap-3 text-left">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <div>
                          <Link to={`/contracts/${adi.id}`} className="text-sm font-bold text-slate-800 hover:text-accent">
                            {adi.title}
                          </Link>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Criado em: {adi.startDate} | Ref: {adi.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={adi.status} />
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/contracts/${adi.id}`)}>
                          Acessar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* ==========================================
              TAB 5: HISTÓRICO DE TRÂMITES
              ========================================== */}
          {activeTab === 'historico' && (
            <Card className="p-6">
              <h4 className="font-semibold text-slate-800 text-sm mb-4 text-left">Audit log de controle interno de alterações</h4>
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-6">
                {contract.history.map((log, index) => (
                  <div key={index} className="relative text-left">
                    {/* Floating point */}
                    <span className="absolute -left-5.5 top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold font-mono text-slate-400">{log.date}</span>
                      <p className="text-xs font-bold text-slate-800">{log.action} • {log.user}</p>
                      <p className="text-xs text-slate-500">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Info - Right */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm text-left">Resumo dos Metadados</h3>

            {/* Related Party */}
            <div className="flex gap-2.5">
              <Users className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div className="text-left leading-snug">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Parte Relacionada</span>
                <span className="text-xs font-bold text-slate-700">{contract.relatedParty}</span>
              </div>
            </div>

            {/* Contract Value */}
            <div className="flex gap-2.5">
              <DollarSign className="text-emerald-600 w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div className="text-left leading-snug">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Valor Pactuado</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  R$ {contract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Term dates */}
            <div className="flex gap-2.5">
              <Calendar className="text-slate-500 w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div className="text-left leading-snug">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Datas Vigíveis</span>
                <span className="text-xs text-slate-600 font-medium">
                  {contract.startDate} à {contract.endDate}
                </span>
              </div>
            </div>

            {/* Warn box if expiring soon (<30 days) */}
            {contract.status === ContractStatus.ATIVO ? (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 mt-2 text-left flex gap-1.5 items-start">
                <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Aviso de Vigência</span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Este contrato encontra-se juridicamente ativo e assistível sob fiscalização operacional.
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {/* Renew Period Modal */}
      <Modal isOpen={isRenewOpen} onClose={() => setIsRenewOpen(false)} title="Estender Vigência Ativa">
        <div className="space-y-4">
          <Input 
            label="Novo Termo de Vencimento" 
            type="date"
            value={renewEndDate}
            onChange={(e) => setRenewEndDate(e.target.value)}
          />
          <Input 
            label="Ajustar Valor Global (R$)" 
            type="number"
            value={renewValue}
            onChange={(e) => setRenewValue(Number(e.target.value))}
          />
          <div className="pt-3 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsRenewOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={submitRenew}>Aproveitar Extensão</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractDetailPage;
