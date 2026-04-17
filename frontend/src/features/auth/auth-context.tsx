import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react"

import { httpClient } from "@/shared/api/httpClient"
import type { CurrentUser } from "@/shared/types/user"

const AUTH_EMAIL_KEY = "paradiplomacy-user-email"
const AUTH_NAME_KEY = "paradiplomacy-user-name"
const AUTH_ID_KEY = "paradiplomacy-user-id"
const AUTH_ROLE_KEY = "paradiplomacy-user-role"

interface LoginPayload {
  email: string
  password: string
}

interface SignupPayload {
  name: string
  email: string
  password: string
}

interface AuthContextValue {
  currentUser: CurrentUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<CurrentUser>
  signup: (payload: SignupPayload) => Promise<CurrentUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthResponse {
  user: CurrentUser
}

function readStoredUser(): CurrentUser | null {
  const id = window.sessionStorage.getItem(AUTH_ID_KEY)
  const email = window.sessionStorage.getItem(AUTH_EMAIL_KEY)
  const name = window.sessionStorage.getItem(AUTH_NAME_KEY)
  const role = window.sessionStorage.getItem(AUTH_ROLE_KEY) as CurrentUser["role"] | null

  if (!id || !email || !name || !role) {
    return null
  }

  return {
    id,
    email,
    name,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function storeUser(user: CurrentUser) {
  window.sessionStorage.setItem(AUTH_ID_KEY, user.id)
  window.sessionStorage.setItem(AUTH_EMAIL_KEY, user.email)
  window.sessionStorage.setItem(AUTH_NAME_KEY, user.name)
  window.sessionStorage.setItem(AUTH_ROLE_KEY, user.role)
}

function clearAuthStorage() {
  window.sessionStorage.removeItem(AUTH_ID_KEY)
  window.sessionStorage.removeItem(AUTH_EMAIL_KEY)
  window.sessionStorage.removeItem(AUTH_NAME_KEY)
  window.sessionStorage.removeItem(AUTH_ROLE_KEY)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => readStoredUser())

  useEffect(() => {
    if (currentUser) {
      return
    }

    const storedUser = readStoredUser()
    if (storedUser) {
      setCurrentUser(storedUser)
    }
  }, [currentUser])

  async function login(payload: LoginPayload) {
    const normalizedEmail = payload.email.trim().toLowerCase()
    const normalizedPassword = payload.password

    if (!normalizedEmail || !normalizedPassword) {
      const error = new Error("Email y contraseña son requeridos")
      error.name = "AuthValidationError"
      throw error
    }

    const response = await httpClient<AuthResponse>("/auth/signin", {
      method: "POST",
      body: {
        email: normalizedEmail,
        password: normalizedPassword,
      },
    })

    const user = response.user
    storeUser(user)
    setCurrentUser(user)
    return user
  }

  async function signup(payload: SignupPayload) {
    const normalizedName = payload.name.trim()
    const normalizedEmail = payload.email.trim().toLowerCase()
    const normalizedPassword = payload.password

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      const error = new Error("Nombre, email y contraseña son requeridos")
      error.name = "AuthValidationError"
      throw error
    }

    const response = await httpClient<AuthResponse>("/auth/signup", {
      method: "POST",
      body: {
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
      },
    })

    const user = response.user
    storeUser(user)
    setCurrentUser(user)
    return user
  }

  function logout() {
    clearAuthStorage()
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      signup,
      logout,
    }),
    [currentUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}

export {
  AUTH_EMAIL_KEY,
  AUTH_NAME_KEY,
  AUTH_ID_KEY,
  AUTH_ROLE_KEY,
  clearAuthStorage,
  storeUser,
}