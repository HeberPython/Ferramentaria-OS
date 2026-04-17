'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { UserIcon } from 'lucide-react'

export function KanbanCard({ pedido }: { pedido: Pedido }) {
  const statusConfig = STATUS_CONFIG[pedido.status]

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex h-24">
      {/* Faixa lateral de status */}
      <div className={`w-1 shrink-0 ${statusConfig.bg}`} />
      
      <div className="p-2 flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-mono text-gray-400">#{pedido.id.slice(-4)}</span>
          {/* Badge de Urgência integrado (evita erro de importação) */}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
            pedido.urgencia === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {pedido.urgencia}
          </span>
        </div>

        {/* Título Compacto */}
        <h4 className="text-sm font-bold text-gray-900 truncate">{pedido.titulo}</h4>

        {/* Solicitante e Setor */}
        <div className="flex items-center gap-1 text-gray-500">
          <UserIcon size={12} className="shrink-0" />
          <span className="text-[10px] truncate italic">
            {pedido.solicitante} • {pedido.setor}
          </span>
        </div>
      </div>
    </div>
  )
}