'use client'

import { useState, useEffect, useCallback } from 'react'

interface TipoServico {
  id: string
  nome: string
  ativo: boolean
  ordem: number
}

export default function TiposServicoPage() {
  const [tipos, setTipos] = useState<TipoServico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoNome, setEditandoNome] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tipos-servico')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTipos(data.tipos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tipos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  function mostrarSucesso(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setError(null)
    try {
      const res = await fetch('/api/tipos-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTipos((prev) => [...prev, data.tipo])
      setNovoNome('')
      setShowForm(false)
      mostrarSucesso('Tipo de serviço adicionado!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarEdicao(id: string) {
    setSalvando(true)
    setError(null)
    try {
      const res = await fetch(`/api/tipos-servico/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editandoNome }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTipos((prev) => prev.map((t) => (t.id === id ? data.tipo : t)))
      setEditandoId(null)
      mostrarSucesso('Nome atualizado!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar')
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(tipo: TipoServico) {
    try {
      const res = await fetch(`/api/tipos-servico/${tipo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !tipo.ativo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTipos((prev) => prev.map((t) => (t.id === tipo.id ? data.tipo : t)))
      mostrarSucesso(`Tipo ${!tipo.ativo ? 'ativado' : 'desativado'}!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    }
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"? Pedidos existentes não serão afetados.`)) return
    try {
      const res = await fetch(`/api/tipos-servico/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setTipos((prev) => prev.filter((t) => t.id !== id))
      mostrarSucesso('Tipo excluído!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Serviço</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie os tipos disponíveis no formulário de pedidos
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setNovoNome('') }}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Novo Tipo
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Novo Tipo de Serviço</h2>
          <form onSubmit={adicionar} className="flex gap-3">
            <input
              type="text"
              required
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Calibração de Instrumento"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {salvando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : tipos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum tipo cadastrado ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tipos.map((tipo) => (
                <tr key={tipo.id} className={`hover:bg-gray-50 ${!tipo.ativo ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {editandoId === tipo.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editandoNome}
                          onChange={(e) => setEditandoNome(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') salvarEdicao(tipo.id)
                            if (e.key === 'Escape') setEditandoId(null)
                          }}
                        />
                        <button
                          onClick={() => salvarEdicao(tipo.id)}
                          disabled={salvando}
                          className="text-xs px-2.5 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="text-xs px-2.5 py-1 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      tipo.nome
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      tipo.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tipo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editandoId !== tipo.id && (
                        <button
                          onClick={() => { setEditandoId(tipo.id); setEditandoNome(tipo.nome) }}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => toggleAtivo(tipo)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                          tipo.ativo
                            ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            : 'border-green-300 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {tipo.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => excluir(tipo.id, tipo.nome)}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Tipos inativos não aparecem no formulário de pedidos. Pedidos já criados com o tipo excluído não são afetados.
      </p>
    </div>
  )
}
