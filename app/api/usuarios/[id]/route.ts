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

const schemaPatch = z.object({
  ativo: z.boolean().optional(),
  role: z.enum(['admin', 'editor']).optional(),
  nome: z.string().min(1).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const usuario = await autenticar()
  if (!usuario || usuario.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = schemaPatch.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('usuarios')
      .update(parsed.data)
      .eq('id', params.id)
      .select('id, nome, email, role, ativo, criado_em')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Usuário não encontrado' }, { status: 500 })
    }

    return NextResponse.json({ usuario: data })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
