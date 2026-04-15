import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabase-server'
import { verificarToken } from '@/lib/auth'
import { cookies } from 'next/headers'

async function autenticar() {
  const cookieStore = cookies()
  const token = cookieStore.get('ferramentaria_token')?.value
  if (!token) return null
  return await verificarToken(token)
}

export async function GET() {
  const usuario = await autenticar()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseServer
    .from('usuarios')
    .select('id, nome, email, role, ativo, criado_em')
    .order('criado_em', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ usuarios: data })
}

const schemaCriar = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: z.enum(['admin', 'editor']),
})

export async function POST(request: NextRequest) {
  const usuario = await autenticar()
  if (!usuario || usuario.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas administradores podem criar usuários' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = schemaCriar.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { nome, email, senha, role } = parsed.data
    const senha_hash = await bcrypt.hash(senha, 12)

    const { data, error } = await supabaseServer
      .from('usuarios')
      .insert([{ nome, email, senha_hash, role }])
      .select('id, nome, email, role, ativo, criado_em')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ usuario: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
