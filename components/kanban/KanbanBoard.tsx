'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  pedidos: Pedido[]
}

export function KanbanBoard({ pedidos }: KanbanBoardProps) {
  return (
    /* Removido o overflow-hidden de fora e deixado apenas como base */
    <div className="w-full h-full bg-gray-50/50 rounded-xl">
      {/* ÚNICA BARRA DE ROLAGEM: O overflow-x-auto fica apenas aqui */}
      <div className="flex gap-4 overflow-x-auto p-4 snap-x snap-mandatory scroll-smooth no-scrollbar min-h-[600px]">
        {STATUS_ORDER.map((status) => {
          const statusPedidos = pedidos.filter((p) => p.status === status);
          const config = STATUS_CONFIG[status];

          return (
            <div 
              key={status} 
              className="flex-shrink-0 w-[80vw] md:w-[300px] flex flex-col snap-center h-fit"
            >
              <div className={`rounded-t-lg px-3 py-2 border-t border-x ${config.border} ${config.bg} flex justify-between items-center`}>
                <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                <span className="text-xs bg-white px-2 rounded-full border shadow-sm">
                  {statusPedidos.length}
                </span>
              </div>

              <div className={`flex-1 rounded-b-lg border-x border-b ${config.border} bg-white/50 p-2 min-h-[500px]`}>
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