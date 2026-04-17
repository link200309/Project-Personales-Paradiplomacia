import { Router } from "express"

import {
	getPersonalitiesController,
	togglePersonalityController,
	updatePersonalityController,
} from "../controllers/personalities.controller.js"

const personalitiesRouter = Router()

personalitiesRouter.get("/", getPersonalitiesController)
personalitiesRouter.patch("/:id", updatePersonalityController)
personalitiesRouter.patch("/:id/toggle", togglePersonalityController)

export { personalitiesRouter }
