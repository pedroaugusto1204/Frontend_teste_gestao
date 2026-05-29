export enum ContractStatus {
  RASCUNHO = 'Rascunho',
  AGUARDANDO = 'Aguardando Assinatura',
  ASSINADO = 'Assinado',
  ATIVO = 'Ativo',
  VENCENDO = 'Vencendo',
  ENCERRADO = 'Encerrado'
}

export enum ContractType {
  SERVICO = 'Prestação de Serviço',
  TRABALHO = 'Contrato de Trabalho',
  OBRA = 'Empreitada / Obra',
  LOCACAO = 'Locação de Equipamentos',
  OUTRO = 'Outros'
}

export enum ObraStatus {
  PLANEJAMENTO = 'Planejamento',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDA = 'Concluída',
  PAUSADA = 'Pausada'
}

export enum SignatureStatus {
  AGUARDANDO_ASSINATURA = 'Aguardando assinatura',
  ASSINADO = 'Assinado',
  EXPIRADO = 'Expirado'
}

export enum SignatureChannel {
  EMAIL = 'Email',
  WHATSAPP = 'WhatsApp',
  AMBOS = 'Ambos'
}

export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  OPERATOR = 'Operator',
  VIEWER = 'Viewer'
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastActive: string;
}

export interface Company {
  name: string;
  cnpj: string;
  logoUrl?: string;
  email: string;
  phone: string;
  ie?: string;
  address?: string;
  signatureUrl?: string; // Official corporate system signature Base64 PNG image
}

export interface ContractTemplateField {
  id: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'signature';
  required: boolean;
  placeholder?: string;
  options?: string[]; // strictly for 'select'
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  fields: ContractTemplateField[];
  htmlContent: string;
}

export interface Contract {
  id: string;
  title: string;
  relatedParty: string; // Parte Relacionada
  type: ContractType;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  templateId?: string;
  fieldValues: Record<string, string>; // dynamic template field values
  htmlContent: string; // full evaluated html representation
  attachments: { name: string; size: string; date: string; url: string }[];
  history: { date: string; user: string; action: string; details: string }[];
  parentId?: string; // Links this contract as an aditivo to another contract
}

export interface SignatureRequest {
  id: string;
  contractId: string;
  contractTitle: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: SignatureChannel;
  status: SignatureStatus;
  sentAt: string;
  viewedAt?: string;
  signedAt?: string;
  expiresAt: string;
  token: string;
  drawnSignature?: string; // Base64 drawing or typed name representation
}

export interface ObraStep {
  id: string;
  phase: string; // Dynamic phase names (ex: 'Planejamento', 'Pré-obra', 'Fundações')
  title: string;
  isCompleted: boolean;
  dueDate: string;
  notes?: string;
}

export interface ObraCusto {
  id: string;
  obraId: string;
  date: string;
  description: string;
  category: string;
  value: number;
}

export interface VistoriaAttachment {
  name: string;
  type: 'image' | 'pdf';
  url: string; // Base64 data URL
}

export interface ObraVistoria {
  id: string;
  date: string;
  type: 'Inicial' | 'Parcial' | 'Final';
  inspector: string;
  description: string;
  photoUrls: string[];
  attachments?: VistoriaAttachment[];
}

export interface Obra {
  id: string;
  name: string;
  status: ObraStatus;
  progress: number; // percent completion (0 - 100)
  contractId?: string;
  contractTitle?: string;
  manager: string;
  dueDate: string;
  budgetPlanned: number; // Previsto
  budgetRealized: number; // Realizado
  steps: ObraStep[];
  costs: ObraCusto[];
  vistorias: ObraVistoria[];
  description?: string;
  address?: string;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  obraId: string;
  obraName: string;
  providerName: string;
  providerCnpj: string;
  payerCnpj: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  deliveryDate: string;
  notes?: string;
  status: 'Pendente Aprovação' | 'Aprovado';
}

export interface DashboardStats {
  activeContractsCount: number;
  contractsExpiringSoonCount: number;
  awaitingSignatureCount: number;
  activeObrasCount: number;
  contractsByStatus: { status: string; count: number }[];
  contractsByType: { type: string; count: number }[];
  recentContracts: Contract[];
  obrasProgressList: { id: string; name: string; progress: number; budgetPlanned: number; budgetRealized: number; dueDate: string }[];
  budgetAlerts: { id: string; text: string; severity: 'warning' | 'danger' | 'info' }[];
}
