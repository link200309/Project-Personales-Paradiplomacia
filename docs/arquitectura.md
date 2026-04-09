# Arquitectura MVP - Proyecto Paradiplomacia

## 1. Objetivo arquitectónico del MVP

Definir una arquitectura simple, modular y escalable para soportar dos capacidades iniciales:

- chat individual con una personalidad experta,
- análisis comparado con tres personalidades (Economista, Politest y Jurista).

La prioridad de esta fase es rapidez de implementación, claridad técnica y facilidad de evolución hacia una versión multiagente más avanzada.

## 2. Vista general de arquitectura

Arquitectura tipo cliente-servidor con separación por capas:

- Frontend web (React + Vite + TypeScript + shadcn/ui): interfaz conversacional.
- Backend API (Node.js + Express en JavaScript): orquestación de prompts, sesión y respuestas.
- Servicio LLM: generación de contenido para cada personalidad usando `llama-3.3-70b-versatile`.
- Almacenamiento ligero: sesiones, mensajes y configuración de personalidades.

La estructura del proyecto puede organizarse como una base monolítica modular, con dos aplicaciones separadas en `frontend/` y `backend/`, y una carpeta `docs/` para la documentación funcional y técnica.

## 3. Componentes principales

## 3.1 Frontend (MVP)

Responsabilidades:

- Selección de modo: chat individual o comparado.
- Selección de personalidad (en modo individual).
- Captura de pregunta/tema del usuario.
- Visualización de respuestas:
  - una respuesta en chat individual,
  - tres respuestas separadas en análisis comparado,
  - síntesis opcional.
- Historial de conversación por sesión activa.

Módulos sugeridos:

- Vista principal de conversación.
- Selector de personalidad.
- Selector de modo.
- Panel de respuestas comparadas.
- Servicio API client.

## 3.2 Backend API (MVP)

Responsabilidades:

- Exponer endpoints REST para conversación.
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

La siguiente estructura separa claramente frontend y backend, y muestra los archivos sugeridos para cada carpeta.

### 4.1 Frontend

```text
frontend/
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ eslint.config.js
├─ index.html
├─ .env.example
├─ public/
└─ src/
  ├─ main.tsx
  ├─ App.tsx
  ├─ index.css
  ├─ App.css
  ├─ assets/
  ├─ app/
  │  ├─ router.tsx
  │  ├─ providers.tsx
  │  └─ store.ts
  ├─ shared/
  │  ├─ api/
  │  │  └─ httpClient.ts
  │  ├─ components/
  │  │  ├─ Button.tsx
  │  │  ├─ Header.tsx
  │  │  └─ Layout.tsx
  │  ├─ hooks/
  │  │  ├─ useChat.ts
  │  │  └─ useSession.ts
  │  ├─ types/
  │  │  ├─ chat.ts
  │  │  └─ personality.ts
  │  └─ utils/
  │     ├─ formatDate.ts
  │     └─ normalizeResponse.ts
  ├─ features/
  │  ├─ chat/
  │  │  ├─ api/
  │  │  ├─ components/
  │  │  ├─ hooks/
  │  │  ├─ pages/
  │  │  ├─ types/
  │  │  └─ index.ts
  │  ├─ personalities/
  │  │  ├─ api/
  │  │  ├─ components/
  │  │  ├─ hooks/
  │  │  ├─ pages/
  │  │  ├─ types/
  │  │  └─ index.ts
  │  ├─ comparison/
  │  │  ├─ api/
  │  │  ├─ components/
  │  │  ├─ hooks/
  │  │  ├─ pages/
  │  │  ├─ types/
  │  │  └─ index.ts
  │  └─ auth/  
  │     ├─ api/
  │     ├─ components/
  │     ├─ hooks/
  │     ├─ pages/
  │     ├─ types/
  │     └─ index.ts
  └─ styles/
    ├─ globals.css
    ├─ theme.css
    └─ variables.css
```

### 4.2 Backend

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
│  ├─ config/
│  │  ├─ env.js
│  │  ├─ prisma.js
│  │  └─ websocket.js
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
│  │  └─ validateRequest.js
│  ├─ utils/
│  │  ├─ logger.js
│  │  ├─ constants.js
│  │  └─ responseHelpers.js
│  └─ jobs/
│     ├─ cleanupSessions.js
│     └─ index.js
```

Notas de implementación:

- En frontend, el MVP solo necesita `chat/`, `personalities/` y `comparison/`; `auth/` puede quedar preparado para una fase posterior.
- En backend, `websocket.js` puede existir como preparación, aunque no es obligatorio para el MVP.
- En esta fase, Express debe usarse sin TypeScript para reducir complejidad de arranque y alinearse con la estructura de backend que indicaste.

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

- economista,
- politest,
- jurista.

## 6. Persistencia (MVP)

Datos mínimos a guardar:

- sesión,
- mensajes usuario/sistema,
- modo de consulta,
- personalidad usada,
- timestamp,
- metadatos básicos de sesión.

Opciones recomendadas:

- Base relacional ligera (PostgreSQL) para sesiones y mensajes.

## 7. Flujos de ejecución

### 7.1 Flujo A: chat individual

1. Frontend envía pregunta + personalidad + sessionId.
2. Backend obtiene prompt base de la personalidad.
3. Backend arma prompt final (instrucciones + pregunta + contexto de sesión).
4. Backend invoca LLM.
5. Backend guarda mensaje y respuesta.
6. Frontend muestra respuesta.

### 7.2 Flujo B: análisis comparado

1. Frontend envía tema + sessionId en modo comparado.
2. Backend ejecuta pipeline por cada personalidad.
3. Backend obtiene 3 respuestas separadas.
4. Opcional: genera síntesis institucional.
5. Guarda resultados y retorna payload estructurado.
6. Frontend renderiza bloques por experto.

## 8. Diseño de API (mínimo sugerido)

- POST /api/chat/individual
  - input: sessionId, personalityId, message
  - output: response, metadata

- POST /api/chat/comparative
  - input: sessionId, message
  - output: responses[3], optionalSummary, metadata

- GET /api/personalities
  - output: lista de personalidades activas

- POST /api/sessions
  - output: sessionId

- GET /api/sessions/:id/messages
  - output: historial de la sesión

## 9. Modelo de datos mínimo

Entidades:

- Session:
  - id,
  - createdAt,
  - mode.

- Message:
  - id,
  - sessionId,
  - role (user/assistant/system),
  - personalityId (nullable en mensajes de usuario),
  - content,
  - createdAt.

- Personality:
  - id,
  - name,
  - roleDescription,
  - styleGuide,
  - basePrompt,
  - isActive.

Si se usa Prisma, estas entidades pueden mapearse directamente en `backend/prisma/schema.prisma`.