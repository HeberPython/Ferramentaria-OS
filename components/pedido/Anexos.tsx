'use client'

import { useState, useRef } from 'react'

interface Anexo {
  id: string
  nome_original: string
  url: string
  tipo_mime: string
  tamanho: number
  criado_em: string
}

interface AnexosProps {
  pedidoId: string
  anexosIniciais: Anexo[]
  isAdmin?: boolean
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function iconeArquivo(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️'
  if (mime.startsWith('video/')) return '🎥'
  if (mime === 'application/pdf') return '📄'
  if (mime.includes('dwg') || mime.includes('autocad') || mime.includes('dxf')) return '📐'
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z')) return '🗜️'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return '📊'
  return '📎'
}

export function Anexos({ pedidoId, anexosIniciais, isAdmin = false }: AnexosProps) {
  const [anexos, setAnexos] = useState<Anexo[]>(anexosIniciais)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`/api/pedidos/${pedidoId}/anexos`, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setAnexos((prev) => [...prev, data.anexo])
      } catch (err) {
        setError(err instanceof Error ? err.message : `Erro ao enviar ${file.name}`)
      }
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function excluir(anexo: Anexo) {
    if (!confirm(`Excluir "${anexo.nome_original}"?`)) return
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/anexos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anexoId: anexo.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setAnexos((prev) => prev.filter((a) => a.id !== anexo.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Anexos {anexos.length > 0 && `(${anexos.length})`}
        </h2>
        {isAdmin && (
          <label className="cursor-pointer">
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            <span className="text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors">
              {uploading ? 'Enviando...' : '+ Adicionar arquivo'}
            </span>
          </label>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {anexos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum arquivo anexado.</p>
      ) : (
        <div className="space-y-2">
          {anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group"
            >
              <span className="text-xl flex-shrink-0">{iconeArquivo(anexo.tipo_mime)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={anexo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-600 hover:text-brand-800 hover:underline truncate block"
                >
                  {anexo.nome_original}
                </a>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatarTamanho(anexo.tamanho)} ·{' '}
                  {new Date(anexo.criado_em).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <a
                href={anexo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                title="Abrir"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {isAdmin && (
                <button
                  onClick={() => excluir(anexo)}
                  className="text-gray-300 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
