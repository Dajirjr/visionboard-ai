export type UserRole = 'admin' | 'editor' | 'viewer'

export interface UserPermissions {
  canSaveSummary: boolean
  canEditSummary: boolean
  canDeleteSummary: boolean
  canViewSummary: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canSaveSummary: true,
    canEditSummary: true,
    canDeleteSummary: true,
    canViewSummary: true
  },
  editor: {
    canSaveSummary: true,
    canEditSummary: true,
    canDeleteSummary: false,
    canViewSummary: true
  },
  viewer: {
    canSaveSummary: false,
    canEditSummary: false,
    canDeleteSummary: false,
    canViewSummary: true
  }
} 