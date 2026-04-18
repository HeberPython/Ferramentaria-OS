import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const numero = searchParams.get('numero')

  if (!numero) {
    return NextResponse.json({ error: 'Número obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('token_acompanhamento')
    .eq('numero', parseInt(numero))
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ token: data.token_acompanhamento })
}