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
  closestCorners,
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

function SortableItem({ pedido }: { pedido: Pedido }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pedido.id,
    data: { type: 'card', pedido }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <KanbanCard pedido={pedido} isAdmin isDragging={isDragging} />
    </div>
  )
}

function Column({ status, pedidos }: { status: StatusPedido; pedidos: Pedido[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col w-[80vw] md:w-[300px] flex-shrink-0 snap-center">
      <div className={`rounded-t-lg px-3 py-2 border-t border-x ${config.border} ${config.bg} flex justify-between items-center`}>
        <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
        <span className="text-xs bg-white px-2 rounded-full border">{pedidos.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border-x border-b ${config.border} p-2 min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-50' : 'bg-gray-50'
        }`}
      >
        <SortableContext items={pedidos.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 h-full">
            {pedidos.map(p => <SortableItem key={p.id} pedido={p} />)}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export function KanbanBoardAdmin({ pedidosIniciais }: KanbanBoardAdminProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais)
  const [activePedido, setActivePedido] = useState<Pedido | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePedido(null)
    if (!over) return

    const pedidoMovido = pedidos.find(p => p.id === active.id)
    if (!pedidoMovido) return

    const novoStatus = (over.data.current?.status || over.id) as StatusPedido
    if (!STATUS_ORDER.includes(novoStatus) || novoStatus === pedidoMovido.status) return

    setPedidos(prev => prev.map(p => p.id === pedidoMovido.id ? { ...p, status: novoStatus } : p))

    try {
      const res = await fetch(`/api/pedidos/${pedidoMovido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setPedidos(prev => prev.map(p => p.id === pedidoMovido.id ? { ...p, status: pedidoMovido.status } : p))
    }
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={(e) => setActivePedido(pedidos.find(p => p.id === e.active.id) || null)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-10 snap-x snap-mandatory scroll-smooth no-scrollbar">
        {STATUS_ORDER.map(status => (
          <Column 
            key={status} 
            status={status} 
            pedidos={pedidos.filter(p => p.status === status)} 
          />
        ))}
      </div>
      <DragOverlay>
        {activePedido ? (
          <div className="opacity-80 rotate-3 scale-105">
            <KanbanCard pedido={activePedido} isAdmin />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}