import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ferramentaria OS — Gestão de Ordens de Serviço',
  description: 'Sistema de gestão de pedidos para departamento industrial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
