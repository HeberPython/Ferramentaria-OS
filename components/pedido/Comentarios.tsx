'use client'

import { useState } from 'react'
import { Comentario } from '@/types'

interface ComentariosProps {
  pedidoId: string
  comentariosIniciais: Comentario[]
  isAdmin?: boolean
  nomeUsuario?: string
}

export function Comentarios({ pedidoId, comentariosIniciais, isAdmin = false, nomeUsuario = 'Visitante' }: ComentariosProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(comentariosIniciais)
  const [conteudo, setConteudo] = useState('')
  const [interno, setInterno] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visiveis = isAdmin ? comentarios : comentarios.filter((c) => !c.interno)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!conteudo.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo, interno: isAdmin ? interno : false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComentarios((prev) => [...prev, data.comentario])
      setConteudo('')
      setInterno(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Comentários {isAdmin && `(${comentarios.length})`}
      </h2>

      {/* Lista de comentários */}
      <div className="space-y-3 mb-6">
        {visiveis.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Nenhum comentário ainda.</p>
        )}
        {visiveis.map((c) => (
          <div
            key={c.id}
            className={`p-4 rounded-lg border text-sm ${
              c.interno
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
              <span className="font-semibold text-gray-800">{c.usuario_nome}</span>
              <div className="flex items-center gap-2">
                {c.interno && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                    Interno
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(c.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{c.conteudo}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      <form onSubmit={enviar} className="border-t border-gray-100 pt-4">
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Adicionar comentário..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={interno}
                onChange={(e) => setInterno(e.target.checked)}
                className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
              />
              Comentário interno (visível apenas para a equipe)
            </label>
          )}
          {!isAdmin && <div />}
          <button
            type="submit"
            disabled={loading || !conteudo.trim()}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-40"
          >
            {loading ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </form>
    </div>
  )
}
