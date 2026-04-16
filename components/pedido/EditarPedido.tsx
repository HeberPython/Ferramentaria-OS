'use client'

import { useState } from 'react'

interface EditarPedidoProps {
  pedidoId: string
  token: string
  descricaoAtual: string
  telefoneAtual: string
  prazoDesejadoAtual: string
}

export function EditarPedido({
  pedidoId,
  token,
  descricaoAtual,
  telefoneAtual,
  prazoDesejadoAtual,
}: EditarPedidoProps) {
  const [aberto, setAberto] = useState(false)
  const [descricao, setDescricao] = useState(descricaoAtual)
  const [telefone, setTelefone] = useState(telefoneAtual)
  const [prazoDesejado, setPrazoDesejado] = useState(prazoDesejadoAtual)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setError(null)

    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/editar-solicitante`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          descricao,
          telefone: telefone || undefined,
          prazo_desejado: prazoDesejado || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(true)
      setAberto(false)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Atualizar informações
        </h2>
        {!aberto && (
          <button
            onClick={() => setAberto(true)}
            className="text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
          >
            Editar pedido
          </button>
        )}
      </div>

      {success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Pedido atualizado! A ferramentaria foi notificada por e-mail.
        </div>
      )}

      {!aberto ? (
        <p className="text-sm text-gray-400">
          Precisa corrigir ou acrescentar informações? Clique em <strong>Editar pedido</strong> acima.
          A ferramentaria receberá uma notificação automática.
        </p>
      ) : (
        <form onSubmit={salvar} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo desejado <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="date"
                value={prazoDesejado}
                onChange={(e) => setPrazoDesejado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setAberto(false)
                setDescricao(descricaoAtual)
                setTelefone(telefoneAtual)
                setPrazoDesejado(prazoDesejadoAtual)
                setError(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
