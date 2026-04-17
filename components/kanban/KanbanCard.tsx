'use client'

import { Pedido } from '@/types'
import { STATUS_CONFIG, URGENCIA_CONFIG } from '@/lib/constants'
import Link from 'next/link'

interface KanbanCardProps {
  pedido: Pedido
  isAdmin?: boolean
  commentCount?: number
  isDragging?: boolean
}

export function KanbanCard({ pedido, isAdmin = false, commentCount = 0, isDragging = false }: KanbanCardProps) {
  const statusKey = (pedido.status || 'recebido') as keyof typeof STATUS_CONFIG
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.recebido

  const urgenciaRaw = String(pedido.urgencia || 'normal').toLowerCase()
  const urgenciaKey = urgenciaRaw as keyof typeof URGENCIA_CONFIG
  const urgencia = URGENCIA_CONFIG[urgenciaKey] || URGENCIA_CONFIG.normal

  const titulo = pedido.tipo_servico || pedido.titulo || 'Sem título'

  return (
    <div
      className={`bg-white border rounded-lg shadow-sm overflow-hidden flex h-20 shrink-0 transition-shadow ${
        isDragging ? 'opacity-50 rotate-1 shadow-xl' : 'hover:shadow-md'
      }`}
    >
      <div className={`w-1 shrink-0 ${statusConfig.bg}`} />
      <div className="p-2 flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex justify-between items-center leading-none">
          <span className="text-[9px] font-mono text-gray-400">
            #{String(pedido.numero || '').padStart(4, '0')}
          </span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${urgencia.bg} ${urgencia.color}`}>
            {urgencia.label}
          </span>
        </div>
        <h4 className="text-xs font-bold text-gray-900 truncate my-0.5">
          {titulo}
        </h4>
        <div className="text-[9px] text-gray-500 truncate border-t pt-1 italic flex items-center justify-between">
          <span>
            <span className="font-bold text-gray-700">{pedido.solicitante}</span> • {pedido.setor}
          </span>
          {isAdmin && (
            <Link
              href={`/admin/dashboard/pedidos/${pedido.id}`}
              className="text-blue-500 hover:text-blue-700 font-bold text-[9px] ml-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              Abrir
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}