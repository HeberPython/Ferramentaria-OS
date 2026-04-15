import { Pedido, StatusPedido } from '@/types'
import { STATUS_ORDER } from '@/lib/constants'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  pedidos: Pedido[]
}

export function KanbanBoard({ pedidos }: KanbanBoardProps) {
  const pedidosPorStatus = STATUS_ORDER.reduce<Record<StatusPedido, Pedido[]>>(
    (acc, status) => {
      acc[status] = pedidos.filter((p) => p.status === status)
      return acc
    },
    {} as Record<StatusPedido, Pedido[]>
  )

  return (
    <div className="flex gap-4 overflow-x-auto pb-6">
      {STATUS_ORDER.map((status) => (
        <KanbanColumn key={status} status={status} pedidos={pedidosPorStatus[status]}>
          {pedidosPorStatus[status].map((pedido) => (
            <KanbanCard key={pedido.id} pedido={pedido} isAdmin={false} />
          ))}
          {pedidosPorStatus[status].length === 0 && (
            <div className="flex items-center justify-center h-16 text-gray-400 text-xs">
              Nenhum pedido
            </div>
          )}
        </KanbanColumn>
      ))}
    </div>
  )
}
