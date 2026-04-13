import { useEffect, useRef } from "react"

import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { RichTextResponse } from "@/shared/components/RichTextResponse"
import type { ChatMessage } from "@/shared/types/chat"
import { formatDate } from "@/shared/utils/formatDate"

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto pr-1">
      {messages.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-background/70">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-sm font-semibold">1</span>
            </div>
            <p className="text-sm font-medium">Aún no hay mensajes en esta conversación</p>
            <p className="max-w-sm text-xs leading-6 text-muted-foreground">
              Escribe una consulta para comenzar a construir el historial de la sesión activa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {messages.map((message) => {
            const isUser = message.role === "user"
            const personaLabel = message.personalityId ? message.personalityId : null

            return (
              <Card
                key={message.id}
                className={isUser ? "border-primary/20 bg-primary/5 shadow-sm" : "border-border/70 bg-card shadow-sm"}
              >
                <CardHeader className="flex flex-col gap-3 border-b border-border/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {isUser ? "T" : "A"}
                    </div>
                    <div>
                      <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {isUser ? "Tú" : "Asistente"}
                      </CardTitle>
                      <p className="text-sm font-medium text-foreground">
                        {isUser ? "Consulta enviada" : "Respuesta generada"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {personaLabel ? (
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[0.7rem] capitalize">
                        {personaLabel}
                      </Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="px-3 py-4 sm:px-6 sm:py-5">
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-xs leading-6 text-foreground/90 sm:text-sm">{message.content}</p>
                  ) : (
                    <RichTextResponse content={message.content} />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
