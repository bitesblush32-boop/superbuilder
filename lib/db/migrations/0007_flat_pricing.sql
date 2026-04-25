-- Migration 0007: Switch to flat pricing model
-- - Remove tier packages (pro/premium), replace with solo/team pricing
-- - Make payments.tier nullable (legacy column preserved for existing records)
-- - Cap team max_size from 4 to 3
-- - Seed new flat pricing settings

-- 1. Make payments.tier nullable (existing records keep their values)
ALTER TABLE payments ALTER COLUMN tier DROP NOT NULL;

-- 2. Cap existing teams that were created with maxSize = 4
UPDATE teams SET max_size = 3 WHERE max_size = 4;

-- 3. Upsert new flat pricing keys into app_settings
INSERT INTO app_settings (key, value, label, updated_at) VALUES
  ('price_solo', '3499', 'Solo registration price (₹)', NOW()),
  ('price_team', '2999', 'Team registration price per head (₹)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      label = EXCLUDED.label,
      updated_at = NOW();
