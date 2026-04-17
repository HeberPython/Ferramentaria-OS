'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'

export function KanbanCard({ pedido }: { pedido: Pedido }) {
  const statusConfig = STATUS_CONFIG[pedido.status];
  const urgenciaCor = pedido.urgencia === 'Alta' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex h-20">
      <div className={`w-1 shrink-0 ${statusConfig.bg}`} />
      <div className="p-2 flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono text-gray-400">#{pedido.id.slice(-4)}</span>
          <span className={`text-[8px] px-1 rounded font-bold uppercase ${urgenciaCor}`}>
            {pedido.urgencia}
          </span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">
          {pedido.titulo}
        </h4>
        <div className="text-[9px] text-gray-500 truncate border-t pt-1">
          <span className="font-bold text-gray-700">{pedido.solicitante}</span> | {pedido.setor}
        </div>
      </div>
    </div>
  )
}