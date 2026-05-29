import { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../store';
import { ContractType, ContractTemplateField } from '../../types';
import { Card, Button, Input, Textarea, Select } from '../../components/ui';
import { 
  FileCode, 
  Plus, 
  Trash2, 
  Edit2, 
  Variable, 
  MoveUp, 
  MoveDown, 
  BookOpen,
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
  HelpCircle,
  FileText,
  Code,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

// Classical, high-grade ready clauses presets for corporate contracts
const PRESET_CLAUSES = [
  {
    title: 'Objeto do Contrato',
    content: '<h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #0f172a;">CLÁUSULA PRIMEIRA - OBJETO</h3><p>O presente instrumento tem por objeto a prestação de serviços técnicos especializados de engenharia civil, conforme especificações operativas e cronograma de obras acordados mutuamente.</p>'
  },
  {
    title: 'Cláusula de Foro e Resolução',
    content: '<h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #0f172a;">CLÁUSULA - FORO ELEITO</h3><p>Fica eleito o Foro da Comarca de São Paulo/SP para dirimir litígios oriundos do presente instrumento, com expressa exclusão e renúncia a qualquer outro, por mais privilegiado que se apresente.</p>'
  },
  {
    title: 'Rescisão por Comunicação',
    content: '<h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #0f172a;">CLÁUSULA - RESCISÃO AMIGÁVEL</h3><p>O presente contrato de adesão poderá ser rescindido imotivadamente por qualquer das duas partes pactuantes, mediante notificação por escrito enviada com antecedência mínima de 30 (trinta) dias úteis.</p>'
  },
  {
    title: 'Segredo de Negócio & Sigilo',
    content: '<h3 style="font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; color: #0f172a;">CLÁUSULA - CONFIDENCIALIDADE</h3><p>As partes obrigam-se mutuamente a manter em caráter de absoluto sigilo todas as metodologias operacionais, relatórios de vistorias técnicas e dados financeiros envolvidos nesta obra técnica.</p>'
  },
  {
    title: 'Multa e Juros por Atraso',
    content: '<p><em>Parágrafo Único:</em> O atraso injustificado no cumprimento das metas fiscais ou cronogramas de entrega ensejará multa moratória de 2% (dois por cento) capitalizada diariamente sobre o saldo saldo remanescente.</p>'
  },
  {
    title: 'Área de Assinaturas (Bloco Duplo)',
    content: '<div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 12px; font-family: sans-serif;"><div style="border-top: 1.5px solid #94a3b8; padding-top: 8px; text-align: center; color: #334155;"><p><strong>REPRESENTANTE EMITENTE</strong><br/>{{empresa_contratante}}</p></div><div style="border-top: 1.5px solid #94a3b8; padding-top: 8px; text-align: center; color: #334155;"><p><strong>PARTE CONTRATADA</strong><br/>{{parte_relacionada}}</p></div></div>'
  }
];

export const TemplateListPage = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useAppState();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Core Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<ContractType>(ContractType.SERVICO);
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [fields, setFields] = useState<ContractTemplateField[]>([]);

  // Search filter terms
  const [searchTerm, setSearchTerm] = useState('');

  // Editor screen options
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  // New field builder states
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'select' | 'signature'>('text');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');

  // Refs for WYSIWYG selection tracking
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Initialize content editable on mount/template transition
  useEffect(() => {
    if (isCreating && editorRef.current && editorMode === 'visual') {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [isCreating, editingId, editorMode]);

  // Keep selection range saved whenever user types or clicks inside the editor sheet
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      try {
        const range = sel.getRangeAt(0);
        // Only save if selection lives within the editor sheet
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      } catch (e) {
        // Safe catch on initial ranges
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

  // Perform basic browser text formatting
  const applyFormat = (command: string, value: string = '') => {
    restoreSelection();
    document.execCommand(command, false, value);
    // Sync back modified HTML
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  // Safe insertion of string code tokens or raw tag blocks at the user's cursor
  const insertToken = (html: string) => {
    restoreSelection();
    
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      // Append to bottom if cursor state is lost
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
        setHtmlContent(editorRef.current.innerHTML);
        toast.success('Inserido no final do texto (cursor não estava posicionado)');
      }
      return;
    }

    try {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      
      const div = document.createElement('div');
      div.innerHTML = html;
      
      const fragment = document.createDocumentFragment();
      let node: Node | null;
      let lastNode: Node | null = null;
      
      while ((node = div.firstChild)) {
        lastNode = fragment.appendChild(node);
      }
      
      range.insertNode(fragment);
      
      if (lastNode) {
        const newRange = range.cloneRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    } catch (e) {
      // If native insertion fails slightly, just fallback to direct append
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
      }
    }

    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const handleEdit = (tmplId: string) => {
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      setEditingId(tmplId);
      setName(tmpl.name);
      setType(tmpl.type);
      setDescription(tmpl.description);
      setHtmlContent(tmpl.htmlContent);
      setFields(tmpl.fields || []);
      setIsCreating(true);
      setEditorMode('visual');
    }
  };

  const handleAddField = () => {
    if (!fieldLabel || !fieldKey) {
      toast.error('Informe rótulo e chave da variável (Ex: Matrícula, matricula_func)');
      return;
    }
    
    const sanitizedKey = fieldKey.trim().toLowerCase().replace(/\s+/g, '_');

    const newField: ContractTemplateField = {
      id: `field-${Date.now()}`,
      label: fieldLabel,
      key: sanitizedKey,
      type: fieldType,
      required: true,
      placeholder: fieldPlaceholder
    };

    setFields([...fields, newField]);
    setFieldLabel('');
    setFieldKey('');
    setFieldPlaceholder('');
    toast.success(`Variável {{${sanitizedKey}}} criada com sucesso!`);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    toast.success('Variável opcional removida.');
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const nextFields = [...fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const temp = nextFields[index];
    nextFields[index] = nextFields[targetIdx];
    nextFields[targetIdx] = temp;
    setFields(nextFields);
  };

  const handleSave = () => {
    if (!name || !htmlContent) {
      toast.error('Preencha o Nome e o Corpo do contrato!');
      return;
    }

    if (editingId) {
      updateTemplate(editingId, {
        name,
        type,
        description,
        htmlContent,
        fields
      });
      toast.success('Template homologado atualizado com sucesso!');
    } else {
      addTemplate({
        name,
        type,
        description,
        htmlContent,
        fields
      });
      toast.success('Novo template adicionado à biblioteca!');
    }

    setIsCreating(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setHtmlContent('');
    setFields([]);
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center justify-between text-left">
        <div>
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode className="text-primary w-6 h-6" /> Biblioteca de Templates
          </h1>
          <p className="text-sm text-slate-500 font-medium">Controle e edição simplificada em formato Word para minutas dinâmicas.</p>
        </div>
        {!isCreating && (
          <Button variant="primary" className="flex items-center gap-1.5 text-xs text-right" onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setName('');
            setDescription('');
            setHtmlContent('<h2 style="text-align:center; font-size: 20px; color: #1e3a5f;">{{titulo_contrato}}</h2>\n<p>Este instrumento regula os termos entre as partes abaixo descritas...</p>');
            setFields([]);
            setEditorMode('visual');
          }}>
            <Plus size={16} /> Novo Template
          </Button>
        )}
      </div>

      {isCreating ? (
        /* Dynamic Word-Like Interactive Workspace Template Constructor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* LEFT SIDEBAR: CORE DATA & VARIABLES FORM */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Standard Details Card */}
            <Card className="p-5 space-y-4 border border-slate-150">
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Informações Básicas</h3>
              
              <Input 
                label="Título da Matriz" 
                placeholder="Ex: Prestação de Consultoria de Segurança" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Select
                label="Tipo de Contrato"
                options={Object.values(ContractType).map(t => ({ label: t, value: t }))}
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              />
              
              <Input 
                label="Finalidade / Breve Descrição"
                placeholder="Descreva a aplicação para os operadores"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Card>

            {/* Custom Variables Builder */}
            <Card className="p-5 space-y-4 border border-slate-150">
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Variable size={14} className="text-amber-500" /> Variáveis Personalizadas (Formulário)
              </h3>
              
              <p className="text-[11px] text-slate-500 leading-normal">
                Adicione perguntas que o operador precisará preencher ao usar este template. 
                Ex: <code>"Crea do Responsável"</code> &rarr; <code>crea_registro</code>.
              </p>

              <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Input 
                  label="Rotulo (Dica Visível)" 
                  placeholder="Ex: Matrícula Órgão" 
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    label="Nome da Chave (sem espaços)" 
                    placeholder="Ex: matricula_orgao" 
                    value={fieldKey}
                    onChange={(e) => setFieldKey(e.target.value)}
                  />
                  <Select
                    label="Tipo de Entrada"
                    options={[
                      { label: 'Texto Único', value: 'text' },
                      { label: 'Número', value: 'number' },
                      { label: 'Data', value: 'date' },
                      { label: 'Assinatura', value: 'signature' }
                    ]}
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                  />
                </div>

                <Input 
                  label="Mensagem de ajuda" 
                  placeholder="Insera o registro"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                />

                <Button type="button" variant="secondary" onClick={handleAddField} className="w-full text-xs py-1">
                  + Cadastrar Variável
                </Button>
              </div>

              {/* Added Custom Variables List */}
              <div className="space-y-1.5 pt-1">
                {fields.length > 0 && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordem de Preenchimento:</p>}
                {fields.map((f, index) => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-white text-xs">
                    <div className="truncate">
                      <span className="font-semibold text-slate-700 block truncate">{f.label}</span>
                      <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-amber-600 font-mono font-bold">{`{{${f.key}}}`}</code>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-35">
                        <MoveUp size={12} />
                      </button>
                      <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-35">
                        <MoveDown size={12} />
                      </button>
                      <button onClick={() => handleRemoveField(f.id)} className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Variable Injector Badge Panel */}
            <Card className="p-5 space-y-4 border border-slate-150 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Injetar Variáveis na Escrita</h3>
              <p className="text-[11px] text-slate-500">Dê um clique em qualquer variável listada abaixo para injetá-la no local onde seu cursor estiver digitando!</p>
              
              <div className="space-y-3">
                {/* System fields */}
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Variáveis Globais do Sistema:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'titulo_contrato', label: 'Título do Contrato' },
                      { key: 'empresa_contratante', label: 'Emitente' },
                      { key: 'cnpj_contratante', label: 'CNPJ Emitente' },
                      { key: 'parte_relacionada', label: 'Prestador/Contratada' },
                      { key: 'valor_total', label: 'Valor Global' },
                      { key: 'data_inicio', label: 'Vigência Início' },
                      { key: 'data_fim', label: 'Vigência Término' },
                    ].map(v => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => insertToken(`{{${v.key}}}`)}
                        className="px-2 py-1 bg-blue-50 text-primary-light hover:bg-primary hover:text-white rounded text-[11px] font-medium font-mono border border-blue-100 transition-colors"
                        title="Injetar no cursor"
                      >
                        {`{{${v.key}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom User variables */}
                {fields.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Variáveis que Você Criou:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {fields.map(v => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => insertToken(`{{${v.key}}}`)}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded text-[11px] font-medium font-mono border border-amber-100 transition-colors"
                          title="Injetar no cursor"
                        >
                          {`{{${v.key}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Templates clauses presets list */}
            <Card className="p-5 space-y-4 border border-slate-150">
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-105 pb-2">Cláusulas Prontas (Padrão corporativo)</h3>
              <p className="text-[11px] text-slate-500">Economize digitação! Clique em qualquer cláusula pronta para inseri-la instantaneamente no contrato:</p>
              
              <div className="space-y-1">
                {PRESET_CLAUSES.map((pc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertToken(pc.content)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 flex items-center justify-between border border-transparent hover:border-slate-200 group"
                  >
                    <span className="truncate">{pc.title}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-primary transition-colors">&rarr; Inserir</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: CORE INTERACTIVE SHEET EDITOR */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Main Editor Console with word toolbar and visual contentEditable */}
            <Card className="border border-slate-200 overflow-visible">
              
              {/* Header and Editor Mode Switch */}
              <div className="bg-slate-900 text-white px-5 py-3 border-b border-slate-800 flex items-center justify-between rounded-t-xl select-none">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold font-display uppercase tracking-widest text-slate-300">Editor Editor de Minutas</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Modo visual simulador Microsoft Word</span>
                  </div>
                </div>
                
                {/* Switcher tabs */}
                <div className="bg-slate-850 p-1 rounded-lg flex items-center gap-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditorMode('visual')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      editorMode === 'visual' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye size={13} /> Visual (Word)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('html')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      editorMode === 'html' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code size={13} /> Código HTML
                  </button>
                </div>
              </div>

              {/* Advanced WYSIWYG Toolbar */}
              {editorMode === 'visual' && (
                <div className="bg-slate-50 border-b border-slate-150 p-2.5 flex flex-wrap gap-1.5 select-none items-center shadow-sm">
                  
                  {/* Style formats buttons */}
                  <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => applyFormat('bold')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Negrito (B)"
                    >
                      <Bold size={14} className="font-bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('italic')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Itálico (I)"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('underline')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded transition-colors"
                      title="Sublinhado (U)"
                    >
                      <Underline size={14} />
                    </button>
                  </div>

                  {/* Document Alignments buttons */}
                  <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => applyFormat('justifyLeft')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Alinhar à Esquerda"
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('justifyCenter')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Centralizar"
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('justifyRight')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Alinhar à Direita"
                    >
                      <AlignRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('justifyFull')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Justificar"
                    >
                      <AlignJustify size={14} />
                    </button>
                  </div>

                  {/* Document Block Paragraph Structures */}
                  <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => applyFormat('formatBlock', 'p')}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
                      title="Texto Base Parágrafo"
                    >
                      Texto normal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('formatBlock', 'h2')}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold"
                      title="Título de Seção h2"
                    >
                      Título 1
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('formatBlock', 'h3')}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold"
                      title="Subtítulo Seção h3"
                    >
                      Título 2
                    </button>
                  </div>

                  {/* Lists */}
                  <div className="flex items-center gap-0.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => applyFormat('insertUnorderedList')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Lista Marcada"
                    >
                      <List size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('insertOrderedList')}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                      title="Lista Numérica"
                    >
                      <ListOrdered size={14} />
                    </button>
                  </div>

                  {/* Helpful Quick Tip Label */}
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-auto bg-slate-100 px-2 py-1 rounded">
                    Sua folha Word inteligente
                  </span>
                </div>
              )}

              {/* The Editable workspace Area */}
              <div className="bg-slate-100/50 p-6 flex justify-center outline-none min-h-[600px] border-b border-slate-150">
                {editorMode === 'visual' ? (
                  /* SIMULATED A4 PHYSICAL WORD PAPER CANVAS SHEET */
                  <div 
                    key={editingId || 'new-editor'}
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full max-w-[800px] bg-white min-h-[750px] shadow-lg border border-slate-250 p-12 md:p-14 text-sm text-slate-800 leading-relaxed font-serif outline-none tracking-normal prose prose-slate focus:ring-1 focus:ring-primary rounded-lg text-left"
                    onKeyUp={saveSelection}
                    onMouseUp={saveSelection}
                    onInput={(e) => {
                      setHtmlContent(e.currentTarget.innerHTML);
                    }}
                    onBlur={() => {
                      saveSelection();
                      if (editorRef.current) {
                        setHtmlContent(editorRef.current.innerHTML);
                      }
                    }}
                  />
                ) : (
                  /* HTML source code block adjustment */
                  <div className="w-full max-w-[800px] bg-slate-900 border border-slate-950 p-5 rounded-lg shadow-inner">
                    <p className="text-[11px] text-cyan-400 font-mono mb-2">Editor Avançado de Fonte HTML:</p>
                    <textarea
                      className="w-full h-[620px] bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-slate-800"
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="Estrutura de código legal do contrato..."
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons row footer */}
              <div className="p-4 bg-slate-50 flex items-center justify-between gap-2 border-t border-slate-150 rounded-b-xl">
                <span className="text-[11px] text-slate-400 font-semibold italic">Salvamento local em nuvem homologada</span>
                <div className="flex gap-2 text-right">
                  <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={handleSave}>
                    Homologar e Salvar Template
                  </Button>
                </div>
              </div>

            </Card>

            {/* Quick Word Helper details tipbox */}
            <div className="bg-emerald-50 text-emerald-900 p-4 border border-emerald-150 rounded-xl flex items-start gap-3">
              <Sparkles size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-left">
                <h5 className="font-bold">Escrever minutas ficou muito mais fácil!</h5>
                <p className="mt-1 leading-normal text-emerald-800 font-medium">
                  Você não precisa mexer em códigos HTML complicados. Basta digitar livremente na folha branca como se estivesse no Word! 
                  Use o menu de formatação para destacar títulos e textos, clique nas variáveis na barra lateral para injetá-las e clique nas cláusulas completas prontas para compor seu contrato jurídico instantaneamente.
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Templates Grid List View with Live Search bar client-side */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Pesquisar por título, descrição ou tipo de contrato..."
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-xs text-rose-600 font-semibold hover:underline shrink-0"
              >
                Limpar pesquisa
              </button>
            )}

            <div className="text-xs text-slate-400 font-medium">
              Mostrando {templates.filter(t => {
                const q = searchTerm.toLowerCase();
                return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
              }).length} de {templates.length} templates
            </div>
          </div>

          {templates.filter(t => {
            const q = searchTerm.toLowerCase();
            return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
          }).length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 py-12 px-6 text-center text-slate-500">
              <p className="font-semibold text-slate-700">Nenhum template encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Refine seus termos de pesquisa ou crie um novo template.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(tmpl => {
                const q = searchTerm.toLowerCase();
                return (
                  tmpl.name.toLowerCase().includes(q) ||
                  tmpl.description.toLowerCase().includes(q) ||
                  tmpl.type.toLowerCase().includes(q)
                );
              }).map(tmpl => (
                <div key={tmpl.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary">
                        <FileCode size={20} />
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase">
                        {tmpl.type}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-base mt-4">{tmpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
                    
                    {/* Embedded fields count badge */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono bg-blue-50 text-primary font-semibold px-2 py-0.5 rounded">
                        {tmpl.fields?.length || 0} variáveis do formulário
                      </span>
                      <span>ID: {tmpl.id}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 justify-end border-t border-slate-50 pt-3">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setDeleteConfirmId(tmpl.id)}>
                      <Trash2 size={12} /> Excluir
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => handleEdit(tmpl.id)}>
                      <Edit2 size={12} /> Editar Matriz
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (() => {
        const tmpl = templates.find(t => t.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 max-w-md w-full mx-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Excluir Template</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Tem certeza que deseja excluir o template <strong className="text-slate-800">"{tmpl?.name}"</strong>? 
                Os contratos já criados com este template não serão afetados.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancelar</Button>
                <Button
                  variant="primary"
                  className="bg-rose-600 hover:bg-rose-700 border-rose-600"
                  onClick={() => {
                    deleteTemplate(deleteConfirmId);
                    setDeleteConfirmId(null);
                    toast.success('Template excluído com sucesso.');
                  }}
                >
                  <Trash2 size={14} className="mr-1" /> Confirmar Exclusão
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TemplateListPage;
