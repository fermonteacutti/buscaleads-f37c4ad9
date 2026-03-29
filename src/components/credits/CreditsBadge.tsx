import { Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigate } from 'react-router-dom'
import { useCredits } from '@/hooks/useCredits'
import { cn } from '@/lib/utils'

interface CreditsBadgeProps {
  className?: string
}

export function CreditsBadge({ className }: CreditsBadgeProps) {
  const { balance, loading } = useCredits()
  const navigate = useNavigate()

  const isLow = balance <= 10
  const isEmpty = balance === 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-1.5 h-8', className)}
          onClick={() => navigate('/app/creditos')}
        >
          <Zap
            className={cn(
              'h-3.5 w-3.5',
              isEmpty ? 'text-destructive' : isLow ? 'text-yellow-500' : 'text-primary'
            )}
          />
          {loading ? (
            <span className="text-xs text-muted-foreground">...</span>
          ) : (
            <Badge
              variant={isEmpty ? 'destructive' : isLow ? 'outline' : 'secondary'}
              className="h-4 px-1.5 text-xs font-semibold"
            >
              {balance}
            </Badge>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>
          {isEmpty
            ? 'Sem créditos — clique para comprar'
            : isLow
            ? `Apenas ${balance} crédito(s) restante(s)`
            : `${balance} crédito(s) disponíveis`}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
