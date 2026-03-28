
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS google_place_id text;

CREATE UNIQUE INDEX IF NOT EXISTS leads_user_place_unique ON public.leads (user_id, google_place_id) WHERE google_place_id IS NOT NULL;
