import { Urgencia } from '@/types'
import { URGENCIA_CONFIG } from '@/lib/constants'

interface UrgenciaBadgeProps {
  urgencia: Urgencia
  size?: 'sm' | 'md'
}

export function UrgenciaBadge({ urgencia, size = 'md' }: UrgenciaBadgeProps) {
  const config = URGENCIA_CONFIG[urgencia]
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  const icons: Record<Urgencia, string> = {
    normal: '●',
    alta: '▲',
    urgente: '‼',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${config.bg} ${config.color}`}
    >
      <span className="text-xs">{icons[urgencia]}</span>
      {config.label}
    </span>
  )
}
