import {
  createKnowledgeDocument,
  getKnowledgeDocuments,
  updateKnowledgeDocument,
} from "../services/documents.service.js"
import { fail, ok } from "../utils/responseHelpers.js"

export async function listDocumentsController(_req, res, next) {
  try {
    const documents = await getKnowledgeDocuments()
    return ok(res, { documents })
  } catch (error) {
    return next(error)
  }
}

export async function createDocumentController(req, res, next) {
  try {
    const document = await createKnowledgeDocument(req.body ?? {}, req.currentUser.id)
    return ok(res, { document }, 201)
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}

export async function updateDocumentController(req, res, next) {
  try {
    const document = await updateKnowledgeDocument(req.params.id, req.body ?? {})
    return ok(res, { document })
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode)
    }

    return next(error)
  }
}