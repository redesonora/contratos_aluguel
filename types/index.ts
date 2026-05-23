export enum StatusPagamento {
  PENDENTE = 'Pendente',
  PAGO = 'Pago',
  ATRASADO = 'Atrasado'
}

export interface Imovel {
  id: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  tipo_imovel: 'RESIDENCIAL' | 'COMERCIAL';
  status: 'Disponível' | 'Alugado' | 'Indisponível';
  valor_base?: number;
  proprietario_id?: string;
  apelido?: string;
  cemig?: string;
  copasa?: string;
  descricao?: string;
  arquivado?: boolean;
}

export interface Inquilino {
  id: string;
  nome: string;
  cpf_cnpj: string;
  rg?: string;
  profissao?: string;
  estado_civil?: string;
  nacionalidade?: string;
  naturalidade?: string;
  uf_nascimento?: string;
  data_nascimento?: string;
  email: string;
  telefone: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  nome_fiador?: string;
  cpf_fiador?: string;
  rg_fiador?: string;
  endereco_fiador?: string;
  telefone_fiador?: string;
  email_fiador?: string;
  profissao_fiador?: string;
  estado_civil_fiador?: string;
  nacionalidade_fiador?: string;
  arquivado?: boolean;
}

export interface Proprietario {
  id: string;
  nome: string;
  cpf_cnpj: string;
  rg?: string;
  profissao?: string;
  estado_civil?: string;
  nacionalidade?: string;
  naturalidade?: string;
  uf_nascimento?: string;
  data_nascimento?: string;
  email: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  arquivado?: boolean;
}

export interface Contrato {
  id: string;
  imovel_id: string;
  inquilino_id: string;
  proprietario_id: string;
  data_inicio: string;
  data_fim: string;
  valor_aluguel: number;
  dia_vencimento: number;
  status: string;
  renovacoes_count?: number;
  arquivo_url?: string;
  documentos?: string[];
  documentos_fiador?: string[];
  clausulas?: string;
  alinhamento_texto?: 'left' | 'center' | 'right' | 'justify';
  arquivado?: boolean;
  imoveis?: any;
  inquilinos?: any;
  proprietarios?: any;
}

export interface Pagamento {
  id: string;
  contrato_id: string;
  valor_pago?: number;
  valor_esperado?: number;
  data_pagamento?: string;
  data_vencimento: string;
  status: StatusPagamento;
  competencia_mes: number;
  competencia_ano: number;
  contratos?: any;
  comprovante_aluguel?: string;
  observacoes?: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  cpf?: string;
  role: 'MASTER' | 'ADMIN' | 'CORRETOR' | 'PROPRIETARIO';
  approved: boolean;
  proprietario_id?: string | null;
  plano?: string | null;
  status_pagamento?: string | null;
  data_inicio?: string | null;
  trial_ends_at?: string | null;
  last_access?: string | null;
  created_at?: string | null;
  email?: string | null;
}

export interface ReceiptData {
  inquilino: string;
  cpf: string;
  valor: number;
  competencia: string;
  vencimento: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  locador: string;
  locador_cpf: string;
  data: string;
}
