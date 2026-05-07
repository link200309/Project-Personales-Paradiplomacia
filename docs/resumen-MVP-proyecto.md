# Resumen MVP Proyecto Paradiplomacia (WhatsApp Bot)

## 1. Objetivo del MVP

Construir una primera versión funcional de Paradiplomacia IDEI como asistente de IA en un grupo de WhatsApp, con tres personalidades expertas (Economista, Politólogo y Jurista) que respondan a preguntas de estudiantes de paradiplomacia de manera automática.

## 2. Alcance de esta fase (solo lo necesario)

### Incluye

- Bot de WhatsApp conectado mediante Baileys.
- Tres personalidades: Economista, Politólogo y Jurista.
- Comandos para seleccionar personalidad (!economista, !politologo, !jurista).
- Modo análisis comparado (!compare).
- Respuestas automáticas en el grupo de paradiplomacia.
- Historial básico de conversación por sesión.

### No incluye en el MVP

- Debate multiagente con réplicas automáticas en varias rondas.
- Panel administrativo completo con versionado avanzado.
- Sistema complejo de auditoría o trazabilidad extendida.
- Gestión avanzada de permisos por roles múltiples.
- Integraciones externas complejas.

## 3. Funcionalidades mínimas

### F1. Conexión a WhatsApp

- Autenticación por QR (primera vez).
- Persistencia de sesión.
- Conexión automática al grupo de paradiplomacia.

### F2. Gestión de comandos

- !economista - responde solo como Economista.
- !politologo - responde solo como Politólogo.
- !jurista - responde solo como Jurista.
- !compare - análisis comparado de las 3 personalidades.
- !ayuda - muestra comandos disponibles.

### F3. Respuesta automática

- El bot detecta mensajes en el grupo.
- Procesa la pregunta del estudiante.
- Genera respuesta con la personalidad seleccionada.
- Envía la respuesta al grupo.

### F4. Modo comparado

- El usuario envía !compare + pregunta.
- El sistema consulta a las 3 personalidades.
- Muestra las 3 respuestas separadas.

## 4. Flujos MVP

### Flujo A: Chat individual por comando

1. Estudiante envía !economista + pregunta.
2. Bot procesa el comando.
3. Sistema responde según el perfil elegido.

### Flujo B: Comparativo

1. Estudiante envía !compare + tema.
2. Sistema consulta a las 3 personalidades.
3. Muestra las 3 respuestas separadas.

## 5. Criterios de éxito del MVP

- El bot puede conectarse a WhatsApp y mantenerse conectado.
- Los estudiantes pueden usar comandos para seleccionar personalidad.
- Las respuestas de cada personalidad son distinguibles y consistentes.
- El modo comparado genera las 3 respuestas diferenciadas.
- El tiempo de respuesta es adecuado para uso conversacional.
- El contenido es útil para fines académicos.

## 6. Entregables de esta fase

- Bot funcional conectado a WhatsApp.
- Configuración inicial de las 3 personalidades.
- Guía breve de comandos para estudiantes.
- Documentación técnica básica.

## 7. Próxima fase sugerida (post-MVP)

- Agregar más comandos y funcionalidades.
- Implementar modo debate con réplicas.
- Crear panel administrativo.
- Mejorar base de conocimiento.