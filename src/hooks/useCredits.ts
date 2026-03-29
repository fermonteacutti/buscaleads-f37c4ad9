// src/hooks/useCredits.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useCredits() {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error: fetchError } = await supabase
        .from('credit_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError
      setBalance(data?.balance ?? 0)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar créditos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasEnoughCredits = useCallback(
    (required: number) => balance >= required,
    [balance]
  )

  const validateBeforeSearch = useCallback(
    (estimatedLeads: number = 20): boolean => {
      if (balance < 1) {
        toast({
          title: 'Créditos insuficientes',
          description: 'Você não tem créditos disponíveis. Adquira mais para continuar buscando.',
          variant: 'destructive',
        })
        return false
      }

      if (balance < estimatedLeads) {
        // Silently allow — the search confirmation toast will be shown instead
        return true
      }

      return true
    },
    [balance, toast]
  )

  const syncBalanceAfterSearch = useCallback((balanceAfter: number) => {
    setBalance(balanceAfter)
  }, [])

  useEffect(() => {
    fetchBalance()

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('credit-balances-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'credit_balances',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newBalance = (payload.new as { balance: number }).balance
            setBalance(newBalance)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupRealtime()
    return () => {
      cleanup.then(fn => fn?.())
    }
  }, [fetchBalance])

  return {
    balance,
    loading,
    error,
    hasEnoughCredits,
    validateBeforeSearch,
    syncBalanceAfterSearch,
    fetchBalance,
  }
}
