
-- API Keys table
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Chave padrão',
  key_value text NOT NULL,
  key_prefix text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint on key_value
CREATE UNIQUE INDEX api_keys_key_value_idx ON public.api_keys (key_value);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_select_own" ON public.api_keys
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "api_keys_insert_own" ON public.api_keys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_update_own" ON public.api_keys
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "api_keys_delete_own" ON public.api_keys
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
