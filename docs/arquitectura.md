# Arquitectura MVP - Proyecto Paradiplomacia (WhatsApp Bot)

## 1. Objetivo arquitectónico del MVP

Definir una arquitectura simple, modular y escalable para soportar un asistente de IA en un grupo de WhatsApp, con tres personalidades expertas que respondan a preguntas de estudiantes de paradiplomacia.

La prioridad de esta fase es rapidez de implementación, claridad técnica y facilidad de evolución hacia una versión más avanzada con más funcionalidades.

## 2. Vista general de arquitectura

Arquitectura tipo cliente-servidor con separación por capas:

- Backend Bot (Node.js + Express + Baileys): conexión a WhatsApp, manejo de mensajes y grupos.
- Backend API (Node.js + Express en JavaScript): orquestación de prompts, sesión y respuestas.
- Servicio LLM: generación de contenido para cada personalidad usando `llama-3.3-70b-versatile`.
- Almacenamiento ligero: sesiones, mensajes, grupos y configuración de personalidades.

La estructura del proyecto puede organizarse como una base monolítica modular, con dos aplicaciones separadas en `backend/` (bot + API) y una carpeta `docs/` para la documentación funcional y técnica.

## 3. Componentes principales

## 3.1 Bot de WhatsApp (MVP)

Responsabilidades:

- Conexión a WhatsApp mediante Baileys (QR Authentication).
- Gestión de grupos: detectar mensajes en el grupo de paradiplomacia.
- Detección de menciones o comandos: identificar cuando mencionados o llamado.
- Réplica automática o respondida a preguntas de estudiantes.
- Gestión de estado de conexión y reconexiones.

Módulos sugeridos:

- Inicialización de Baileys.
- Manejador de mensajes entrantes.
- Procesador de comandos.
- Interfaz con el servicio de chat.

## 3.2 Backend API (MVP)

Responsabilidades:

- Exponer endpoints REST para chat.
- Gestionar sesión y contexto reciente.
- Resolver configuración de personalidades.
- Construir prompts finales por personalidad.
- Invocar modelo LLM y normalizar salidas.

Capas internas sugeridas:

- Controller: entrada/salida HTTP.
- Service de conversación: lógica de negocio.
- Service de personalidades: perfiles y prompts base.
- Adapter LLM: integración desacoplada con proveedor.
- Repository: persistencia de sesiones y mensajes.

## 4. Estructura de carpetas propuesta

La siguiente estructura separa claramente backend (bot + API) y muestra los archivos sugeridos para cada carpeta.

### 4.1 Backend (Bot + API)

```text
backend/
├─ package.json
├─ .env.example
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.js
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ bot/
│  │  ├─ baileys.js
│  │  ├─ client.js
│  │  ├─ handlers/
│  │  │  ├─ message.handler.js
│  │  │  └─ group.handler.js
│  │  └─ services/
│  │     └─ bot.service.js
│  ├─ config/
│  │  ├─ env.js
│  │  ├─ prisma.js
│  │  └─ whatsapp.js
│  ├─ controllers/
│  │  ├─ chat.controller.js
│  │  ├─ personalities.controller.js
│  │  ├─ sessions.controller.js
│  │  └─ index.js
│  ├─ services/
│  │  ├─ chat.service.js
│  │  ├─ personalities.service.js
│  │  ├─ sessions.service.js
│  │  └─ llm.service.js
│  ├─ repositories/
│  │  ├─ messages.repository.js
│  │  ├─ personalities.repository.js
│  │  └─ sessions.repository.js
│  ├─ routes/
│  │  ├─ chat.routes.js
│  │  ├─ personalities.routes.js
│  │  ├─ sessions.routes.js
│  │  └─ index.js
│  ├─ middlewares/
│  │  ├─ errorHandler.js
│  │  ├─ auth.js
│  │  ��─ validateRequest.js
│  ├─ utils/
│  │  ├─ logger.js
│  │  ├─ constants.js
│  │  └─ responseHelpers.js
│  └─ jobs/
│     ├─ cleanupSessions.js
│     └─ index.js
```

Notas de implementación:

- Baileys permite conexión a WhatsApp sin API externa.
- El bot usa autenticación por QR la primera vez.
- El bot debe integrarse a un grupo específico de WhatsApp.
- El modo "solo" o "comparado" puede activarse por comando.

## 5. Motor de personalidades

Cada personalidad se define por configuración (no hardcode en lógica):

- id,
- nombre visible,
- rol,
- estilo de lenguaje,
- prioridades analíticas,
- prompt base,
- límites temáticos.

Perfiles iniciales:

- Economista,
- Politólogo,
- Jurista.

## 6. Persistencia (MVP)

Datos mínimos a guardar:

- sesión,
- mensajes usuario/sistema,
- modo de consulta,
- personalityId,
- timestamp,
- metadata del grupo de WhatsApp,
- metadata del mensaje.

Opciones recomendadas:

- Base relacional ligera (PostgreSQL) para sesiones y mensajes.

## 7. Flujos de ejecución

### 7.1 Flujo A: Respuesta automática en grupo

1. El bot recibe un mensaje del grupo de paradiplomacia.
2. El bot detecta mención o comando (@bot, !economista, !politologo, etc.).
3. El backend obtiene prompt base de la personalidad seleccionada.
4. El backend arma prompt final (instrucciones + pregunta + contexto de sesión).
5. El backend invoca LLM.
6. El bot envía la respuesta al grupo.
7. Se guarda el mensaje y la respuesta.

### 7.2 Flujo B: Análisis сравнениы (modo comparado)

1. El usuario envía comando comparativo.
2. El backend ejecuta pipeline por cada personalidad.
3. El backend obtiene 3 respuestas separadas.
4. Opcional: genera síntesis institucional.
5. Guarda resultados y retorna payload estructurado.
6. El bot envía respuesta formateada al grupo.

## 8. Diseño de API (mínimo sugerido)

- POST /api/chat/whatsapp
  - input: sessionId, personalityId, message, groupId, messageId
  - output: response, metadata

- POST /api/chat/comparative
  - input: sessionId, message, groupId
  - output: responses[3], optionalSummary, metadata

- GET /api/personalities
  - output: lista de personalidades activas

- POST /api/sessions
  - output: sessionId

- GET /api/sessions/:id/messages
  - output: historial de la sesión

- POST /api/bot/connect
  - output: status, qrCode (para autenticación inicial)

- GET /api/bot/status
  - output: connectionStatus

## 9. Modelo de datos mínimo

Entidades:

- Session:
  - id,
  - createdAt,
  - mode,
  - groupId (nullable).

- Message:
  - id,
  - sessionId,
  - role (user/assistant/system),
  - personalityId (nullable en mensajes de usuario),
  - content,
  - groupId,
  - messageId (messageID de WhatsApp),
  - createdAt.

- Personality:
  - id,
  - name,
  - roleDescription,
  - styleGuide,
  - basePrompt,
  - isActive.

- Group:
  - id,
  - whatsappGroupId,
  - name,
  - isActive,
  - createdAt.

Si se usa Prisma, estas entidades pueden mapearse directamente en `backend/prisma/schema.prisma`.

## 10. Integración con WhatsApp (Baileys v6)

### 10.1 Autenticación

- Primera vez: generar QR para escanear con WhatsApp.
- Sesiones persistidas en disco para reconexión automática.
- Manejo de eventos de conexión/desconexión.

### 10.2 Manejo de grupos

- Unirse al grupo de paradiplomacia mediante link invitation.
- Escuchar mensajes del grupo exclusivamente.
- Responder en el mismo grupo.

### 10.3 Comandos sugeridos

- @bot - mención directa al bot.
- !economista - responde solo como Economista.
- !politologo - responde solo como Politólogo.
- !jurista - responde solo como Jurista.
- !compare - análisis comparado de las 3 personalidades.
- !ayuda - muestra comandos disponibles.

## 11. Consideraciones deWhatsApp

- WhatsApp tiene límites de tasa (rate limits).
- No enviar mensajes muy rápidos para evitar bloquo.
- Respetar términos de servicio de WhatsApp.
- Baileys es no oficial, usar con precaución en producción.