// src/app/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  // Pega a sessão do usuário logado
  const session = await auth()

  // Redirecionamento de segurança (redundância)
  if (!session) {
    redirect("/login")
  }

  // Verifica a patente (Role) e manda para a rota correta
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard") // Futura tela da chefia
  }

  if (session.user.role === "GCM") {
    redirect("/gcm/convocacoes") // Futura tela do celular do guarda
  }

  return null
}