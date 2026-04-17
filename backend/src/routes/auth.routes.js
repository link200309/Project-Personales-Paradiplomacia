import { Router } from "express"

import { signInController, signUpController } from "../controllers/auth.controller.js"

const authRouter = Router()

authRouter.post("/signup", signUpController)
authRouter.post("/signin", signInController)

export { authRouter }
