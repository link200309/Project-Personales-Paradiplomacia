import { useEffect, useRef, useState } from "react"

import { AuthTopbar } from "@/features/auth/components/AuthTopbar"
import { ChatComposer } from "@/features/chat/components/ChatComposer"
import { ChatSidebar } from "@/features/chat/components/ChatSidebar"
import { MessageList } from "@/features/chat/components/MessageList"
import { ModeSelectionModal } from "@/features/chat/components/ModeSelectionModal"
import { useChat } from "@/features/chat/hooks/useChat"
import { ComparisonPanel } from "@/features/comparison/components/ComparisonPanel"
import { DebatePanel } from "@/features/debate/components/DebatePanel"
import { getPersonalities } from "@/features/personalities/api/getPersonalities"
import { PersonalitySelector } from "@/features/personalities/components/PersonalitySelector"
import type { InteractionMode } from "@/app/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { httpClient } from "@/shared/api/httpClient"
import { useSession } from "@/shared/hooks/useSession"
import type { Personality, PersonalityId } from "@/shared/types/personality"

interface SessionSummary {
  id: string
  mode: InteractionMode
  title: string | null
  personalityId: string | null
  personalityName: string | null
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
  mode: InteractionMode
  personalityId: string | null
  title: string | null
  createdAt: string
}

const COMPARATIVE_SESSION_KEY = "paradiplomacy-comparative-session-id"
const DEBATE_SESSION_KEY = "paradiplomacy-debate-session-id"

function getSessionModeLabel(mode: string) {
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

export function ConversationPage() {
  const contentScrollRef = useRef<HTMLDivElement>(null)
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
  const [debateSessionId, setDebateSessionId] = useState<string | null>(() =>
    window.sessionStorage.getItem(DEBATE_SESSION_KEY)
  )

  const { sessionId, isLoading: loadingSession, error: sessionError, selectSession } = useSession()
  const {
    messages,
    comparativeResult,
    comparativeHistory,
    debateResult,
    debateHistory,
    errorMessage,
    sendIndividual,
    sendComparative,
    sendDebate,
    loadComparativeSession,
    loadDebateSession,
    clearComparativeResult,
    clearDebateResult,
    clearMessages,
    loadSessionMessages,
  } = useChat()

  useEffect(() => {
    getPersonalities()
      .then((loadedPersonalities) => {
        setPersonalities(loadedPersonalities)
        if (loadedPersonalities[0]?.id) {
          setSelectedPersonalityId(loadedPersonalities[0].id)
        }
      })
      .catch(() => {
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
    if (mode !== "individual" || !sessionId) {
      return
    }

    const currentSession = sessions.find((session) => session.id === sessionId)
    if (currentSession?.personalityId) {
      setSelectedPersonalityId(currentSession.personalityId as PersonalityId)
    }
  }, [mode, sessionId, sessions])

  useEffect(() => {
    void refreshSessions()
  }, [])

  useEffect(() => {
    if (mode !== "comparative" || !comparativeSessionId) {
      return
    }

    void loadComparativeSession(comparativeSessionId)
  }, [comparativeSessionId, loadComparativeSession, mode])

  useEffect(() => {
    if (mode !== "debate" || !debateSessionId) {
      return
    }

    void loadDebateSession(debateSessionId)
  }, [debateSessionId, loadDebateSession, mode])

  useEffect(() => {
    if (!contentScrollRef.current) {
      return
    }

    contentScrollRef.current.scrollTop = contentScrollRef.current.scrollHeight
  }, [mode, messages, comparativeHistory, debateHistory, comparativeResult, debateResult])

  async function refreshSessions() {
    try {
      const response = await httpClient<SessionsResponse>("/sessions")
      setSessions(response.sessions)
    } catch {
      setSessions([])
    }
  }

  async function createIndividualSession(personalityId: PersonalityId) {
    const response = await httpClient<CreateSessionResponse>("/sessions", {
      method: "POST",
      body: { mode: "individual", personalityId },
    })

    window.sessionStorage.setItem("paradiplomacy-session-id", response.sessionId)
    selectSession(response.sessionId)
    setMode("individual")
    setSelectedPersonalityId(personalityId)
    await refreshSessions()
    return response.sessionId
  }

  async function createComparativeSession() {
    const response = await httpClient<CreateSessionResponse>("/sessions", {
      method: "POST",
      body: { mode: "comparative" },
    })

    window.sessionStorage.setItem(COMPARATIVE_SESSION_KEY, response.sessionId)
    setComparativeSessionId(response.sessionId)
    return response.sessionId
  }

  async function createDebateSession() {
    const response = await httpClient<CreateSessionResponse>("/sessions", {
      method: "POST",
      body: { mode: "debate" },
    })

    window.sessionStorage.setItem(DEBATE_SESSION_KEY, response.sessionId)
    setDebateSessionId(response.sessionId)
    return response.sessionId
  }

  async function handleSubmit() {
    if (!draft.trim()) {
      return
    }

    setLoading(true)
    try {
      if (mode === "individual") {
        const currentSessionId = sessionId ?? (await createIndividualSession(selectedPersonalityId))
        await sendIndividual({ sessionId: currentSessionId, personalityId: selectedPersonalityId, message: draft })
      } else if (mode === "comparative") {
        const currentComparativeSessionId = comparativeSessionId ?? (await createComparativeSession())
        await sendComparative({ sessionId: currentComparativeSessionId, message: draft })
      } else {
        const currentDebateSessionId = debateSessionId ?? (await createDebateSession())
        await sendDebate({ sessionId: currentDebateSessionId, message: draft })
      }

      setDraft("")
      void refreshSessions()
    } finally {
      setLoading(false)
    }
  }

  async function startComparativeChat() {
    setShowModeSelection(false)
    setDraft("")
    clearMessages()
    clearComparativeResult()
    clearDebateResult()
    setSidebarOpen(false)
    setMode("comparative")
    const nextComparativeSessionId = await createComparativeSession()
    void loadComparativeSession(nextComparativeSessionId)
    void refreshSessions()
  }

  async function startDebateChat() {
    setShowModeSelection(false)
    setDraft("")
    clearMessages()
    clearComparativeResult()
    clearDebateResult()
    setSidebarOpen(false)
    setMode("debate")
    const nextDebateSessionId = await createDebateSession()
    void loadDebateSession(nextDebateSessionId)
    void refreshSessions()
  }

  async function startIndividualChat(personalityId: PersonalityId) {
    setShowModeSelection(false)
    setDraft("")
    clearMessages()
    clearComparativeResult()
    clearDebateResult()
    setSidebarOpen(false)
    setMode("individual")
    const nextSessionId = await createIndividualSession(personalityId)
    void loadSessionMessages(nextSessionId)
    void refreshSessions()
  }

  const activeSessionId =
    mode === "comparative"
      ? comparativeSessionId
      : mode === "debate"
        ? debateSessionId
        : sessionId

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <AuthTopbar
        activeMode={mode}
        activeSessionId={activeSessionId}
        onToggleSidebar={() => setSidebarOpen((current) => !current)}
        onNewChat={() => setShowModeSelection(true)}
      />

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed inset-y-0 left-0 z-50 w-[90%] max-w-xs overflow-y-auto border-r bg-background shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:h-full lg:w-64 lg:max-w-none lg:translate-x-0 lg:overflow-hidden lg:shadow-none`}
        >
          <ChatSidebar
            sessions={sessions.map((session) => ({
              id: session.id,
              mode: session.mode,
              name:
                session.mode === "individual"
                  ? session.personalityName ?? session.title ?? "Conversación individual"
                  : getSessionModeLabel(session.mode),
              lastMessage: session.lastMessage?.content ?? "Sin mensajes todavía",
              timestamp: new Date(session.createdAt).toLocaleString(),
              personalityId: session.personalityId,
            }))}
            activeSessionId={activeSessionId ?? undefined}
            onSelectSession={async (nextSessionId) => {
              const selected = sessions.find((session) => session.id === nextSessionId)

              if (selected?.mode === "comparative") {
                setMode("comparative")
                window.sessionStorage.setItem(COMPARATIVE_SESSION_KEY, nextSessionId)
                setComparativeSessionId(nextSessionId)
                void loadComparativeSession(nextSessionId)
              } else if (selected?.mode === "debate") {
                setMode("debate")
                window.sessionStorage.setItem(DEBATE_SESSION_KEY, nextSessionId)
                setDebateSessionId(nextSessionId)
                void loadDebateSession(nextSessionId)
              } else {
                selectSession(nextSessionId)
                setMode("individual")
                if (selected?.personalityId) {
                  setSelectedPersonalityId(selected.personalityId as PersonalityId)
                }
                void loadSessionMessages(nextSessionId)
              }

              void refreshSessions()
              setSidebarOpen(false)
            }}
            onNewChat={() => {
              setShowModeSelection(true)
            }}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>

        {sidebarOpen ? <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}

        <div className="flex flex-1 min-h-0 flex-col gap-3 overflow-hidden px-4 py-4 sm:gap-4 sm:px-6 sm:py-6 lg:px-[8%] lg:py-6">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="grid gap-3 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {mode === "comparative"
                    ? `${comparativeHistory.length} turnos en esta sesión`
                    : mode === "debate"
                      ? `${debateHistory.length} debates en esta sesión`
                      : `${messages.length} mensajes en esta sesión`}
                </div>
              </div>

              {mode === "individual" ? (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Personalidad experta</p>
                    <span className="text-xs text-muted-foreground">
                      {messages.length > 0 ? "Fijada para esta conversación" : "Elige antes de escribir"}
                    </span>
                  </div>
                  <PersonalitySelector
                    compact
                    personalities={personalities}
                    selectedPersonalityId={selectedPersonalityId}
                    onSelect={setSelectedPersonalityId}
                    disabled={messages.length > 0}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          {mode === "individual" ? (
            <Card className="border-border/70 bg-muted/30 shadow-sm">
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Conversación actual</p>
                  <p className="text-sm font-medium">
                    {personalities.find((personality) => personality.id === selectedPersonalityId)?.name ?? "Personalidad"}
                  </p>
                </div>
                <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground">
                  {sessionId ? `Sesión ${sessionId.slice(0, 10)}` : "Sin sesión aún"}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div ref={contentScrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1">
            {mode === "individual" ? (
              <MessageList messages={messages} />
            ) : mode === "comparative" ? (
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
                          <p className="whitespace-pre-wrap text-xs leading-6 text-foreground/90 sm:text-sm">{turn.prompt}</p>
                        </CardContent>
                      </Card>
                      <ComparisonPanel result={turn.result} />
                    </div>
                  ))
                ) : (
                  <ComparisonPanel result={comparativeResult} />
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {debateHistory.length > 0 ? (
                  debateHistory.map((turn) => (
                    <div key={turn.id} className="grid gap-3">
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="py-3 sm:py-4">
                          <CardTitle className="text-sm sm:text-base">Tu consulta</CardTitle>
                          <CardDescription>Pregunta enviada al debate estructurado</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="whitespace-pre-wrap text-xs leading-6 text-foreground/90 sm:text-sm">{turn.prompt}</p>
                        </CardContent>
                      </Card>
                      <DebatePanel result={turn.result} />
                    </div>
                  ))
                ) : (
                  <DebatePanel result={debateResult} />
                )}
              </div>
            )}
          </div>

          <Card className="sticky bottom-0 z-20 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardContent>
              <ChatComposer mode={mode} value={draft} loading={loading || loadingSession} onChange={setDraft} onSubmit={handleSubmit} />
            </CardContent>
          </Card>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          {sessionError ? <p className="text-sm text-destructive">{sessionError}</p> : null}
        </div>

        <ModeSelectionModal
          open={showModeSelection}
          personalities={personalities}
          onOpenChange={setShowModeSelection}
          onSelectMode={(selectedMode) => {
            if (selectedMode === "comparative") {
              void startComparativeChat()
              return
            }

            if (selectedMode === "debate") {
              void startDebateChat()
            }
          }}
          onSelectIndividualPersonality={(personalityId) => {
            void startIndividualChat(personalityId)
          }}
        />
      </div>
    </div>
  )
}
