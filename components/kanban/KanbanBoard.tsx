'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'
import { KanbanCard } from './KanbanCard'

export function KanbanBoard({ pedidos = [] }: { pedidos: Pedido[] }) {
  return (
    <div className="w-full bg-gray-50/50 rounded-xl overflow-x-auto no-scrollbar">
      <div className="flex gap-4 p-4 snap-x snap-mandatory">
        {STATUS_ORDER.map((status) => {
          const statusPedidos = pedidos.filter((p) => p.status === status);
          const config = STATUS_CONFIG[status];

          return (
            <div key={status} className="flex-shrink-0 w-[75vw] md:w-[300px] snap-center">
              <div className={`rounded-t-lg px-3 py-2 border-t border-x ${config.border} ${config.bg} flex justify-between items-center`}>
                <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                <span className="text-xs bg-white px-2 rounded-full border font-bold">{statusPedidos.length}</span>
              </div>
              <div className={`rounded-b-lg border-x border-b ${config.border} bg-white/50 p-2 min-h-[400px] flex flex-col gap-2`}>
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