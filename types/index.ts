export type StatusPedido =
  | 'recebido'
  | 'em_analise'
  | 'aguardando_material'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'

export type Urgencia = 'normal' | 'alta' | 'urgente'
export type RoleUsuario = 'admin' | 'editor'

export interface Pedido {
  id: string
  numero?: number
  token_acompanhamento?: string
  titulo?: string
  solicitante: string
  email_contato?: string
  telefone?: string
  setor: string
  tipo_servico?: string
  status: StatusPedido
  urgencia: Urgencia
  prazo?: string
  prazo_definido?: string
  prazo_desejado?: string
  descricao?: string
  especificacoes?: string
  tags?: string[]
  anexos?: any[]
  responsavel_id?: string
  responsavel?: Usuario
  criado_em: string
  updated_at?: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  role: RoleUsuario
  ativo: boolean
  criado_em: string
}

export interface HistoricoStatus {
  id: string
  pedido_id: string
  status_anterior?: string
  status_novo: string
  observacao?: string
  usuario_nome?: string
  criado_em: string
}

export interface Comentario {
  id: string
  pedido_id: string
  usuario_nome: string
  conteudo: string
  interno: boolean
  criado_em: string
}

export interface JWTPayload {
  id: string
  email: string
  nome: string
  role: RoleUsuario
}