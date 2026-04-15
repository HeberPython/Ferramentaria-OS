import { Pedido } from '@/types'
import { STATUS_CONFIG, URGENCIA_CONFIG } from '@/lib/constants'
import Link from 'next/link'

interface KanbanCardProps {
  pedido: Pedido
  isAdmin?: boolean
  commentCount?: number
  isDragging?: boolean
}

function isPrazoVencido(prazo?: string): boolean {
  if (!prazo) return false
  return new Date(prazo + 'T23:59:59') < new Date()
}

export function KanbanCard({
  pedido,
  isAdmin = false,
  commentCount = 0,
  isDragging = false,
}: KanbanCardProps) {
  const urgenciaConfig = URGENCIA_CONFIG[pedido.urgencia]
  const statusConfig = STATUS_CONFIG[pedido.status]
  const prazoVencido = isPrazoVencido(pedido.prazo_definido || pedido.prazo_desejado)
  const prazo = pedido.prazo_definido || pedido.prazo_desejado

  const urgenciaBorder =
    pedido.urgencia === 'urgente'
      ? 'border-l-red-500'
      : pedido.urgencia === 'alta'
      ? 'border-l-yellow-500'
      : 'border-l-blue-300'

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${urgenciaBorder} shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-1 shadow-xl' : ''
      }`}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold text-gray-400">
            #{String(pedido.numero).padStart(4, '0')}
          </span>
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${urgenciaConfig.bg} ${urgenciaConfig.color}`}
          >
            {urgenciaConfig.label}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
          {pedido.tipo_servico}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{pedido.setor}</p>
      </div>

      {/* Body */}
      <div className="px-3 pb-2">
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{pedido.descricao}</p>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-1 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {prazo && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                prazoVencido ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(prazo + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              {prazoVencido && ' !'}
            </span>
          )}
          {isAdmin && commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {commentCount}
            </span>
          )}
        </div>

        {isAdmin && (
          <Link
            href={`/admin/dashboard/pedidos/${pedido.id}`}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Abrir
          </Link>
        )}
      </div>

      {isAdmin && pedido.responsavel && (
        <div className="px-3 pb-2 -mt-1">
          <span className="text-xs text-gray-400">
            Resp: {pedido.responsavel.nome}
          </span>
        </div>
      )}
    </div>
  )
}
