'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, URGENCIA_CONFIG } from '@/lib/constants'

export function KanbanCard({ pedido }: { pedido: Pedido }) {
  const statusConfig = STATUS_CONFIG[pedido.status]
  // Proteção contra erro de capitalização
  const urgenciaChave = pedido.urgencia.toLowerCase() as keyof typeof URGENCIA_CONFIG
  const urgencia = URGENCIA_CONFIG[urgenciaChave] || URGENCIA_CONFIG.normal

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex h-20">
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
        <div className="text-[10px] text-gray-500 truncate italic border-t pt-1">
          <span className="font-semibold text-gray-700">{pedido.solicitante}</span> • {pedido.setor}
        </div>
      </div>
    </div>
  )
}