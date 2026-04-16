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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseServer
    .from('anexos')
    .select('*')
    .eq('pedido_id', params.id)
    .order('criado_em', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ anexos: data })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Limite: 50MB' }, { status: 400 })
    }

    const timestamp = Date.now()
    const nomeSanitizado = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const caminhoStorage = `pedidos/${params.id}/${timestamp}_${nomeSanitizado}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabaseServer.storage
      .from('anexos')
      .upload(caminhoStorage, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseServer.storage
      .from('anexos')
      .getPublicUrl(caminhoStorage)

    const { data: anexo, error: dbError } = await supabaseServer
      .from('anexos')
      .insert([{
        pedido_id: params.id,
        nome_original: file.name,
        nome_storage: caminhoStorage,
        url: urlData.publicUrl,
        tipo_mime: file.type || 'application/octet-stream',
        tamanho: file.size,
      }])
      .select('*')
      .single()

    if (dbError) {
      await supabaseServer.storage.from('anexos').remove([caminhoStorage])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ anexo }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno ao fazer upload' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const usuario = await autenticar()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { anexoId } = await request.json()

    const { data: anexo, error: fetchError } = await supabaseServer
      .from('anexos')
      .select('*')
      .eq('id', anexoId)
      .eq('pedido_id', params.id)
      .single()

    if (fetchError || !anexo) {
      return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })
    }

    await supabaseServer.storage.from('anexos').remove([anexo.nome_storage])

    const { error: dbError } = await supabaseServer
      .from('anexos')
      .delete()
      .eq('id', anexoId)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
