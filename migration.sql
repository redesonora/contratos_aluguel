-- Migration to fix pagamentos table and support pre-generated installments
ALTER TABLE pagamentos ALTER COLUMN valor_pago DROP NOT NULL;
ALTER TABLE pagamentos ALTER COLUMN data_pagamento DROP NOT NULL;

-- Add new columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'pagamentos' AND COLUMN_NAME = 'valor_esperado') THEN
        ALTER TABLE pagamentos ADD COLUMN valor_esperado DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'pagamentos' AND COLUMN_NAME = 'data_vencimento') THEN
        ALTER TABLE pagamentos ADD COLUMN data_vencimento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'pagamentos' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE pagamentos ADD COLUMN status TEXT DEFAULT 'Pendente';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'pagamentos' AND COLUMN_NAME = 'comprovante_url') THEN
        ALTER TABLE pagamentos ADD COLUMN comprovante_url TEXT;
    END IF;
END $$;

-- Update existing records to have a status if null
UPDATE pagamentos SET status = 'Pago' WHERE status IS NULL AND valor_pago IS NOT NULL;
UPDATE pagamentos SET status = 'Pendente' WHERE status IS NULL AND valor_pago IS NULL;
