'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pedido, StatusPedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardAdminProps {
  pedidosIniciais: Pedido[]
}

function SortableKanbanCard({ pedido }: { pedido: Pedido }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pedido.id, data: { type: 'card', pedido } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <KanbanCard
        pedido={pedido}
        isAdmin
        isDragging={isDragging}
      />
    </div>
  )
}

function DroppableColumn({
  status,
  pedidos,
}: {
  status: StatusPedido
  pedidos: Pedido[]
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col min-w-[240px] w-full">
      <div className={`rounded-t-lg px-3 py-2.5 border ${config.border} ${config.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <span className={`text-xs font-bold ${config.color} bg-white rounded-full w-5 h-5 flex items-center justify-center border ${config.border}`}>
          {pedidos.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border-x border-b ${config.border} p-2 min-h-[200px] space-y-2 transition-colors ${
          isOver ? 'bg-blue-50' : 'bg-gray-50'
        }`}
      >
        <SortableContext
          items={pedidos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {pedidos.map((pedido) => (
            <SortableKanbanCard key={pedido.id} pedido={pedido} />
          ))}
        </SortableContext>

        {pedidos.length === 0 && (
          <div className="flex items-center justify-center h-16 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg">
            Solte aqui
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoardAdmin({ pedidosIniciais }: KanbanBoardAdminProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais)
  const [activePedido, setActivePedido] = useState<Pedido | null>(null)
  const [savingStatus, setSavingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  )

  const pedidosPorStatus = STATUS_ORDER.reduce<Record<StatusPedido, Pedido[]>>(
    (acc, status) => {
      acc[status] = pedidos.filter((p) => p.status === status)
      return acc
    },
    {} as Record<StatusPedido, Pedido[]>
  )

  function handleDragStart(event: DragStartEvent) {
    const pedido = pedidos.find((p) => p.id === event.active.id)
    if (pedido) setActivePedido(pedido)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePedido(null)

    if (!over) return

    const pedidoMovido = pedidos.find((p) => p.id === active.id)
    if (!pedidoMovido) return

    const overData = over.data.current as
      | { type: 'column'; status: StatusPedido }
      | { type: 'card'; pedido: Pedido }
      | undefined

    let novoStatus: StatusPedido | undefined

    if (overData?.type === 'column') {
      novoStatus = overData.status
    } else if (overData?.type === 'card') {
      novoStatus = overData.pedido.status
    } else if (STATUS_ORDER.includes(over.id as StatusPedido)) {
      novoStatus = over.id as StatusPedido
    }

    if (!novoStatus || novoStatus === pedidoMovido.status) return

    // Atualiza localmente imediato
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoMovido.id ? { ...p, status: novoStatus! } : p
      )
    )

    setSavingStatus(true)
    setError(null)

    try {
      const res = await fetch(`/api/pedidos/${pedidoMovido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao atualizar status')
      }

      const { pedido: pedidoAtualizado } = await res.json()
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p))
      )
    } catch (err) {
      // Reverte se der erro
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoMovido.id ? { ...p, status: pedidoMovido.status } : p
        )
      )
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between">
          {error}
          <button className="underline ml-2" onClick={() => setError(null)}>fechar</button>
        </div>
      )}

      {savingStatus && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Salvando...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-6">
          {STATUS_ORDER.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              pedidos={pedidosPorStatus[status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activePedido ? (
            <div className="rotate-2 opacity-90 w-60">
              <KanbanCard pedido={activePedido} isAdmin isDragging={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}