CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Criar perfil com CPF
  INSERT INTO profiles (user_id, full_name, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'cpf', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    cpf = COALESCE(NULLIF(NEW.raw_user_meta_data->>'cpf', ''), profiles.cpf);

  -- Criar saldo inicial de 50 créditos
  INSERT INTO credit_balances (user_id, balance, updated_at)
  VALUES (NEW.id, 50, now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Registrar transação de bônus
  INSERT INTO credits (user_id, amount, balance_after, transaction_type, description)
  VALUES (NEW.id, 50, 50, 'bonus', 'Bônus de boas-vindas — Plano Free');

  -- Criar subscription no plano Free
  INSERT INTO subscriptions (user_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
  VALUES (
    NEW.id,
    '93c768b0-18ed-4732-a3f9-347b8d1342e7',
    'active',
    'monthly',
    now(),
    now() + interval '100 years'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;