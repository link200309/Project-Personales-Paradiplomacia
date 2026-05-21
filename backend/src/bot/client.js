import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "baileys"
import { existsSync, mkdirSync, rmSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import QRCode from "qrcode"

import { handleIncomingMessage } from "./handlers/message.handler.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const SESSION_DIR = resolve(__dirname, "../../sessions/auth.json")

export let sock = null
export let connectionState = {
  isConnected: false,
  isConnecting: false,
  qr: null,
  qrDataURL: null,
  lastError: null,
}

function ensureSessionDir() {
  if (!existsSync(SESSION_DIR)) {
    mkdirSync(SESSION_DIR, { recursive: true })
  }
}

function clearSessionDir() {
  if (existsSync(SESSION_DIR)) {
    rmSync(SESSION_DIR, { recursive: true, force: true })
  }
}

async function getAuthState() {
  ensureSessionDir()

  return await useMultiFileAuthState(SESSION_DIR)
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
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        connectionState.qr = qr
        generateQRDataURL(qr)
        console.log("[Baileys] QR Code recibido - visita http://localhost:3001/qr para escanear")
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
          clearSessionDir()
          sock = null
          connectionState.isConnected = false
          connectionState.isConnecting = false
          connectionState.qr = null
          connectionState.qrDataURL = null
          connectionState.lastError = "Sesión cerrada - necesitas autenticarte de nuevo"
          initBot().catch((error) => {
            console.error("[Baileys] No se pudo reiniciar sesión limpia:", error)
            connectionState.lastError = error.message
          })
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
    qrDataURL: connectionState.qrDataURL,
    lastError: connectionState.lastError,
  }
}

async function generateQRDataURL(qrCode) {
  try {
    const dataURL = await QRCode.toDataURL(qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    connectionState.qrDataURL = dataURL
  } catch (error) {
    console.error("[Baileys] Error al generar QR:", error)
  }
}

export function getQRDataURL() {
  return connectionState.qrDataURL
}

export async function disconnectBot() {
  if (sock) {
    sock.end(undefined)
    sock = null
    connectionState.isConnected = false
    connectionState.isConnecting = false
    connectionState.qr = null
    connectionState.qrDataURL = null
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