// src/app/gcm/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MenuGcm } from "@/components/MenuGcm"

export default async function GcmLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (session?.user?.role !== "GCM" && session?.user?.role !== "LIDER" && session?.user?.role !== "SUPERVISOR") {
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col">
      <MenuGcm role={session?.user?.role} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}