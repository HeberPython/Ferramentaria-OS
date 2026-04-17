'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, URGENCIA_CONFIG } from '@/lib/constants'

interface KanbanCardProps {
  pedido: Pedido
  isAdmin?: boolean
  commentCount?: number
  isDragging?: boolean
}

export function KanbanCard({ pedido, isAdmin = false, commentCount = 0, isDragging = false }: KanbanCardProps) {
  const statusKey = (pedido.status || 'recebido') as keyof typeof STATUS_CONFIG
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.recebido

  const urgenciaRaw = String(pedido.urgencia || 'normal').toLowerCase()
  const urgenciaKey = urgenciaRaw as keyof typeof URGENCIA_CONFIG
  const urgencia = URGENCIA_CONFIG[urgenciaKey] || URGENCIA_CONFIG.normal

  return (
    <div
      className={`bg-white border rounded-lg shadow-sm overflow-hidden flex h-20 shrink-0 ${
        isDragging ? 'opacity-50 rotate-1 shadow-xl' : ''
      }`}
    >
      <div className={`w-1 shrink-0 ${statusConfig.bg}`} />
      <div className="p-2 flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-center leading-none">
          <span className="text-[9px] font-mono text-gray-400">#{pedido.id.slice(-4)}</span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${urgencia.bg} ${urgencia.color}`}>
            {urgencia.label}
          </span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 truncate my-0.5">
          {pedido.titulo}
        </h4>
        <div className="text-[9px] text-gray-500 truncate border-t pt-1 italic">
          <span className="font-bold text-gray-700">{pedido.solicitante}</span> • {pedido.setor}
        </div>
      </div>
    </div>
  )
}