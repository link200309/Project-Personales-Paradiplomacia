import { prisma } from "../src/config/prisma.js"
import { INITIAL_PERSONALITIES } from "../src/services/personalities.service.js"

const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL ?? "admin@idei.local"
const DEFAULT_USER_NAME = process.env.DEFAULT_USER_NAME ?? "Admin IDEI"

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {
      name: DEFAULT_USER_NAME,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME,
      role: "ADMIN",
      isActive: true,
    },
  })

  for (const personality of INITIAL_PERSONALITIES) {
    const existing = await prisma.personality.findUnique({ where: { id: personality.id } })

    const savedPersonality = await prisma.personality.upsert({
      where: { id: personality.id },
      update: {
        name: personality.name,
        roleDescription: personality.roleDescription,
        styleGuide: personality.styleGuide,
        analysisFrame: personality.analysisFrame,
        argumentStyle: personality.argumentStyle,
        baseInstructions: personality.baseInstructions,
        thematicLimits: personality.thematicLimits,
        currentVersion: existing?.currentVersion ?? 1,
        isActive: true,
      },
      create: {
        ...personality,
        currentVersion: 1,
        isActive: true,
      },
    })

    await prisma.personalityVersion.upsert({
      where: {
        personalityId_version: {
          personalityId: savedPersonality.id,
          version: savedPersonality.currentVersion,
        },
      },
      update: {
        roleDescription: savedPersonality.roleDescription,
        styleGuide: savedPersonality.styleGuide,
        analysisFrame: savedPersonality.analysisFrame,
        argumentStyle: savedPersonality.argumentStyle,
        baseInstructions: savedPersonality.baseInstructions,
        thematicLimits: savedPersonality.thematicLimits,
        createdByUserId: adminUser.id,
      },
      create: {
        personalityId: savedPersonality.id,
        version: savedPersonality.currentVersion,
        roleDescription: savedPersonality.roleDescription,
        styleGuide: savedPersonality.styleGuide,
        analysisFrame: savedPersonality.analysisFrame,
        argumentStyle: savedPersonality.argumentStyle,
        baseInstructions: savedPersonality.baseInstructions,
        thematicLimits: savedPersonality.thematicLimits,
        createdByUserId: adminUser.id,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error("Prisma seed failed", error)
    await prisma.$disconnect()
    process.exit(1)
  })
