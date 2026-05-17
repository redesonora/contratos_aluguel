-- ==========================================
-- PARTE 1: TIPOS E FUNÇÕES (RODE PRIMEIRO)
-- ==========================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'CORRETOR', 'PROPRIETARIO');
    END IF;
END $$;

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
  ) OR LOWER(auth.jwt() ->> 'email') = 'gleisonisaias@gmail.com';
END;
$$;

-- ==========================================
-- PARTE 2: TABELAS (RODE SEGUNDO)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'CORRETOR' NOT NULL,
  nome TEXT,
  email TEXT,
  cpf VARCHAR(14),
  approved BOOLEAN DEFAULT false,
  plano TEXT DEFAULT 'Nenhum',
  status_pagamento TEXT DEFAULT 'Sem Assinatura',
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  last_access TIMESTAMP WITH TIME ZONE,
  proprietario_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  email TEXT,
  telefone TEXT,
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado VARCHAR(2) NOT NULL,
  status TEXT DEFAULT 'Disponível',
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS inquilinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  email TEXT,
  telefone TEXT,
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  imovel_id UUID NOT NULL REFERENCES imoveis(id),
  inquilino_id UUID NOT NULL REFERENCES inquilinos(id),
  proprietario_id UUID REFERENCES proprietarios(id),
  valor_aluguel DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT DEFAULT 'ativo',
  arquivado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  valor_esperado DECIMAL(10,2),
  valor_pago DECIMAL(10,2),
  data_vencimento DATE,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- PARTE 3: SEGURANÇA E POLÍTICAS (RODE POR ÚLTIMO)
-- ==========================================

-- Habilita RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proprietarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquilinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Limpeza de Políticas para evitar erro "já existe"
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_select_all" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_update_policy" ON user_profiles;
    DROP POLICY IF EXISTS "profiles_delete_admin" ON user_profiles;

    DROP POLICY IF EXISTS "proprietarios_policy" ON proprietarios;
    DROP POLICY IF EXISTS "imoveis_policy" ON imoveis;
    DROP POLICY IF EXISTS "inquilinos_policy" ON inquilinos;
    DROP POLICY IF EXISTS "contratos_policy" ON contratos;
    DROP POLICY IF EXISTS "pagamentos_policy" ON pagamentos;
END $$;

-- Criação das Políticas
CREATE POLICY "profiles_select_all" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_policy" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete_admin" ON user_profiles FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "proprietarios_policy" ON proprietarios FOR ALL USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "imoveis_policy" ON imoveis FOR ALL USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "inquilinos_policy" ON inquilinos FOR ALL USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "contratos_policy" ON contratos FOR ALL USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "pagamentos_policy" ON pagamentos FOR ALL USING (auth.uid() = user_id OR is_admin());
