CREATE OR REPLACE FUNCTION public.check_cpf_exists(p_cpf text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE cpf = p_cpf
  );
$$;