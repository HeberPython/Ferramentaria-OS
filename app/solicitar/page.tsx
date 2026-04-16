import Link from 'next/link'
import { FormularioPedido } from '@/components/forms/FormularioPedido'

export const metadata = {
  title: 'Abrir Pedido — Ferramentaria OS',
}

export default function SolicitarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Voltar</span>
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="https://scitec.com.br/wp-content/uploads/2023/07/SCiTec-Laboratorio-Logo-150x113.png"
              alt="SCiTec"
              className="h-8 w-auto"
            />
            <div className="border-l border-gray-200 pl-2">
              <span className="font-bold text-gray-900 text-sm">Ferramentaria</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Abrir novo pedido</h1>
          <p className="text-gray-600">
            Preencha o formulário abaixo para solicitar um serviço à ferramentaria.
            Você receberá um e-mail de confirmação com o link para acompanhar o andamento.
          </p>
        </div>

        <FormularioPedido />
      </main>
    </div>
  )
}
