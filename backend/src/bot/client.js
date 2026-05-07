import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "baileys"
import { existsSync, mkdirSync } from "fs"
import { dirname } from "path"
import { fileURLToPath } from "url"

import { handleIncomingMessage } from "./handlers/message.handler.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const SESSION_DIR = "./sessions"
const SESSION_FILE = "auth.json"

export let sock = null
export let connectionState = {
  isConnected: false,
  isConnecting: false,
  qr: null,
  lastError: null,
}

function ensureSessionDir() {
  if (!existsSync(SESSION_DIR)) {
    mkdirSync(SESSION_DIR, { recursive: true })
  }
}

async function getAuthState() {
  ensureSessionDir()
  const sessionPath = `${SESSION_DIR}/${SESSION_FILE}`
  
  return await useMultiFileAuthState(sessionPath)
}

export async function initBot() {
  if (sock) {
    return sock
  }

  connectionState.isConnecting = true
  connectionState.lastError = null

  try {
    const { state, saveCreds } = await getAuthState()

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: {
        level: "info",
        info: (msg) => console.log("[Baileys]", msg),
        warn: (msg) => console.warn("[Baileys WARN]", msg),
        error: (msg) => console.error("[Baileys ERROR]", msg),
        debug: (msg) => console.debug("[Baileys DEBUG]", msg),
      },
      browser: ["Paradiplomacia Bot", "Chrome", "120"],
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        connectionState.qr = qr
        console.log("[Baileys] QR Code received - escanea con WhatsApp")
      }

      if (connection === "close") {
        const reason = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = reason !== DisconnectReason.loggedOut

        console.log("[Baileys] Conexión cerrada:", DisconnectReason[reason] || reason)

        if (shouldReconnect) {
          console.log("[Baileys] Reconectando...")
          sock = null
          connectionState.isConnected = false
          initBot()
        } else {
          connectionState.isConnected = false
          connectionState.lastError = "Sesión cerrada - necesitas autenticarte de nuevo"
        }
      }

      if (connection === "open") {
        console.log("[Baileys] Conectado a WhatsApp")
        connectionState.isConnected = true
        connectionState.isConnecting = false
        connectionState.qr = null
      }
    })

    sock.ev.on("messages.upsert", ({ messages }) => {
      for (const message of messages) {
        if (message.key?.remoteJid?.endsWith("@g.us")) {
          handleGroupMessage(message)
        }
      }
    })

    return sock
  } catch (error) {
    connectionState.isConnecting = false
    connectionState.lastError = error.message
    console.error("[Baileys] Error al inicializar:", error)
    throw error
  }
}

export async function connectBot() {
  return await initBot()
}

export function getConnectionStatus() {
  return {
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    qr: connectionState.qr,
    lastError: connectionState.lastError,
  }
}

export async function disconnectBot() {
  if (sock) {
    sock.end(undefined)
    sock = null
    connectionState.isConnected = false
    connectionState.isConnecting = false
    console.log("[Baileys] Bot desconectado")
  }
}

export async function getMe() {
  if (!sock) {
    return null
  }
  return sock.user
}

export async function sendMessage(jid, content, options = {}) {
  if (!sock) {
    throw new Error("Bot no conectado")
  }
  return await sock.sendMessage(jid, content, options)
}

async function handleGroupMessage(message) {
  await handleIncomingMessage(message)
}