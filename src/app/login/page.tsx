"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro("")

    const formData = new FormData(e.currentTarget)
    const matricula = formData.get("matricula")
    const senha = formData.get("senha")

    const result = await signIn("credentials", {
      matricula,
      senha,
      redirect: false,
    })

    if (result?.error) {
      setErro("Matrícula ou senha incorretos. Tente novamente.")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            GCM Goiana
          </CardTitle>
          <CardDescription className="text-slate-500">
            Sistema de Convocação Operacional (GECP)
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input 
                id="matricula" 
                name="matricula" 
                placeholder="Ex: 12345" 
                required 
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input 
                id="senha" 
                name="senha" 
                type="password" 
                placeholder="••••••••" 
                required 
                disabled={loading}
              />
            </div>

            {erro && (
              <p className="text-sm font-medium text-red-500 text-center">
                {erro}
              </p>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="mt-6 w-full" 
              disabled={loading}
            >
              {loading ? "Acessando..." : "Entrar no Sistema"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}