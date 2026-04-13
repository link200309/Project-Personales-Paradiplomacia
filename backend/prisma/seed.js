import { prisma } from "../src/config/prisma.js"
import { INITIAL_PERSONALITIES } from "../src/services/personalities.service.js"

async function main() {
  for (const personality of INITIAL_PERSONALITIES) {
    await prisma.personality.upsert({
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
        ...personality,
        isActive: true,
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
