-- Update existing subscription to Starter plan
UPDATE subscriptions 
SET plan_id = '7a586934-d270-4c09-bfa3-c1ccd4214e6f',
    status = 'active',
    billing_cycle = 'monthly',
    current_period_start = now(),
    current_period_end = now() + interval '30 days',
    updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fernando@certificasp.com.br');