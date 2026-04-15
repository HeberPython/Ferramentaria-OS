import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase-server'
import { verificarToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const schemaCriar = z.object({
  conteudo: z.string().min(1, 'Comentário não pode estar vazio'),
  interno: z.boolean().optional().default(false),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const token = cookieStore.get('ferramentaria_token')?.value
  const isAdmin = token ? !!(await verificarToken(token)) : false

  let query = supabaseServer
    .from('comentarios')
    .select('*')
    .eq('pedido_id', params.id)
    .order('criado_em', { ascending: true })

  if (!isAdmin) {
    query = query.eq('interno', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comentarios: data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const token = cookieStore.get('ferramentaria_token')?.value
  const usuario = token ? await verificarToken(token) : null

  try {
    const body = await request.json()
    const parsed = schemaCriar.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // Comentários internos só para autenticados
    if (parsed.data.interno && !usuario) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const nomeUsuario = usuario?.nome || body.nome_publico || 'Solicitante'

    const { data, error } = await supabaseServer
      .from('comentarios')
      .insert([{
        pedido_id: params.id,
        usuario_nome: nomeUsuario,
        conteudo: parsed.data.conteudo,
        interno: usuario ? parsed.data.interno : false,
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comentario: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
