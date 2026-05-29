import { Link, useLocation } from 'react-router-dom';
import { useAppState } from '../../store';
import { Logo } from '../Logo';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  FileCode, 
  TrendingUp, 
  PenTool, 
  ListTodo, 
  HardHat, 
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) => {
  const { sidebarOpen, setSidebarOpen, logout, user } = useAppState();
  const location = useLocation();

  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Contratos & Assinaturas',
      items: [
        { label: 'Contratos', path: '/contracts', icon: FileText },
        { label: 'Templates', path: '/templates', icon: FileCode },
        { label: 'Assinaturas', path: '/signatures', icon: PenTool },
      ]
    },
    {
      title: 'Obras & Custos',
      items: [
        { label: 'Obras', path: '/obras', icon: HardHat },
        { label: 'Ordens de Compra', path: '/purchase-orders', icon: ShoppingCart },
      ]
    },
    {
      title: 'Administração',
      items: [
        { label: 'Relatórios', path: '/reports', icon: TrendingUp },
        { label: 'Parametrização', path: '/settings', icon: Settings },
        { label: 'Usuários', path: '/settings/users', icon: Users },
      ]
    }
  ];

  const currentPath = location.pathname;

  const bottomMenuItems = [
    { label: 'Início', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Contratos', path: '/contracts', icon: FileText },
    { label: 'Obras', path: '/obras', icon: HardHat },
    { label: 'Compras', path: '/purchase-orders', icon: ShoppingCart },
    { label: 'Mais', path: '#', icon: Menu, isMenuTrigger: true }
  ];

  return (
    <>
      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-45 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-100 transition-all duration-300 border-r border-slate-800 flex flex-col z-50 md:z-40
          ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Brand area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo size={28} showText={sidebarOpen || mobileMenuOpen} textColor="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent" />
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all hidden md:block cursor-pointer"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileMenuOpen?.(false)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all md:hidden cursor-pointer"
            title="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(sidebarOpen || mobileMenuOpen) && (
                <h4 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h4>
              )}
              
              <div className="space-y-0.5">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                  
                  return (
                    <Link
                      key={iIdx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen?.(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                        isActive 
                          ? 'bg-accent/15 text-accent border-l-4 border-accent' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {(sidebarOpen || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Profile Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Visitante'}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role || 'User'}</p>
              </div>
            )}
          </div>
          
          {(sidebarOpen || mobileMenuOpen) && (
            <button 
              onClick={() => {
                setMobileMenuOpen?.(false);
                logout();
              }}
              className="w-full mt-3 px-3 py-1.5 text-xs text-center border border-slate-800 hover:border-red-900/50 hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
            Sair do Sistema
          </button>
        )}
      </div>
    </aside>

    {/* Sleek Mobile Bottom Navigation Bar */}
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around z-40 md:hidden px-2 shadow-2xl">
      {bottomMenuItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path + '/'));
        
        if (item.isMenuTrigger) {
          return (
            <button
              key={idx}
              onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white transition-all gap-1 cursor-pointer ${
                mobileMenuOpen ? 'text-accent font-semibold' : ''
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium tracking-wide">Mais</span>
            </button>
          );
        }

        return (
          <Link
            key={idx}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all gap-1 ${
              isActive 
                ? 'text-accent font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={20} />
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  </>
);
};
