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
  titulo: string;
  solicitante: string;
  setor: string;
  status: StatusPedido; // Ajustado de string para StatusPedido
  urgencia: Urgencia;    // Ajustado de string para Urgencia
  prazo: string;
  criado_em: string;
}
// Mantenha o restante das interfaces (Usuario, Historico, etc) como estão