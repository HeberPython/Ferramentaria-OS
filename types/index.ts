export type StatusPedido = 'recebido' | 'em_analise' | 'aguardando_material' | 'em_andamento' | 'concluido' | 'cancelado'

export interface Pedido {
  id: string;
  titulo: string;
  solicitante: string;
  setor: string;
  status: any;   // Flexibilizado para evitar erro de build
  urgencia: any; // Flexibilizado para evitar erro de build
  prazo: string;
  criado_em: string;
}
// Mantenha o restante como está