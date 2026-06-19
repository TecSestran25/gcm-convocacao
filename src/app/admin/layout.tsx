// src/app/admin/layout.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Puxa a sessão para pegar o nome do usuário
  const session = await auth()
  
  // Barreira de segurança dupla: garante que apenas ADMIN acesse
  if (session?.user?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="font-bold text-lg tracking-wide">
          GCM GOIANA <span className="font-light text-slate-400">| COMANDO</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 hidden md:block">
            Olá, {session.user.name}
          </span>
          {/* Botão de Logout usando Server Actions */}
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <Button variant="destructive" size="sm">
              Sair do Sistema
            </Button>
          </form>
        </div>
      </header>

      {/* Miolo da página (onde o dashboard e outras telas vão renderizar) */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}