export type UserRole = "ADMIN" | "ANALYST" | "VIEWER"

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}