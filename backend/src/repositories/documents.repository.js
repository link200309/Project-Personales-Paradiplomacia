import { prisma } from "../config/prisma.js"

export function listDocuments(limit = 100) {
  return prisma.knowledgeDocument.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export function getDocumentById(id) {
  return prisma.knowledgeDocument.findUnique({ where: { id } })
}

export function createDocument(data) {
  return prisma.knowledgeDocument.create({ data })
}

export function updateDocument(id, data) {
  return prisma.knowledgeDocument.update({
    where: { id },
    data,
  })
}