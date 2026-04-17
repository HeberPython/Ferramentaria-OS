import { Resend } from 'resend'
import { Pedido, StatusPedido } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY!)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const EMAIL_FROM = process.env.EMAIL_FROM || 'ferramentaria@noreply.com'
const EMAIL_ADMIN = process.env.EMAIL_ADMIN || ''

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function templateBase(titulo: string, conteudo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:#C41E3A;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
                🔧 Ferramentaria OS
              </h1>
              <p style="margin:4px 0 0;color:#fecdd3;font-size:14px;">${titulo}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${conteudo}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;">
                Este é um e-mail automático do sistema Ferramentaria OS. Não responda a este e-mail.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function cardInfo(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#6b7280;font-size:14px;width:160px;">${label}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${value}</td>
  </tr>`
}

export async function enviarConfirmacaoPedido(pedido: Pedido): Promise<void> {
  const linkAcompanhamento = `${BASE_URL}/acompanhar/${pedido.token_acompanhamento}`

  const conteudo = `
    <h2 style="margin:0 0 8px;color:#C41E3A;font-size:18px;">Pedido recebido com sucesso!</h2>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;">
      Olá, <strong>${pedido.solicitante}</strong>! Seu pedido foi registrado no sistema Ferramentaria OS.
      Você pode acompanhar o andamento pelo link abaixo.
    </p>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#0369a1;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Número do Pedido</p>
      <p style="margin:0;color:#0c4a6e;font-size:28px;font-weight:700;">#${String(pedido.numero).padStart(4, '0')}</p>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${cardInfo('Setor', pedido.setor)}
      ${cardInfo('Tipo de Serviço', pedido.tipo_servico || '')}
      ${cardInfo('Urgência', pedido.urgencia === 'urgente' ? '🔴 Urgente' : pedido.urgencia === 'alta' ? '🟡 Alta' : '🟢 Normal')}
      ${cardInfo('Data de abertura', formatarData(pedido.criado_em))}
      ${pedido.prazo_desejado ? cardInfo('Prazo desejado', new Date(pedido.prazo_desejado + 'T12:00:00').toLocaleDateString('pt-BR')) : ''}
    </table>

    <div style="margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Descrição:</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;background:#f9fafb;padding:12px;border-radius:4px;border-left:3px solid #1e40af;">${pedido.descricao}</p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${linkAcompanhamento}" style="display:inline-block;background:#C41E3A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:600;">
        Acompanhar Pedido
      </a>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Ou acesse: <a href="${linkAcompanhamento}" style="color:#C41E3A;">${linkAcompanhamento}</a>
    </p>
  `

  await resend.emails.send({
    from: EMAIL_FROM,
    to: pedido.email_contato || '',
    subject: `[Ferramentaria OS] Pedido #${String(pedido.numero).padStart(4, '0')} recebido — ${pedido.tipo_servico}`,
    html: templateBase(`Confirmação — Pedido #${String(pedido.numero).padStart(4, '0')}`, conteudo),
  })
}

export async function enviarNotificacaoStatus(
  pedido: Pedido,
  statusAnterior: StatusPedido,
  statusNovo: StatusPedido,
  observacao?: string
): Promise<void> {
  const linkAcompanhamento = `${BASE_URL}/acompanhar/${pedido.token_acompanhamento}`
  const configNovo = STATUS_CONFIG[statusNovo]
  const configAnterior = STATUS_CONFIG[statusAnterior]

  const conteudo = `
    <h2 style="margin:0 0 8px;color:#C41E3A;font-size:18px;">Status do seu pedido foi atualizado</h2>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;">
      Olá, <strong>${pedido.solicitante}</strong>! Houve uma atualização no seu pedido <strong>#${String(pedido.numero).padStart(4, '0')}</strong>.
    </p>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#f3f4f6;border-radius:6px;padding:12px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Anterior</p>
        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${configAnterior.label}</p>
      </div>
      <div style="color:#6b7280;font-size:20px;">→</div>
      <div style="flex:1;background:#eff6ff;border:2px solid #1e40af;border-radius:6px;padding:12px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#C41E3A;font-size:11px;text-transform:uppercase;">Novo status</p>
        <p style="margin:0;color:#1e3a8a;font-size:16px;font-weight:700;">${configNovo.label}</p>
      </div>
    </div>

    ${
      observacao
        ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;color:#92400e;font-size:12px;font-weight:600;">Observação da equipe:</p>
        <p style="margin:0;color:#78350f;font-size:14px;">${observacao}</p>
      </div>`
        : ''
    }

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${cardInfo('Setor', pedido.setor)}
      ${cardInfo('Tipo de Serviço', pedido.tipo_servico)}
      ${pedido.prazo_definido ? cardInfo('Prazo definido', new Date(pedido.prazo_definido + 'T12:00:00').toLocaleDateString('pt-BR')) : ''}
    </table>

    <div style="text-align:center;margin:24px 0;">
      <a href="${linkAcompanhamento}" style="display:inline-block;background:#C41E3A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:600;">
        Ver detalhes do pedido
      </a>
    </div>
  `

  await resend.emails.send({
    from: EMAIL_FROM,
    to: pedido.email_contato || '',
    subject: `[Ferramentaria OS] Pedido #${String(pedido.numero).padStart(4, '0')} — Status: ${configNovo.label}`,
    html: templateBase(`Atualização de Status — Pedido #${String(pedido.numero).padStart(4, '0')}`, conteudo),
  })
}

export async function enviarNotificacaoAdminStatus(
  pedido: Pedido,
  statusAnterior: StatusPedido,
  statusNovo: StatusPedido,
  usuarioNome: string,
  observacao?: string
): Promise<void> {
  if (!EMAIL_ADMIN) return

  const linkAdmin = `${BASE_URL}/admin/dashboard/pedidos/${pedido.id}`
  const configNovo = STATUS_CONFIG[statusNovo]
  const configAnterior = STATUS_CONFIG[statusAnterior]

  const conteudo = `
    <h2 style="margin:0 0 8px;color:#C41E3A;font-size:18px;">Card movimentado por ${usuarioNome}</h2>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;">
      O pedido <strong>#${String(pedido.numero).padStart(4, '0')}</strong> teve seu status alterado.
    </p>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#f3f4f6;border-radius:6px;padding:12px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Anterior</p>
        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${configAnterior.label}</p>
      </div>
      <div style="color:#6b7280;font-size:20px;display:flex;align-items:center;">→</div>
      <div style="flex:1;background:#fff1f2;border:2px solid #C41E3A;border-radius:6px;padding:12px 16px;text-align:center;">
        <p style="margin:0 0 4px;color:#C41E3A;font-size:11px;text-transform:uppercase;">Novo status</p>
        <p style="margin:0;color:#7e1220;font-size:16px;font-weight:700;">${configNovo.label}</p>
      </div>
    </div>

    ${observacao ? `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#92400e;font-size:12px;font-weight:600;">Observação registrada:</p>
      <p style="margin:0;color:#78350f;font-size:14px;">${observacao}</p>
    </div>` : ''}

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${cardInfo('Solicitante', pedido.solicitante)}
      ${cardInfo('Setor', pedido.setor)}
      ${cardInfo('Tipo de Serviço', pedido.tipo_servico)}
      ${cardInfo('Movido por', usuarioNome)}
    </table>

    <div style="text-align:center;">
      <a href="${linkAdmin}" style="display:inline-block;background:#C41E3A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:600;">
        Ver Pedido
      </a>
    </div>
  `

  await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_ADMIN,
    subject: `[Ferramentaria OS] Pedido #${String(pedido.numero).padStart(4, '0')} movido para "${configNovo.label}" por ${usuarioNome}`,
    html: templateBase(`Movimentação — Pedido #${String(pedido.numero).padStart(4, '0')}`, conteudo),
  })
}

export async function enviarNotificacaoAdminEdicao(
  pedido: Pedido,
  camposAlterados: string[]
): Promise<void> {
  if (!EMAIL_ADMIN) return

  const linkAdmin = `${BASE_URL}/admin/dashboard/pedidos/${pedido.id}`
  const linkAcompanhamento = `${BASE_URL}/acompanhar/${pedido.token_acompanhamento}`

  const conteudo = `
    <h2 style="margin:0 0 8px;color:#C41E3A;font-size:18px;">Pedido atualizado pelo solicitante</h2>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;">
      O solicitante <strong>${pedido.solicitante}</strong> atualizou informações do pedido
      <strong>#${String(pedido.numero).padStart(4, '0')}</strong>.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#991b1b;font-size:12px;font-weight:600;">Campos alterados:</p>
      <ul style="margin:0;padding-left:16px;color:#7f1d1d;font-size:14px;">
        ${camposAlterados.map((c) => `<li>${c}</li>`).join('')}
      </ul>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${cardInfo('Solicitante', pedido.solicitante)}
      ${cardInfo('Setor', pedido.setor)}
      ${cardInfo('Tipo de Serviço', pedido.tipo_servico)}
      ${cardInfo('Status atual', STATUS_CONFIG[pedido.status as StatusPedido]?.label || pedido.status)}
    </table>

    <div style="margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Descrição atual:</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;background:#f9fafb;padding:12px;border-radius:4px;border-left:3px solid #9F1828;">${pedido.descricao}</p>
    </div>

    <div style="text-align:center;">
      <a href="${linkAdmin}" style="display:inline-block;background:#C41E3A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:600;">
        Ver Pedido no Admin
      </a>
    </div>
    <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;text-align:center;">
      Link do solicitante: <a href="${linkAcompanhamento}" style="color:#C41E3A;">${linkAcompanhamento}</a>
    </p>
  `

  await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_ADMIN,
    subject: `[Ferramentaria OS] Pedido #${String(pedido.numero).padStart(4, '0')} atualizado pelo solicitante — ${pedido.solicitante}`,
    html: templateBase(`Pedido Atualizado #${String(pedido.numero).padStart(4, '0')}`, conteudo),
  })
}

export async function enviarNotificacaoAdmin(pedido: Pedido): Promise<void> {
  if (!EMAIL_ADMIN) return

  const linkAdmin = `${BASE_URL}/admin/dashboard/pedidos/${pedido.id}`

  const conteudo = `
    <h2 style="margin:0 0 8px;color:#C41E3A;font-size:18px;">Novo pedido recebido</h2>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;">
      Um novo pedido foi registrado no sistema e aguarda análise.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px 20px;margin-bottom:24px;${pedido.urgencia === 'urgente' ? '' : 'display:none;'}">
      <p style="margin:0;color:#dc2626;font-size:14px;font-weight:700;">⚠️ PEDIDO URGENTE — Atenção imediata necessária!</p>
    </div>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#0369a1;font-size:12px;font-weight:600;text-transform:uppercase;">Pedido</p>
      <p style="margin:0;color:#0c4a6e;font-size:28px;font-weight:700;">#${String(pedido.numero).padStart(4, '0')}</p>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      ${cardInfo('Solicitante', pedido.solicitante)}
      ${cardInfo('Setor', pedido.setor)}
      ${cardInfo('E-mail', pedido.email_contato || '')}
      ${pedido.telefone ? cardInfo('Telefone', pedido.telefone) : ''}
      ${cardInfo('Tipo de Serviço', pedido.tipo_servico)}
      ${cardInfo('Urgência', pedido.urgencia === 'urgente' ? '🔴 URGENTE' : pedido.urgencia === 'alta' ? '🟡 Alta' : '🟢 Normal')}
      ${pedido.prazo_desejado ? cardInfo('Prazo desejado', new Date(pedido.prazo_desejado + 'T12:00:00').toLocaleDateString('pt-BR')) : ''}
      ${cardInfo('Recebido em', formatarData(pedido.criado_em))}
    </table>

    <div style="margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Descrição:</p>
      <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;background:#f9fafb;padding:12px;border-radius:4px;border-left:3px solid #1e40af;">${pedido.descricao}</p>
    </div>

    <div style="text-align:center;">
      <a href="${linkAdmin}" style="display:inline-block;background:#C41E3A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;font-weight:600;">
        Gerenciar Pedido
      </a>
    </div>
  `

  await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_ADMIN,
    subject: `[Ferramentaria OS] Novo pedido #${String(pedido.numero).padStart(4, '0')} — ${pedido.tipo_servico} (${pedido.setor})`,
    html: templateBase(`Novo Pedido #${String(pedido.numero).padStart(4, '0')}`, conteudo),
  })
}
