-- Admin RPC: list all users with profiles, credits, and subscriptions
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT
        p.user_id,
        p.full_name,
        p.cpf,
        p.company_name,
        p.phone,
        p.created_at,
        u.email,
        cb.balance AS credit_balance,
        s.status AS subscription_status,
        pl.name AS plan_name,
        pl.slug AS plan_slug,
        s.billing_cycle,
        s.current_period_end
      FROM profiles p
      LEFT JOIN auth.users u ON u.id = p.user_id
      LEFT JOIN credit_balances cb ON cb.user_id = p.user_id
      LEFT JOIN subscriptions s ON s.user_id = p.user_id AND s.status = 'active'
      LEFT JOIN plans pl ON pl.id = s.plan_id
      ORDER BY p.created_at DESC
    ) t
  );
END;
$$;

-- Admin RPC: adjust credits for a user
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_target_user_id uuid,
  p_amount integer,
  p_description text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT balance INTO v_current_balance
  FROM credit_balances
  WHERE user_id = p_target_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  v_new_balance := v_current_balance + p_amount;
  IF v_new_balance < 0 THEN
    v_new_balance := 0;
  END IF;

  UPDATE credit_balances
  SET balance = v_new_balance, updated_at = now()
  WHERE user_id = p_target_user_id;

  INSERT INTO credits (user_id, amount, balance_after, transaction_type, description)
  VALUES (
    p_target_user_id,
    p_amount,
    v_new_balance,
    CASE WHEN p_amount >= 0 THEN 'bonus' ELSE 'debit' END,
    p_description
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance_before', v_current_balance,
    'balance_after', v_new_balance
  );
END;
$$;

-- Admin RPC: update user subscription
CREATE OR REPLACE FUNCTION public.admin_update_subscription(
  p_target_user_id uuid,
  p_plan_slug text,
  p_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id uuid;
  v_sub_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT id INTO v_plan_id FROM plans WHERE slug = p_plan_slug;
  IF v_plan_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'plan_not_found');
  END IF;

  SELECT id INTO v_sub_id FROM subscriptions
  WHERE user_id = p_target_user_id AND status = 'active'
  LIMIT 1;

  IF v_sub_id IS NOT NULL THEN
    UPDATE subscriptions
    SET plan_id = v_plan_id,
        status = COALESCE(p_status, status)::subscription_status,
        updated_at = now()
    WHERE id = v_sub_id;
  ELSE
    INSERT INTO subscriptions (user_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
    VALUES (p_target_user_id, v_plan_id, 'active', 'monthly', now(), now() + interval '30 days');
  END IF;

  RETURN jsonb_build_object('success', true, 'plan_slug', p_plan_slug);
END;
$$;

-- Admin RPC: list payment history for a user
CREATE OR REPLACE FUNCTION public.admin_list_payments(p_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    FROM (
      SELECT id, amount, credits, plan_id, type, status, billing, created_at, processed_at, mp_payment_id
      FROM payment_intents
      WHERE user_id = p_target_user_id
      ORDER BY created_at DESC
      LIMIT 100
    ) t
  );
END;
$$;

-- Admin RPC: list credit transactions for a user
CREATE OR REPLACE FUNCTION public.admin_list_credits(p_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    FROM (
      SELECT id, amount, balance_after, transaction_type, description, created_at
      FROM credits
      WHERE user_id = p_target_user_id
      ORDER BY created_at DESC
      LIMIT 100
    ) t
  );
END;
$$;