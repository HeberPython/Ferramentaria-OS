'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'
import { KanbanCard } from './KanbanCard'

export function KanbanBoard({ pedidos = [] }: { pedidos: Pedido[] }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
        {STATUS_ORDER.filter(s => s !== 'cancelado').map((status) => {
          const statusPedidos = pedidos.filter((p) => p.status === status);
          const config = STATUS_CONFIG[status];

          return (
            <div key={status} className="flex-shrink-0 w-[75vw] md:w-[300px] flex flex-col snap-center">
              <div className={`rounded-t-lg px-3 py-2 border-t border-x ${config.border} ${config.bg} flex justify-between items-center`}>
                <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                <span className="text-xs bg-white px-2 rounded-full border shadow-sm font-bold">{statusPedidos.length}</span>
              </div>
              <div className={`flex-1 rounded-b-lg border-x border-b ${config.border} bg-white/50 p-2 min-h-[400px] flex flex-col gap-2`}>
                {statusPedidos.map((pedido) => (
                  <KanbanCard key={pedido.id} pedido={pedido} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}