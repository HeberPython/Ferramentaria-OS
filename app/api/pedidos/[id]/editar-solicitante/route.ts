import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase-server'
import { enviarNotificacaoAdminEdicao } from '@/lib/email'
import { Pedido } from '@/types'

const schemaEdicao = z.object({
  token: z.string().min(1),
  descricao: z.string().min(10, 'Descrição muito curta').optional(),
  telefone: z.string().optional(),
  prazo_desejado: z.string().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = schemaEdicao.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { token, ...campos } = parsed.data

    // Verificar token do pedido
    const { data: pedidoAtual, error: errBusca } = await supabaseServer
      .from('pedidos')
      .select('*')
      .eq('id', params.id)
      .eq('token_acompanhamento', token)
      .single()

    if (errBusca || !pedidoAtual) {
      return NextResponse.json({ error: 'Pedido não encontrado ou token inválido' }, { status: 404 })
    }

    if (pedidoAtual.status === 'concluido' || pedidoAtual.status === 'cancelado') {
      return NextResponse.json({ error: 'Pedido finalizado não pode ser editado' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    const camposAlterados: string[] = []

    if (campos.descricao && campos.descricao !== pedidoAtual.descricao) {
      updates.descricao = campos.descricao
      camposAlterados.push('Descrição')
    }
    if ('telefone' in campos && campos.telefone !== pedidoAtual.telefone) {
      updates.telefone = campos.telefone || null
      camposAlterados.push('Telefone')
    }
    if ('prazo_desejado' in campos && campos.prazo_desejado !== pedidoAtual.prazo_desejado) {
      updates.prazo_desejado = campos.prazo_desejado || null
      camposAlterados.push('Prazo desejado')
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhuma alteração detectada' }, { status: 400 })
    }

    const { data: pedidoAtualizado, error: errUpdate } = await supabaseServer
      .from('pedidos')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (errUpdate || !pedidoAtualizado) {
      return NextResponse.json({ error: errUpdate?.message || 'Erro ao atualizar' }, { status: 500 })
    }

    // Registrar no histórico
    await supabaseServer.from('historico_status').insert([{
      pedido_id: params.id,
      status_anterior: pedidoAtual.status,
      status_novo: pedidoAtual.status,
      observacao: `Pedido atualizado pelo solicitante. Campos: ${camposAlterados.join(', ')}.`,
      usuario_nome: pedidoAtual.solicitante,
    }])

    // Notificar admin
    try {
      await enviarNotificacaoAdminEdicao(pedidoAtualizado as Pedido, camposAlterados)
    } catch (emailErr) {
      console.error('Erro ao enviar e-mail de edição:', emailErr)
    }

    return NextResponse.json({ pedido: pedidoAtualizado })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
