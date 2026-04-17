import { useMemo, useState } from "react"

import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { useAuth } from "@/features/auth/auth-context"
import type { InteractionMode } from "@/app/store"

interface AuthTopbarProps {
  activeMode: InteractionMode
  activeSessionId: string | null
  onToggleSidebar?: () => void
  onNewChat?: () => void
}

function formatModeLabel(mode: InteractionMode) {
  switch (mode) {
    case "individual":
      return "Individual"
    case "comparative":
      return "Comparativo"
    case "debate":
      return "Debate"
    default:
      return mode
  }
}

export function AuthTopbar({ activeMode, activeSessionId, onToggleSidebar, onNewChat }: AuthTopbarProps) {
  const { currentUser, isAuthenticated, login, signup, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState(currentUser?.email ?? "")
  const [name, setName] = useState(currentUser?.name ?? "")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sessionLabel = useMemo(() => {
    if (!activeSessionId) {
      return "Sin sesión activa"
    }

    return `${formatModeLabel(activeMode)} · ${activeSessionId.slice(0, 10)}`
  }, [activeMode, activeSessionId])

  async function handleAuthSubmit() {
    try {
      setLoading(true)
      setErrorMessage(null)

      if (authMode === "signin") {
        await login({ email, password })
      } else {
        await signup({ name, email, password })
      }

      window.sessionStorage.removeItem("paradiplomacy-session-id")
      window.sessionStorage.removeItem("paradiplomacy-comparative-session-id")
      window.sessionStorage.removeItem("paradiplomacy-debate-session-id")
      setOpen(false)
      setPassword("")
      window.location.reload()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar la autenticación.")
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    window.sessionStorage.removeItem("paradiplomacy-session-id")
    window.sessionStorage.removeItem("paradiplomacy-comparative-session-id")
    window.sessionStorage.removeItem("paradiplomacy-debate-session-id")
    window.location.reload()
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-3 px-3 py-3 sm:px-4 lg:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">Paradiplomacia IDEI</p>
              <h1 className="font-heading text-base font-semibold tracking-tight sm:text-xl">Espacio de trabajo de política conversacional</h1>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={onNewChat}
                className="inline-flex h-9 items-center rounded-lg border border-border/70 px-3 text-xs font-medium hover:bg-accent"
              >
                Nuevo
              </button>
              <button
                type="button"
                onClick={onToggleSidebar}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 hover:bg-accent"
                aria-label="Abrir historial"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[0.7rem]">
              {sessionLabel}
            </Badge>
            <p className="max-w-3xl text-xs leading-5 text-muted-foreground sm:text-sm">
              Consulta paradiplomacia con perfiles disciplinares, historial persistente, análisis comparado y debate estructurado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs sm:text-sm">
              {isAuthenticated && currentUser ? `${currentUser.name} · ${currentUser.role}` : "Invitado"}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs sm:text-sm">
              {activeSessionId ? "Sesión activa" : "Sin sesión"}
            </Badge>
            {isAuthenticated && currentUser ? (
              <Button type="button" variant="outline" onClick={handleLogout} className="rounded-full px-4">
                Cerrar sesión
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setAuthMode("signin")
                  setOpen(true)
                }}
                className="rounded-full px-4"
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{authMode === "signin" ? "Iniciar sesión" : "Crear cuenta"}</DialogTitle>
            <DialogDescription>
              {authMode === "signin"
                ? "Ingresa con tu correo y contraseña para recuperar tu historial."
                : "Registra una cuenta con correo único y contraseña."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="inline-flex w-full rounded-full border border-border/70 bg-muted/40 p-1">
              <button
                type="button"
                className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium ${authMode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                onClick={() => {
                  setErrorMessage(null)
                  setAuthMode("signin")
                }}
              >
                Ingresar
              </button>
              <button
                type="button"
                className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium ${authMode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                onClick={() => {
                  setErrorMessage(null)
                  setAuthMode("signup")
                }}
              >
                Registrarme
              </button>
            </div>

            {authMode === "signup" ? (
              <label className="grid gap-1.5 text-sm">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Nombre</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" />
              </label>
            ) : null}

            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Correo</span>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" type="email" />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Contraseña</span>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="********" type="password" />
            </label>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAuthSubmit} disabled={loading}>
              {loading ? "Procesando..." : authMode === "signin" ? "Ingresar" : "Crear cuenta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}