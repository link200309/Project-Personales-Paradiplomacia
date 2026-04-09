import { useEffect, useRef } from "react"

import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
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
    <div ref={containerRef} className="max-h-[55vh] overflow-y-auto pr-1">
      <div className="grid gap-3">
      {messages.map((message) => {
        const isUser = message.role === "user"

        return (
          <Card key={message.id} className={isUser ? "border-primary/20 bg-primary/5" : "bg-card"}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm">{isUser ? "You" : "Assistant"}</CardTitle>
              <div className="flex items-center gap-2">
                {message.personalityId ? (
                  <Badge variant="outline" className="capitalize">
                    {message.personalityId}
                  </Badge>
                ) : null}
                <span className="text-muted-foreground text-xs">{formatDate(message.createdAt)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6">{message.content}</p>
            </CardContent>
          </Card>
        )
      })}
      </div>
    </div>
  )
}
