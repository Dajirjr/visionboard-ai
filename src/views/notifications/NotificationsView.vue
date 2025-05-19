<template>
  <section class="p-6 text-white">
    <h1 class="text-2xl font-bold">🔔 Notifications</h1>
    <p class="text-gray-400 mb-4">Stay updated with task reminders and team activity</p>

    <div class="space-y-4">
      <!-- Placeholder notifications -->
      <div v-for="i in 3" :key="i" 
           class="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-indigo-500 cursor-pointer">
        <div class="flex items-center justify-between">
          <span class="text-indigo-400">Task Reminder</span>
          <span class="text-sm text-gray-500">Coming soon</span>
        </div>
        <p class="mt-2 text-gray-300">Notification content will appear here</p>
      </div>

      <div class="mt-6">
        <button class="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
          Configure Notifications
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Coming soon: Notification system integration
</script> 