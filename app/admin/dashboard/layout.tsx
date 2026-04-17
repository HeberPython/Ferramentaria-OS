import { AdminSidebar } from '@/components/ui/AdminSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <div className="p-4 md:p-6 lg:p-8 pt-16">
          {children}
        </div>
      </main>
    </div>
  )
}