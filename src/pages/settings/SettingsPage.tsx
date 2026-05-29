import React, { useState, useRef } from 'react';
import { useAppState } from '../../store';
import { Card, Button, Input } from '../../components/ui';
import { Sliders, Building, Check, Save, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { company, updateCompany } = useAppState();

  // Form states initialized with Zustand store values
  const [name, setName] = useState(company.name);
  const [cnpj, setCnpj] = useState(company.cnpj);
  const [ie, setIe] = useState(company.ie);
  const [address, setAddress] = useState(company.address);
  const [phone, setPhone] = useState(company.phone);

  const [currentSignature, setCurrentSignature] = useState(company.signatureUrl || '');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
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
    setHasDrawn(false);
  };

  const handleDeleteCurrentSignature = () => {
    setCurrentSignature('');
    setHasDrawn(false);
    toast.success('Assinatura atual removida temporariamente. Salve para persistir.');
  };

  const handleUpdate = () => {
    if (!name || !cnpj) {
      toast.error('Razão Social e CNPJ são campos obrigatórios!');
      return;
    }

    let finalSignatureUrl = currentSignature;
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      finalSignatureUrl = canvas.toDataURL('image/png');
      setCurrentSignature(finalSignatureUrl);
    }

    updateCompany({
      ...company,
      name,
      cnpj,
      ie,
      address,
      phone,
      signatureUrl: finalSignatureUrl
    });

    toast.success('Dados e assinatura corporativa atualizados com sucesso!');
    setHasDrawn(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left">
        <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
          <Building className="text-primary w-6 h-6" /> Dados do Emitente (Sua Empresa)
        </h1>
        <p className="text-sm text-slate-500 font-medium font-sans">Forneça os dados de faturamento padrão corporativo injetados dinamicamente nos clausulados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Core fields form */}
        <div className="lg:col-span-8">
          <Card className="p-6 space-y-5">
            <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2.5">Matriz de Cadastro Geral</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Razão Social" 
                placeholder="Ex: Constructora Sólida de Obras Ltda" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input 
                label="CNPJ" 
                placeholder="Ex: 12.345.678/0001-90" 
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Inscrição Estadual (IE)" 
                placeholder="Ex: 110.245.890.111" 
                value={ie}
                onChange={(e) => setIe(e.target.value)}
              />

              <Input 
                label="Telefone Corporativo" 
                placeholder="Ex: (11) 3255-8000" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Input 
              label="Endereço Comercial Completo" 
              placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {/* Signature Pad Section */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 font-sans">
                  <PenTool className="text-primary w-4.5 h-4.5" /> Assinatura Oficial Corporativa
                </h4>
                <p className="text-xs text-slate-400 font-medium">Esta rubrica será automaticamente carimbada como a assinatura digital do emitente em todas as novas minutas emitidas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Signature */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700">Assinatura Ativa</span>
                  {currentSignature ? (
                    <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/20 flex flex-col items-center justify-center min-h-[180px] relative">
                      <img 
                        src={currentSignature} 
                        alt="Assinatura Corporativa Ativa" 
                        className="max-h-24 w-auto object-contain bg-transparent" 
                      />
                      <button
                        type="button"
                        onClick={handleDeleteCurrentSignature}
                        className="absolute top-2.5 right-2.5 text-[10px] bg-white text-red-500 hover:text-red-700 border border-slate-200 rounded px-2 py-0.5 cursor-pointer font-bold transition-all shadow-sm animate-fade-in"
                      >
                        Excluir
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center min-h-[180px] text-xs text-slate-400 font-medium leading-normal text-center">
                      Nenhuma assinatura corporativa ativa.<br />Utilize o painel ao lado para desenhar e salvar uma rubrica oficial.
                    </div>
                  )}
                </div>

                {/* Drawing Canvas */}
                <div className="space-y-2 text-left">
                  <span className="block text-xs font-semibold text-slate-700">Desenhar Nova Assinatura</span>
                  <div className="border border-slate-200 rounded-xl bg-white shadow-inner relative overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={180}
                      className="w-full h-44 cursor-crosshair touch-none block bg-white"
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDrawing}
                      onMouseUp={handleStopDrawing}
                      onMouseLeave={handleStopDrawing}
                    />
                    <button 
                      type="button" 
                      onClick={clearCanvas}
                      className="absolute right-3.5 bottom-3 text-[10px] text-slate-400 hover:text-slate-600 border border-slate-200 bg-white/95 backdrop-blur rounded px-2 py-0.5 cursor-pointer font-semibold shadow-sm"
                    >
                      Limpar Desenho
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 flex justify-end">
              <Button variant="primary" className="flex items-center gap-1.5" onClick={handleUpdate}>
                <Save size={16} /> Salvar Alterações
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar help tips panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-slate-50 text-xs text-slate-600 leading-normal space-y-3.5 border border-slate-150">
            <h4 className="font-bold text-slate-800 text-xs text-left uppercase tracking-wider">Como estes dados atuam?</h4>
            <p>
              Estes campos alimentam as chaves sistêmicas injetadas nas minutas de contratos e ordens de compra:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[11px] text-slate-500 font-medium">
              <li><code>{`{{empresa_contratante}}`}</code> &rarr; Razão Social</li>
              <li><code>{`{{cnpj_contratante}}`}</code> &rarr; Documento CNPJ</li>
              <li>Faturamento central de Ordens de Compra de suprimentos.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
