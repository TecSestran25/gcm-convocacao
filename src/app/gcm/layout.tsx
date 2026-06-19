// src/app/gcm/layout.tsx
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function GcmLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  // Barreira de segurança: garante que apenas utilizadores com perfil GCM entram
  if (session?.user?.role !== "GCM") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-800 text-white p-4 shadow-sm flex justify-between items-center">
        <div className="font-bold tracking-wide">
          GCM GOIANA <span className="font-light text-slate-400">| PORTAL</span>
        </div>
        <form action={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}>
          <Button variant="destructive" size="sm">
            Sair
          </Button>
        </form>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}