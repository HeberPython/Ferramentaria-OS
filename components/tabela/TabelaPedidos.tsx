'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Pedido, StatusPedido, Urgencia } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER, URGENCIA_CONFIG, TIPOS_SERVICO } from '@/lib/constants'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { UrgenciaBadge } from '@/components/ui/UrgenciaBadge'

interface TabelaPedidosProps {
  pedidos: Pedido[]
}

type SortKey = 'numero' | 'criado_em' | 'setor' | 'solicitante' | 'tipo_servico' | 'urgencia' | 'status' | 'prazo_definido'
type SortDir = 'asc' | 'desc'

const PER_PAGE = 20

export function TabelaPedidos({ pedidos: pedidosIniciais }: TabelaPedidosProps) {
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | ''>('')
  const [filtroUrgencia, setFiltroUrgencia] = useState<Urgencia | ''>('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busca, setBusca] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('numero')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [pagina, setPagina] = useState(1)
  const [exportando, setExportando] = useState(false)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPagina(1)
  }

  const pedidosFiltrados = useMemo(() => {
    let lista = [...pedidosIniciais]

    if (filtroStatus) lista = lista.filter((p) => p.status === filtroStatus)
    if (filtroUrgencia) lista = lista.filter((p) => p.urgencia === filtroUrgencia)
    if (filtroTipo) lista = lista.filter((p) => p.tipo_servico === filtroTipo)
    if (busca.trim()) {
      const q = busca.toLowerCase()
      lista = lista.filter(
        (p) =>
          p.solicitante.toLowerCase().includes(q) ||
          p.setor.toLowerCase().includes(q) ||
          p.descricao.toLowerCase().includes(q) ||
          String(p.numero).includes(q)
      )
    }

    lista.sort((a, b) => {
      let va: string | number = a[sortKey as keyof Pedido] as string | number || ''
      let vb: string | number = b[sortKey as keyof Pedido] as string | number || ''

      if (sortKey === 'urgencia') {
        const order: Record<Urgencia, number> = { normal: 0, alta: 1, urgente: 2 }
        va = order[a.urgencia]
        vb = order[b.urgencia]
      }

      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return lista
  }, [pedidosIniciais, filtroStatus, filtroUrgencia, filtroTipo, busca, sortKey, sortDir])

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / PER_PAGE))
  const pedidosPagina = pedidosFiltrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE)

  async function exportar(formato: 'xlsx' | 'csv') {
    setExportando(true)
    try {
      const params = new URLSearchParams()
      if (filtroStatus) params.set('status', filtroStatus)
      if (filtroUrgencia) params.set('urgencia', filtroUrgencia)
      if (filtroTipo) params.set('tipo_servico', filtroTipo)
      if (busca) params.set('busca', busca)
      params.set('formato', formato)

      const res = await fetch(`/api/export?${params.toString()}`)
      if (!res.ok) throw new Error('Erro ao exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedidos-ferramentaria.${formato}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportando(false)
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div>
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          {/* Busca */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nome, setor, número..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Todos os tipos</option>
            {TIPOS_SERVICO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Export */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => exportar('xlsx')}
              disabled={exportando}
              className="flex items-center gap-1.5 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel
            </button>
            <button
              onClick={() => exportar('csv')}
              disabled={exportando}
              className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Chips Status */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-500 self-center">Status:</span>
          <button
            onClick={() => { setFiltroStatus(''); setPagina(1) }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filtroStatus === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            Todos
          </button>
          {STATUS_ORDER.map((s) => {
            const c = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => { setFiltroStatus(s); setPagina(1) }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  filtroStatus === s
                    ? `${c.bg} ${c.color} ${c.border}`
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {c.label}
              </button>
            )
          })}

          <span className="text-xs text-gray-500 self-center ml-3">Urgência:</span>
          <button
            onClick={() => { setFiltroUrgencia(''); setPagina(1) }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filtroUrgencia === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            Todas
          </button>
          {(['normal', 'alta', 'urgente'] as Urgencia[]).map((u) => {
            const c = URGENCIA_CONFIG[u]
            return (
              <button
                key={u}
                onClick={() => { setFiltroUrgencia(u); setPagina(1) }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  filtroUrgencia === u
                    ? `${c.bg} ${c.color} border-current`
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
        <span>{pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} encontrado{pedidosFiltrados.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  { key: 'numero', label: '#' },
                  { key: 'criado_em', label: 'Data' },
                  { key: 'setor', label: 'Setor' },
                  { key: 'solicitante', label: 'Solicitante' },
                  { key: 'tipo_servico', label: 'Tipo' },
                  { key: 'urgencia', label: 'Urgência' },
                  { key: 'status', label: 'Status' },
                  { key: 'prazo_definido', label: 'Prazo' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key as SortKey)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer hover:text-gray-900 select-none whitespace-nowrap"
                  >
                    {col.label}
                    <SortIcon col={col.key as SortKey} />
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pedidosPagina.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                pedidosPagina.map((p) => {
                  const prazoVencido =
                    p.prazo_definido && new Date(p.prazo_definido + 'T23:59:59') < new Date()
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-500">
                        #{String(p.numero).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-gray-800 max-w-[120px] truncate">{p.setor}</td>
                      <td className="px-4 py-3 text-gray-800 max-w-[140px] truncate">{p.solicitante}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{p.tipo_servico}</td>
                      <td className="px-4 py-3">
                        <UrgenciaBadge urgencia={p.urgencia} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className={`px-4 py-3 text-sm whitespace-nowrap ${prazoVencido ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {p.prazo_definido
                          ? new Date(p.prazo_definido + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/dashboard/pedidos/${p.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                ← Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const p = Math.max(1, Math.min(pagina - 2, totalPaginas - 4)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`px-2.5 py-1 text-xs border rounded ${
                      p === pagina
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
