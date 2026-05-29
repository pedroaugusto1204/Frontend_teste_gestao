import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../store';
import { Plasma } from '../../components/Plasma';
import { Logo } from '../../components/Logo';
import { Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password?: string;
}

export const Login = () => {
  const { login, user, token } = useAppState();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: {
      email: 'pedroclashkiil@gmail.com',
      password: 'senha123!'
    }
  });

  // Redireciona automaticamente para o dashboard se estiver autenticado
  useEffect(() => {
    if (user && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, token, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Bem-vindo, acesso concedido!', {
        icon: '🔐',
        duration: 3000
      });
    } catch {
      toast.error('Credenciais incorretas ou erro de conexão.');
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Immersive Plasma Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Plasma 
          color="#131976"
          speed={1.2}
          direction="forward"
          scale={1.8}
          opacity={0.55}
          mouseInteractive
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950/90 z-10 pointer-events-none" />

      {/* Login Card Form */}
      <div className="relative z-20 w-full max-w-md mx-4 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <Logo size={64} />
        </div>
        
        <h2 className="font-display font-medium text-2xl tracking-tight text-slate-100 bg-slate-900/90 py-1 px-4 rounded-xl inline-block mx-auto mb-2 select-none border border-slate-800">
          Growth<span className="text-accent font-bold">Solution</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Sistema corporativo para controle de contratos e gestão de orçamentações em obras civis.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="nome@empresa.com"
                {...register('email', { required: 'E-mail é obrigatório' })}
              />
            </div>
            {errors.email && <span className="block mt-1 text-[11px] text-red-600">{errors.email.message}</span>}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="password"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
                {...register('password', { required: 'Senha é obrigatória' })}
              />
            </div>
            {errors.password && <span className="block mt-1 text-[11px] text-red-600">{errors.password.message}</span>}
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 py-2.5 cursor-pointer">
              <Lock size={16} /> Entrar no Sistema
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Versão 1.0.0</span>
          <span>Growth Solution Ltda © 2023</span>
        </div>
      </div>
    </div>
  );
};
export default Login;
