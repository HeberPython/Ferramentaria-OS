'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
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

function SortableKanbanCard({
  pedido,
  commentCount,
}: {
  pedido: Pedido
  commentCount: number
}) {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard
        pedido={pedido}
        isAdmin
        commentCount={commentCount}
        isDragging={isDragging}
      />
    </div>
  )
}

interface ConfirmModalProps {
  pedido: Pedido
  novoStatus: StatusPedido
  onConfirm: (observacao: string) => void
  onCancel: () => void
  loading: boolean
}

function ConfirmModal({ pedido, novoStatus, onConfirm, onCancel, loading }: ConfirmModalProps) {
  const [observacao, setObservacao] = useState('')
  const configNovo = STATUS_CONFIG[novoStatus]
  const configAtual = STATUS_CONFIG[pedido.status]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar mudança de status</h3>
          <p className="text-sm text-gray-600 mb-4">
            Pedido <strong>#{String(pedido.numero).padStart(4, '0')}</strong> — {pedido.tipo_servico}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Atual</p>
              <p className="text-sm font-semibold text-gray-700">{configAtual.label}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className={`flex-1 rounded-lg px-3 py-2 text-center border-2 ${configNovo.border} ${configNovo.bg}`}>
              <p className={`text-xs mb-0.5 ${configNovo.color}`}>Novo</p>
              <p className={`text-sm font-semibold ${configNovo.color}`}>{configNovo.label}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação (opcional)
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Adicione uma observação sobre esta mudança..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(observacao)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
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
    <div className="flex flex-col min-w-[260px] max-w-[280px] w-full">
      <div
        className={`rounded-t-lg px-3 py-2.5 border ${config.border} ${config.bg} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <span
          className={`text-xs font-bold ${config.color} bg-white rounded-full w-5 h-5 flex items-center justify-center border ${config.border}`}
        >
          {pedidos.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border-x border-b ${config.border} p-2 min-h-[120px] space-y-2 transition-colors ${
          isOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
        }`}
      >
        <SortableContext
          items={pedidos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {pedidos.map((pedido) => (
            <SortableKanbanCard key={pedido.id} pedido={pedido} commentCount={0} />
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
  const [pendingMove, setPendingMove] = useState<{
    pedido: Pedido
    novoStatus: StatusPedido
  } | null>(null)
  const [savingStatus, setSavingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
    const { active } = event
    const pedido = pedidos.find((p) => p.id === active.id)
    if (pedido) setActivePedido(pedido)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePedido(null)

    if (!over) return

    const pedidoMovido = pedidos.find((p) => p.id === active.id)
    if (!pedidoMovido) return

    // Determine target column — the over target can be a column or a card
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

    setPendingMove({ pedido: pedidoMovido, novoStatus })
  }

  async function confirmarMudancaStatus(observacao: string) {
    if (!pendingMove) return
    setSavingStatus(true)
    setError(null)

    try {
      const res = await fetch(`/api/pedidos/${pendingMove.pedido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: pendingMove.novoStatus,
          observacao: observacao || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao atualizar status')
      }

      const { pedido: pedidoAtualizado } = await res.json()
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p))
      )
      setPendingMove(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setPendingMove(null)
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>fechar</button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
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
            <div className="rotate-2 opacity-90">
              <KanbanCard pedido={activePedido} isAdmin isDragging={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingMove && (
        <ConfirmModal
          pedido={pendingMove.pedido}
          novoStatus={pendingMove.novoStatus}
          onConfirm={confirmarMudancaStatus}
          onCancel={() => setPendingMove(null)}
          loading={savingStatus}
        />
      )}
    </>
  )
}
