import { Sidebar, SidebarContent, SidebarHeader, SidebarItem } from "@/shared/components/ui/sidebar"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"

interface ChatHistorySession {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  mode: string
}

interface ChatSidebarProps {
  sessions: ChatHistorySession[]
  activeSessionId?: string
  onSelectSession?: (sessionId: string) => void
  onNewChat?: () => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <Sidebar className="border-border/70 bg-background/85 backdrop-blur-xl">
      <SidebarHeader className="border-b border-border/60 bg-background/80">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold sm:text-base">Historial de chat</h2>
              <p className="text-xs text-muted-foreground">Sesiones individuales y comparativas</p>
            </div>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[0.7rem]">
              {sessions.length}
            </Badge>
          </div>
          <Button type="button" variant="outline" className="w-full justify-start rounded-xl text-xs shadow-sm" onClick={onNewChat}>
            + Nuevo chat
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-background/60">
        <div className="flex flex-col gap-2 p-2">
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-3 py-6 text-center">
              <p className="text-xs font-medium">Sin chats todavía</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                Inicia una conversación y aparecerá aquí el historial de sesiones.
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <SidebarItem
                key={session.id}
                onClick={() => onSelectSession?.(session.id)}
                className={`rounded-2xl border px-3 py-3 transition-all duration-200 ${activeSessionId === session.id ? "border-primary/30 bg-primary/5 shadow-sm" : "border-transparent hover:border-border/70 hover:bg-accent/40"}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="max-w-[10rem] truncate text-xs font-medium sm:text-sm">
                      {session.name}
                    </span>
                    <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.14em]">
                      {session.mode}
                    </Badge>
                  </div>
                  <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">{session.lastMessage}</span>
                  <span className="text-[0.7rem] text-muted-foreground">{session.timestamp}</span>
                </div>
              </SidebarItem>
            ))
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
