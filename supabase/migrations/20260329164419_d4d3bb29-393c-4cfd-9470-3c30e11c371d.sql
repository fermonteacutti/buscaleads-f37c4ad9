-- Manually process the approved R$1 payment (intent c1e4d163)
-- Add 1 credit and update payment intent status
SELECT public.add_credits(
  '53728f22-daf6-4e6c-9b45-8b7eaa13fa50'::uuid,
  1,
  'Assinatura: teste (processamento manual)',
  'c1e4d163-78ac-4009-9f98-5cdd454cef7c'
);

UPDATE public.payment_intents 
SET status = 'approved', processed_at = now() 
WHERE id = 'c1e4d163-78ac-4009-9f98-5cdd454cef7c';
