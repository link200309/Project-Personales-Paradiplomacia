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

export async function updatePersonality(personalityId, data) {
  return prisma.personality.update({
    where: { id: personalityId },
    data,
  })
}

export async function createPersonalityVersion({ personalityId, version, data, createdByUserId }) {
  return prisma.personalityVersion.create({
    data: {
      personalityId,
      version,
      roleDescription: data.roleDescription,
      styleGuide: data.styleGuide,
      analysisFrame: data.analysisFrame,
      argumentStyle: data.argumentStyle,
      baseInstructions: data.baseInstructions,
      thematicLimits: data.thematicLimits,
      createdByUserId,
    },
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
