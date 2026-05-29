import { useState } from 'react';
import { useAppState } from '../../store';
import { Card, Button, StatusBadge, Input, Select, EmptyState, Textarea } from '../../components/ui';
import { ShoppingCart, Plus, Eye, Printer, FileText, Check, Send, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OCItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export const POListPage = () => {
  const { purchaseOrders, addPurchaseOrder, approvePurchaseOrder, sendPurchaseOrderToProvider, updatePurchaseOrderStatus, obras, company, user } = useAppState();

  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

  // Filter States
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterObra, setFilterObra] = useState('ALL');

  // Creation Form States
  const [obraId, setObraId] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerCnpj, setProviderCnpj] = useState('');
  const [payerCnpj, setPayerCnpj] = useState(company.cnpj);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Dynamic line items listing
  const [items, setItems] = useState<OCItemInput[]>([
    { description: 'Brita Nº 1 Usinada', quantity: 15, unit: 'm³', unitPrice: 120 }
  ]);

  // Active PO check
  const activePO = purchaseOrders.find(po => po.id === selectedPOId);

  // Filters calculation
  const filteredPOs = purchaseOrders.filter(po => {
    const statusMatch = filterStatus === 'ALL' || po.status === filterStatus;
    const obraMatch = filterObra === 'ALL' || po.obraId === filterObra;
    return statusMatch && obraMatch;
  });

  // Dynamic row addition
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'unidade', unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error('A ordem de compra precisa de ao menos 1 item!');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OCItemInput, value: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
        };
      }
      return item;
    });
    setItems(updated);
  };

  // Submit PO
  const handleSavePO = () => {
    if (!obraId || !providerName || !deliveryDate) {
      toast.error('Preencha os dados da obra, fornecedor e data de entrega!');
      return;
    }

    const matchedObra = obras.find(o => o.id === obraId);
    if (!matchedObra) return;

    // Map item totalPrices
    const formattedItems = items.map((item, index) => ({
      id: `item-${index}-${Date.now()}`,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    }));

    addPurchaseOrder({
      obraId,
      obraName: matchedObra.name,
      providerName,
      providerCnpj,
      payerCnpj,
      items: formattedItems,
      deliveryDate,
      notes,
      discount: 0,
      taxes: 0,
      status: 'Rascunho'
    });

    toast.success('Nota de compra criada em Rascunho!');
    setView('list');

    // Reset Creation values
    setObraId('');
    setProviderName('');
    setProviderCnpj('');
    setDeliveryDate('');
    setNotes('');
    setItems([{ description: 'Brita Nº 1 Usinada', quantity: 15, unit: 'm³', unitPrice: 120 }]);
  };

  // Approval flow acts
  const handleApprove = (id: string) => {
    approvePurchaseOrder(id);
    toast.success('Ordem de Compra Aprovada! Saldo debitado do orçamento da obra.');
  };

  const handleSendToProvider = (id: string) => {
    sendPurchaseOrderToProvider(id);
    toast.success('Ordem redirecionada ao fornecedor por e-mail.');
  };

  return (
    <div className="space-y-6">
      {/* Title Header area */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center gap-1.5">
            <ShoppingCart className="text-primary w-6 h-6" /> Suprimentos & Ordens de Compra
          </h1>
          <p className="text-sm text-slate-500 font-medium">Controle de insumos, cotações de fornecedores e aprovações orçamentárias.</p>
        </div>
        {view === 'list' && (
          <Button variant="primary" className="flex items-center gap-1" onClick={() => setView('create')}>
            <Plus size={16} /> Emitir Ordem (OC)
          </Button>
        )}
      </div>

      {/* ==========================================
          SCREEN 1: LISTING & FILTERS VIEW
          ========================================== */}
      {view === 'list' && (
        <div className="space-y-6">
          {/* Filters shelf */}
          <Card className="p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Filtrar por Status"
                options={[
                  { label: 'Todos os Status', value: 'ALL' },
                  { label: 'Rascunho', value: 'Rascunho' },
                  { label: 'Pendente Aprovação', value: 'Pendente Aprovação' },
                  { label: 'Aprovado', value: 'Aprovado' },
                  { label: 'Enviado Fornecedor', value: 'Enviado Fornecedor' }
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />

              <Select
                label="Filtrar por Obra"
                options={[
                  { label: 'Todas as Obras', value: 'ALL' },
                  ...obras.map(o => ({ label: o.name, value: o.id }))
                ]}
                value={filterObra}
                onChange={(e) => setFilterObra(e.target.value)}
              />
            </div>
          </Card>

          {/* Table display */}
          {filteredPOs.length === 0 ? (
            <EmptyState message="Nenhuma Ordem de Compra identificada sob estes filtros de suprimento." />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Código / ID</th>
                      <th className="px-5 py-3">Obra Destino</th>
                      <th className="px-5 py-3">Fornecedor</th>
                      <th className="px-5 py-3 text-right">Valor Líquido</th>
                      <th className="px-5 py-3">Data Entrega</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPOs.map(po => (
                      <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-slate-600 font-mono text-xs">{po.id}</td>
                        <td className="px-5 py-3 font-semibold text-slate-700 text-xs truncate max-w-[170px]">{po.obraName}</td>
                        <td className="px-5 py-3 text-slate-600">{po.providerName}</td>
                        <td className="px-5 py-3 font-bold text-slate-900 font-mono text-right">
                          R$ {po.total.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs font-mono">{po.deliveryDate}</td>
                        <td className="px-5 py-3">
                          <StatusBadge status={po.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button 
                              onClick={() => {
                                setSelectedPOId(po.id);
                                setView('detail');
                              }}
                              className="p-1 px-1.5 text-slate-500 hover:text-accent hover:bg-slate-50 rounded transition-colors"
                              title="Visualizar Ficha"
                            >
                              <Eye size={15} />
                            </button>

                            {po.status === 'Rascunho' && (
                              <button 
                                onClick={() => handleApprove(po.id)}
                                className="p-1 px-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                                title="Aprovar Diretamente"
                              >
                                <Check size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ==========================================
          SCREEN 2: CREATION FORM WITH DYNAMIC ROWS
          ========================================== */}
      {view === 'create' && (
        <Card className="p-6 text-left space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm">Registrar Nova Ordem de Compra</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unidade Suprimentos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              label="Obra Destinatária"
              options={[
                { label: 'Selecione a Obra...', value: '' },
                ...obras.map(o => ({ label: o.name, value: o.id }))
              ]}
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
            />

            <Input 
              label="Nome Fantasia do Fornecedor" 
              placeholder="Ex: Gerdau Aços Brasil" 
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />

            <Input 
              label="CNPJ do Fornecedor" 
              placeholder="Ex: 01.203.405/0001-88" 
              value={providerCnpj}
              onChange={(e) => setProviderCnpj(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="CNPJ Pagador (Sua Matriz)" 
              disabled
              value={payerCnpj}
            />

            <Input 
              label="Data de Entrega Limite no Canteiro" 
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>

          {/* Dynamic items sub-form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h4 className="font-bold text-slate-800 text-xs uppercase text-accent">Itens da Ordem de Compra</h4>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-[10px]" onClick={handleAddItem}>
                Adicionar Linha
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5 text-left">
                    <Input 
                      label={idx === 0 ? "Descrição Breve do Item" : undefined}
                      placeholder="Ex: Revestimento Porcelanato Eliane" 
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 text-left">
                    <Input 
                      label={idx === 0 ? "Qtd" : undefined} 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 text-left">
                    <Input 
                      label={idx === 0 ? "Unidade" : undefined} 
                      placeholder="Ex: saca, m², m³" 
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 text-left">
                    <Input 
                      label={idx === 0 ? "Preço Unit. (R$)" : undefined} 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1 text-center py-2">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea 
            label="Condições Especiais / Observações" 
            placeholder="Especificações de descarga, desvios ou embalagens..." 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-2 justify-end pt-3">
            <Button variant="secondary" onClick={() => setView('list')}>Cancelar</Button>
            <Button variant="primary" onClick={handleSavePO}>Emitir Suprimento</Button>
          </div>
        </Card>
      )}

      {/* ==========================================
          SCREEN 3: DETAILED FORMATTED PRINT SHEET VIEW
          ========================================== */}
      {view === 'detail' && activePO && (
        <div className="space-y-6">
          <div className="flex gap-2 justify-between items-center bg-slate-50 border border-slate-250 rounded-xl p-4">
            <Button variant="secondary" onClick={() => setView('list')}>Voltar para Lista</Button>
            
            <div className="flex items-center gap-2">
              {user?.role === 'Admin' && (
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
                  <span className="text-xs font-semibold text-slate-500">Forçar Status:</span>
                  <select
                    className="text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                    value={activePO.status}
                    onChange={(e) => {
                      updatePurchaseOrderStatus(activePO.id, e.target.value as any);
                      toast.success(`Status alterado administrativamente para: ${e.target.value}`);
                    }}
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Pendente Aprovação">Pendente Aprovação</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Enviado Fornecedor">Enviado Fornecedor</option>
                  </select>
                </div>
              )}

              <Button variant="secondary" className="flex items-center gap-1" onClick={() => {
                const printContent = document.getElementById('printable-po-area')?.innerHTML;
                const win = window.open('', '_blank');
                if (win && printContent) {
                  win.document.write(`
                    <html>
                    <head><title>Ordem de Compra ${activePO.id}</title></head>
                    <body style="font-family:sans-serif; padding:30px;">${printContent}</body>
                    </html>
                  `);
                  win.document.close();
                  win.print();
                }
              }}>
                <Printer size={15} /> Imprimir Comprovante
              </Button>

              {activePO.status === 'Rascunho' && (
                <Button variant="success" className="flex items-center gap-1" onClick={() => handleApprove(activePO.id)}>
                  <Check size={14} /> Aprovar Ordem
                </Button>
              )}

              {activePO.status === 'Aprovado' && (
                <Button variant="primary" className="flex items-center gap-1" onClick={() => handleSendToProvider(activePO.id)}>
                  <Send size={14} /> Enviar p/ Fornecedor
                </Button>
              )}
            </div>
          </div>

          {/* Official styled Printable area sheet */}
          <div id="printable-po-area">
            <Card className="p-8 bg-white border border-slate-250 rounded-xl text-left font-sans space-y-6 max-w-4xl mx-auto shadow-lg bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')] justify-between">
              
              {/* Fake header corporate design */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-slate-800">CONSTRUCTORA SÓLIDA LTDA</h3>
                  <p className="text-xs text-slate-400">CNPJ Pagador: {activePO.payerCnpj}</p>
                  <p className="text-xs text-slate-400">Unidade Suprimentos e Almoxarifado Central</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-primary text-white font-bold font-mono px-2 py-0.5 rounded uppercase leading-none">
                    ORDEM DE COMPRA {activePO.id}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 font-semibold">Status: {activePO.status}</p>
                </div>
              </div>

              {/* Work entity & Provider details info blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px]">Destino de Entrega (Obra)</h4>
                  <p className="font-semibold text-slate-900">{activePO.obraName}</p>
                  <p>Prazo Limite para descarga: <strong>{activePO.deliveryDate}</strong></p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px]">Fornecedor Contratado</h4>
                  <p className="font-semibold text-slate-900">{activePO.providerName}</p>
                  <p>CNPJ: {activePO.providerCnpj}</p>
                </div>
              </div>

              {/* Items Grid */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase border-b border-slate-100 pb-1 mr-2">Especificação de Insumos</h4>
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Insumo / Descrição Técnica</th>
                      <th className="px-3 py-2 text-center">Unidade</th>
                      <th className="px-3 py-2 text-center">Quantidade</th>
                      <th className="px-3 py-2 text-right">Preço Unitário</th>
                      <th className="px-3 py-2 text-right">Preço Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePO.items.map(item => (
                      <tr key={item.id} className="text-slate-800 font-sans">
                        <td className="px-3 py-3 font-semibold text-slate-900">{item.description}</td>
                        <td className="px-3 py-3 text-center text-slate-500">{item.unit}</td>
                        <td className="px-3 py-3 text-center text-slate-800 font-bold">{item.quantity}</td>
                        <td className="px-3 py-3 text-right text-slate-500 font-mono">R$ {item.unitPrice.toLocaleString('pt-BR')}</td>
                        <td className="px-3 py-3 text-right text-slate-800 font-mono font-bold">R$ {item.totalPrice.toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations footer */}
              <div className="flex border-t border-slate-200 pt-4 justify-between items-start font-sans">
                <div className="max-w-md text-xs text-slate-500">
                  <h4 className="font-semibold text-slate-800 mb-1 leading-snug">Observações da Execução</h4>
                  <p className="italic leading-normal">{activePO.notes || 'Sem observações secundárias informadas.'}</p>
                </div>
                <div className="w-64 space-y-1.5 text-xs text-slate-600 text-right">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span className="font-mono">R$ {activePO.subtotal.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Impostos (Flat 5%):</span>
                    <span className="font-mono">R$ {activePO.taxes.toLocaleString('pt-BR')}</span>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="flex justify-between text-slate-900 font-bold text-sm">
                    <span>Valor Líquido:</span>
                    <span className="font-mono text-primary">R$ {activePO.total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default POListPage;
