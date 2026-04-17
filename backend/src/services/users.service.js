import {
  createUser,
  findActiveUserByEmail,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUser,
  upsertUserByEmail,
} from "../repositories/users.repository.js"
import bcrypt from "bcryptjs"

const BCRYPT_ROUNDS = 10

function mapUser(user) {
  const { passwordHash, ...safeUser } = user

  return {
    ...safeUser,
    createdAt: safeUser.createdAt.toISOString(),
    updatedAt: safeUser.updatedAt.toISOString(),
  }
}

export async function ensureDefaultUser(email, name, role = "VIEWER") {
  const user = await upsertUserByEmail({ email, name, role, isActive: true })
  return mapUser(user)
}

export async function resolveUser({ userId, email, name }) {
  if (userId) {
    const user = await findUserById(userId)
    if (user && user.isActive) {
      return mapUser(user)
    }
  }

  return null
}

function validateEmailAndPassword(email, password) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase()
  const normalizedPassword = String(password ?? "")

  if (!normalizedEmail || !normalizedPassword) {
    const error = new Error("Email and password are required")
    error.statusCode = 400
    throw error
  }

  return { normalizedEmail, normalizedPassword }
}

export async function signUpUser({ email, name, password }) {
  const { normalizedEmail, normalizedPassword } = validateEmailAndPassword(email, password)
  const normalizedName = String(name ?? "").trim() || normalizedEmail.split("@")[0]

  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    const error = new Error("Email already exists")
    error.statusCode = 409
    throw error
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, BCRYPT_ROUNDS)
  const user = await createUser({
    email: normalizedEmail,
    name: normalizedName,
    role: "VIEWER",
    passwordHash,
  })

  return mapUser(user)
}

export async function signInUser({ email, password }) {
  const { normalizedEmail, normalizedPassword } = validateEmailAndPassword(email, password)
  const user = await findActiveUserByEmail(normalizedEmail)

  if (!user?.passwordHash) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }

  const passwordOk = await bcrypt.compare(normalizedPassword, user.passwordHash)
  if (!passwordOk) {
    const error = new Error("Invalid credentials")
    error.statusCode = 401
    throw error
  }

  return mapUser(user)
}

export async function getUsers() {
  const users = await listUsers(100)
  return users.map(mapUser)
}

export async function createManagedUser({ email, name, role }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase()
  const normalizedName = String(name ?? "").trim()

  if (!normalizedEmail || !normalizedName) {
    const error = new Error("Name and email are required")
    error.statusCode = 400
    throw error
  }

  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    const error = new Error("Email already exists")
    error.statusCode = 409
    throw error
  }

  const user = await createUser({
    email: normalizedEmail,
    name: normalizedName,
    role: role ?? "VIEWER",
    passwordHash: null,
  })

  return mapUser(user)
}

export async function updateManagedUser(id, payload) {
  if (!id) {
    const error = new Error("User id is required")
    error.statusCode = 400
    throw error
  }

  const existing = await findUserById(id)
  if (!existing) {
    const error = new Error("User not found")
    error.statusCode = 404
    throw error
  }

  const data = {}
  if (typeof payload?.name === "string" && payload.name.trim()) {
    data.name = payload.name.trim()
  }
  if (typeof payload?.role === "string") {
    data.role = payload.role
  }
  if (typeof payload?.isActive === "boolean") {
    data.isActive = payload.isActive
  }

  const updated = await updateUser(id, data)
  return mapUser(updated)
}