-- Migration 0009: Update app_settings stage labels to 5-stage display structure.
-- Uses ON CONFLICT DO UPDATE so existing rows get the new labels.

INSERT INTO app_settings (key, value, label, updated_at) VALUES
  ('stage_1_open', 'true',  'Stage 1 — Apply & Prepare (Apr 23 – May 30)', NOW()),
  ('stage_2_open', 'false', 'Stage 2 — Workshops (Jun 3–5)',               NOW()),
  ('stage_3_open', 'false', 'Stage 3 — Hackathon (Jun 7–8)',               NOW()),
  ('stage_4_open', 'false', 'Stage 4 — Demo Day (Jun 27)',                 NOW()),
  ('stage_5_open', 'false', 'Stage 5 — Certificates & Prizes (Jul 1)',     NOW())
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, updated_at = NOW();
