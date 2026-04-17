'use client'

import { Pedido } from '@/types'
import { UrgenciaBadge } from '../ui/UrgenciaBadge'
import { STATUS_CONFIG } from '@/lib/constants'
import { UserIcon } from 'lucide-react'

export function KanbanCard({ pedido }: { pedido: Pedido }) {
  const statusConfig = STATUS_CONFIG[pedido.status]

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex h-24">
      {/* Faixa lateral fina de status */}
      <div className={`w-1 shrink-0 ${statusConfig.bg}`} />

      <div className="p-2 flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-mono font-bold text-gray-400">
            #{pedido.id.slice(-4)}
          </span>
          <UrgenciaBadge nivel={pedido.urgencia} />
        </div>

        {/* Título em apenas uma linha para economizar espaço */}
        <h4 className="text-sm font-bold text-gray-900 truncate">
          {pedido.titulo}
        </h4>

        {/* Solicitante e Setor em linha única */}
        <div className="flex items-center gap-1 text-gray-500">
          <UserIcon className="w-3 h-3" />
          <span className="text-[10px] truncate italic">
            {pedido.solicitante} • {pedido.setor}
          </span>
        </div>
      </div>
    </div>
  )
}