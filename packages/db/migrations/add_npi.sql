-- Add missing npi column to branches table
ALTER TABLE branches ADD COLUMN IF NOT EXISTS npi varchar(32);

-- Add missing npi column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS npi varchar(32) DEFAULT 'Pending' NOT NULL;
