'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  pedidos: Pedido[]
}

export function KanbanBoard({ pedidos }: KanbanBoardProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50/50 rounded-xl border border-gray-200 shadow-inner overflow-hidden">
      {/* TRILHO ÚNICO: Títulos + Cards rolam juntos aqui */}
      <div className="flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
        {STATUS_ORDER.map((status) => {
          const statusPedidos = pedidos.filter((p) => p.status === status);
          const config = STATUS_CONFIG[status];

          return (
            <div 
              key={status} 
              className="flex-shrink-0 w-[80vw] md:w-[300px] flex flex-col snap-center"
            >
              {/* Cabeçalho da Coluna */}
              <div className={`rounded-t-lg px-3 py-2 border-t border-x ${config.border} ${config.bg} flex justify-between items-center`}>
                <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                <span className="text-xs bg-white px-2 rounded-full border shadow-sm">
                  {statusPedidos.length}
                </span>
              </div>

              {/* Área dos Cards */}
              <div className={`flex-1 min-h-[60vh] rounded-b-lg border-x border-b ${config.border} bg-white/50 p-2`}>
                <div className="space-y-3">
                  {statusPedidos.length > 0 ? (
                    statusPedidos.map((pedido) => (
                      <KanbanCard key={pedido.id} pedido={pedido} />
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400 text-sm italic">
                      Nenhum pedido
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}