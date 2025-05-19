<template>
  <section class="p-6 text-white">
    <h1 class="text-2xl font-bold">👥 Shared Workspace</h1>
    <p class="text-gray-400 mb-4">Collaborate with your team in real-time</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Team Members -->
      <div class="p-4 rounded-lg bg-gray-800 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">Team Members</h2>
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-600"></div>
            <span class="text-gray-300">Team Member (Coming Soon)</span>
          </div>
        </div>
      </div>

      <!-- Shared Tasks -->
      <div class="p-4 rounded-lg bg-gray-800 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">Shared Tasks</h2>
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" 
               class="p-3 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer">
            <span class="text-gray-300">Shared Task (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <button class="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
        Invite Team Members
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
// Coming soon: Team collaboration features
</script> 