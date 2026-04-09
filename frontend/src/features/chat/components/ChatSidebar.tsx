import { Sidebar, SidebarContent, SidebarHeader, SidebarItem } from "@/shared/components/ui/sidebar"
import { Button } from "@/shared/components/ui/button"

interface ChatHistorySession {
  id: string
  name: string
  lastMessage: string
  timestamp: string
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-base">Chat History</h2>
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={onNewChat}
          >
            + New Chat
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-4">No chats yet</p>
          ) : (
            sessions.map((session) => (
              <SidebarItem
                key={session.id}
                onClick={() => onSelectSession?.(session.id)}
                className={activeSessionId === session.id ? "bg-accent" : ""}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs truncate">{session.name}</span>
                  <span className="text-xs text-muted-foreground truncate line-clamp-1">
                    {session.lastMessage}
                  </span>
                  <span className="text-xs text-muted-foreground">{session.timestamp}</span>
                </div>
              </SidebarItem>
            ))
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
