import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Pedido, StatusPedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'

async function getPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .not('status', 'eq', 'cancelado')
    .order('criado_em', { ascending: false })

  if (error) return []
  return data as Pedido[]
}

export const revalidate = 30

export default async function HomePage() {
  const pedidos = await getPedidos()

  const contagemPorStatus = STATUS_ORDER.reduce<Record<StatusPedido, number>>(
    (acc, status) => {
      acc[status] = pedidos.filter((p) => p.status === status).length
      return acc
    },
    {} as Record<StatusPedido, number>
  )

  const totalAtivos = pedidos.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://scitec.com.br/wp-content/uploads/2023/07/SCiTec-Laboratorio-Logo-150x113.png"
              alt="SCiTec"
              className="h-9 w-auto"
            />
            <div className="border-l border-gray-200 pl-3">
              <h1 className="text-base font-bold text-gray-900 leading-tight">Ferramentaria</h1>
              <p className="text-xs text-gray-500">Painel de acompanhamento</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/solicitar"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block"
            >
              Acompanhar pedido
            </Link>
            <Link
              href="/solicitar"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Abrir Pedido
            </Link>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full px-6 py-3 flex items-center gap-6 overflow-x-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            <strong className="text-gray-900">{totalAtivos}</strong> pedidos ativos
          </span>
          {STATUS_ORDER.filter(s => s !== 'cancelado').map((status) => {
            const config = STATUS_CONFIG[status]
            const count = contagemPorStatus[status]
            if (count === 0) return null
            return (
              <span key={status} className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${config.color}`}>
                <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                {config.label}: {count}
              </span>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Quadro de Pedidos — Somente leitura
          </h2>
          <p className="text-xs text-gray-400">Atualizado automaticamente</p>
        </div>

        {pedidos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum pedido no momento</h3>
            <p className="text-gray-500 mb-6">Seja o primeiro a abrir um pedido para a ferramentaria.</p>
            <Link
              href="/solicitar"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Abrir Pedido
            </Link>
          </div>
        ) : (
          <KanbanBoard pedidos={pedidos} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 mt-8 py-4 px-6">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Ferramentaria SCiTec — Sistema de Gestão de Ordens de Serviço</span>
          <Link href="/admin" className="hover:text-gray-200 transition-colors">Acesso Admin</Link>
        </div>
      </footer>
    </div>
  )
}
