import { supabaseServer } from '@/lib/supabase-server'
import { KanbanBoardAdmin } from '@/components/kanban/KanbanBoardAdmin'
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

export default async function AdminKanbanPage() {
  const pedidos = await getPedidos()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban</h1>
          <p className="text-gray-500 text-sm mt-1">
            Arraste os cartões para atualizar o status dos pedidos
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <span className="font-medium text-yellow-800">Dica:</span> Arraste e solte para mover pedidos entre colunas
        </div>
      </div>

      <KanbanBoardAdmin pedidosIniciais={pedidos} />
    </div>
  )
}
