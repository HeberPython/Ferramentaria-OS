'use client'

import { useState } from 'react'
import { Pedido, StatusPedido, Usuario, HistoricoStatus } from '@/types'
import { STATUS_CONFIG, STATUS_ORDER, URGENCIA_CONFIG } from '@/lib/constants'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { UrgenciaBadge } from '@/components/ui/UrgenciaBadge'

interface DetalhesPedidoProps {
  pedido: Pedido
  historico: HistoricoStatus[]
  usuarios: Usuario[]
}

export function DetalhesPedido({ pedido: pedidoInicial, historico: historicoInicial, usuarios }: DetalhesPedidoProps) {
  const [pedido, setPedido] = useState<Pedido>(pedidoInicial)
  const [historico, setHistorico] = useState<HistoricoStatus[]>(historicoInicial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [novoStatus, setNovoStatus] = useState<StatusPedido>(pedido.status)
  const [observacaoStatus, setObservacaoStatus] = useState('')
  const [prazoDefinido, setPrazoDefinido] = useState(pedido.prazo_definido || '')
  const [responsavelId, setResponsavelId] = useState(pedido.responsavel_id || '')
  const [observacoesInternas, setObservacoesInternas] = useState(pedido.observacoes_internas || '')
  const [confirmCancelar, setConfirmCancelar] = useState(false)

  function showSuccess(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function atualizarStatus() {
    if (novoStatus === pedido.status) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus, observacao: observacaoStatus || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPedido(data.pedido)
      setHistorico((prev) => [data.historico, ...prev])
      setObservacaoStatus('')
      showSuccess('Status atualizado com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  async function atualizarDetalhes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prazo_definido: prazoDefinido || null,
          responsavel_id: responsavelId || null,
          observacoes_internas: observacoesInternas || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPedido(data.pedido)
      showSuccess('Pedido atualizado com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  async function cancelarPedido() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pedidos/${pedido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado', observacao: 'Pedido cancelado pelo administrador.' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPedido(data.pedido)
      setHistorico((prev) => [data.historico, ...prev])
      setConfirmCancelar(false)
      showSuccess('Pedido cancelado.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="xl:col-span-2 space-y-6">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-gray-400">
                  #{String(pedido.numero).padStart(4, '0')}
                </span>
                <StatusBadge status={pedido.status} />
                <UrgenciaBadge urgencia={pedido.urgencia} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{pedido.tipo_servico}</h1>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Criado em {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</p>
              <p>Atualizado {new Date(pedido.atualizado_em).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Dados do Solicitante */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Solicitante</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Nome</p>
              <p className="font-semibold text-gray-900">{pedido.solicitante}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Setor</p>
              <p className="font-semibold text-gray-900">{pedido.setor}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">E-mail</p>
              <a href={`mailto:${pedido.email_contato}`} className="font-semibold text-blue-600 hover:underline">
                {pedido.email_contato}
              </a>
            </div>
            {pedido.telefone && (
              <div>
                <p className="text-gray-500 mb-0.5">Telefone</p>
                <p className="font-semibold text-gray-900">{pedido.telefone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Descrição</h2>
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{pedido.descricao}</p>
        </div>

        {/* Histórico de Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Histórico de Status</h2>
          <div className="space-y-3">
            {historico.map((h, idx) => {
              const config = STATUS_CONFIG[h.status_novo as StatusPedido]
              return (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${config?.dot || 'bg-gray-400'}`} />
                    {idx < historico.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config?.bg || 'bg-gray-50'} ${config?.color || 'text-gray-600'} border ${config?.border || 'border-gray-200'}`}>
                        {config?.label || h.status_novo}
                      </span>
                      {h.status_anterior && (
                        <span className="text-xs text-gray-400">
                          (antes: {STATUS_CONFIG[h.status_anterior as StatusPedido]?.label || h.status_anterior})
                        </span>
                      )}
                    </div>
                    {h.observacao && (
                      <p className="text-xs text-gray-600 mt-1">{h.observacao}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {h.usuario_nome && `${h.usuario_nome} · `}
                      {new Date(h.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Feedback */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Atualizar Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Atualizar Status</h3>
          <select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value as StatusPedido)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <textarea
            value={observacaoStatus}
            onChange={(e) => setObservacaoStatus(e.target.value)}
            placeholder="Observação (opcional)"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={atualizarStatus}
            disabled={loading || novoStatus === pedido.status}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            Salvar Status
          </button>
        </div>

        {/* Prazo e Responsável */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalhes do Atendimento</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Prazo definido</label>
              <input
                type="date"
                value={prazoDefinido}
                onChange={(e) => setPrazoDefinido(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Responsável</label>
              <select
                value={responsavelId}
                onChange={(e) => setResponsavelId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sem responsável</option>
                {usuarios.filter(u => u.ativo).map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Observações internas</label>
              <textarea
                value={observacoesInternas}
                onChange={(e) => setObservacoesInternas(e.target.value)}
                placeholder="Notas visíveis apenas para a equipe..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <button
              onClick={atualizarDetalhes}
              disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              Salvar Detalhes
            </button>
          </div>
        </div>

        {/* Prazos Info */}
        {(pedido.prazo_desejado || pedido.prazo_definido) && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Prazos</h3>
            {pedido.prazo_desejado && (
              <div className="text-sm mb-1">
                <span className="text-gray-500">Desejado: </span>
                <span className="font-medium">{new Date(pedido.prazo_desejado + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {pedido.prazo_definido && (
              <div className="text-sm">
                <span className="text-gray-500">Definido: </span>
                <span className="font-medium text-brand-600">{new Date(pedido.prazo_definido + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}

        {/* Cancelar */}
        {pedido.status !== 'cancelado' && (
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-red-700 mb-2">Zona de Perigo</h3>
            {!confirmCancelar ? (
              <button
                onClick={() => setConfirmCancelar(true)}
                className="w-full border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                Cancelar Pedido
              </button>
            ) : (
              <div>
                <p className="text-xs text-red-600 mb-3">Tem certeza? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancelar(false)}
                    className="flex-1 border border-gray-300 text-gray-600 text-xs font-semibold py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    Não
                  </button>
                  <button
                    onClick={cancelarPedido}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Sim, cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
