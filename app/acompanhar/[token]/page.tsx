import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Pedido, HistoricoStatus, Comentario, StatusPedido } from '@/types'
import { STATUS_CONFIG, URGENCIA_CONFIG } from '@/lib/constants'
import { Comentarios } from '@/components/pedido/Comentarios'
import { Anexos } from '@/components/pedido/Anexos'
import { EditarPedido } from '@/components/pedido/EditarPedido'

async function getPedidoPorToken(token: string) {
  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('*')
    .eq('token_acompanhamento', token)
    .single()

  if (error || !data) return null
  return data as Pedido
}

async function getHistorico(pedidoId: string): Promise<HistoricoStatus[]> {
  const { data } = await supabaseServer
    .from('historico_status')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('criado_em', { ascending: false })
  return data || []
}

async function getComentariosPublicos(pedidoId: string): Promise<Comentario[]> {
  const { data } = await supabaseServer
    .from('comentarios')
    .select('*')
    .eq('pedido_id', pedidoId)
    .eq('interno', false)
    .order('criado_em', { ascending: true })
  return data || []
}

async function getAnexos(pedidoId: string) {
  const { data } = await supabaseServer
    .from('anexos')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('criado_em', { ascending: true })
  return data || []
}

export default async function AcompanharPage({
  params,
}: {
  params: { token: string }
}) {
  const pedido = await getPedidoPorToken(params.token)
  if (!pedido) notFound()

  const [historico, comentarios, anexos] = await Promise.all([
    getHistorico(pedido.id),
    getComentariosPublicos(pedido.id),
    getAnexos(pedido.id),
  ])

  const statusConfig = STATUS_CONFIG[pedido.status]
  const urgenciaConfig = URGENCIA_CONFIG[pedido.urgencia]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Painel público</span>
          </Link>
          <div className="flex items-center gap-2">
            <img
              src="https://scitec.com.br/wp-content/uploads/2023/07/SCiTec-Laboratorio-Logo-150x113.png"
              alt="SCiTec"
              className="h-8 w-auto"
            />
            <div className="border-l border-gray-200 pl-2">
              <span className="font-bold text-gray-900 text-sm">Ferramentaria</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Hero do pedido */}
        <div className={`rounded-2xl border ${statusConfig.border} ${statusConfig.bg} p-6`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${statusConfig.color}`}>
                Acompanhamento do Pedido
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                #{String(pedido.numero).padStart(4, '0')}
              </h1>
              <p className="text-gray-700 font-medium">{pedido.tipo_servico}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                {statusConfig.label}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgenciaConfig.bg} ${urgenciaConfig.color}`}>
                {urgenciaConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Dados */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Dados do Pedido
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Solicitante</p>
              <p className="font-semibold text-gray-900">{pedido.solicitante}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Setor</p>
              <p className="font-semibold text-gray-900">{pedido.setor}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Aberto em</p>
              <p className="font-semibold text-gray-900">
                {new Date(pedido.criado_em).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            {pedido.prazo_definido && (
              <div>
                <p className="text-gray-500 mb-0.5">Prazo previsto</p>
                <p className="font-semibold text-brand-600">
                  {new Date(pedido.prazo_definido + 'T12:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            )}
            {pedido.prazo_desejado && !pedido.prazo_definido && (
              <div>
                <p className="text-gray-500 mb-0.5">Prazo desejado</p>
                <p className="font-semibold text-gray-900">
                  {new Date(pedido.prazo_desejado + 'T12:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Descrição</p>
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{pedido.descricao}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
            Histórico de atualizações
          </h2>
          <div className="space-y-0">
            {historico.map((h, idx) => {
              const config = STATUS_CONFIG[h.status_novo as StatusPedido]
              return (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0 mt-0.5 ${config?.dot || 'bg-gray-400'}`} />
                    {idx < historico.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: '24px' }} />
                    )}
                  </div>
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${config?.color || 'text-gray-600'}`}>
                        {config?.label || h.status_novo}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(h.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {h.observacao && (
                      <p className="text-sm text-gray-600 mt-1">{h.observacao}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Editar pedido */}
        {pedido.status !== 'concluido' && pedido.status !== 'cancelado' && (
          <EditarPedido
            pedidoId={pedido.id}
            token={params.token}
            descricaoAtual={pedido.descricao || ''}
            telefoneAtual={pedido.telefone || ''}
            prazoDesejadoAtual={pedido.prazo_desejado || ''}
          />
        )}

        {/* Anexos */}
        {anexos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <Anexos
              pedidoId={pedido.id}
              anexosIniciais={anexos}
              isAdmin={false}
            />
          </div>
        )}

        {/* Comentários */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <Comentarios
            pedidoId={pedido.id}
            comentariosIniciais={comentarios}
            isAdmin={false}
            nomeUsuario={pedido.solicitante}
          />
        </div>
      </main>
    </div>
  )
}
