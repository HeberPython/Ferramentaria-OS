import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase-server'
import { verificarToken } from '@/lib/auth'
import { cookies } from 'next/headers'

async function autenticar() {
  const cookieStore = cookies()
  const token = cookieStore.get('ferramentaria_token')?.value
  if (!token) return null
  return await verificarToken(token)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ pedido: data })
}

const schemaPatch = z.object({
  prazo_definido: z.string().nullable().optional(),
  responsavel_id: z.string().nullable().optional(),
  observacoes_internas: z.string().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const usuario = await autenticar()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = schemaPatch.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if ('prazo_definido' in parsed.data) updates.prazo_definido = parsed.data.prazo_definido
    if ('responsavel_id' in parsed.data) updates.responsavel_id = parsed.data.responsavel_id
    if ('observacoes_internas' in parsed.data) updates.observacoes_internas = parsed.data.observacoes_internas

    const { data, error } = await supabaseServer
      .from('pedidos')
      .update(updates)
      .eq('id', params.id)
      .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Pedido não encontrado' }, { status: 500 })
    }

    return NextResponse.json({ pedido: data })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const usuario = await autenticar()
  if (!usuario || usuario.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { error } = await supabaseServer.from('pedidos').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
