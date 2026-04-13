import { useEffect, useState } from "react"

import { ChatComposer } from "@/features/chat/components/ChatComposer"
import { ChatSidebar } from "@/features/chat/components/ChatSidebar"
import { MessageList } from "@/features/chat/components/MessageList"
import { ModeSelectionModal } from "@/features/chat/components/ModeSelectionModal"
import { useChat } from "@/features/chat/hooks/useChat"
import { ComparisonPanel } from "@/features/comparison/components/ComparisonPanel"
import { getPersonalities } from "@/features/personalities/api/getPersonalities"
import { PersonalitySelector } from "@/features/personalities/components/PersonalitySelector"
import type { InteractionMode } from "@/app/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useSession } from "@/shared/hooks/useSession"
import type { Personality, PersonalityId } from "@/shared/types/personality"
import { httpClient } from "@/shared/api/httpClient"

interface SessionSummary {
  id: string
  mode: InteractionMode
  createdAt: string
  lastMessage: {
    content: string
    role: string
    createdAt: string
    personalityId: string | null
  } | null
}

interface SessionsResponse {
  sessions: SessionSummary[]
}

interface CreateSessionResponse {
  sessionId: string
}

const COMPARATIVE_SESSION_KEY = "paradiplomacy-comparative-session-id"

export function ConversationPage() {
  const [mode, setMode] = useState<InteractionMode>("individual")
  const [draft, setDraft] = useState("")
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<PersonalityId>("economist")
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModeSelection, setShowModeSelection] = useState(false)
  const [comparativeSessionId, setComparativeSessionId] = useState<string | null>(() =>
    window.sessionStorage.getItem(COMPARATIVE_SESSION_KEY)
  )

  const { sessionId, isLoading: loadingSession, error: sessionError, resetSession, selectSession } = useSession()
  const {
    messages,
    comparativeResult,
    comparativeHistory,
    errorMessage,
    sendIndividual,
    sendComparative,
    loadComparativeSession,
    clearComparativeResult,
    clearMessages,
    loadSessionMessages,
  } = useChat()

  useEffect(() => {
    getPersonalities()
      .then(setPersonalities)
      .catch(() => {
        // Keep UI usable even when the personalities request fails.
        setPersonalities([])
      })
  }, [])

  useEffect(() => {
    if (!sessionId) {
      return
    }

    void loadSessionMessages(sessionId)
  }, [loadSessionMessages, sessionId])

  useEffect(() => {
    void refreshSessions()
  }, [])

  useEffect(() => {
    if (mode !== "comparative" || !comparativeSessionId) {
      return
    }

    void loadComparativeSession(comparativeSessionId)
  }, [comparativeSessionId, loadComparativeSession, mode])

  async function refreshSessions() {
    try {
      const response = await httpClient<SessionsResponse>("/sessions")
      setSessions(response.sessions)
    } catch {
      setSessions([])
    }
  }

  async function handleSubmit() {
    if (!draft.trim()) {
      return
    }

    setLoading(true)
    try {
      if (mode === "individual") {
        if (!sessionId) {
          return
        }

        await sendIndividual({ sessionId, personalityId: selectedPersonalityId, message: draft })
      } else {
        const currentComparativeSessionId = await ensureComparativeSession()
        await sendComparative({ sessionId: currentComparativeSessionId, message: draft })
      }
      setDraft("")
      void refreshSessions()
    } finally {
      setLoading(false)
    }
  }

  async function ensureComparativeSession() {
    if (comparativeSessionId) {
      return comparativeSessionId
    }

    const response = await httpClient<CreateSessionResponse>("/sessions", {
      method: "POST",
      body: { mode: "comparative" },
    })

    window.sessionStorage.setItem(COMPARATIVE_SESSION_KEY, response.sessionId)
    setComparativeSessionId(response.sessionId)
    return response.sessionId
  }

  async function handleModeSelection(selectedMode: InteractionMode) {
    setShowModeSelection(false)
    setDraft("")
    clearMessages()
    clearComparativeResult()
    setSidebarOpen(false)

    if (selectedMode === "individual") {
      // Clean comparative session if switching to individual
      window.sessionStorage.removeItem(COMPARATIVE_SESSION_KEY)
      setComparativeSessionId(null)
      setMode("individual")
      await resetSession("individual")
    } else if (selectedMode === "comparative") {
      // Clean individual session if switching to comparative
      setMode("comparative")
      const nextComparativeSessionId = await ensureComparativeSession()
      void loadComparativeSession(nextComparativeSessionId)
    }

    void refreshSessions()
  }

  return (
    <div className="flex h-screen bg-background flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="text-base sm:text-lg font-semibold">Paradiplomacia.AI</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-accent rounded-md"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'block' : 'hidden lg:block'
      } absolute lg:relative top-14 lg:top-0 left-0 right-0 lg:right-auto w-full lg:w-64 bg-background z-40 lg:z-auto border-b lg:border-b-0 lg:border-r max-h-[calc(100vh-56px)] lg:max-h-screen overflow-y-auto`}>
        <ChatSidebar
          sessions={sessions.map((session) => ({
            id: session.id,
            mode: session.mode,
            name: session.mode === "individual" ? "Individual" : "Comparativo",
            lastMessage: session.lastMessage?.content ?? "Sin mensajes todavía",
            timestamp: new Date(session.createdAt).toLocaleString(),
          }))}
          activeSessionId={mode === "comparative" ? comparativeSessionId ?? undefined : sessionId ?? undefined}
          onSelectSession={async (nextSessionId) => {
            const selected = sessions.find((session) => session.id === nextSessionId)

            if (selected?.mode === "comparative") {
              setMode("comparative")
              window.sessionStorage.setItem(COMPARATIVE_SESSION_KEY, nextSessionId)
              setComparativeSessionId(nextSessionId)
              void loadComparativeSession(nextSessionId)
            } else {
              selectSession(nextSessionId)
              setMode("individual")
              void loadSessionMessages(nextSessionId)
            }

            void refreshSessions()
            setSidebarOpen(false)
          }}
          onNewChat={() => {
            setShowModeSelection(true)
          }}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 lg:hidden bg-black/50 z-30 top-14"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 sm:gap-4 overflow-hidden py-4 sm:py-6 lg:py-10 px-4 sm:px-6 lg:px-[10%]">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="grid gap-3 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {mode === "comparative" ? `${comparativeHistory.length} turnos en esta sesión` : `${messages.length} mensajes en esta sesión`}
              </div>
            </div>

            {mode === "individual" ? (
              <div className="grid gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Personalidad experta</p>
                <PersonalitySelector
                  compact
                  personalities={personalities}
                  selectedPersonalityId={selectedPersonalityId}
                  onSelect={setSelectedPersonalityId}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className={`flex-1 min-h-0 ${mode === "comparative" ? "overflow-y-auto pr-1" : ""}`}>
          {mode === "individual" ? (
            <MessageList messages={messages} />
          ) : (
            <div className="grid gap-4">
              {comparativeHistory.length > 0 ? (
                comparativeHistory.map((turn) => (
                  <div key={turn.id} className="grid gap-3">
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="py-3 sm:py-4">
                        <CardTitle className="text-sm sm:text-base">Tu consulta</CardTitle>
                        <CardDescription>Pregunta enviada al análisis comparativo</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-6 text-foreground/90">{turn.prompt}</p>
                      </CardContent>
                    </Card>
                    <ComparisonPanel result={turn.result} />
                  </div>
                ))
              ) : (
                <ComparisonPanel result={comparativeResult} />
              )}
            </div>
          )}
        </div>

        {/* Chat Composer */}
        <Card className="sticky bottom-0 z-20 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardContent className="">
            <ChatComposer
              mode={mode}
              value={draft}
              loading={loading || loadingSession}
              onChange={setDraft}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        {sessionError ? <p className="text-sm text-destructive">{sessionError}</p> : null}
      </div>

      {/* Mode Selection Modal */}
      <ModeSelectionModal
        open={showModeSelection}
        onSelect={handleModeSelection}
      />
    </div>
  )
}
