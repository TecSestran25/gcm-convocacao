// src/app/admin/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/AdminShell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  // Barreira de segurança: Apenas ADMIN entra aqui
  if (session?.user?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  )
}