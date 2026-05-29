import { useState } from 'react';
import { useAppState } from '../../store';
import { Card, Button, StatusBadge, Input, Select, Modal } from '../../components/ui';
import { Users, Plus, ShieldCheck, Mail, Sliders, ExternalLink } from 'lucide-react';
import { Role } from '../../types';
import toast from 'react-hot-toast';

export const UsersPage = () => {
  const { users, addUser } = useAppState();

  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.MANAGER);

  const handleCreateUser = () => {
    if (!name || !email) {
      toast.error('Preencha pelo menos Nome e E-mail do colaborador corporativo!');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    addUser(name, email, selectedRole, password);

    toast.success(`Usuário ${name} cadastrado com perfil de ${selectedRole}!`);
    setIsNewOpen(false);

    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="font-display font-semibold text-2xl text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
            <Users className="text-primary w-6 h-6" /> Gestão de Colaboradores
          </h1>
          <p className="text-sm text-slate-500 font-medium">Controle de credenciais de acesso técnico e atribuição de perfis de conformidade jurídica.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-1.5 text-xs text-right" onClick={() => setIsNewOpen(true)}>
          <Plus size={16} /> Novo Usuário
        </Button>
      </div>

      {/* Corporate Users lists */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-100">
            <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Profissional</th>
                <th className="px-5 py-3">E-mail de Contato</th>
                <th className="px-5 py-3">Função / Perfil Atribuído</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Direitos Técnicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white leading-normal">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    <span className="block text-xs text-slate-400 text-left font-mono">{u.id}</span>
                    <span className="text-xs">{u.name}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-semibold">
                      <ShieldCheck size={14} className="text-primary shrink-0" /> {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-[10px] text-slate-400 hover:text-primary underline font-semibold">
                      Editar Permissão
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ==========================================
          MODAL: NOVO COLABORADOR
          ========================================== */}
      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="Cadastrar Credencial Operativa">
        <div className="space-y-4 text-left font-sans">
          <p className="text-sm text-slate-500 font-medium">
            Registre colaboradores autorizados a monitorar vigências, assinar aditivos ou liberar compras técnicas.
          </p>

          <Input 
            label="Nome Completo do Colaborador" 
            placeholder="Ex: Marcus Junqueira" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input 
            label="E-mail Corporativo" 
            type="email"
            placeholder="marcus@construtorasolida.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input 
            label="Senha de Acesso" 
            type="password"
            placeholder="Mínimo 6 caracteres" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nível de Acesso Regulatório</label>
            <select
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
            >
              <option value={Role.ADMIN}>Administrador</option>
              <option value={Role.MANAGER}>Gestor de Contratos</option>
              <option value={Role.OPERATOR}>Engenheiro de Campo</option>
              <option value={Role.VIEWER}>Financeiro / Auditor</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-right">
            <Button variant="secondary" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateUser}>Autorizar Credencial</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
