import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../../store';
import { SignatureStatus } from '../../types';
import { Button, Card, Checkbox, Input } from '../../components/ui';
import { Logo } from '../../components/Logo';
import { FileCheck, ShieldAlert, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

export const SignaturePublicPage = () => {
  const { token } = useParams();
  const { signatures, updateSignatureStatus, contracts } = useAppState();

  const [signatureName, setSignatureName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSignedSuccessfully, setIsSignedSuccessfully] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'typed' | 'drawn'>('typed');

  // Simple canvasing lines state for "draw" signature
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Find matches by token
  const request = signatures.find(s => s.token === token);
  const contract = request ? contracts.find(c => c.id === request.contractId) : null;

  if (!request || !contract) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto">
            <ShieldAlert size={24} />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900">Token de Assinatura Inválido</h2>
          <p className="text-xs text-slate-500">
            Este link de recusa expirou, foi assinado previamente ou não é mais válido para trâmites legais neste servidor. Entre em contato com o emissor para solicitar um novo link de assinatura.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="secondary" className="w-full">Voltar ao Sistema</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Draw simulation handlers
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Submit trigger
  const handleSignDocument = () => {
    if (signatureMethod === 'typed' && !signatureName.trim()) {
      toast.error('Informe seu nome completo para assinar eletronicamente!');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Você deve aceitar os termos de compromisso jurídico para prosseguir!');
      return;
    }

    let signatureDataUrl = '';
    if (signatureMethod === 'drawn') {
      const canvas = canvasRef.current;
      if (canvas) {
        signatureDataUrl = canvas.toDataURL('image/png');
      }
    } else {
      signatureDataUrl = `typed:${signatureName}`;
    }

    // Change status in Zustand database
    updateSignatureStatus(request.token, SignatureStatus.ASSINADO, signatureName || request.recipientName, signatureDataUrl);
    setIsSignedSuccessfully(true);
    toast.success('Documento formalmente assinado com validade técnica!', {
      duration: 5000,
      icon: '🔐'
    });
  };

  if (request.status === SignatureStatus.ASSINADO || isSignedSuccessfully) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col text-slate-800">
        {/* Top corporate bar */}
        <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 text-left">
          <div className="flex items-center gap-1.5">
            <Logo size={24} />
            <span className="font-display font-normal text-sm text-white leading-none">
              Growth<span className="text-accent font-bold">Solution</span> <span className="text-xs text-slate-400 font-sans border-l border-slate-800 pl-2">Portal Público de Assinaturas</span>
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Assinatura Digital Válida e Auditada
          </span>
        </header>

        {/* Main split dashboard view */}
        <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-left">
          {/* Left Side: Document PDF sheet scroll area */}
          <section className="lg:col-span-7 bg-slate-800 overflow-y-auto p-6 md:p-12 flex justify-center relative">
            <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-xl p-8 md:p-12 shadow-2xl font-serif text-slate-800 relative bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')] leading-relaxed">
              {/* Rotated Green Hologram Seal */}
              <div className="absolute top-10 right-10 transform rotate-12 border-4 border-emerald-500 rounded-xl px-4 py-2 text-emerald-600 font-display font-extrabold text-sm tracking-wide uppercase select-none opacity-85 text-center flex flex-col items-center">
                <span>🔐 Assinado</span>
                <span className="text-[8px] font-sans font-normal normal-case">Blockchain Cert.</span>
              </div>

              {/* Watermark in background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-emerald-100 font-display font-bold text-6xl tracking-widest uppercase pointer-events-none opacity-30 select-none">
                Assinado
              </div>
              
              <div dangerouslySetInnerHTML={{ __html: contract.htmlContent }} />
              
              {/* Digital signature footer block inside the contract paper! */}
              <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-200">
                <h4 className="text-xs font-bold font-sans text-slate-400 uppercase tracking-wider mb-3">Evidências de Assinatura Eletrônica</h4>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-600 font-sans">
                  <div>
                    <p className="font-bold text-emerald-800">ASSINATURA DE TERCEIRO</p>
                    <p><strong className="text-slate-800">Signatário:</strong> {signatureName || request.recipientName}</p>
                    <p><strong className="text-slate-800">E-mail:</strong> {request.recipientEmail}</p>
                    <p><strong className="text-slate-800">Data/Hora:</strong> {request.signedAt ? new Date(request.signedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}</p>
                    {request.drawnSignature && request.drawnSignature.startsWith('data:image/') ? (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-100 inline-block">
                        <span className="block text-[8px] text-slate-400 uppercase font-mono mb-1">Rubrica Desenhada</span>
                        <img 
                          src={request.drawnSignature} 
                          alt="Rubrica Desenhada" 
                          className="h-10 w-auto object-contain bg-transparent max-w-[160px]" 
                        />
                      </div>
                    ) : request.drawnSignature && request.drawnSignature.startsWith('typed:') ? (
                      <div className="mt-2 p-1.5 bg-white rounded-lg border border-emerald-100 inline-block">
                        <span className="block text-[8px] text-slate-400 uppercase font-mono mb-0.5">Rubrica Digitada</span>
                        <span className="font-serif italic text-xs text-slate-700 tracking-wider font-semibold block px-0.5">
                          {request.drawnSignature.replace('typed:', '')}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">CERTIFICAÇÃO TÉCNICA</p>
                    <p><strong className="text-slate-800">IP de Origem:</strong> 192.168.1.104</p>
                    <p><strong className="text-slate-800">Status ICP:</strong> Em conformidade com MP 2.200-2/2001</p>
                    <p className="font-mono text-[8px] truncate mt-1 text-slate-400">HASH: SHA256:{request.token.substring(0, 16)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Side: Audit Certificate Panel controls */}
          <section className="lg:col-span-5 bg-white border-l border-slate-100 flex flex-col p-6 md:p-8 justify-between max-h-screen overflow-y-auto">
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] bg-emerald-100 font-bold text-emerald-700 py-0.5 px-2 rounded uppercase font-mono">Blockchain Ativa</span>
                <h2 className="font-display font-bold text-xl text-slate-900 mt-2 leading-snug">Certificado de Autenticidade</h2>
                <p className="text-xs text-slate-400 mt-0.5">Este documento foi assinado eletronicamente e possui validade jurídica incontestável.</p>
              </div>

              {/* Status Certificate box */}
              <div className="p-5 bg-emerald-50/35 border border-emerald-100 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileCheck size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-800 text-sm">Status: Documento Homologado</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Todos os trâmites legais foram concluídos. As partes possuem cópias assinadas com hashes criptográficos estáveis de integridade.
                  </p>
                </div>
              </div>

              {/* Legal info summary list */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Histórico de Validação Digital</h4>
                
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-[11px] text-slate-600 bg-slate-50/20">
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">Identificador (Token)</span>
                    <span className="font-mono text-slate-800">{request.token}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">Canal de Validação</span>
                    <span className="font-medium text-slate-800">{request.channel}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">Autoridade Certificadora</span>
                    <span className="font-medium text-slate-800">Growth Solution MP-2.200</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">Data de Envio</span>
                    <span className="font-mono text-slate-800">{request.sentAt ? new Date(request.sentAt).toLocaleString('pt-BR') : '--'}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">Data de Assinatura</span>
                    <span className="font-mono text-slate-800 font-bold text-emerald-700">
                      {request.signedAt ? new Date(request.signedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-2.5">
              <Button 
                variant="primary" 
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-md text-white cursor-pointer"
                onClick={() => window.print()}
              >
                Imprimir Certificado de Validade
              </Button>
              <p className="text-[10px] text-slate-400 text-center">
                A validade das assinaturas pode ser auditada na ICP-Brasil utilizando o token público de segurança.
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top corporate bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-1.5 text-left">
          <Logo size={24} />
          <span className="font-display font-normal text-sm text-white leading-none">
            Growth<span className="text-accent font-bold">Solution</span> <span className="text-xs text-slate-400 font-sans border-l border-slate-800 pl-2">Portal Público de Assinaturas</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono font-semibold hidden md:inline">Transação Segura SSL de 256 bits</span>
      </header>

      {/* Main split dashboard view */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Document PDF sheet scroll area */}
        <section className="lg:col-span-7 bg-slate-800 overflow-y-auto p-6 md:p-12 flex justify-center">
          <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-xl p-8 md:p-12 shadow-2xl font-serif text-left min-h-[700px] text-slate-800 relative bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')] leading-relaxed">
            {/* Watermark */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-slate-100 font-display font-bold text-6xl tracking-widest uppercase pointer-events-none opacity-40 select-none">
              Aguardando
            </div>
            
            <div dangerouslySetInnerHTML={{ __html: contract.htmlContent }} />
          </div>
        </section>

        {/* Right Side: Assigner Panel controls */}
        <section className="lg:col-span-5 bg-white border-l border-slate-100 flex flex-col max-h-screen overflow-y-auto p-6 md:p-8 justify-between text-left">
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] bg-slate-100 font-bold text-slate-400 py-0.5 px-2 rounded uppercase font-mono">Assinatura Certificada</span>
              <h2 className="font-display font-bold text-xl text-slate-900 mt-2 leading-snug">Painel de Assinatura Eletrônica</h2>
              <p className="text-xs text-slate-400 mt-0.5">Assine o documento em menos de 1 minuto sem precisar imprimir ou digitalizar.</p>
            </div>

            {/* Contract Info Summary Card */}
            <Card className="p-4 bg-slate-50/50 border border-slate-200/60 leading-normal">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Documento Principal</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">{contract.title}</h4>
              <div className="grid grid-cols-2 gap-4 mt-3 text-[11px] text-slate-500">
                <div>
                  <span className="block font-semibold text-slate-400 uppercase text-[9px]">Empresa Emissora</span>
                  <span className="font-medium text-slate-800">Constructora Sólida Ltda</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-400 uppercase text-[9px]">Valor Contratado</span>
                  <span className="font-bold text-slate-800 font-mono">R$ {contract.value.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </Card>

            {/* Selection Signature Methods tabs */}
            <div className="space-y-3.5">
              <label className="block text-xs font-semibold text-slate-700">Como você prefere assinar?</label>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setSignatureMethod('typed')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all border ${
                    signatureMethod === 'typed' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Digitar Nome Completo
                </button>
                <button 
                  onClick={() => setSignatureMethod('drawn')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all border ${
                    signatureMethod === 'drawn' ? 'bg-primary text-white border-primary' : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Desenhar Assinatura
                </button>
              </div>

              {/* Typed Mode */}
              {signatureMethod === 'typed' ? (
                <div className="space-y-2">
                  <Input 
                    label="Seu Nome Completo (Como consta nos documentos)" 
                    placeholder="Ex: Geraldo Alckmin Filho" 
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                  />
                  {signatureName.trim() && (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold self-start mb-2">Rubrica Cursiva Automática</span>
                      {/* Fake stylized font signature */}
                      <span className="font-serif italic text-2xl text-slate-700 select-none select-all font-semibold tracking-wider font-mono">
                        {signatureName}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Drawn Mode Canvas Pad representation */
                <div className="space-y-2 text-left">
                  <span className="block text-xs font-semibold text-slate-700">Desenhe sua rubrica no painel abaixo</span>
                  <div className="border border-slate-200 rounded-xl bg-white shadow-inner relative overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={180}
                      className="w-full h-44 cursor-crosshair touch-none block"
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDrawing}
                      onMouseUp={handleStopDrawing}
                      onMouseLeave={handleStopDrawing}
                    />
                    <button 
                      type="button" 
                      onClick={clearCanvas}
                      className="absolute right-3.5 bottom-3 text-[10px] text-slate-400 hover:text-slate-600 border border-slate-200 bg-white/90 backdrop-blur rounded px-2 py-0.5 cursor-pointer font-semibold"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Terms and compliance acceptance checklists */}
            <div className="space-y-3.5 pt-2">
              <Checkbox 
                label="Declaro para os devidos fins de validade legal que li, aceito os termos do instrumento e reconheço a validade jurídica das presentes assinaturas nos moldes da ICP-Brasil."
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
            <Button 
              variant="success" 
              className="w-full flex items-center justify-center gap-1.5 py-3 shadow-lg"
              onClick={handleSignDocument}
            >
              <PenTool size={16} /> Assinar Contrato Eletronicamente
            </Button>
            <p className="text-[10px] text-slate-400 text-center">
              Ao assinar, um carimbo criptográfico SHA-256 e IP serão gerados para fins de auditoria jurídica em conformidade com a MP 2.200-2/2001.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignaturePublicPage;
