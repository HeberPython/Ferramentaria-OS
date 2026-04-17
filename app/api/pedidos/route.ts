import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase-server'
import { enviarConfirmacaoPedido, enviarNotificacaoAdmin } from '@/lib/email'
import { Pedido } from '@/types'

const schemaCriar = z.object({
  setor: z.string().min(1, 'Setor obrigatório'),
  solicitante: z.string().min(1, 'Nome obrigatório'),
  email_contato: z.string().email('E-mail inválido'),
  telefone: z.string().optional(),
  tipo_servico: z.string().min(1, 'Tipo de serviço obrigatório'),
  descricao: z.string().min(10, 'Descrição muito curta'),
  urgencia: z.enum(['normal', 'alta', 'urgente']),
  prazo_desejado: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const urgencia = searchParams.get('urgencia')
  const tipo_servico = searchParams.get('tipo_servico')
  const busca = searchParams.get('busca')

  let query = supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .order('criado_em', { ascending: false })

  if (status) query = query.eq('status', status)
  if (urgencia) query = query.eq('urgencia', urgencia)
  if (tipo_servico) query = query.eq('tipo_servico', tipo_servico)
  if (busca) {
    query = query.or(
      `solicitante.ilike.%${busca}%,setor.ilike.%${busca}%,descricao.ilike.%${busca}%`
    )
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ pedidos: data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schemaCriar.safeParse(body)

    console.log('BODY RECEBIDO:', JSON.stringify(body))
    console.log('ERRO VALIDAÇÃO:', JSON.stringify(parsed.error?.errors))

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('pedidos')
      .insert([parsed.data])
      .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const pedido = data as Pedido

    await supabaseServer.from('historico_status').insert([{
      pedido_id: pedido.id,
      status_anterior: null,
      status_novo: 'recebido',
      observacao: 'Pedido criado pelo sistema.',
      usuario_nome: pedido.solicitante,
    }])

    try {
      console.log('Enviando e-mail confirmação para:', pedido.email_contato)
      await enviarConfirmacaoPedido(pedido)
      console.log('E-mail confirmação enviado com sucesso!')
    } catch (emailErr) {
      console.error('Erro ao enviar e-mail de confirmação:', emailErr)
    }

    try {
      console.log('Enviando e-mail admin para:', process.env.EMAIL_ADMIN)
      await enviarNotificacaoAdmin(pedido)
      console.log('E-mail admin enviado com sucesso!')
    } catch (emailErr) {
      console.error('Erro ao enviar e-mail admin:', emailErr)
    }

    return NextResponse.json({ pedido }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}