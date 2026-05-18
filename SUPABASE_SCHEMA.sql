-- SUPABASE SQL SCHEMA
-- Execute este script no SQL Editor do Supabase

-- 1. Tipos e Perfis
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'CORRETOR', 'PROPRIETARIO');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'CORRETOR' NOT NULL,
  nome TEXT,
  cpf VARCHAR(14),
  approved BOOLEAN DEFAULT false,
  plano TEXT DEFAULT 'Nenhum',
  status_pagamento TEXT DEFAULT 'Sem Assinatura',
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  last_access TIMESTAMP WITH TIME ZONE,
  proprietario_id UUID REFERENCES proprietarios(id), -- Vincula o usuário a um proprietário CRM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Funções auxiliares
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$;

-- Políticas de user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_view_own" ON user_profiles;
    DROP POLICY IF EXISTS "user_create_own" ON user_profiles;
    DROP POLICY IF EXISTS "user_update_own" ON user_profiles;
    DROP POLICY IF EXISTS "admin_all_profiles" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_select_all" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_update_admin" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_update_policy" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_delete_admin" ON user_profiles;

    -- Permite que qualquer usuário autenticado veja os nomes e cargos (necessário para o app)
    CREATE POLICY "profiles_select_all" ON user_profiles FOR SELECT TO authenticated USING (true);
    
    -- Permite criação do próprio perfil (necessário no primeiro login)
    CREATE POLICY "profiles_insert_own" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
    
    -- Permite atualização: usuários podem mudar o próprio nome, mas apenas admins podem mudar role/approved
    -- Como RLS é por linha, facilitamos: Admin pode tudo, usuário só o dele.
    -- Para segurança extra, no app filtramos campos. No DB:
    CREATE POLICY "profiles_update_policy" ON user_profiles FOR UPDATE TO authenticated 
    USING (auth.uid() = id OR is_admin());

    -- Permite deleção apenas por administradores
    CREATE POLICY "profiles_delete_admin" ON user_profiles FOR DELETE TO authenticated 
    USING (is_admin());
END $$;

-- 2. Tabelas Principais

-- Proprietários
CREATE TABLE IF NOT EXISTS proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  rg TEXT,
  estado_civil TEXT,
  endereco TEXT NOT NULL,
  bairro TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  email TEXT,
  telefone TEXT,
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Imóveis
CREATE TABLE IF NOT EXISTS imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  apelido TEXT,
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(9),
  tipo_imovel TEXT DEFAULT 'RESIDENCIAL',
  status TEXT DEFAULT 'Disponível',
  cemig TEXT,
  copasa TEXT,
  descricao TEXT,
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inquilinos
CREATE TABLE IF NOT EXISTS inquilinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  email TEXT,
  telefone TEXT,
  estado_civil TEXT,
  rg TEXT,
  profissao TEXT,
  nacionalidade TEXT,
  naturalidade TEXT,
  uf_nascimento VARCHAR(2),
  nome_fiador TEXT,
  cpf_fiador VARCHAR(18),
  rg_fiador TEXT,
  endereco_fiador TEXT,
  documentos_fiador TEXT[],
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  imovel_id UUID NOT NULL REFERENCES imoveis(id),
  inquilino_id UUID NOT NULL REFERENCES inquilinos(id),
  proprietario_id UUID REFERENCES proprietarios(id),
  valor_aluguel DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dia_vencimento INTEGER CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado', 'cancelado')),
  renovacoes_count INTEGER DEFAULT 0,
  clausulas TEXT,
  alinhamento_texto TEXT DEFAULT 'justify',
  arquivo_url TEXT,
  documentos TEXT[],
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  valor_esperado DECIMAL(10,2),
  valor_pago DECIMAL(10,2),
  data_vencimento DATE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  competencia_mes INTEGER NOT NULL,
  competencia_ano INTEGER NOT NULL,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recibos (Log)
CREATE TABLE IF NOT EXISTS recibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  pagamento_id UUID NOT NULL REFERENCES pagamentos(id),
  numero_sequencial BIGSERIAL,
  conteudo_customizado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Auditoria (Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  acao TEXT NOT NULL, -- 'CRIAR', 'EDITAR', 'EXCLUIR', 'ARQUIVAR', 'RESTAURAR'
  tabela TEXT NOT NULL, -- 'imoveis', 'contratos', etc
  registro_id UUID,
  detalhes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Configuração de RLS (Row Level Security)

ALTER TABLE proprietarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquilinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Isolamento
DO $$ 
BEGIN
    -- Tabelas: proprietarios, imoveis, inquilinos, contratos, pagamentos, recibos, audit_logs
    
    -- Proprietários
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios proprietários" ON proprietarios;
    CREATE POLICY "proprietarios_policy" ON proprietarios FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- Imóveis
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios imóveis" ON imoveis;
    CREATE POLICY "imoveis_policy" ON imoveis FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- Inquilinos
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios inquilinos" ON inquilinos;
    CREATE POLICY "inquilinos_policy" ON inquilinos FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- Contratos
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios contratos" ON contratos;
    CREATE POLICY "contratos_policy" ON contratos FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- Pagamentos
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios pagamentos" ON pagamentos;
    CREATE POLICY "pagamentos_policy" ON pagamentos FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- Recibos
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios recibos" ON recibos;
    CREATE POLICY "recibos_policy" ON recibos FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- Logs
    DROP POLICY IF EXISTS "Usuários veem apenas seus próprios logs" ON audit_logs;
    CREATE POLICY "audit_logs_policy" ON audit_logs FOR ALL USING (auth.uid() = user_id OR is_admin());
END $$;
