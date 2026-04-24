-- Seed default app_settings rows.
-- Uses ON CONFLICT DO NOTHING so re-running is safe and existing values are preserved.

INSERT INTO app_settings (key, value, label, updated_at) VALUES
  ('team_discount_3',   '10',    'Team of 3 discount (%)',              NOW()),
  ('team_discount_4',   '20',    'Team of 4 discount (%)',              NOW()),
  ('pro_price_min',     '1499',  'Pro tier minimum price (₹)',          NOW()),
  ('pro_price_max',     '1999',  'Pro tier maximum price (₹)',          NOW()),
  ('premium_price_min', '2499',  'Premium tier minimum price (₹)',      NOW()),
  ('premium_price_max', '2999',  'Premium tier maximum price (₹)',      NOW()),
  ('premium_emi_first', '999',   'Premium EMI first instalment (₹)',    NOW()),
  ('stage_1_open',      'true',  'Stage 1 — Apply & Prepare (Apr 23 – May 30)', NOW()),
  ('stage_2_open',      'false', 'Stage 2 — Workshops (Jun 3–5)',              NOW()),
  ('stage_3_open',      'false', 'Stage 3 — Hackathon (Jun 7–8)',              NOW()),
  ('stage_4_open',      'false', 'Stage 4 — Demo Day (Jun 27)',                NOW()),
  ('stage_5_open',      'false', 'Stage 5 — Certificates & Prizes (Jul 1)',    NOW())
ON CONFLICT (key) DO NOTHING;
