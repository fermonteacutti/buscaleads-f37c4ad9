import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, ShoppingCart, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface InsufficientCreditsModalProps {
  open: boolean
  onClose: () => void
  currentBalance: number
  requiredCredits?: number
}

const CREDIT_PACKS = [
  { credits: 100, price: 'R$ 29,90', highlight: false },
  { credits: 300, price: 'R$ 69,90', highlight: true, badge: 'Mais popular' },
  { credits: 1000, price: 'R$ 179,90', highlight: false, badge: 'Melhor valor' },
]

export function InsufficientCreditsModal({
  open,
  onClose,
  currentBalance,
  requiredCredits,
}: InsufficientCreditsModalProps) {
  const navigate = useNavigate()

  const handleBuyCredits = () => {
    onClose()
    navigate('/app/creditos')
  }

  const handleUpgradePlan = () => {
    onClose()
    navigate('/planos')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Créditos insuficientes</DialogTitle>
          </div>
          <DialogDescription>
            {requiredCredits ? (
              <>
                Esta busca pode retornar até{' '}
                <strong>{requiredCredits} leads</strong>, mas você tem apenas{' '}
                <strong>{currentBalance} crédito(s)</strong> disponíveis.
              </>
            ) : (
              <>
                Você não tem créditos suficientes para realizar esta busca.
                Seu saldo atual é de <strong>{currentBalance} crédito(s)</strong>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <p className="text-sm font-medium text-muted-foreground">Adquira créditos avulsos:</p>
          <div className="grid gap-2">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  pack.highlight ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={handleBuyCredits}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{pack.credits} créditos</span>
                  {pack.badge && (
                    <Badge variant={pack.highlight ? 'default' : 'secondary'} className="text-xs">
                      {pack.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium text-primary">{pack.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 rounded-lg border border-dashed p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleUpgradePlan}
        >
          <TrendingUp className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Fazer upgrade de plano</p>
            <p className="text-xs text-muted-foreground">
              Planos com créditos mensais inclusos a partir de R$ 97/mês
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleBuyCredits} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Comprar créditos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
