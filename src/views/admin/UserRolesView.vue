<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">User Role Management</h1>
      <p class="text-gray-600">Manage user roles and permissions</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2Icon class="w-8 h-8 animate-spin text-blue-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
      <div class="flex items-start">
        <AlertCircleIcon class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-medium">Failed to load users</p>
          <p class="text-sm mt-1">{{ error }}</p>
          <button 
            @click="fetchUsers"
            class="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Role
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member Since
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-purple-100 text-purple-800': user.role === 'admin',
                  'bg-blue-100 text-blue-800': user.role === 'editor',
                  'bg-gray-100 text-gray-800': user.role === 'viewer'
                }"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(user.created_at).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
                <select
                  v-model="user.role"
                  @change="updateUserRole(user.id, $event.target.value as UserRole)"
                  class="text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  :disabled="loading"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  @click="deleteUserRole(user.id)"
                  class="text-red-600 hover:text-red-900"
                  :disabled="loading"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Loader2Icon, AlertCircleIcon, TrashIcon } from 'lucide-vue-next'
import { useRoleManagement } from '@/composables/useRoleManagement'
import type { UserRole } from '@/types/auth'
import { useToast } from '@/composables/useToast'

const { users, loading, error, fetchUsers, updateUserRole: updateRole, deleteUserRole: deleteRole } = useRoleManagement()
const toast = useToast()

const updateUserRole = async (userId: string, newRole: UserRole) => {
  const success = await updateRole(userId, newRole)
  if (success) {
    toast.success(`User role updated to ${newRole}`)
  } else {
    toast.error('Failed to update user role')
  }
}

const deleteUserRole = async (userId: string) => {
  if (!confirm('Are you sure you want to reset this user\'s role to viewer?')) return

  const success = await deleteRole(userId)
  if (success) {
    toast.success('User role reset to viewer')
  } else {
    toast.error('Failed to reset user role')
  }
}

onMounted(fetchUsers)
</script> 