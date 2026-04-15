'use client'

import { useState } from 'react'
import { TIPOS_SERVICO } from '@/lib/constants'
import { Urgencia } from '@/types'

interface FormData {
  setor: string
  solicitante: string
  email_contato: string
  telefone: string
  tipo_servico: string
  descricao: string
  urgencia: Urgencia
  prazo_desejado: string
}

interface ResultadoCriado {
  numero: number
  token_acompanhamento: string
}

export function FormularioPedido() {
  const [form, setForm] = useState<FormData>({
    setor: '',
    solicitante: '',
    email_contato: '',
    telefone: '',
    tipo_servico: '',
    descricao: '',
    urgencia: 'normal',
    prazo_desejado: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoCriado | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          prazo_desejado: form.prazo_desejado || undefined,
          telefone: form.telefone || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido')

      setResultado({
        numero: data.pedido.numero,
        token_acompanhamento: data.pedido.token_acompanhamento,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (resultado) {
    const link = `${window.location.origin}/acompanhar/${resultado.token_acompanhamento}`
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido enviado!</h2>
          <p className="text-gray-600 mb-6">
            Seu pedido foi registrado com sucesso. Guarde o número e o link abaixo para acompanhar.
          </p>

          <div className="bg-white border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Número do pedido</p>
            <p className="text-4xl font-bold text-blue-700">
              #{String(resultado.numero).padStart(4, '0')}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Link de acompanhamento:</p>
            <a
              href={link}
              className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
            >
              {link}
            </a>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Um e-mail de confirmação foi enviado para <strong>{form.email_contato}</strong>
          </p>

          <div className="flex gap-3">
            <a
              href={link}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg text-center transition-colors"
            >
              Acompanhar pedido
            </a>
            <button
              onClick={() => {
                setResultado(null)
                setForm({
                  setor: '',
                  solicitante: '',
                  email_contato: '',
                  telefone: '',
                  tipo_servico: '',
                  descricao: '',
                  urgencia: 'normal',
                  prazo_desejado: '',
                })
              }}
              className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Novo pedido
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section 1: Identificação */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            Identificação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="setor"
                value={form.setor}
                onChange={handleChange}
                required
                placeholder="Ex: Laboratório de Ensaios"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do solicitante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="solicitante"
                value={form.solicitante}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail para contato <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email_contato"
                value={form.email_contato}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span className="text-gray-400 text-xs font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Serviço */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            Detalhes do Serviço
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de serviço <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo_servico"
                value={form.tipo_servico}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Selecione o tipo de serviço</option>
                {TIPOS_SERVICO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição detalhada <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Descreva com detalhes o serviço necessário, especificações, materiais envolvidos, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Prazo e Urgência */}
        <div className="p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            Prazo e Urgência
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Urgência <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'normal', label: 'Normal', desc: 'Sem urgência especial', color: 'text-gray-700' },
                  { value: 'alta', label: 'Alta', desc: 'Necessário em breve', color: 'text-yellow-700' },
                  { value: 'urgente', label: 'Urgente', desc: 'Parada de produção', color: 'text-red-700' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      form.urgencia === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgencia"
                      value={opt.value}
                      checked={form.urgencia === opt.value}
                      onChange={handleChange}
                      className="text-blue-600"
                    />
                    <div>
                      <span className={`text-sm font-semibold ${opt.color}`}>{opt.label}</span>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo desejado <span className="text-gray-400 text-xs font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                name="prazo_desejado"
                value={form.prazo_desejado}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Informe se houver uma data limite para conclusão do serviço.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar Pedido'
          )}
        </button>
      </div>
    </form>
  )
}
