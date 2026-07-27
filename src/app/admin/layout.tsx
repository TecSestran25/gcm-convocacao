// src/app/admin/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/AdminShell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }
  // Barreira de segurança: Apenas ADMIN entra aqui
  const role = session.user?.role
  if (role !== "ADMIN" && role !== "COMANDO") {
    redirect("/login")
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  )
}