import { Router } from "express"

import { getPersonalitiesController } from "../controllers/personalities.controller.js"

const personalitiesRouter = Router()

personalitiesRouter.get("/", getPersonalitiesController)

export { personalitiesRouter }
