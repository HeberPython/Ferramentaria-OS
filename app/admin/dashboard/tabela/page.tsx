import { supabaseServer } from '@/lib/supabase-server'
import { TabelaPedidos } from '@/components/tabela/TabelaPedidos'
import { Pedido } from '@/types'

async function getPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabaseServer
    .from('pedidos')
    .select('*, responsavel:usuarios(id, nome, email, role, ativo, criado_em)')
    .order('criado_em', { ascending: false })

  if (error) return []
  return data as Pedido[]
}

export const revalidate = 0

export default async function AdminTabelaPage() {
  const pedidos = await getPedidos()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tabela de Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Filtre, ordene e exporte os pedidos
        </p>
      </div>

      <TabelaPedidos pedidos={pedidos} />
    </div>
  )
}
