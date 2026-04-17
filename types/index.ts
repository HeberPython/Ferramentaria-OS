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
  id: string;
  numero?: number;
  titulo: string;
  solicitante: string;
  setor: string;
  tipo_servico?: string;
  status: StatusPedido;
  urgencia: Urgencia;
  prazo: string;
  prazo_definido?: boolean; // ADICIONADO: O campo que causou o erro 14:15
  descricao?: string;      // Adicionado preventivamente
  criado_em: string;
  updated_at?: string;     // Adicionado preventivamente
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