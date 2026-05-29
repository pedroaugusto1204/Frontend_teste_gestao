import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppState } from '../../store';
import { Bell, ShieldCheck, ChevronDown, Check, AlertCircle, Menu } from 'lucide-react';
import { ContractStatus, SignatureStatus } from '../../types';

export const Header = ({ setMobileMenuOpen }: { setMobileMenuOpen?: (open: boolean) => void }) => {
  const { user, company, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppState();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate dynamic path breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  // Get active unread notifications
  const unreadNotifications = notifications.filter(n => !n.read);
  const notificationCount = unreadNotifications.length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shadow-sm">
      {/* Breadcrumbs with Mobile Hamburger Trigger */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileMenuOpen?.(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors md:hidden cursor-pointer shrink-0"
          title="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">Growth Solution</span>
        {pathParts.length > 0 && (
          <>
            <span className="text-slate-300 hidden sm:inline-block">/</span>
            {pathParts.map((part, index) => {
              const routeTo = `/${pathParts.slice(0, index + 1).join('/')}`;
              const isLast = index === pathParts.length - 1;
              const formattedName = part === 'contracts' ? 'Contratos' 
                : part === 'new' ? 'Novo' 
                : part === 'templates' ? 'Templates'
                : part === 'signatures' ? 'Assinaturas'
                : part === 'manager' ? 'Gerenciador'
                : part === 'obras' ? 'Obras'
                : part === 'purchase-orders' ? 'Ordens de Compra'
                : part === 'reports' ? 'Relatórios'
                : part === 'settings' ? 'Parametrização'
                : part === 'users' ? 'Usuários'
                : part;

              return (
                <div key={part} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-300">/</span>}
                  {isLast ? (
                    <span className="text-sm font-semibold text-primary capitalize">{formattedName}</span>
                  ) : (
                    <Link to={routeTo} className="text-sm text-slate-500 hover:text-accent font-medium capitalize">
                      {formattedName}
                    </Link>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Corporate Metadata and Notification Triggers */}
      <div className="flex items-center gap-5">
        {/* Enterprise Unit Indicator */}
        <div className="hidden lg:flex flex-col text-right border-r border-slate-100 pr-5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Empresa Ativa</span>
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 justify-end">
            <ShieldCheck className="text-emerald-600 w-3.5 h-3.5" />
            {company.name}
          </span>
        </div>

        {/* Dynamic Alerts notification dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors relative"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Floated Dropdown notifications view */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-left">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <span className="font-semibold text-slate-700 text-sm">Alertas e Notificações</span>
                  <div className="flex items-center gap-2">
                    {notificationCount > 0 && (
                      <button 
                        onClick={() => markAllNotificationsAsRead()} 
                        className="text-[10px] text-slate-500 hover:text-accent font-semibold underline"
                      >
                        Limpar todas
                      </button>
                    )}
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded">
                      {notificationCount} pendentes
                    </span>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tudo certo! Sem alertas críticos no momento.
                    </div>
                  ) : (
                    <>
                      {unreadNotifications.map(n => (
                        <div key={n.id} className="p-3 bg-blue-50/20 hover:bg-blue-50/50 transition-colors flex items-start justify-between gap-2.5 group">
                          <div className="flex gap-2.5">
                            <Check className={`shrink-0 mt-0.5 ${n.type === 'success' ? 'text-emerald-600' : n.type === 'warning' ? 'text-amber-500' : 'text-sky-600'}`} size={16} />
                            <div>
                              <p className="text-xs font-semibold text-slate-900 leading-tight">{n.title}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                              <p className="text-[9px] text-slate-400 font-medium mt-1">{n.date}</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(n.id);
                            }}
                            className="p-1 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                            title="Marcar como lida"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Minimal User Profile Trigger */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
            {user?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block truncate max-w-[120px]">
            {user?.name || 'Administrador'}
          </span>
        </div>
      </div>
    </header>
  );
};
