import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { requireAdminPage } from "@/lib/admin-auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdminPage()

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader
          user={{
            name: session.user.name ?? "Admin",
            email: session.user.email ?? "",
          }}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
