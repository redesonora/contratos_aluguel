-- Migration to add missing columns to user_profiles table
DO $$ 
BEGIN 
    -- Add 'plano' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'plano') THEN
        ALTER TABLE user_profiles ADD COLUMN plano TEXT DEFAULT 'Nenhum';
    END IF;
    
    -- Add 'status_pagamento' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'status_pagamento') THEN
        ALTER TABLE user_profiles ADD COLUMN status_pagamento TEXT DEFAULT 'Sem Assinatura';
    END IF;

    -- Add 'data_inicio' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'data_inicio') THEN
        ALTER TABLE user_profiles ADD COLUMN data_inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;

    -- Add 'trial_ends_at' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'trial_ends_at') THEN
        ALTER TABLE user_profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days');
    END IF;

    -- Add 'last_access' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'last_access') THEN
        ALTER TABLE user_profiles ADD COLUMN last_access TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
