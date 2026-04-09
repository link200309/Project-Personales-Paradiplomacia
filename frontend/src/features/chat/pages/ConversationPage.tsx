import { useEffect, useState } from "react"

import { ChatComposer } from "@/features/chat/components/ChatComposer"
import { ChatSidebar } from "@/features/chat/components/ChatSidebar"
import { MessageList } from "@/features/chat/components/MessageList"
import { useChat } from "@/features/chat/hooks/useChat"
import { ComparisonPanel } from "@/features/comparison/components/ComparisonPanel"
import { getPersonalities } from "@/features/personalities/api/getPersonalities"
import { PersonalitySelector } from "@/features/personalities/components/PersonalitySelector"
import type { InteractionMode } from "@/app/store"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useSession } from "@/shared/hooks/useSession"
import type { Personality, PersonalityId } from "@/shared/types/personality"

export function ConversationPage() {
  const [mode, setMode] = useState<InteractionMode>("individual")
  const [draft, setDraft] = useState("")
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<PersonalityId>("economist")
  const [loading, setLoading] = useState(false)

  const { sessionId } = useSession()
  const { messages, comparativeResult, errorMessage, sendIndividual, sendComparative, clearComparativeResult, clearMessages } = useChat()

  useEffect(() => {
    getPersonalities().then(setPersonalities)
  }, [])

  async function handleSubmit() {
    if (!draft.trim()) {
      return
    }

    setLoading(true)
    try {
      if (mode === "individual") {
        await sendIndividual({ personalityId: selectedPersonalityId, message: draft })
      } else {
        await sendComparative({ message: draft, personalities })
      }
      setDraft("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        sessions={[]}
        activeSessionId={sessionId}
        onNewChat={() => {
          setDraft("")
          clearMessages()
          clearComparativeResult()
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden py-10 px-35">
        {/* Interaction Mode + Expert Personality */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Interaction Mode Card */}
          <Card>
            <CardHeader>
              <CardTitle>Interaction mode</CardTitle>
              <CardDescription>Choose one expert or comparison.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                type="button"
                variant={mode === "individual" ? "default" : "outline"}
                onClick={() => {
                  setMode("individual")
                  clearComparativeResult()
                }}
                className="w-full"
              >
                Individual chat
              </Button>
              <Button
                type="button"
                variant={mode === "comparative" ? "default" : "outline"}
                onClick={() => setMode("comparative")}
                className="w-full"
              >
                Comparative analysis
              </Button>
            </CardContent>
          </Card>

          {/* Expert Personality Card */}
          {mode === "individual" && (
            <Card>
              <CardHeader>
                <CardTitle>Expert personality</CardTitle>
                <CardDescription>Select the perspective.</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalitySelector
                  personalities={personalities}
                  selectedPersonalityId={selectedPersonalityId}
                  onSelect={setSelectedPersonalityId}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Messages List */}
        <div className="flex-1">
          {mode === "individual" ? (
            <MessageList messages={messages} />
          ) : (
            <ComparisonPanel result={comparativeResult} />
          )}
        </div>

        {/* Chat Composer */}
        <Card className="relative bottom-0">
          <CardContent className="">
            <ChatComposer mode={mode} value={draft} loading={loading} onChange={setDraft} onSubmit={handleSubmit} />
          </CardContent>
        </Card>

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </div>
    </div>
  )
}
