import { Link } from 'react-router-dom';
import { useAppState } from '../../store';
import { ContractStatus, ObraStatus, SignatureStatus } from '../../types';
import { Card, StatusBadge, Button } from '../../components/ui';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  FileText, 
  AlertCircle, 
  PenTool, 
  HardHat, 
  ChevronRight, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';

export const DashboardPage = () => {
  const { contracts, obras, signatures } = useAppState();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('ID do contrato copiado!', { id: 'copy-contract-id-dash' });
  };

  const getContractSeqNum = (contractId: string) => {
    const sorted = [...contracts].sort((a, b) => a.id.localeCompare(b.id));
    const idx = sorted.findIndex(c => c.id === contractId);
    return idx !== -1 ? `#${String(idx + 1).padStart(2, '0')}` : '--';
  };

  // 1. Calculate KPI Counters
  const activeContracts = contracts.filter(c => c.status === ContractStatus.ATIVO);
  
  const expiringContractsCount = contracts.filter(c => {
    if (c.status !== ContractStatus.ATIVO) return false;
    const diff = new Date(c.endDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  const pendingSignaturesCount = signatures.filter(s => s.status !== SignatureStatus.ASSINADO).length;
  const activeObrasCount = obras.filter(o => o.status === ObraStatus.EM_ANDAMENTO).length;

  // 2. Format Data for Contract Type Chart (BarChart)
  const typesMap: Record<string, number> = {};
  contracts.forEach(c => {
    typesMap[c.type] = (typesMap[c.type] || 0) + 1;
  });
  const typeChartData = Object.entries(typesMap).map(([key, value]) => ({
    name: key.replace('Prestação de ', '').replace('Contrato de ', ''),
    Quantidade: value
  }));

  // 3. Format Data for Contract Status Chart (PieChart)
  const statusMap: Record<string, number> = {};
  contracts.forEach(c => {
    statusMap[c.status] = (statusMap[c.status] || 0) + 1;
  });
  const statusChartData = Object.entries(statusMap).map(([key, value]) => ({
    name: key,
    value: value
  }));

  const COLORS = ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  // 4. Format Data for Obras Budget Chart (BarChart)
  const budgetChartData = obras.map(o => ({
    name: o.name.split(' (')[0],
    Previsto: o.budgetPlanned,
    Realizado: o.budgetRealized
  }));

  // 5. Recent Contracts (last 5)
  const recentContracts = [...contracts].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight">Painel Consolidado</h1>
          <p className="text-sm text-slate-500">Gestão global de vigências contratuais e contingenciamento orçamentário.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/contracts/new">
            <Button variant="primary">Criar Contrato</Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between border-l-4 border-primary">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contratos Ativos</span>
            <h3 className="text-2xl font-bold text-slate-800">{activeContracts.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-primary">
            <FileText size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-amber-500">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencendo (30 dias)</span>
            <h3 className="text-2xl font-bold text-amber-600">{expiringContractsCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle size={22} className="animate-pulse" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-sky-500">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aguardando Assinatura</span>
            <h3 className="text-2xl font-bold text-sky-600">{pendingSignaturesCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <PenTool size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-l-4 border-emerald-500">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Obras em Andamento</span>
            <h3 className="text-2xl font-bold text-emerald-600">{activeObrasCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <HardHat size={22} />
          </div>
        </Card>
      </div>

      {/* Main Charts Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type Distribution chart */}
        <Card className="p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="text-left mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Distribuição por Categoria de Contrato</h4>
            <p className="text-xs text-slate-400">Classificação por modalidades operativas vigentes.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="Quantidade" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Donut chart */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-left mb-2">
            <h4 className="font-semibold text-slate-800 text-sm">Status dos Documentos</h4>
            <p className="text-xs text-slate-400">Proporção dos fluxos atuais.</p>
          </div>
          <div className="h-44 flex items-center justify-center">
            {statusChartData.length === 0 ? (
              <span className="text-xs text-slate-400">Sem dados</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] text-slate-500 max-h-20 overflow-y-auto">
            {statusChartData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Obras Progress & Budget Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Comparison chart */}
        <Card className="p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="text-left mb-4">
            <div className="flex items-center gap-1 text-slate-800">
              <TrendingUp size={16} className="text-primary" />
              <h4 className="font-semibold text-slate-800 text-sm">Gasto em Obras: Previsto vs Realizado</h4>
            </div>
            <p className="text-xs text-slate-400">Acompanhamento e desvio financeiro acumulado.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tickFormatter={(val) => `R$${val/1000}k`} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Previsto" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizado" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Construction Work progress mini items */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-left mb-4">
            <h4 className="font-semibold text-slate-800 text-sm">Evolução Física das Obras</h4>
            <p className="text-xs text-slate-400">Medição técnica de conclusão.</p>
          </div>
          <div className="space-y-4 flex-1">
            {obras.slice(0, 3).map(o => (
              <div key={o.id} className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate">{o.name}</span>
                  <span className="font-bold text-primary font-mono">{o.progress}%</span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${o.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Resp: {o.manager}</span>
                  <span className={o.progress > 50 ? 'text-emerald-600' : 'text-slate-400'}>
                    Saldo: R$ {(o.budgetPlanned - o.budgetRealized).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-100 mt-2">
            <Link to="/obras" className="text-xs text-accent font-semibold inline-flex items-center gap-1 hover:underline">
              Gerenciar obras em progresso <ChevronRight size={14} />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity List of 5 Contratos */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 text-sm text-left">Últimos Contratos Editados</h4>
          <Link to="/contracts" className="text-xs text-accent font-semibold hover:underline flex items-center gap-0.5">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-100">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Contrato</th>
                <th className="px-5 py-3 ml-2">Parte Relacionada</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3">Vencimento</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentContracts.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleCopyId(c.id)}
                      title={`ID completo: ${c.id}\nClique para copiar`}
                      className="text-slate-500 font-mono text-xs font-semibold hover:text-accent transition-colors text-left focus:outline-none flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60"
                    >
                      {getContractSeqNum(c.id)}
                    </button>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    <Link to={`/contracts/${c.id}`} className="hover:text-accent font-semibold">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.relatedParty}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{c.type}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    R$ {c.value.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{c.endDate}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
