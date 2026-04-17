import { AdminSidebar } from '@/components/ui/AdminSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - O componente que tornamos retrátil */}
      <AdminSidebar />
      
      {/* Área de Conteúdo Principal */}
      {/* md:ml-64: No PC, deixa espaço para a barra lateral. */}
      {/* ml-0: No celular, ocupa a tela toda (remove o espaço branco). */}
      <main className="flex-1 min-w-0 md:ml-64 transition-all duration-300 ease-in-out">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}