# Resumen MVP Proyecto Paradiplomacia

## 1. Objetivo del MVP

Construir una primera versión funcional de Paradiplomacia IDEI que permita consultar un tema desde tres personalidades expertas (Economista, Politest y Jurista) mediante interfaz conversacional, con respuestas claramente diferenciadas por enfoque disciplinar.

## 2. Alcance de esta fase (solo lo necesario)

### Incluye

- Chat individual con una personalidad seleccionada.
- Modo análisis comparado con tres respuestas separadas al mismo tema.
- Definición base de 3 personalidades:
  - Economista,
  - Politest (politólogo),
  - Jurista.
- Prompt/sistema de instrucciones por personalidad para diferenciar tono, marco analítico y tipo de argumentos.
- Historial básico de conversación por sesión.

### No incluye en el MVP

- Debate multiagente con réplicas automáticas en varias rondas.
- Panel administrativo completo con versionado avanzado.
- Sistema complejo de auditoría o trazabilidad extendida.
- Gestión avanzada de permisos por roles múltiples.
- Integraciones externas complejas.

## 3. Funcionalidades mínimas

### F1. Gestión simple de personalidades

- Configurar nombre, rol y estilo de respuesta de cada agente.
- Asignar instrucciones base por personalidad.

### F2. Conversación individual

- El usuario selecciona una personalidad.
- El sistema responde en formato chatbot con su enfoque disciplinar.

### F3. Análisis comparado

- El usuario ingresa un tema único.
- El sistema genera 3 respuestas: Economista, Politest y Jurista.

### F4. Salidas mínimas

- Respuesta breve.
- Análisis comparativo corto.
- Síntesis final opcional en lenguaje institucional.

## 4. Flujos MVP

### Flujo A: Chat individual

1. Usuario elige personalidad.
2. Usuario hace pregunta.
3. Sistema responde según el perfil elegido.

### Flujo B: Comparativo

1. Usuario propone tema.
2. Sistema consulta a las 3 personalidades.
3. Muestra las 3 respuestas separadas.
4. Opcional: entrega síntesis comparativa.

## 5. Criterios de éxito del MVP

- Las respuestas de cada personalidad son distinguibles y consistentes.
- El sistema permite usar chat individual y análisis comparado sin fricción.
- El tiempo de respuesta es adecuado para uso conversacional.
- El contenido es útil para fines académicos e institucionales iniciales.

## 6. Entregables de esta fase

- Prototipo funcional en frontend y backend.
- Configuración inicial de las 3 personalidades.
- Guía breve de prompts base por personalidad.
- Guía corta de uso para pruebas internas.

## 7. Próxima fase sugerida (post-MVP)

- Incorporar modo debate o mesa redonda.
- Agregar panel administrador para edición de personalidades.
- Mejorar trazabilidad y evaluación de calidad de respuestas.
