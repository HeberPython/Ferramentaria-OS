import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Pedido, HistoricoStatus, Comentario, Usuario } from '@/types'
import { DetalhesPedido } from '@/components/pedido/DetalhesPedido'
import { Comentarios } from '@/components/pedido/Comentarios'
import { Anexos } from '@/components/pedido/Anexos'

async function getPedido(id: string): Promise<Pedido | null> {
  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .eq('id', id)
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

async function getComentarios(pedidoId: string): Promise<Comentario[]> {
  const { data } = await supabaseServer
    .from('comentarios')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('criado_em', { ascending: true })
  return data || []
}

async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await supabaseServer
    .from('usuarios')
    .select('id, nome, email, role, ativo, criado_em')
    .eq('ativo', true)
    .order('nome')
  return (data as Usuario[]) || []
}

async function getAnexos(pedidoId: string) {
  const { data } = await supabaseServer
    .from('anexos')
    .select('*')
    .eq('pedido_id', pedidoId)
    .order('criado_em', { ascending: true })
  return data || []
}

export const revalidate = 0

export default async function PedidoDetalhePage({
  params,
}: {
  params: { id: string }
}) {
  const [pedido, historico, comentarios, usuarios, anexos] = await Promise.all([
    getPedido(params.id),
    getHistorico(params.id),
    getComentarios(params.id),
    getUsuarios(),
    getAnexos(params.id),
  ])

  if (!pedido) notFound()

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/dashboard/tabela" className="hover:text-gray-700">Pedidos</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">#{String(pedido.numero).padStart(4, '0')}</span>
      </div>

      <DetalhesPedido
        pedido={pedido}
        historico={historico}
        usuarios={usuarios}
      />

      {/* Anexos */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 xl:max-w-[calc(66.666%)]">
        <Anexos
          pedidoId={pedido.id}
          anexosIniciais={anexos}
          isAdmin={true}
        />
      </div>

      {/* Comentários */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 xl:max-w-[calc(66.666%)]">
        <Comentarios
          pedidoId={pedido.id}
          comentariosIniciais={comentarios}
          isAdmin={true}
          nomeUsuario="Administrador"
        />
      </div>
    </div>
  )
}
