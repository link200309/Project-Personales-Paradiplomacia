import { prisma } from "../config/prisma.js"

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id } })
}

export function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } })
}

export function findActiveUserByEmail(email) {
  return prisma.user.findFirst({
    where: {
      email,
      isActive: true,
    },
  })
}

export function listUsers(limit = 50) {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export function createUser({ email, name, role = "VIEWER", passwordHash = null }) {
  return prisma.user.create({
    data: {
      email,
      name,
      role,
      passwordHash,
    },
  })
}

export function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  })
}

export function upsertUserByEmail({ email, name, role = "VIEWER", isActive = true, passwordHash = null }) {
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      isActive,
      passwordHash,
    },
    create: {
      email,
      name,
      role,
      isActive,
      passwordHash,
    },
  })
}