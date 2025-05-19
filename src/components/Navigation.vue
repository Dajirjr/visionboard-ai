<template>
  <nav class="space-y-2">
    <!-- Regular features -->
    <router-link
      v-for="route in regularRoutes"
      :key="route.path"
      :to="route.path"
      class="nav-item"
      :class="{ active: $route.path === route.path }"
    >
      <component :is="route.icon" class="w-5 h-5" />
      <span>{{ route.label }}</span>
    </router-link>

    <!-- Beta features -->
    <div v-if="isBetaEnabled" class="pt-4 mt-4 border-t border-gray-700">
      <div class="px-4 py-2 text-sm text-gray-400">Beta Features</div>
      <router-link
        v-for="route in betaRoutes"
        :key="route.path"
        :to="route.path"
        class="nav-item"
        :class="{ active: $route.path === route.path }"
      >
        <component :is="route.icon" class="w-5 h-5" />
        <span>{{ route.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { isBetaEnabled } from '@/config/env'
import {
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  UsersIcon,
  DocumentDuplicateIcon
} from 'lucide-vue-next'

const regularRoutes = [
  { path: '/dashboard', label: 'Task Calendar', icon: CalendarIcon },
  { path: '/weekly-report', label: 'Weekly Report', icon: DocumentTextIcon },
  { path: '/weekly-archive', label: 'Archive', icon: DocumentDuplicateIcon },
  { path: '/analytics', label: 'Analytics', icon: ChartBarIcon },
]

const betaRoutes = [
  { path: '/notifications', label: 'Notifications', icon: BellIcon },
  { path: '/shared-workspace', label: 'Shared Workspace', icon: UsersIcon },
]
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-4 py-2 rounded-md transition-colors duration-200 hover:bg-indigo-600 hover:text-white text-indigo-300 gap-3;
}

.nav-item.active {
  @apply bg-indigo-700 text-white;
}
</style> 