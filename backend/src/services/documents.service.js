import {
  createDocument,
  getDocumentById,
  listDocuments,
  updateDocument,
} from "../repositories/documents.repository.js"

function mapDocument(document) {
  return {
    ...document,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function getKnowledgeDocuments() {
  const documents = await listDocuments(200)
  return documents.map(mapDocument)
}

export async function createKnowledgeDocument(payload, currentUserId) {
  const title = String(payload?.title ?? "").trim()
  const content = String(payload?.content ?? "").trim()
  if (!title || !content) {
    const error = new Error("Title and content are required")
    error.statusCode = 400
    throw error
  }

  const slug = payload?.slug ? slugify(payload.slug) : slugify(title)
  const document = await createDocument({
    title,
    slug,
    content,
    summary: payload?.summary ? String(payload.summary).trim() : null,
    source: payload?.source ? String(payload.source).trim() : null,
    tags: Array.isArray(payload?.tags) ? payload.tags : [],
    scope: payload?.scope ?? "INTERNAL",
    status: payload?.status ?? "DRAFT",
    isActive: typeof payload?.isActive === "boolean" ? payload.isActive : true,
    uploadedByUserId: currentUserId,
  })

  return mapDocument(document)
}

export async function updateKnowledgeDocument(id, payload) {
  const existing = await getDocumentById(id)
  if (!existing) {
    const error = new Error("Document not found")
    error.statusCode = 404
    throw error
  }

  const data = {}
  if (typeof payload?.title === "string" && payload.title.trim()) {
    data.title = payload.title.trim()
  }
  if (typeof payload?.content === "string" && payload.content.trim()) {
    data.content = payload.content.trim()
  }
  if (typeof payload?.summary === "string") {
    data.summary = payload.summary.trim() || null
  }
  if (typeof payload?.source === "string") {
    data.source = payload.source.trim() || null
  }
  if (Array.isArray(payload?.tags)) {
    data.tags = payload.tags
  }
  if (typeof payload?.scope === "string") {
    data.scope = payload.scope
  }
  if (typeof payload?.status === "string") {
    data.status = payload.status
  }
  if (typeof payload?.isActive === "boolean") {
    data.isActive = payload.isActive
  }

  if (typeof payload?.slug === "string" && payload.slug.trim()) {
    data.slug = slugify(payload.slug)
  }

  const updated = await updateDocument(id, data)
  return mapDocument(updated)
}