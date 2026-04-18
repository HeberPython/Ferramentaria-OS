import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .not('status', 'eq', 'cancelado')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ pedidos: [] })
  return NextResponse.json({ pedidos: data })
}