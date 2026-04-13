import type { ReactNode } from "react"

interface RichTextResponseProps {
  content: string
  className?: string
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: string[] }

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trimEnd()
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      index += 1
      continue
    }

    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(trimmedLine)
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      })
      index += 1
      continue
    }

    const unorderedItemMatch = /^[-*•]\s+(.*)$/.exec(trimmedLine)
    const orderedItemMatch = /^\d+[.)]\s+(.*)$/.exec(trimmedLine)

    if (unorderedItemMatch || orderedItemMatch) {
      const ordered = Boolean(orderedItemMatch)
      const items: string[] = []

      while (index < lines.length) {
        const currentLine = lines[index].trim()
        const currentUnordered = /^[-*•]\s+(.*)$/.exec(currentLine)
        const currentOrdered = /^\d+[.)]\s+(.*)$/.exec(currentLine)

        if (ordered && currentOrdered) {
          items.push(currentOrdered[1].trim())
          index += 1
          continue
        }

        if (!ordered && currentUnordered) {
          items.push(currentUnordered[1].trim())
          index += 1
          continue
        }

        break
      }

      blocks.push({ type: "list", ordered, items })
      continue
    }

    const paragraphLines = [trimmedLine]
    index += 1

    while (index < lines.length) {
      const nextLine = lines[index].trim()
      if (!nextLine) {
        break
      }

      if (/^(#{1,3})\s+/.test(nextLine) || /^[-*•]\s+/.test(nextLine) || /^\d+[.)]\s+/.test(nextLine)) {
        break
      }

      paragraphLines.push(nextLine)
      index += 1
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") })
  }

  return blocks
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const matchText = match[0]
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex))
    }

    if (matchText.startsWith("**")) {
      parts.push(<strong key={`${matchIndex}-strong`}>{matchText.slice(2, -2)}</strong>)
    } else if (matchText.startsWith("`")) {
      parts.push(<code key={`${matchIndex}-code`} className="rounded bg-muted px-0.5 sm:px-1 py-0.5 font-mono text-[0.75em] sm:text-[0.85em]">{matchText.slice(1, -1)}</code>)
    }

    lastIndex = matchIndex + matchText.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function renderBlock(block: Block, index: number) {
  if (block.type === "heading") {
    const Tag = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5"
    const sizeClass = block.level === 1 ? "text-sm sm:text-base" : block.level === 2 ? "text-xs sm:text-[0.98rem]" : "text-xs sm:text-sm"

    return (
      <Tag key={`${block.type}-${index}`} className={`font-semibold tracking-tight ${sizeClass}`}>
        {renderInlineMarkdown(block.text)}
      </Tag>
    )
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul"

    return (
      <ListTag key={`${block.type}-${index}`} className={`grid gap-1 sm:gap-2 ${block.ordered ? "list-decimal pl-4 sm:pl-5" : "list-disc pl-4 sm:pl-5"}`}>
        {block.items.map((item, itemIndex) => (
          <li key={`${index}-${itemIndex}`} className="leading-6 text-xs sm:text-sm">
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ListTag>
    )
  }

  return (
    <p key={`${block.type}-${index}`} className="whitespace-pre-wrap leading-7 text-foreground/90 text-xs sm:text-sm">
      {renderInlineMarkdown(block.text)}
    </p>
  )
}

export function RichTextResponse({ content, className }: RichTextResponseProps) {
  const blocks = parseBlocks(content)

  return <div className={`grid gap-2 sm:gap-3 text-sm ${className ?? ""}`.trim()}>{blocks.map(renderBlock)}</div>
}