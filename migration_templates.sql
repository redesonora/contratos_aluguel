-- Modelos de Contratos

CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT NOT NULL,
  content TEXT,
  font_size INTEGER DEFAULT 12,
  font_color TEXT DEFAULT '#000000',
  bold BOOLEAN DEFAULT false,
  alignment TEXT DEFAULT 'justify',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "contract_templates_policy" ON contract_templates;
    CREATE POLICY "contract_templates_policy" ON contract_templates FOR ALL USING (auth.uid() = user_id OR is_admin());
END $$;
