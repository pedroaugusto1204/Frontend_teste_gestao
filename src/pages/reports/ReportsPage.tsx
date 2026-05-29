import { useState } from 'react';
import { useAppState } from '../../store';
import { Card, Button, Select } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileSpreadsheet, FileText, Download, TrendingUp, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';
import { SignatureStatus } from '../../types';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
  const { contracts, obras, signatures } = useAppState();

  const [selectedReportType, setSelectedReportType] = useState('contracts');

  // Chart Calculations
  // 1. Status Colors and Pie Charts calculations for Contracts
  const statusCounts: Record<string, number> = {};
  contracts.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const pieData = Object.entries(statusCounts).map(([key, val]) => ({
    name: key,
    value: val
  }));

  const COLORS = ['#1e3a5f', '#0ea5e9', '#16a34a', '#d97706', '#dc2626'];

  // 2. Budget Comparisons Bar Charts calculations
  const budgetChartData = obras.map(o => ({
    name: o.name,
    Orçado: o.budgetPlanned,
    Realizado: o.budgetRealized
  }));

  // Download simulation
  const handleDownloadSheet = (title: string) => {
    toast.success(`Relatório "${title}" gerado com sucesso! Iniciando exportação para XLS/CSV corporativo...`, {
      icon: '📊',
      duration: 5000
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-left">
        <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center gap-1.5">
          <TrendingUp className="text-primary w-6 h-6" /> Central de Inteligência & Relatórios
        </h1>
        <p className="text-sm text-slate-500 font-medium">Análise quantitativa de conformidade legal, auditorias e dotação financeira de canteiros.</p>
      </div>

      {/* Report Selection Toggle Shelf */}
      <Card className="p-4 bg-slate-50/50">
        <div className="flex items-center justify-between flex-wrap gap-4 text-left">
          <div className="flex gap-2">
            {[
              { id: 'contracts', label: 'Matriz de Contratos & Vigência' },
              { id: 'financials', label: 'Balanço Financeiro por Obra' },
              { id: 'signatures', label: 'Diagnóstico de Assinaturas' }
            ].map(r => (
              <Button
                key={r.id}
                variant={selectedReportType === r.id ? 'primary' : 'secondary'}
                onClick={() => setSelectedReportType(r.id)}
                className="text-xs mr-3 py-1.5 h-auto text-slate-700"
              >
                {r.label}
              </Button>
            ))}
          </div>

          <Button 
            variant="success" 
            className="flex items-center gap-1.5 text-xs py-2 h-auto"
            onClick={() => handleDownloadSheet('Geral Consolidado Auditável')}
          >
            <Download size={14} /> Exportar XLSX Consolidado
          </Button>
        </div>
      </Card>

      {/* Bento Grid Graphics comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: dynamic Chart representing toggled choice */}
        <Card className="lg:col-span-8 p-6 text-left flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Demonstrativo Gráfico</h3>
            <p className="text-xs text-slate-400 mt-0.5">Indicadores do banco de dados atualizados em tempo real.</p>
          </div>

          <div className="h-64">
            {selectedReportType === 'contracts' ? (
              /* Pie chart */
              <div className="h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: 'Sem dados', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom list description panel side to chart */}
                <div className="space-y-2 text-xs font-semibold text-slate-600 pl-4">
                  {pieData.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{d.name}: <strong>{d.value} contratos</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedReportType === 'financials' ? (
              /* Bar Chart */
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`]} />
                  <Bar dataKey="Orçado" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Realizado" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               /* Signature Status bar summary counts */
              <div className="h-full flex flex-col justify-center space-y-4 max-w-md mx-auto">
                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>Assinado / Autorizados</span>
                    <span>{signatures.filter(s => s.status === SignatureStatus.ASSINADO).length} de {signatures.length}</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${signatures.length > 0 ? (signatures.filter(s => s.status === SignatureStatus.ASSINADO).length / signatures.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex justify-between text-xs text-slate-500 font-bold">
                    <span>Aguardando Retorno / Visualizado</span>
                    <span>{signatures.filter(s => s.status === SignatureStatus.AGUARDANDO_ASSINATURA).length} de {signatures.length}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full" 
                      style={{ width: `${signatures.length > 0 ? (signatures.filter(s => s.status === SignatureStatus.AGUARDANDO_ASSINATURA).length / signatures.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right Side: Quick Action Spreadsheet pre-builders */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4 text-left">
            <h4 className="font-bold text-slate-800 text-xs text-left uppercase tracking-wider">Exportar por Matrizes</h4>
            
            <div className="space-y-3">
              {/* Box 1: Contracts */}
              <div className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                <div className="space-y-0.5 leading-normal text-left">
                  <p className="text-xs font-bold text-slate-700">Contratos & Aditivos</p>
                  <p className="text-[10px] text-slate-400 font-medium">Contendo prazos e multas SLAs.</p>
                </div>
                <button 
                  onClick={() => handleDownloadSheet('Contratos Vigentes')}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-accent hover:border-accent transition-colors cursor-pointer"
                >
                  <Download size={14} />
                </button>
              </div>

              {/* Box 2: Materials costs */}
              <div className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                <div className="space-y-0.5 leading-normal text-left">
                  <p className="text-xs font-bold text-slate-700">Custos Integrados por Obra</p>
                  <p className="text-[10px] text-slate-400 font-medium font-sans">Análise de desvio orçado vs realizado.</p>
                </div>
                <button 
                  onClick={() => handleDownloadSheet('Custos de Obras')}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-accent hover:border-accent transition-colors cursor-pointer"
                >
                  <Download size={14} />
                </button>
              </div>

              {/* Box 3: Audit Signatures log */}
              <div className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                <div className="space-y-0.5 leading-normal text-left">
                  <p className="text-xs font-bold text-slate-700">Audit Logs de Assinatura</p>
                  <p className="text-[10px] text-slate-400 font-medium">Declarações e validações eletrônicas.</p>
                </div>
                <button 
                  onClick={() => handleDownloadSheet('Logs de Assinaturas')}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-accent hover:border-accent transition-colors cursor-pointer"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
