-- =========================================================================
-- ⚡ REALIZZE - GESTÃO IMOBILIÁRIA - MODELO DE BANCO DE DADOS (SUPABASE)
-- =========================================================================
-- DICA: Execute o conteúdo deste arquivo no menu "SQL Editor" do seu
-- painel administrativo do Supabase para corrigir a visibilidade dos e-mails
-- e garantir que todas as tabelas estejam funcionando corretamente.
-- =========================================================================

-- -------------------------------------------------------------------------
-- CORREÇÃO DE E-MAILS AUSENTES NO PAINEL ADMINISTRATIVO:
-- -------------------------------------------------------------------------
-- Execute esta instrução para adicionar o campo 'email' na tabela de perfis:
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS plano text DEFAULT 'Nenhum';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS status_pagamento text DEFAULT 'Sem Assinatura';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Adicionalmente, você pode atualizar os e-mails dos usuários que já existem
-- vinculando-os com base nos metadados ou inserções da sessão. O sistema
-- também auto-atualizará o e-mail do usuário logado ao longo do uso.


-- -------------------------------------------------------------------------
-- 🛸 TABELA: user_profiles (Perfis de Usuários)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome text NOT NULL,
  cpf text,
  email text,
  role text DEFAULT 'CORRETOR', -- MASTER, ADMIN, CORRETOR, PROPRIETARIO, FINANCEIRO
  approved boolean DEFAULT false,
  plano text DEFAULT 'Nenhum',
  status_pagamento text DEFAULT 'Sem Assinatura',
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  trial_ends_at timestamptz DEFAULT timezone('utc'::text, now() + interval '7 days'),
  last_access timestamptz,
  proprietario_id uuid
);

-- Habilitar Row Level Security (RLS) se desejado:
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- FIX RECUSÃO INFINITA (Erro 42P17):
-- Evitamos o uso de FOR ALL nas políticas que consultam a própria tabela.
-- Separando em FOR UPDATE e FOR DELETE, o subselect utilizará a política
-- FOR SELECT (que é USING true) e não causará loop!
-- Também precisamos garantir a remoção de TODAS as políticas antigas.
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON user_profiles;
DROP POLICY IF EXISTS "Permitir inserções do próprio usuário" ON user_profiles;
DROP POLICY IF EXISTS "Permitir atualizações do próprio usuário" ON user_profiles;
DROP POLICY IF EXISTS "Master possui controle total" ON user_profiles;
DROP POLICY IF EXISTS "Master possui controle total: UPDATE" ON user_profiles;
DROP POLICY IF EXISTS "Master possui controle total: DELETE" ON user_profiles;

-- Função auxiliar para contornar RLS e evitar Infinite Recursion (42P17)
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

-- Exemplo de política rápida permitindo leitura de todos os perfis autenticados:
CREATE POLICY "Permitir leitura para autenticados" ON user_profiles
  FOR SELECT TO authenticated USING (true);

-- Permitir que cada usuário altere/insira o seu próprio perfil:
CREATE POLICY "Permitir inserções do próprio usuário" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir atualizações do próprio usuário" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Master possui controle total: UPDATE" ON user_profiles
  FOR UPDATE TO authenticated USING (
    public.get_auth_user_role() = 'MASTER'
  );
CREATE POLICY "Master possui controle total: DELETE" ON user_profiles
  FOR DELETE TO authenticated USING (
    public.get_auth_user_role() = 'MASTER'
  );


-- -------------------------------------------------------------------------
-- 🏢 TABELA: proprietarios (Proprietários de Imóveis)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proprietarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf_cnpj text NOT NULL,
  email text,
  telefone text,
  status text DEFAULT 'Ativo',
  observacoes text,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  arquivado boolean DEFAULT false
);

ALTER TABLE proprietarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Proprietários: Controle por Criador" ON proprietarios;
CREATE POLICY "Proprietários: Controle por Criador" ON proprietarios
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_auth_user_role() = 'MASTER');


-- -------------------------------------------------------------------------
-- 🏢 TABELA: inquilinos (Locatários / Inquilinos)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquilinos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf_cnpj text NOT NULL,
  email text,
  telefone text,
  status text DEFAULT 'Ativo',
  observacoes text,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  arquivado boolean DEFAULT false
);

ALTER TABLE inquilinos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inquilinos: Controle por Criador" ON inquilinos;
CREATE POLICY "Inquilinos: Controle por Criador" ON inquilinos
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_auth_user_role() = 'MASTER');


-- -------------------------------------------------------------------------
-- 🏠 TABELA: imoveis (Imóveis Cadastrados)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS imoveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apelido text,
  endereco text NOT NULL,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  tipo text, -- Residencial, Comercial, Industrial, Terreno
  proprietario_id uuid REFERENCES proprietarios ON DELETE SET NULL,
  valor_aluguel numeric,
  valor_iptu numeric,
  valor_condominio numeric,
  status text DEFAULT 'Disponível', -- Disponível, Alugado, Manutenção
  observacoes text,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  arquivado boolean DEFAULT false
);

ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Imóveis: Controle por Criador" ON imoveis;
CREATE POLICY "Imóveis: Controle por Criador" ON imoveis
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_auth_user_role() = 'MASTER');


-- -------------------------------------------------------------------------
-- 📄 TABELA: contratos (Contratos de Locação)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id uuid REFERENCES imoveis ON DELETE RESTRICT,
  inquilino_id uuid REFERENCES inquilinos ON DELETE RESTRICT,
  proprietario_id uuid REFERENCES proprietarios ON DELETE RESTRICT,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  valor_aluguel numeric NOT NULL,
  taxa_administracao numeric,
  dia_vencimento integer DEFAULT 5,
  garantia_tipo text, -- Caução, Fiador, Seguro Fiança, Sem Garantia
  garantia_valor numeric,
  status text DEFAULT 'Ativo', -- Ativo, Finalizado, Cancelado, Pendente
  reajuste_indice text, -- IGPM, IPCA, Outro
  observacoes text,
  documentos text[], -- links dos arquivos enviados
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  arquivado boolean DEFAULT false
);

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contratos: Controle por Criador" ON contratos;
CREATE POLICY "Contratos: Controle por Criador" ON contratos
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_auth_user_role() = 'MASTER');


-- -------------------------------------------------------------------------
-- 💰 TABELA: pagamentos (Mensalidades e Repasses)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid REFERENCES contratos ON DELETE CASCADE,
  mes_referencia text NOT NULL, -- Exemplo: 05/2026
  data_vencimento date NOT NULL,
  valor_aluguel numeric NOT NULL,
  valor_iptu numeric DEFAULT 0,
  valor_condominio numeric DEFAULT 0,
  taxa_servicos numeric DEFAULT 0,
  desconto numeric DEFAULT 0,
  multa_juros numeric DEFAULT 0,
  valor_total numeric NOT NULL,
  status_aluguel text DEFAULT 'Pendente', -- Pendente, Pago, Atrasado
  data_pagamento_aluguel date,
  forma_pagamento_aluguel text, -- Pix, Boleto, Transferência, Dinheiro
  comprovante_aluguel text,
  
  -- Campos de Repasse ao Proprietário:
  taxa_administracao_valor numeric DEFAULT 0,
  valor_repasse_liquido numeric NOT NULL,
  status_repasse text DEFAULT 'Pendente', -- Pendente, Repassado, Agendado
  data_repasse date,
  comprovante_repasse text,
  
  observacoes text,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pagamentos: Controle por Criador" ON pagamentos;
CREATE POLICY "Pagamentos: Controle por Criador" ON pagamentos
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_auth_user_role() = 'MASTER');


-- -------------------------------------------------------------------------
-- 📄 TABELA: contract_templates (Modelos de Contratos)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  font_size integer DEFAULT 12,
  font_color text DEFAULT '#000000',
  bold boolean DEFAULT false,
  alignment text DEFAULT 'justify',
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Templates: Controle por Criador" ON contract_templates;
CREATE POLICY "Templates: Controle por Criador" ON contract_templates
  FOR ALL TO authenticated USING (user_id = auth.uid() OR public.get_auth_user_role() = 'MASTER');


-- -------------------------------------------------------------------------
-- 📝 TABELA: audit_logs (Histórico de Atividades / Logs)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Audit Logs: Leitura Geral / Escrita por Autenticados" ON audit_logs;
CREATE POLICY "Audit Logs: Leitura Geral / Escrita por Autenticados" ON audit_logs
  FOR ALL TO authenticated USING (true);


-- -------------------------------------------------------------------------
-- ⚡ FUNÇÃO SPECIAL: delete_user_by_id (Exclusão Completa de Contas no Supabase Auth)
-- -------------------------------------------------------------------------
-- Esta função com privilégios "SECURITY DEFINER" permite deletar a credencial
-- de login do Supabase Auth (tabela auth.users) junto com o seu respectivo perfil.
-- Caso o usuário administrador MASTER delete alguém no painel, a conta será
-- completamente deletada, permitindo um novo cadastro do e-mail.
-- -------------------------------------------------------------------------
-- Remove a versão antiga para evitar erro de troca de nome de parâmetro (42P13)
DROP FUNCTION IF EXISTS delete_user_by_id(uuid);

CREATE OR REPLACE FUNCTION delete_user_by_id(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se quem está chamando é MASTER ou ADMIN na tabela user_profiles
  IF EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND (role = 'MASTER' OR role = 'ADMIN')
  ) THEN
    -- Limpeza de Referências antes de excluir o usuário, prevemos contornar falha de ON DELETE SET NULL não aplicado.
    DELETE FROM public.audit_logs WHERE user_id = p_user_id;
    DELETE FROM public.contract_templates WHERE user_id = p_user_id;
    
    UPDATE public.proprietarios SET user_id = auth.uid() WHERE user_id = p_user_id;
    UPDATE public.inquilinos SET user_id = auth.uid() WHERE user_id = p_user_id;
    UPDATE public.imoveis SET user_id = auth.uid() WHERE user_id = p_user_id;
    UPDATE public.contratos SET user_id = auth.uid() WHERE user_id = p_user_id;
    UPDATE public.pagamentos SET user_id = auth.uid() WHERE user_id = p_user_id;

    -- Update referencias à proprietario_id/inquilino_id caso esse usuario deletado os possuia?
    -- Como a exclusão é do user logado e não do proprietário de negócio... 
    
    -- Exclui o perfil associado na tabela do domínio público
    DELETE FROM public.user_profiles WHERE id = p_user_id;
    -- Exclui a conta física de autenticação do Supabase Auth
    DELETE FROM auth.users WHERE id = p_user_id;
    RETURN true;
  ELSE
    RAISE EXCEPTION 'Acesso negado: apenas administradores com privilégio MASTER ou ADMIN podem excluir contas de usuário.';
  END IF;
END;
$$;


-- -------------------------------------------------------------------------
-- ⚡ GATILHO (TRIGGER): Criação automática de perfil (Resolve erro de RLS no cadastro com confirmação de email)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role text;
  v_approved boolean;
BEGIN
  -- Se for o primeiro usuário do banco, vira MASTER.
  IF (SELECT count(*) FROM public.user_profiles) = 0 THEN
    v_role := 'MASTER';
    v_approved := true;
  ELSE
    v_role := 'CORRETOR';
    v_approved := false;
  END IF;

  BEGIN
    INSERT INTO public.user_profiles (id, nome, cpf, email, role, approved)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nome', 'Novo Usuário'),
      new.raw_user_meta_data->>'cpf',
      new.email,
      v_role,
      v_approved
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Evita que qualquer erro impessa a criação do usuário no Supabase Auth
      RAISE WARNING 'Erro ao criar perfil de usuario: %', SQLERRM;
  END;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


