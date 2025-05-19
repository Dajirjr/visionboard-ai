import { ref, computed, watch } from 'vue'
import { useSupabaseUser } from '@supabase/auth-helpers-vue'
import { supabase } from '@/lib/supabase'
import type { UserRole, UserPermissions } from '@/types/auth'
import { ROLE_PERMISSIONS } from '@/types/auth'

export function useUserRole() {
  const { user } = useSupabaseUser()
  const role = ref<UserRole>('viewer')
  const loading = ref(true)
  const error = ref<string | null>(null)

  const permissions = computed<UserPermissions>(() => {
    return ROLE_PERMISSIONS[role.value]
  })

  const fetchUserRole = async () => {
    if (!user.value) {
      role.value = 'viewer'
      loading.value = false
      return
    }

    try {
      loading.value = true
      error.value = null

      // First check user metadata for role
      const metadataRole = user.value.user_metadata?.role as UserRole
      if (metadataRole && Object.keys(ROLE_PERMISSIONS).includes(metadataRole)) {
        role.value = metadataRole
        loading.value = false
        return
      }

      // If no role in metadata, check database
      const { data, error: dbError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.value.id)
        .single()

      if (dbError) throw dbError

      if (data?.role && Object.keys(ROLE_PERMISSIONS).includes(data.role)) {
        role.value = data.role as UserRole
      } else {
        role.value = 'viewer' // Default role
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch user role'
      role.value = 'viewer' // Default to viewer on error
    } finally {
      loading.value = false
    }
  }

  // Watch for user changes
  watch(() => user.value?.id, (newId: string | undefined) => {
    if (newId) {
      fetchUserRole()
    } else {
      role.value = 'viewer'
    }
  }, { immediate: true })

  return {
    role,
    permissions,
    loading,
    error,
    fetchUserRole
  }
} 