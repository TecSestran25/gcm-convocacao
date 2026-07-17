// src/app/admin/layout.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sininho } from "@/components/Sininho"
import { Sidebar } from "@/components/Sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center print:hidden">
        <div className="font-bold text-lg tracking-wide hover:text-slate-200 transition-colors">
          <a href="/admin/dashboard">
            GCM GOIANA <span className="font-light text-slate-400">| COMANDO</span>
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 hidden md:block">
            Olá, {session.user.name}
          </span>
          <Sininho />
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <Button variant="destructive" size="sm" type="submit">
              Sair do Sistema
            </Button>
          </form>
        </div>
      </header>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}