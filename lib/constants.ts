import { StatusPedido } from '@/types'

export const STATUS_CONFIG: Record<
  StatusPedido,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  recebido: {
    label: 'Recebido',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  em_analise: {
    label: 'Em Análise',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  aguardando_material: {
    label: 'Aguardando Material',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  concluido: {
    label: 'Concluído',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
}

export const URGENCIA_CONFIG = {
  normal: { label: 'Normal', color: 'text-gray-600', bg: 'bg-gray-100' },
  alta: { label: 'Alta', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  urgente: { label: 'Urgente', color: 'text-red-700', bg: 'bg-red-100' },
}

export const TIPOS_SERVICO = [
  'Dispositivo de Ensaio',
  'Preparação de Amostra',
  'Serralheria',
  'Metalografia',
  'Manutenção Predial',
  'Serviço Terceirizado',
  'Outros',
]

export const STATUS_ORDER: StatusPedido[] = [
  'recebido',
  'em_analise',
  'aguardando_material',
  'em_andamento',
  'concluido',
  'cancelado',
]
