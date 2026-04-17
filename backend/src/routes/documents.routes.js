import { Router } from "express"

import {
  createDocumentController,
  listDocumentsController,
  updateDocumentController,
} from "../controllers/documents.controller.js"

const documentsRouter = Router()

documentsRouter.get("/", listDocumentsController)
documentsRouter.post("/", createDocumentController)
documentsRouter.patch("/:id", updateDocumentController)

export { documentsRouter }