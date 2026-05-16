-- Execute este script no SQL Editor do Supabase para adicionar os campos de fiador à tabela inquilinos

ALTER TABLE public.inquilinos
ADD COLUMN IF NOT EXISTS nome_fiador text,
ADD COLUMN IF NOT EXISTS cpf_fiador text,
ADD COLUMN IF NOT EXISTS rg_fiador text,
ADD COLUMN IF NOT EXISTS cep_fiador text,
ADD COLUMN IF NOT EXISTS endereco_fiador text,
ADD COLUMN IF NOT EXISTS documentos_fiador text[],
ADD COLUMN IF NOT EXISTS arquivado boolean DEFAULT false;
