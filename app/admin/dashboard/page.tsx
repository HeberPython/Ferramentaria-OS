import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Pedido, StatusPedido } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER } from '@/lib/constants'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { UrgenciaBadge } from '@/components/ui/UrgenciaBadge'

async function getMetricas() {
  const hoje = new Date()
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
  const inicioSemana = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ count: total }, { count: recebidosHoje }, { count: emAndamento }, { count: concluidosSemana }] =
    await Promise.all([
      supabaseServer.from('pedidos').select('*', { count: 'exact', head: true }),
      supabaseServer.from('pedidos').select('*', { count: 'exact', head: true }).gte('criado_em', inicioHoje),
      supabaseServer.from('pedidos').select('*', { count: 'exact', head: true }).in('status', ['em_andamento', 'em_analise', 'aguardando_material']),
      supabaseServer.from('pedidos').select('*', { count: 'exact', head: true }).eq('status', 'concluido').gte('atualizado_em', inicioSemana),
    ])

  return {
    total: total || 0,
    recebidosHoje: recebidosHoje || 0,
    emAndamento: emAndamento || 0,
    concluidosSemana: concluidosSemana || 0,
  }
}

async function getContagemPorStatus() {
  const { data } = await supabaseServer.from('pedidos').select('status')
  if (!data) return {} as Record<StatusPedido, number>

  return data.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
}

async function getPedidosRecentes(): Promise<Pedido[]> {
  const { data } = await supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .order('criado_em', { ascending: false })
    .limit(5)
  return (data as Pedido[]) || []
}

export const revalidate = 60

export default async function DashboardPage() {
  const [metricas, contagemStatus, pedidosRecentes] = await Promise.all([
    getMetricas(),
    getContagemPorStatus(),
    getPedidosRecentes(),
  ])

  const maxCount = Math.max(...Object.values(contagemStatus), 1)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total de Pedidos',
            value: metricas.total,
            icon: '📋',
            color: 'text-brand-600',
            bg: 'bg-brand-50',
          },
          {
            label: 'Recebidos Hoje',
            value: metricas.recebidosHoje,
            icon: '📥',
            color: 'text-green-700',
            bg: 'bg-green-50',
          },
          {
            label: 'Em Andamento',
            value: metricas.emAndamento,
            icon: '⚙️',
            color: 'text-purple-700',
            bg: 'bg-purple-50',
          },
          {
            label: 'Concluídos (7 dias)',
            value: metricas.concluidosSemana,
            icon: '✅',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center text-xl mb-3`}>
              {m.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{m.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de barras */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pedidos por Status</h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = contagemStatus[status] || 0
              const config = STATUS_CONFIG[status]
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{config.label}</span>
                    <span className="text-xs font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${config.dot} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pedidos recentes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Pedidos Recentes</h2>
            <Link
              href="/admin/dashboard/tabela"
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              Ver todos →
            </Link>
          </div>

          <div className="space-y-2">
            {pedidosRecentes.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhum pedido ainda.</p>
            ) : (
              pedidosRecentes.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/dashboard/pedidos/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 text-right">
                    <span className="text-xs font-bold text-gray-400">
                      #{String(p.numero).padStart(4, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.tipo_servico}</p>
                    <p className="text-xs text-gray-500 truncate">{p.setor} — {p.solicitante}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <UrgenciaBadge urgencia={p.urgencia} size="sm" />
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Links rápidos */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/admin/dashboard/kanban"
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Kanban Board</p>
              <p className="text-xs text-gray-500">Arrastar e soltar pedidos</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/dashboard/tabela"
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-brand-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-700 group-hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Tabela de Pedidos</p>
              <p className="text-xs text-gray-500">Filtrar e exportar</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
