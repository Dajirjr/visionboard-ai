import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { isBetaEnabled } from '@/config/env'
import type { UserRole } from '@/types/auth'
import { useToast } from '@/composables/useToast'

// Views
import WeeklyReportView from '@/views/WeeklyReportView.vue'
import WeeklyArchiveView from '@/views/WeeklyArchiveView.vue'
import NotificationsView from '@/views/notifications/NotificationsView.vue'
import SharedWorkspace from '@/views/shared-workspace/SharedWorkspace.vue'
import UserRolesView from '@/views/admin/UserRolesView.vue'

const toast = useToast()

// Define route metadata types
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresBeta?: boolean
    requiredRole?: UserRole
  }
}

// Normalize paths to lowercase
const normalizePath = (path: string): string => path.toLowerCase()

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/weekly-report',
    name: 'weeklyReport',
    component: WeeklyReportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/weekly-archive',
    name: 'weeklyArchive',
    component: WeeklyArchiveView,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: { requiresAuth: true, requiresBeta: true }
  },
  {
    path: '/shared-workspace',
    name: 'sharedWorkspace',
    component: SharedWorkspace,
    meta: { requiresAuth: true, requiresBeta: true, requiredRole: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'userRoles',
    component: UserRolesView,
    meta: { requiresAuth: true, requiredRole: 'admin' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  // Docs routes with consistent casing
  {
    path: '/docs',
    name: 'docs',
    component: () => import('@/views/docs/DocsLayout.vue'),
    children: [
      {
        path: '',
        name: 'docsHome',
        component: () => import('@/views/docs/DocsHome.vue')
      },
      {
        path: ':page',
        name: 'docsPage',
        component: () => import('@/views/docs/DocsPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  }
].map(route => ({
  ...route,
  path: normalizePath(route.path)
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
  scrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    savedPosition: { left: number; top: number } | null
  ) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// Handle GitHub Pages 404 redirect
const handleGitHubPagesRedirect = () => {
  if (window.sessionStorage.redirect) {
    const redirect = sessionStorage.redirect
    delete sessionStorage.redirect
    const { pathname, search, hash } = new URL(redirect)
    const normalizedPath = normalizePath(pathname)
    if (normalizedPath !== window.location.pathname.toLowerCase()) {
      const targetPath = normalizedPath + search + hash
      window.history.replaceState(null, '', targetPath)
      return targetPath
    }
  }
  return null
}

// Add helper function for role checks
const hasRequiredRole = async (userId: string, requiredRole: UserRole): Promise<boolean> => {
  // First check user metadata
  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role as UserRole

  if (userRole === requiredRole) return true

  // If no role in metadata or not matching, check database
  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || !roleData) return false
  return roleData.role === requiredRole
}

// Update the navigation guard
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // Handle GitHub Pages redirect
  const redirectPath = handleGitHubPagesRedirect()
  if (redirectPath) {
    return next(redirectPath)
  }

  // Normalize path casing
  if (to.path !== to.path.toLowerCase()) {
    return next(to.path.toLowerCase())
  }

  // Check beta access
  if (to.meta.requiresBeta && !isBetaEnabled()) {
    toast.error('This feature is coming soon')
    return next({ 
      name: 'dashboard',
      query: { error: 'beta_disabled' }
    })
  }

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some((record: RouteRecordRaw) => record.meta?.requiresAuth)

  if (requiresAuth && !session) {
    toast.error('Please log in to continue')
    return next({
      name: 'login',
      query: { 
        redirect: to.fullPath,
        error: 'auth_required'
      }
    })
  }

  if (!requiresAuth && session) {
    return next('/dashboard')
  }

  // Check role requirements
  if (session && to.meta.requiredRole) {
    try {
      const hasRole = await hasRequiredRole(session.user.id, to.meta.requiredRole)
      
      if (!hasRole) {
        toast.error('You do not have permission to access this page')
        return next({
          name: 'dashboard',
          query: { 
            error: 'insufficient_permissions',
            required_role: to.meta.requiredRole
          }
        })
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      toast.error('Error checking permissions')
      return next({
        name: 'dashboard',
        query: { error: 'role_check_failed' }
      })
    }
  }

  next()
})

export default router 