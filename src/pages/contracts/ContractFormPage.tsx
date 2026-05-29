import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppState } from '../../store';
import { ContractStatus, ContractType, SignatureChannel } from '../../types';
import { Button, Card, Input, Select } from '../../components/ui';
import { 
  FileCode, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  PenTool,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Sparkles,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// Schema validation for basic contract fields
const contractSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório (mínimo 3 caracteres)'),
  relatedParty: z.string().min(2, 'Informe a parte relacionada'),
  type: z.nativeEnum(ContractType),
  value: z.number().min(1, 'O valor global deve ser maior que zero'),
  startDate: z.string().min(1, 'Data inicial obrigatória'),
  endDate: z.string().min(1, 'Data final obrigatória'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'Data final não pode ser anterior à data inicial',
  path: ['endDate'],
});

export const ContractFormPage = () => {
  const { templates, contracts, addContract, addSignatureRequest, company } = useAppState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parent');
  const parentContract = parentId ? contracts.find(c => c.id === parentId) : null;

  const [step, setStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Dynamic template custom form key-values state
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const chosenTemplate = templates.find(t => t.id === selectedTemplateId);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: parentContract ? `Aditivo - ${parentContract.title}` : '',
      relatedParty: parentContract ? parentContract.relatedParty : '',
      type: ContractType.SERVICO,
      value: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    }
  });

  const formWatcher = watch();

  // WYSIWYG Editable Word-like states
  const [editorContent, setEditorContent] = useState('');
  const [hasEditedContent, setHasEditedContent] = useState(false);
  
  // Signature delivery states
  const [signatureChannel, setSignatureChannel] = useState<SignatureChannel>(SignatureChannel.EMAIL);
  const [signatureEmail, setSignatureEmail] = useState('');
  const [signaturePhone, setSignaturePhone] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // HTML live evaluation helper
  const renderPreviewHtml = () => {
    if (!chosenTemplate) {
      return `
        <h2 style="text-align:center; font-size: 20px; color: #1e3a5f; margin-bottom: 24px; font-weight: bold;">${formWatcher.title ? formWatcher.title.toUpperCase() : 'CONTRATO CORPORATIVO DE PRESTAÇÃO DE SERVIÇOS'}</h2>
        <p>Pelo presente instrumento, de um lado como <strong>Emitente e Contratante</strong>: <strong>${company.name}</strong>, com sede e foro legal, inscrita sob o CNPJ nº <strong>${company.cnpj}</strong>.</p>
        <p>De outro lado, como <strong>Contratada e Prestadora de Serviços</strong>: <strong>${formWatcher.relatedParty || '[Nome da Contratada]'}</strong>.</p>
        <p>As partes qualificadas acima celebram e estabelecem de comum acordo o presente termo, mediante as seguintes condições:</p>

        <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #01224f;">CLÁUSULA PRIMEIRA - OBJETO</h3>
        <p>O presente contrato tem como objeto a prestação de serviços técnicos especializados sob demanda operacional, conforme detalhado nos anexos técnicos desta parceria.</p>

        <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #01224f;">CLÁUSULA SEGUNDA - VALOR E PAGAMENTO</h3>
        <p>Pelo adimplemento integral das obrigações pactuadas, a Contratante pagará à Contratada o valor total global estimado de <strong>R$ ${(formWatcher.value || 0).toLocaleString('pt-BR')}</strong> vigendo na forma legal.</p>

        <h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #01224f;">CLÁUSULA TERCEIRA - VIGÊNCIA E CRONOGRAMA</h3>
        <p>O presente instrumento entra em vigor a partir de <strong>${formWatcher.startDate ? formWatcher.startDate.split('-').reverse().join('/') : '[Início]'}</strong>, estendendo-se em caráter regular até o seu vencimento operádo em <strong>${formWatcher.endDate ? formWatcher.endDate.split('-').reverse().join('/') : '[Encerramento]'}</strong>.</p>

        <div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 12px; font-family: sans-serif;">
          <div style="border-top: 1.5px solid #94a3b8; padding-top: 8px; text-align: center; color: #334155;">
            <p><strong>REPRESENTANTE EMITENTE</strong><br/>${company.name}</p>
          </div>
          <div style="border-top: 1.5px solid #94a3b8; padding-top: 8px; text-align: center; color: #334155;">
            <p><strong>PARTE CONTRATADA</strong><br/>${formWatcher.relatedParty || '[Nome da Contratada]'}</p>
          </div>
        </div>
      `;
    }

    let compiledHtml = chosenTemplate.htmlContent;
    // Inject system fields
    compiledHtml = compiledHtml
      .replace(/\{\{titulo_contrato\}\}/g, formWatcher.title || '[Título do Contrato]')
      .replace(/\{\{titulo_documento\}\}/g, formWatcher.title || '[Título do Contrato]')
      .replace(/\{\{titulo\}\}/g, formWatcher.title || '[Título do Contrato]')
      .replace(/\{\{empresa_contratante\}\}/g, company.name)
      .replace(/\{\{cnpj_contratante\}\}/g, company.cnpj)
      .replace(/\{\{parte_relacionada\}\}/g, formWatcher.relatedParty || '[Parte Relacionada]')
      .replace(/\{\{valor_total\}\}/g, (formWatcher.value || 0).toLocaleString('pt-BR'))
      .replace(/\{\{data_inicio\}\}/g, formWatcher.startDate ? formWatcher.startDate.split('-').reverse().join('/') : '[Início]')
      .replace(/\{\{data_fim\}\}/g, formWatcher.endDate ? formWatcher.endDate.split('-').reverse().join('/') : '[Encerramento]');

    // Inject custom fields
    chosenTemplate.fields.forEach(f => {
      const val = dynamicValues[f.key] || `[${f.label}]`;
      compiledHtml = compiledHtml.replace(new RegExp(`\\{\\{${f.key}\\}\\}`, 'g'), val);
    });

    return compiledHtml;
  };

  // Keep editor content synchronized with form as long as the user hasn't explicitly typed inside the paper sheet
  useEffect(() => {
    if (!hasEditedContent && step === 2) {
      const compiled = renderPreviewHtml();
      setEditorContent(compiled);
      if (editorRef.current) {
        editorRef.current.innerHTML = compiled;
      }
    }
  }, [
    formWatcher.title,
    formWatcher.relatedParty,
    formWatcher.value,
    formWatcher.startDate,
    formWatcher.endDate,
    dynamicValues,
    selectedTemplateId,
    hasEditedContent,
    step
  ]);

  // Keep selection range saved
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      try {
        const range = sel.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      } catch (e) {
        // Safe catch
      }
    }
  };

  const restoreSelection = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        } catch (e) {
          // Safe catch
        }
      }
    }
  };

  const applyFormat = (command: string, value: string = '') => {
    setHasEditedContent(true);
    restoreSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const handleResetContent = () => {
    const compiled = renderPreviewHtml();
    setEditorContent(compiled);
    if (editorRef.current) {
      editorRef.current.innerHTML = compiled;
    }
    setHasEditedContent(false);
    toast.success('Minuta re-sincronizada com os dados do formulário!');
  };

  const handleChooseTemplate = (id: string | null) => {
    setSelectedTemplateId(id);
    if (id) {
      const tmpl = templates.find(t => t.id === id);
      if (tmpl) {
        // Pre-propagate default values for customized keys
        const initialDynamic: Record<string, string> = {};
        tmpl.fields.forEach(f => {
          initialDynamic[f.key] = '';
        });
        setDynamicValues(initialDynamic);
      }
    }
    setStep(2);
  };

  const handleDynamicChange = (key: string, value: string) => {
    setDynamicValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const onFormSubmit = () => {
    // Basic form validated at Step 2 -> Transition to Step 3 (Review)
    setStep(3);
  };

  // Step 3 triggers
  const handleFinalSave = async (status: ContractStatus) => {
    if (status === ContractStatus.AGUARDANDO) {
      if ((signatureChannel === SignatureChannel.EMAIL || signatureChannel === SignatureChannel.AMBOS) && !signatureEmail) {
        toast.error('Informe o e-mail para envio da assinatura.');
        return;
      }
      if ((signatureChannel === SignatureChannel.WHATSAPP || signatureChannel === SignatureChannel.AMBOS) && !signaturePhone) {
        toast.error('Informe o número do WhatsApp para envio da assinatura.');
        return;
      }
    }

    const values = formWatcher;
    const finalHtml = editorContent || renderPreviewHtml();

    const addedCtr = await addContract({
      title: values.title,
      relatedParty: values.relatedParty,
      type: values.type,
      value: values.value,
      startDate: values.startDate,
      endDate: values.endDate,
      status,
      templateId: selectedTemplateId || undefined,
      fieldValues: dynamicValues,
      htmlContent: finalHtml,
      parentId: parentId || undefined
    });

    if (status === ContractStatus.AGUARDANDO) {
      const generatedToken = `token-${Math.floor(1000 + Math.random() * 9000)}`;
      
      addSignatureRequest({
        contractId: addedCtr.id,
        contractTitle: addedCtr.title,
        recipientName: `${values.relatedParty} (Contato)`,
        recipientEmail: signatureEmail,
        recipientPhone: signaturePhone,
        channel: signatureChannel,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Simulação do envio físico via links mailto e wa.me
      const signUrl = `${window.location.origin}/#/sign/${generatedToken}`;
      const emailSubject = encodeURIComponent(`Assinatura de Contrato: ${addedCtr.title}`);
      const emailBody = encodeURIComponent(`Olá, por favor assine o contrato acessando o link:\n${signUrl}`);
      
      if (signatureChannel === SignatureChannel.EMAIL || signatureChannel === SignatureChannel.AMBOS) {
        window.open(`mailto:${signatureEmail}?subject=${emailSubject}&body=${emailBody}`);
      }
      if (signatureChannel === SignatureChannel.WHATSAPP || signatureChannel === SignatureChannel.AMBOS) {
        const cleanPhone = signaturePhone.replace(/\D/g, '');
        const waText = encodeURIComponent(`Olá, por favor assine o contrato acessando o link:\n${signUrl}`);
        window.open(`https://wa.me/55${cleanPhone}?text=${waText}`);
      }

      toast.success('Contrato criado e links de assinatura abertos para envio manual!');
    } else {
      toast.success('Contrato salvo em rascunho com sucesso!');
    }

    navigate('/contracts');
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="text-left">
        <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck className="text-primary w-6 h-6" /> Emissão de Contrato com Editor Word
        </h1>
        <p className="text-sm text-slate-500">Preencha os campos e edite o texto diretamente na folha de papel digital.</p>
      </div>

      {/* Progress Dots Step Indicator */}
      <div className="flex items-center justify-center gap-10 max-w-lg mx-auto py-2">
        {[
          { num: 1, label: 'Escolha o Modelo' },
          { num: 2, label: 'Preenchimento e Escrita' },
          { num: 3, label: 'Revisão Final' }
        ].map((item) => (
          <div key={item.num} className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === item.num ? 'bg-accent text-white shadow-md shadow-accent/25' : 
              step > item.num ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {item.num}
            </span>
            <span className={`text-xs font-semibold hidden sm:inline ${
              step === item.num ? 'text-slate-800' : 'text-slate-400'
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* ==========================================
          PASSO 1: ESCOLHER TEMPLATE
          ========================================== */}
      {step === 1 && (
        <div className="space-y-6 text-left">
          <h3 className="font-semibold text-slate-800 text-base">Selecione um template base homologado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Template Card: Do zero */}
            <div 
              className="bg-white rounded-xl border-2 border-slate-200 hover:border-accent shadow-sm p-5 cursor-pointer hover:bg-slate-50 transition-all flex flex-col justify-between"
              onClick={() => handleChooseTemplate(null)}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
                  <FileText size={20} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Contrato Livre (Do Zero)</h4>
                <p className="text-xs text-slate-400 mt-1">Crie um acordo livre e digite todo o texto usando a folha de papel inteligente como no Microsoft Word.</p>
              </div>
              <div className="mt-6 flex items-center justify-between text-accent font-semibold text-xs">
                <span>Criar em folha em branco</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Existing dynamic template options in store */}
            {templates.map(tmpl => (
              <div 
                key={tmpl.id}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-accent shadow-sm p-5 cursor-pointer hover:bg-slate-50 transition-all flex flex-col justify-between"
                onClick={() => handleChooseTemplate(tmpl.id)}
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <FileCode size={20} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{tmpl.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-primary font-semibold text-xs">
                  <span>Usar este modelo {`(${tmpl.fields.length} variáveis)`}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          PASSO 2: PREENCHER E EDITAR ESTILO WORD
          ========================================== */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Form parameters inputs - Left side */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-6 space-y-4 shadow-sm border border-slate-150">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Dados Fiscais / Globais</h3>
                <span className="text-[10px] bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  {selectedTemplateId ? 'Template ativo' : 'Papel Livre'}
                </span>
              </div>

              {/* Core Shared Form Fields */}
              <Input 
                label="Título do Documento" 
                placeholder="Ex: Consultoria Hidráulica Bela Vista" 
                {...register('title')} 
                error={errors.title?.message}
              />

              <Input 
                label="Parte Relacionada (Contratada / Fornecedor)" 
                placeholder="Ex: ABC Engenharia Ltda" 
                {...register('relatedParty')} 
                error={errors.relatedParty?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Tipo de Contrato"
                  options={Object.values(ContractType).map(t => ({ label: t, value: t }))}
                  {...register('type')}
                />
                
                <Input 
                  label="Valor Global do Contrato (R$)" 
                  type="number"
                  placeholder="Ex: 50000"
                  {...register('value', { valueAsNumber: true })} 
                  error={errors.value?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Data Início" 
                  type="date" 
                  {...register('startDate')} 
                  error={errors.startDate?.message}
                />
                <Input 
                  label="Data Encerramento" 
                  type="date" 
                  {...register('endDate')} 
                  error={errors.endDate?.message}
                />
              </div>
            </Card>

            {/* Template dynamic fields rendered if any */}
            {chosenTemplate && chosenTemplate.fields.length > 0 && (
              <Card className="p-5 space-y-4 border border-slate-150">
                <h4 className="font-semibold text-slate-850 text-xs text-left uppercase tracking-wider text-accent border-b border-slate-100 pb-2">
                  Campos Personalizados do Modelo
                </h4>
                {chosenTemplate.fields.map(f => (
                  <div key={f.id} className="space-y-1 text-left">
                    <label className="block text-xs font-semibold text-slate-700">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder={f.placeholder || ''}
                      required={f.required}
                      value={dynamicValues[f.key] || ''}
                      onChange={(e) => handleDynamicChange(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </Card>
            )}

            {/* Helpful quick guide clause references */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 border border-slate-800 text-xs">
              <h5 className="font-bold flex items-center gap-1.5 text-slate-100 uppercase tracking-wider text-[10px]">
                <Sparkles size={14} className="text-amber-500" /> Sincronização Inteligente
              </h5>
              <p className="leading-relaxed text-slate-300 font-medium">
                À medida que você preenche os campos do formulário à esquerda, o documento à direita é construído automaticamente!
              </p>
              <p className="leading-relaxed text-slate-400 font-normal">
                Se desejar alterar ou incluir alguma linha personalizada, basta **clicar e começar a digitar** diretamente na folha branca do Word!
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex items-center gap-1 text-xs" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Voltar Modelo
              </Button>
              <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center gap-1 text-xs">
                Revisar Documento <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: INTERACTIVE WORD WORKSPACE SHEET */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between select-none">
              <h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <FileText size={14} className="text-primary" /> Minuta Jurídica (Simulador Microsoft Word)
              </h4>
              
              <div className="flex items-center gap-2">
                {hasEditedContent && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-semibold uppercase tracking-wider">
                    Modo Customizado Ativo
                  </span>
                )}
                
                <button
                  type="button"
                  onClick={handleResetContent}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  title="Reseta todas as suas edições livres de volta para os campos dinâmicos do formulário"
                >
                  <RefreshCw size={12} /> Resetar Alterações
                </button>
              </div>
            </div>

            {/* Elegant physical paper card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-visible shadow-lg">
              
              {/* Simple layout WYSIWYG formatting toolbar */}
              <div className="bg-slate-50 border-b border-slate-150 p-2 flex flex-wrap gap-1 items-center justify-start rounded-t-xl select-none">
                <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded transition-colors"
                    title="Negrito"
                  >
                    <Bold size={13} className="font-bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded transition-colors"
                    title="Itálico"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('underline')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded transition-colors"
                    title="Sublinhado"
                  >
                    <Underline size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={() => applyFormat('justifyLeft')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded"
                    title="Alinhar à Esquerda"
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('justifyCenter')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded"
                    title="Centralizar"
                  >
                    <AlignCenter size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('justifyRight')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded"
                    title="Alinhar à Direita"
                  >
                    <AlignRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('justifyFull')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded"
                    title="Justificar"
                  >
                    <AlignJustify size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={() => applyFormat('insertUnorderedList')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded"
                    title="Lista com Marcadores"
                  >
                    <List size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('insertOrderedList')}
                    className="p-1.5 text-slate-700 hover:bg-slate-105 rounded"
                    title="Lista Numérica"
                  >
                    <ListOrdered size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-xs text-xs">
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', 'p')}
                    className="px-2 py-0.5 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-semibold"
                  >
                    Parágrafo
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('formatBlock', 'h3')}
                    className="px-2 py-0.5 text-slate-700 hover:bg-slate-100 rounded text-[11px] font-bold"
                  >
                    Cláusula
                  </button>
                </div>

                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-400 font-bold tracking-wider px-2 py-1 rounded ml-auto">
                  FOLHA A4 INTERATIVA
                </span>
              </div>

              {/* Real-time ContentEditable document paper sheet simulating A4 padding */}
              <div className="bg-slate-150/40 p-6 flex justify-center outline-none">
                <div 
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full max-w-[800px] bg-white min-h-[640px] shadow-sm border border-slate-250 p-10 md:p-12 text-xs text-slate-800 leading-relaxed font-serif outline-none tracking-normal prose prose-sm focus:ring-1 focus:ring-primary rounded-lg text-left"
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  onInput={(e) => {
                    setHasEditedContent(true);
                    setEditorContent(e.currentTarget.innerHTML);
                  }}
                  onBlur={() => {
                    saveSelection();
                    if (editorRef.current) {
                      setEditorContent(editorRef.current.innerHTML);
                    }
                  }}
                />
              </div>

              <div className="p-3 bg-slate-50 text-[10px] text-slate-400 font-semibold italic text-center rounded-b-xl border-t border-slate-150 select-none">
                Edite o termo livremente para ajustar cláusulas de última hora.
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ==========================================
          PASSO 3: REVISAR E SALVAR
          ========================================== */}
      {step === 3 && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <Card className="p-6 bg-slate-50 border border-slate-200 flex items-start gap-4">
            <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm">Contrato gerado com sucesso!</h3>
              <p className="text-xs text-slate-500">
                Abaixo está a visualização consolidada do documento. Você pode salvá-lo como um rascunho offline para edições futuras ou enviá-lo diretamente à fila de assinaturas eletrônicas.
              </p>
            </div>
          </Card>

          {/* Visualized final sheet */}
          <div className="bg-white border-2 border-slate-300 rounded-xl p-10 font-serif max-h-[500px] overflow-y-auto shadow-xl bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')]">
            <div dangerouslySetInnerHTML={{ __html: editorContent || renderPreviewHtml() }} />
          </div>

          <Card className="p-6 border border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm mb-4">Configuração de Assinatura</h4>
            <div className="space-y-4">
              <Select
                label="Canal de Envio do Link de Assinatura"
                value={signatureChannel}
                onChange={(e) => setSignatureChannel(e.target.value as SignatureChannel)}
                options={[
                  { label: 'Envio do link de assinatura por e-mail', value: SignatureChannel.EMAIL },
                  { label: 'Envio via WhatsApp (link)', value: SignatureChannel.WHATSAPP },
                  { label: 'Ambos (E-mail e WhatsApp)', value: SignatureChannel.AMBOS }
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(signatureChannel === SignatureChannel.EMAIL || signatureChannel === SignatureChannel.AMBOS) && (
                  <Input
                    label="E-mail do Destinatário"
                    placeholder="exemplo@empresa.com"
                    value={signatureEmail}
                    onChange={(e) => setSignatureEmail(e.target.value)}
                  />
                )}
                {(signatureChannel === SignatureChannel.WHATSAPP || signatureChannel === SignatureChannel.AMBOS) && (
                  <Input
                    label="WhatsApp do Destinatário"
                    placeholder="(11) 99999-9999"
                    value={signaturePhone}
                    onChange={(e) => setSignaturePhone(e.target.value)}
                  />
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" className="flex items-center gap-1 text-xs" onClick={() => setStep(2)}>
              <ChevronLeft size={16} /> Modificar dados
            </Button>
            
            <Button variant="success" className="flex items-center gap-1.5 text-xs" onClick={() => handleFinalSave(ContractStatus.RASCUNHO)}>
              Salvar em Rascunho
            </Button>
            
            <Button variant="primary" className="flex items-center gap-1.5 text-xs" onClick={() => handleFinalSave(ContractStatus.AGUARDANDO)}>
              <PenTool size={16} /> Assinar e Emitir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractFormPage;
