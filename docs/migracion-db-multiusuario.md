# Migracion DB Multiusuario - Paradiplomacia IDEI

Este documento describe como aplicar la nueva base de datos para soportar:

- gestion de usuarios,
- sesiones por usuario,
- personalidades versionadas,
- documentos institucionales,
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

## 4. Identidad de usuario en requests

El backend resuelve usuario por headers opcionales:

- x-user-id
- x-user-email
- x-user-name

Si no llegan, usa el usuario por defecto configurado en entorno.

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

## 6. Compatibilidad con frontend actual

El frontend sigue funcionando sin login formal:

- si no configura identidad, opera como usuario por defecto,
- puede fijar identidad en sessionStorage para pruebas multiusuario.
