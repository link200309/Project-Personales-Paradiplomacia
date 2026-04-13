import { prisma } from "../config/prisma.js"

export async function findActivePersonalities() {
  return prisma.personality.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })
}

export async function findPersonalityById(personalityId) {
  return prisma.personality.findUnique({
    where: { id: personalityId },
  })
}

export async function upsertPersonality(personality) {
  return prisma.personality.upsert({
    where: { id: personality.id },
    update: {
      name: personality.name,
      roleDescription: personality.roleDescription,
      styleGuide: personality.styleGuide,
      analysisFrame: personality.analysisFrame,
      argumentStyle: personality.argumentStyle,
      baseInstructions: personality.baseInstructions,
      thematicLimits: personality.thematicLimits,
      isActive: true,
    },
    create: {
      id: personality.id,
      name: personality.name,
      roleDescription: personality.roleDescription,
      styleGuide: personality.styleGuide,
      analysisFrame: personality.analysisFrame,
      argumentStyle: personality.argumentStyle,
      baseInstructions: personality.baseInstructions,
      thematicLimits: personality.thematicLimits,
      isActive: true,
    },
  })
}
