import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types/auth'
import { useUserRole } from './useUserRole'

interface UserWithRole {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export function useRoleManagement() {
  const { role: currentUserRole } = useUserRole()
  const users = ref<UserWithRole[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUsers = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: usersData, error: usersError } = await supabase
        .from('auth.users')
        .select('id, email, created_at')

      if (usersError) throw usersError

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      // Combine user data with roles
      users.value = usersData.map(user => ({
        id: user.id,
        email: user.email,
        role: rolesData.find(r => r.user_id === user.id)?.role || 'viewer',
        created_at: user.created_at
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      if (currentUserRole.value !== 'admin') {
        throw new Error('Only admins can update roles')
      }

      loading.value = true
      error.value = null

      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole
        })

      if (upsertError) throw upsertError

      // Update local state
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].role = newRole
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update role'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteUserRole = async (userId: string) => {
    try {
      if (currentUserRole.value !== 'admin') {
        throw new Error('Only admins can delete roles')
      }

      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Update local state
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].role = 'viewer'
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete role'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserRole,
    deleteUserRole
  }
} 