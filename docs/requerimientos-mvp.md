# Requerimientos MVP - Proyecto Paradiplomacia

## 1. Objetivo

Definir los requerimientos funcionales y no funcionales mínimos que debe cubrir el MVP de Paradiplomacia IDEI, orientado a una experiencia conversacional con tres personalidades expertas: Economista, Politest y Jurista.

## 2. Alcance del MVP

El MVP debe cubrir tres modos principales de interacción:

- chat individual con una personalidad seleccionada,
- análisis comparado con respuestas separadas de las tres personalidades.
- debate estructurado o mesa redonda con posturas, réplicas y síntesis final.

Este documento describe solo lo necesario para construir la primera versión funcional.

## 3. Requerimientos funcionales

### 3.1 Gestión de personalidades

- RF-01: El sistema debe disponer de tres personalidades iniciales configuradas: Economista, Politest y Jurista.
- RF-02: Cada personalidad debe tener nombre visible, rol, estilo de respuesta e instrucciones base.
- RF-03: El sistema debe permitir diferenciar el tono, el marco de análisis y el tipo de argumentos de cada personalidad.
- RF-04: El sistema debe permitir asociar límites temáticos o lineamientos básicos a cada personalidad.

### 3.2 Interacción conversacional

- RF-05: El usuario debe poder seleccionar una personalidad específica para iniciar una conversación individual.
- RF-06: El sistema debe permitir enviar una pregunta o tema en lenguaje natural.
- RF-07: El sistema debe responder con un chat generado según la personalidad elegida.
- RF-08: El sistema debe conservar el contexto de la conversación durante la sesión activa.

### 3.3 Modo comparado

- RF-09: El usuario debe poder ingresar un único tema para obtener un análisis comparado.
- RF-10: El sistema debe generar tres respuestas separadas, una por cada personalidad.
- RF-11: El sistema debe presentar las respuestas de forma claramente diferenciada para facilitar la comparación.
- RF-12: El sistema puede incluir una síntesis final opcional que resuma coincidencias y diferencias.

### 3.4 Debate estructurado

- RF-13: El usuario debe poder activar un modo debate con las tres personalidades.
- RF-14: El sistema debe generar una postura inicial por personalidad, réplicas cruzadas y una síntesis final.
- RF-15: El sistema debe conservar el debate dentro de una sesión reutilizable.

### 3.5 Historial de sesión

- RF-16: El sistema debe guardar un historial básico de mensajes durante la sesión.
- RF-17: El sistema debe mostrar la conversación previa de la sesión activa al usuario.
- RF-18: El sistema debe asociar los mensajes al modo de interacción utilizado: individual, comparado o debate.

### 3.6 Integración con backend y modelo

- RF-19: El frontend debe enviar al backend el mensaje del usuario, la personalidad seleccionada y el identificador de sesión cuando aplique.
- RF-20: El backend debe construir el prompt final combinando instrucciones base, contexto reciente y mensaje del usuario.
- RF-21: El backend debe invocar el servicio de modelo de lenguaje y devolver la respuesta normalizada.
- RF-22: El sistema debe almacenar o reutilizar la información mínima necesaria para mantener la continuidad de la sesión.

### 3.7 Salida de resultados

- RF-23: El sistema debe mostrar respuestas legibles, breves y orientadas a consulta académica o institucional.
- RF-24: El sistema debe distinguir visualmente las respuestas de cada personalidad en el modo comparado y en el debate.
- RF-25: El sistema debe manejar respuestas de error cuando falle la generación o la comunicación con el backend.

## 4. Requerimientos no funcionales

### 4.1 Usabilidad

- RNF-01: La interfaz debe permitir usar el chat sin entrenamiento previo.
- RNF-02: La navegación entre modo individual y modo comparado debe ser simple y evidente.
- RNF-03: El sistema debe presentar las respuestas con una estructura clara y fácil de leer.

### 4.2 Rendimiento

- RNF-04: El sistema debe ofrecer una experiencia conversacional fluida para uso interactivo.
- RNF-05: La respuesta debe mostrarse en un tiempo razonable para no interrumpir la conversación.
- RNF-06: El modo comparado debe procesarse de forma aceptable aunque involucre tres respuestas.

### 4.3 Mantenibilidad

- RNF-07: La solución debe mantener separación entre frontend, backend y lógica de personalidades.
- RNF-08: La configuración de cada personalidad debe estar desacoplada de la lógica de presentación.
- RNF-09: El código debe ser modular para permitir agregar nuevas personalidades en el futuro.

### 4.4 Escalabilidad

- RNF-10: La arquitectura debe permitir incorporar nuevas personalidades sin reescribir el flujo principal.
- RNF-11: El sistema debe soportar un modo debate o mesa redonda sin reescribir el flujo principal.
- RNF-12: La persistencia y el manejo de sesiones deben poder ampliarse sin cambiar la experiencia base del usuario.

### 4.5 Confiabilidad

- RNF-13: El sistema debe manejar fallos de red o de servicio LLM sin romper la interfaz.
- RNF-14: El sistema debe devolver mensajes de error claros cuando no se pueda completar una respuesta.
- RNF-15: El comportamiento de cada personalidad debe ser consistente entre consultas similares.

### 4.6 Seguridad

- RNF-16: El sistema no debe exponer credenciales, claves o configuraciones sensibles en el frontend.
- RNF-17: El backend debe centralizar el acceso al proveedor de LLM.
- RNF-18: El sistema debe evitar mostrar información interna no necesaria para el usuario final.

### 4.7 Compatibilidad

- RNF-19: El frontend debe funcionar en navegadores modernos de escritorio.
- RNF-20: La interfaz debe ser responsive para adaptarse a diferentes tamaños de pantalla.
- RNF-21: La solución debe ser compatible con la estructura del proyecto definida para frontend y backend.

### 4.8 Observabilidad básica

- RNF-22: El sistema debe permitir identificar errores básicos en la conversación o en la integración con el backend.
- RNF-23: El backend debe registrar información mínima para depuración de sesiones y respuestas.

## 5. Criterios de aceptación del MVP

- El usuario puede conversar con una personalidad individual sin fricción.
- El usuario puede solicitar un análisis comparado y recibir tres respuestas diferenciadas.
- El usuario puede activar un debate estructurado y recibir posturas, réplicas y síntesis final.
- El sistema conserva el contexto básico de la sesión activa.
- La interfaz presenta la información de forma clara y entendible.
- El backend puede orquestar prompts y respuestas sin exponer complejidad técnica al usuario.

## 6. Exclusiones del MVP

- Panel administrativo completo con versionado avanzado.
- Permisos complejos por roles múltiples.
- Integraciones externas complejas.
- Base de conocimiento documental avanzada.

## 7. Relación con otros documentos

Este documento complementa:

- [resumen-MVP-proyecto.md](resumen-MVP-proyecto.md)
- [arquitectura.md](arquitectura.md)
- [resumen-proyecto-paradiplomacia.md](resumen-proyecto-paradiplomacia.md)
