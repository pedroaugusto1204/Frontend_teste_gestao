import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-light focus:ring-primary',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-200',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ==========================================
// INPUTS & TEXTAREA ELEMENTS
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
        <input
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <span className="block mt-1 text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          rows={3}
          {...props}
        />
        {error && <span className="block mt-1 text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
        <select
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
            error ? 'border-red-500' : 'hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="block mt-1 text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="text-left">
        <label className="inline-flex items-start gap-2 cursor-pointer text-sm font-medium text-slate-700 select-none">
          <input
            ref={ref}
            type="checkbox"
            className={`mt-0.5 rounded border-slate-300 text-primary focus:ring-accent h-4 w-4 ${className}`}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <span className="block mt-1 text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ==========================================
// CARD CONTAINER
// ==========================================
export const Card = ({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) => {
  return (
    <div id={id} className={`bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

// ==========================================
// BADGE & STATUS BADGE
// ==========================================
export const Badge = ({ children, variant = 'info', className = '' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'muted'; className?: string }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    primary: 'bg-blue-50 text-primary border border-blue-200',
    muted: 'bg-slate-100 text-slate-600 border border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  let variant: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'muted' = 'muted';
  let uppercase = status.toUpperCase();

  // Mapping contract status and general status
  if (uppercase.includes('ATIVO') || uppercase.includes('ASSINADO') || uppercase.includes('CONCLU') || uppercase.includes('APROVADO')) {
    variant = 'success';
  } else if (uppercase.includes('VENCENDO') || uppercase.includes('AGUARDANDO') || uppercase.includes('VISUALIZADO') || uppercase.includes('PENDENTE')) {
    variant = 'warning';
  } else if (uppercase.includes('ENCERRADO') || uppercase.includes('EXPIRADO')) {
    variant = 'danger';
  } else if (uppercase.includes('RASCUNHO') || uppercase.includes('ENVIADO')) {
    variant = 'info';
  } else if (uppercase.includes('PLANEJAMENTO')) {
    variant = 'primary';
  }

  return <Badge variant={variant}>{status}</Badge>;
};

// ==========================================
// OUTSIDE PRE-RENDERED MODAL WITH OVERLAY
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 transform transition-all overflow-hidden scale-100 max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// EMPTY DATA STATE
// ==========================================
export const EmptyState = ({ message = 'Nenhum registro encontrado', action }: { message?: string; action?: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
      <p className="text-sm text-slate-500 font-medium max-w-xs mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
