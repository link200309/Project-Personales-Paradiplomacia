# Migracion DB Multiusuario - Paradiplomacia IDEI (WhatsApp Bot)

Este documento describe como aplicar la nueva base de datos para soportar:

- gestion de usuarios (estudiantes del grupo),
- sesiones por usuario,
- personalidades versionadas,
- mensajes del grupo de WhatsApp,
- trazabilidad base (auditoria).

## 1. Variables de entorno

En backend, verifica al menos:

- DATABASE_URL
- DEFAULT_USER_EMAIL
- DEFAULT_USER_NAME

Puedes partir desde backend/.env.example.

## 2. Aplicar migracion

Desde backend:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

Si trabajas en local y quieres crear/aplicar en modo desarrollo:

```bash
npx prisma migrate dev
```

## 3. Seed inicial

```bash
npm run db:seed
```

El seed ahora crea/actualiza:

- usuario administrador por defecto,
- personalidades base,
- version inicial de personalidades.

## 4. Identidad de usuario en WhatsApp

El sistema resuelve el estudiante por número de teléfono:

- phoneNumber del mensaje de WhatsApp
- Nombre del contacto (si está disponible)

El backend mapea el número de teléfono a un usuario en la base de datos.

## 5. Endpoints nuevos de gestion

- GET /api/users/me
- GET /api/users
- POST /api/users
- PATCH /api/users/:id

- GET /api/documents
- POST /api/documents
- PATCH /api/documents/:id

- PATCH /api/personalities/:id
- PATCH /api/personalities/:id/toggle

## 6. Modelo de WhatsApp

El sistema también almacena:

- Group: grupos de WhatsApp where opera el bot
- Message: mensajes del grupo con metadata de WhatsApp (messageId, groupId, sender)

## 7. Compatibilidad con el bot

El bot funciona con el usuario default para estudiantes sin registro.