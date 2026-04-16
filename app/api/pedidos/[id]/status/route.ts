import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase-server'
import { verificarToken } from '@/lib/auth'
import { enviarNotificacaoStatus, enviarNotificacaoAdminStatus } from '@/lib/email'
import { cookies } from 'next/headers'
import { Pedido, StatusPedido } from '@/types'

const schemaStatus = z.object({
  status: z.enum([
    'recebido',
    'em_analise',
    'aguardando_material',
    'em_andamento',
    'concluido',
    'cancelado',
  ]),
  observacao: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const token = cookieStore.get('ferramentaria_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const usuario = await verificarToken(token)
  if (!usuario) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = schemaStatus.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // Buscar pedido atual
    const { data: pedidoAtual, error: errBusca } = await supabaseServer
      .from('pedidos')
      .select('*')
      .eq('id', params.id)
      .single()

    if (errBusca || !pedidoAtual) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    const statusAnterior: StatusPedido = pedidoAtual.status
    const statusNovo: StatusPedido = parsed.data.status

    if (statusAnterior === statusNovo) {
      return NextResponse.json({ error: 'Status já é o atual' }, { status: 400 })
    }

    // Atualizar status
    const { data: pedidoAtualizado, error: errUpdate } = await supabaseServer
      .from('pedidos')
      .update({ status: statusNovo })
      .eq('id', params.id)
      .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
      .single()

    if (errUpdate || !pedidoAtualizado) {
      return NextResponse.json({ error: errUpdate?.message || 'Erro ao atualizar' }, { status: 500 })
    }

    // Registrar histórico
    const { data: historico } = await supabaseServer
      .from('historico_status')
      .insert([{
        pedido_id: params.id,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        observacao: parsed.data.observacao || null,
        usuario_nome: usuario.nome,
      }])
      .select()
      .single()

    // Enviar e-mails de notificação
    try {
      await enviarNotificacaoStatus(
        pedidoAtualizado as Pedido,
        statusAnterior,
        statusNovo,
        parsed.data.observacao
      )
    } catch (emailErr) {
      console.error('Erro ao enviar e-mail de status:', emailErr)
    }
    try {
      await enviarNotificacaoAdminStatus(
        pedidoAtualizado as Pedido,
        statusAnterior,
        statusNovo,
        usuario.nome,
        parsed.data.observacao
      )
    } catch (emailErr) {
      console.error('Erro ao enviar e-mail admin de status:', emailErr)
    }

    return NextResponse.json({ pedido: pedidoAtualizado, historico })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
