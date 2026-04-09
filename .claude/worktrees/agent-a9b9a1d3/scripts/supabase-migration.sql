-- ============================================================
-- Zempotis SaaS — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Add website_url column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website_url text;

-- 2. Add invoice_number to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number text;

-- Update existing invoices with generated numbers
UPDATE invoices
SET invoice_number = 'INV-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 4, '0')
WHERE invoice_number IS NULL;

-- 3. Create calls table (for Vapi AI call handler)
CREATE TABLE IF NOT EXISTS calls (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     uuid REFERENCES clients(id) ON DELETE SET NULL,
  assistant_name text NOT NULL DEFAULT 'Zempotis Assistant',
  phone_number  text,
  duration_seconds integer DEFAULT 0,
  status        text NOT NULL DEFAULT 'completed',
  -- status: completed | failed | no-answer | in-progress
  transcript    text,
  recording_url text,
  caller_number text,
  summary       text,
  created_at    timestamptz DEFAULT now()
);

-- 4. Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  text NOT NULL,
  -- event_type: client_signup | call_made | payment_received | invoice_sent | invoice_created | enquiry_new | settings_updated
  title       text NOT NULL,
  description text,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- 5. Enable RLS on new tables
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — allow all operations (admin-only portal, no public access)
-- For calls
DROP POLICY IF EXISTS "Allow all for authenticated" ON calls;
CREATE POLICY "Allow all for authenticated" ON calls
  FOR ALL USING (auth.role() = 'authenticated');

-- For activity_log
DROP POLICY IF EXISTS "Allow all for authenticated" ON activity_log;
CREATE POLICY "Allow all for authenticated" ON activity_log
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Seed some sample activity log entries (optional — remove if not needed)
INSERT INTO activity_log (event_type, title, description, metadata) VALUES
  ('client_signup',     'New client joined',         'Onboarding complete',          '{"plan": "starter"}'),
  ('invoice_created',   'Invoice created',           'Monthly subscription invoice', '{"amount": 299}'),
  ('call_made',         'AI call completed',         'Duration: 3m 24s',             '{"duration": 204}')
ON CONFLICT DO NOTHING;

-- 8. Index for performance
CREATE INDEX IF NOT EXISTS idx_calls_client_id     ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at    ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_event_type ON activity_log(event_type);
