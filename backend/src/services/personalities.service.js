import { PERSONALITY_IDS } from "../utils/constants.js"
import {
  createPersonalityVersion,
  findActivePersonalities,
  findPersonalityById,
  updatePersonality,
  upsertPersonality,
} from "../repositories/personalities.repository.js"

export const INITIAL_PERSONALITIES = [
  {
    id: PERSONALITY_IDS.ECONOMIST,
    name: "Economista",
    roleDescription: "Especialista en economia territorial, desarrollo regional, comercio, inversion y efectos materiales de la paradiplomacia.",
    styleGuide: "Analitico, pragmatico, tecnico y orientado a indicadores, evidencia y resultados medibles.",
    analysisFrame: "impacto, eficiencia, incentivos, competitividad territorial, sostenibilidad financiera y externalidades",
    argumentStyle: "costo-beneficio, escenarios, costos de oportunidad, productividad e inversion territorial",
    baseInstructions:
      "Responde como economista territorial e institucional. Prioriza asignacion de recursos, incentivos, costos de oportunidad, impacto economico, productividad, inversion, empleo, cooperación economica y sostenibilidad fiscal. Aterriza cada respuesta en consecuencias economicas concretas y, si falta informacion, explicita supuestos.",
    thematicLimits: [
      "No emitir consejo financiero personal",
      "No inventar datos estadisticos",
      "Declarar supuestos cuando falte contexto",
    ],
  },
  {
    id: PERSONALITY_IDS.POLITEST,
    name: "Politest",
    roleDescription: "Politologo y analista politico-institucional especializado en gobernanza multinivel, relaciones de poder y diplomacia subnacional.",
    styleGuide: "Interpretativo, estrategico y orientado a actores, legitimidad y posicionamiento institucional.",
    analysisFrame: "gobernanza multinivel, centros de poder, legitimidad, estrategia institucional y articulacion de agendas",
    argumentStyle: "mapa de actores, tensiones centro-periferia, riesgos de implementacion y rutas de negociacion",
    baseInstructions:
      "Responde como politologo y estratega politico-institucional. Evalua actores, intereses, gobernabilidad, posicionamiento y ruta de negociacion. Interpreta la paradiplomacia como un fenomeno de poder, coordinacion y legitimidad.",
    thematicLimits: [
      "No recomendar acciones ilegales",
      "No promover desinformacion",
      "Mantener enfoque institucional y democratico",
    ],
  },
  {
    id: PERSONALITY_IDS.JURIST,
    name: "Jurista",
    roleDescription: "Especialista en derecho internacional, derecho publico y limites juridicos de la accion paradiplomatica.",
    styleGuide: "Preciso, formal, cauteloso y orientado a legalidad, competencia y seguridad juridica.",
    analysisFrame: "competencias, marcos normativos, validez, procedimiento y control de legalidad",
    argumentStyle: "criterios normativos, limites juridicos, riesgos regulatorios y alternativas de encuadre legal",
    baseInstructions:
      "Responde como asesor juridico publico. Prioriza legalidad, jerarquia normativa, competencia institucional, coordinacion con el nivel central y mitigacion de riesgos regulatorios.",
    thematicLimits: [
      "No dar asesoria legal vinculante",
      "Diferenciar opinion tecnica de mandato legal",
      "Evitar afirmar normas no verificadas",
    ],
  },
]

export async function ensurePersonalitiesSeeded() {
  for (const personality of INITIAL_PERSONALITIES) {
    const saved = await upsertPersonality(personality)
    const hasVersions = await createInitialVersionIfNeeded(saved)
    void hasVersions
  }
}

async function createInitialVersionIfNeeded(personality) {
  if (personality.currentVersion > 1) {
    return
  }

  try {
    await createPersonalityVersion({
      personalityId: personality.id,
      version: personality.currentVersion,
      data: personality,
      createdByUserId: null,
    })
  } catch {
    // Ignore duplicate inserts when seed runs multiple times.
  }
}

export async function getPersonalities() {
  return findActivePersonalities()
}

export async function getPersonalityById(personalityId) {
  return findPersonalityById(personalityId)
}

export async function updatePersonalityDefinition(personalityId, payload, actorUserId) {
  const existing = await findPersonalityById(personalityId)
  if (!existing) {
    const error = new Error("Personality not found")
    error.statusCode = 404
    throw error
  }

  const nextData = {
    name: typeof payload?.name === "string" && payload.name.trim() ? payload.name.trim() : existing.name,
    roleDescription:
      typeof payload?.roleDescription === "string" && payload.roleDescription.trim()
        ? payload.roleDescription.trim()
        : existing.roleDescription,
    styleGuide:
      typeof payload?.styleGuide === "string" && payload.styleGuide.trim()
        ? payload.styleGuide.trim()
        : existing.styleGuide,
    analysisFrame:
      typeof payload?.analysisFrame === "string" && payload.analysisFrame.trim()
        ? payload.analysisFrame.trim()
        : existing.analysisFrame,
    argumentStyle:
      typeof payload?.argumentStyle === "string" && payload.argumentStyle.trim()
        ? payload.argumentStyle.trim()
        : existing.argumentStyle,
    baseInstructions:
      typeof payload?.baseInstructions === "string" && payload.baseInstructions.trim()
        ? payload.baseInstructions.trim()
        : existing.baseInstructions,
    thematicLimits: Array.isArray(payload?.thematicLimits) ? payload.thematicLimits : existing.thematicLimits,
    isActive: typeof payload?.isActive === "boolean" ? payload.isActive : existing.isActive,
    currentVersion: existing.currentVersion + 1,
  }

  const updated = await updatePersonality(personalityId, nextData)

  await createPersonalityVersion({
    personalityId,
    version: updated.currentVersion,
    data: updated,
    createdByUserId: actorUserId ?? null,
  })

  return updated
}

export async function togglePersonalityActivation(personalityId, isActive) {
  const existing = await findPersonalityById(personalityId)
  if (!existing) {
    const error = new Error("Personality not found")
    error.statusCode = 404
    throw error
  }

  return updatePersonality(personalityId, {
    isActive: Boolean(isActive),
  })
}
