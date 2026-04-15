import { Pedido, StatusPedido } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  status: StatusPedido
  pedidos: Pedido[]
  isAdmin?: boolean
  children?: React.ReactNode
}

export function KanbanColumn({ status, pedidos, isAdmin = false, children }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col min-w-[260px] max-w-[280px] w-full">
      {/* Column Header */}
      <div className={`rounded-t-lg px-3 py-2.5 border ${config.border} ${config.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <span className={`text-xs font-bold ${config.color} bg-white rounded-full w-5 h-5 flex items-center justify-center border ${config.border}`}>
          {pedidos.length}
        </span>
      </div>

      {/* Column Body */}
      <div className={`flex-1 rounded-b-lg border-x border-b ${config.border} bg-gray-50 p-2 min-h-[120px] space-y-2`}>
        {children
          ? children
          : pedidos.map((pedido) => (
              <KanbanCard
                key={pedido.id}
                pedido={pedido}
                isAdmin={isAdmin}
              />
            ))}
        {pedidos.length === 0 && !children && (
          <div className="flex items-center justify-center h-16 text-gray-400 text-xs">
            Nenhum pedido
          </div>
        )}
      </div>
    </div>
  )
}
