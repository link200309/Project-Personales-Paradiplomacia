# Requerimientos MVP - Proyecto Paradiplomacia (WhatsApp Bot)

## 1. Objetivo

Definir los requerimientos funcionales y no funcionales mínimos que debe cubrir el MVP de Paradiplomacia IDEI, orientado a un asistente de IA en un grupo de WhatsApp con tres personalidades expertas: Economista, Politólogo y Jurista.

## 2. Alcance del MVP

El MVP debe cubrir los siguientes modos de interacción en WhatsApp:

- Respuesta automática con una personalidad seleccionada mediante comando.
- Análisis comparado con respuestas separadas de las tres personalidades.
- Respuestas grupales en el grupo de paradiplomacia.

Este documento describe solo lo necesario para construir la primera versión funcional.

## 3. Requerimientos funcionales

### 3.1 Gestión de personalidades

- RF-01: El sistema debe disponer de tres personalidades iniciales configuradas: Economista, Politólogo y Jurista.
- RF-02: Cada personalidad debe tener nombre visible, rol, estilo de respuesta e instrucciones base.
- RF-03: El sistema debe permitir diferenciar el tono, el marco de análisis y el tipo de argumentos de cada personalidad.
- RF-04: El sistema debe permitir asociar límites temáticos o lineamientos básicos a cada personalidad.

### 3.2 Conexión a WhatsApp

- RF-05: El sistema debe conectarse a WhatsApp mediante Baileys (QR Authentication).
- RF-06: El sistema debe persistir la sesión para reconexión automática.
- RF-07: El sistema debe manejar eventos de conexión/desconexión.
- RF-08: El sistema debe poder unirse a un grupo específico de WhatsApp.

### 3.3 Manejo de mensajes en grupo

- RF-09: El sistema debe detectar mensajes en el grupo de paradiplomacia.
- RF-10: El sistema debe detectar menciones directas (@bot) o comandos.
- RF-11: El sistema debe responder en el mismo grupo de WhatsApp.
- RF-12: El sistema debe identificar qué estudiante envió el mensaje (número de teléfono).

### 3.4 Interacción conversacional por comando

- RF-13: El usuario debe poder usar comandos para seleccionar una personalidad específica.
- RF-14: El sistema debe permitir enviar una pregunta o tema en linguagem natural.
- RF-15: El sistema debe responder con un mensaje generado según la personalidade elegida.
- RF-16: El sistema debe conservar el contexto de la conversación durante la sesión activa.

### 3.5 Modo comparado

- RF-17: El usuario debe poder ingresar un comando para obtener un análisis comparado.
- RF-18: El sistema debe generar tres respuestas separadas, una por cada personalidade.
- RF-19: El sistema debe enviar las respuestas de forma claramente diferenciada.
- RF-20: El sistema puede incluir una síntesis final opcional.

### 3.6 Historial de sesión

- RF-21: El sistema debe guardar un historial básico de mensajes durante la sesión.
- RF-22: El sistema debe mostrar la conversación previa de la sesión activa.
- RF-23: El sistema debe asociar los mensajes al modo de interacción utilizado.

### 3.7 Integración con backend y modelo

- RF-24: El bot debe enviar al backend el mensaje del usuario, la personalidad seleccionada y el identificador de sesión.
- RF-25: El backend debe construir el prompt final combinando instrucciones base, contexto reciente y mensaje del usuario.
- RF-26: El backend debe invocar el servicio de modelo de lenguaje y devolver la respuesta normalizada.
- RF-27: El sistema debe almacenar o reutilizar la información mínima necesaria para mantener la continuidad de la sesión.

### 3.8 Comandos del bot

- RF-28: El sistema debe reconocer el comando !economista para responder solo como Economista.
- RF-29: El sistema debe reconocer el comando !politologo para responder solo como Politólogo.
- RF-30: El sistema debe reconocer el comando !jurista para responder solo como Jurista.
- RF-31: El sistema debe reconocer el comando !compare para análisis comparado.
- RF-32: El sistema debe reconocer el comando !ayuda para mostrar comandos disponibles.

### 3.9 Salida de resultados

- RF-33: El sistema debe mostrar respuestas legibles, breves y orientadas a consulta académica o institucional.
- RF-34: El sistema debe distinguir visualmente las respuestas de cada personalidad en el modo comparado.
- RF-35: El sistema debe manejar respuestas de error cuando falle la generación o la comunicación con el backend.

## 4. Requerimientos no funcionales

### 4.1 Usabilidad

- RNF-01: Los estudiantes deben poder usar el bot sin entrenamiento previo.
- RNF-02: Los comandos deben ser simples y evidentes (!economista, !compare, etc.).
- RNF-03: El sistema debe presentar las respuestas con una estructura clara y fácil de leer.

### 4.2 Rendimiento

- RNF-04: El sistema debe ofrecer una experiencia conversacional fluida.
- RNF-05: La respuesta debe mostrarse en un tiempo razonable.
- RNF-06: El modo comparado debe procesarse de forma aceptable aunque involucre tres respuestas.

### 4.3 Mantenibilidad

- RNF-07: La solución debe mantener separación entre lógica del bot, backend y lógica de personalidades.
- RNF-08: La configuración de cada personalidad debe estar desacoplada de la lógica del bot.
- RNF-09: El código debe ser modular para permitir agregar nuevas personalidades en el futuro.

### 4.4 Escalabilidad

- RNF-10: La arquitectura debe permitir incorporar nuevas personalidades sin reescribir el flujo principal.
- RNF-11: El sistema debe poder soportar múltiples grupos de WhatsApp sin cambiar la experiencia base.
- RNF-12: La persistencia y el manejo de sesiones deben poder ampliarse sin cambiar la experiencia base del usuario.

### 4.5 Confiabilidad

- RNF-13: El sistema debe manejar fallos de red, de WhatsApp o de servicio LLM sin romperse.
- RNF-14: El sistema debe devolver mensajes de error claros cuando no se pueda completar una respuesta.
- RNF-15: El comportamiento de cada personalidad debe ser consistente entre consultas similares.

### 4.6 Seguridad

- RNF-16: El sistema no debe exponer credenciales, claves o configuraciones sensibles.
- RNF-17: El backend debe centralizar el acceso al proveedor de LLM.
- RNF-18: El sistema debe evitar mostrar información interna no necesaria para los usuarios.
- RNF-19: El número de teléfono de los estudiantes debe tratarse con confidencialidad.

### 4.7 Compatibilidad con WhatsApp

- RNF-20: El bot debe funcionar con WhatsApp Business o WhatsApp Messenger.
- RNF-21: El sistema debe respetar los términos de servicio de WhatsApp.
- RNF-22: El sistema debe manejar límites de tasa (rate limits) de WhatsApp.

### 4.8 Observabilidad básica

- RNF-23: El sistema debe permitir identificar errores básicos en la conversación o en la integración con el backend.
- RNF-24: El backend debe registrar información mínima para depuración de sesiones y respuestas.

## 5. Criterios de aceptación del MVP

- El bot puede conectarse a WhatsApp mediante QR y mantenerse conectado.
- El bot puede unirse al grupo de paradiplomacia.
- Los estudiantes pueden usar comandos (!economista, !politologo, !jurista, !compare).
- El bot responde con la personalidad seleccionada.
- El bot puede generar un análisis comparado de las tres personalidades.
- El sistema conserva el contexto básico de la sesión activa.
- Las respuestas son claras y entendibles para estudiantes.
- El backend puede orquestar prompts y respuestas sin exponer complejidad técnica.

## 6. Exclusiones del MVP

- Debate multiagente con réplicas automáticas en varias rondas.
- Panel administrativo completo con versionado avanzado.
- Sistema complejo de auditoría o trazabilidad extendida.
- Gestión avanzada de permisos por roles múltiples.
- Integraciones externas complejas.
- Base de conocimiento documental avanzada.

## 7. Relación con otros documentos

Este documento complementa:

- [resumen-MVP-proyecto.md](resumen-MVP-proyecto.md)
- [arquitectura.md](arquitectura.md)
- [resumen-proyecto-paradiplomacia.md](resumen-proyecto-paradiplomacia.md)