import { Router } from "express"

import {
  createUserController,
  getCurrentUserController,
  listUsersController,
  updateUserController,
} from "../controllers/users.controller.js"

const usersRouter = Router()

usersRouter.get("/me", getCurrentUserController)
usersRouter.get("/", listUsersController)
usersRouter.post("/", createUserController)
usersRouter.patch("/:id", updateUserController)

export { usersRouter }