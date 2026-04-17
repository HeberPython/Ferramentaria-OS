'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'

export function KanbanCard({ pedido }: { pedido: Pedido }) {
  const statusConfig = STATUS_CONFIG[pedido.status];
  
  // Lógica de Urgência embutida para evitar erro de importação
  const urgenciaEstilo = pedido.urgencia === 'Alta' 
    ? 'bg-red-100 text-red-700' 
    : 'bg-blue-100 text-blue-700';

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex h-20">
      {/* Faixa lateral colorida */}
      <div className={`w-1 shrink-0 ${statusConfig.bg}`} />
      
      <div className="p-2 flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-start leading-none">
          <span className="text-[9px] font-mono text-gray-400">#{pedido.id.slice(-4)}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${urgenciaEstilo}`}>
            {pedido.urgencia}
          </span>
        </div>

        {/* Título truncado para caber em uma linha */}
        <h4 className="text-xs font-bold text-gray-900 truncate my-0.5">
          {pedido.titulo}
        </h4>

        {/* Solicitante e Setor em destaque compacto */}
        <div className="text-[10px] text-gray-500 truncate italic border-t pt-1">
          <span className="font-semibold text-gray-700">{pedido.solicitante}</span> • {pedido.setor}
        </div>
      </div>
    </div>
  )
}