import { NextRequest, NextResponse } from 'next/server'
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
  const { data, error } = await supabaseServer
    .from('tipos_servico')
    .select('id, nome, ativo')
    .order('ordem', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tipos: data })
}

export async function POST(request: NextRequest) {
  const usuario = await autenticar()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { nome } = await request.json()
    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
    }

    const { data: max } = await supabaseServer
      .from('tipos_servico')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1)
      .single()

    const ordem = max ? max.ordem + 1 : 1

    const { data, error } = await supabaseServer
      .from('tipos_servico')
      .insert([{ nome: nome.trim(), ordem }])
      .select('id, nome, ativo, ordem')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Tipo de serviço já existe' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tipo: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
