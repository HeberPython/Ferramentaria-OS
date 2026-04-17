import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabaseServer } from '@/lib/supabase-server'
import { verificarToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { Pedido, StatusPedido, Urgencia } from '@/types'
import { STATUS_CONFIG, URGENCIA_CONFIG } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get('ferramentaria_token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const usuario = await verificarToken(token)
  if (!usuario) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const urgencia = searchParams.get('urgencia')
  const tipo_servico = searchParams.get('tipo_servico')
  const busca = searchParams.get('busca')
  const formato = searchParams.get('formato') || 'xlsx'

  let query = supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(nome)')
    .order('numero', { ascending: true })

  if (status) query = query.eq('status', status)
  if (urgencia) query = query.eq('urgencia', urgencia)
  if (tipo_servico) query = query.eq('tipo_servico', tipo_servico)
  if (busca) {
    query = query.or(`solicitante.ilike.%${busca}%,setor.ilike.%${busca}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const pedidos = data as (Pedido & { responsavel: { nome: string } | null })[]

  const linhas = pedidos.map((p) => ({
    'Número': `#${String(p.numero).padStart(4, '0')}`,
    'Data de Criação': new Date(p.criado_em).toLocaleDateString('pt-BR'),
    'Setor': p.setor,
    'Solicitante': p.solicitante,
    'E-mail': p.email_contato,
    'Telefone': p.telefone || '',
    'Tipo de Serviço': p.tipo_servico,
    'Urgência': URGENCIA_CONFIG[p.urgencia as Urgencia]?.label || p.urgencia,
    'Status': STATUS_CONFIG[p.status as StatusPedido]?.label || p.status,
    'Prazo Desejado': p.prazo_desejado ? new Date(p.prazo_desejado + 'T12:00:00').toLocaleDateString('pt-BR') : '',
    'Prazo Definido': p.prazo_definido ? new Date(p.prazo_definido + 'T12:00:00').toLocaleDateString('pt-BR') : '',
    'Responsável': p.responsavel?.nome || '',
    'Descrição': p.descricao,
    'Última Atualização': p.atualizado_em ? new Date(p.atualizado_em).toLocaleDateString('pt-BR') : '',
  }))

  if (formato === 'csv') {
    const headers = Object.keys(linhas[0] || {})
    const csvRows = [
      headers.join(';'),
      ...linhas.map((row) =>
        headers
          .map((h) => {
            const val = String((row as Record<string, unknown>)[h] || '')
            return val.includes(';') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val
          })
          .join(';')
      ),
    ]
    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pedidos-ferramentaria.csv"`,
      },
    })
  }

  // Excel
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(linhas)

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 8 },   // Número
    { wch: 14 },  // Data
    { wch: 22 },  // Setor
    { wch: 24 },  // Solicitante
    { wch: 28 },  // E-mail
    { wch: 16 },  // Telefone
    { wch: 24 },  // Tipo de Serviço
    { wch: 12 },  // Urgência
    { wch: 22 },  // Status
    { wch: 14 },  // Prazo Desejado
    { wch: 14 },  // Prazo Definido
    { wch: 22 },  // Responsável
    { wch: 60 },  // Descrição
    { wch: 18 },  // Última Atualização
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="pedidos-ferramentaria.xlsx"`,
    },
  })
}
