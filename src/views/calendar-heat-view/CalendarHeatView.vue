<template>
  <section class="p-6 text-white">
    <h1 class="text-2xl font-bold">📅 Task Heatmap</h1>
    <p class="text-gray-400 mb-4">Visualize your task activity patterns</p>
    
    <div class="grid grid-cols-7 gap-1 mt-4">
      <!-- Placeholder for actual heatmap implementation -->
      <div v-for="i in 365" :key="i" 
           class="w-4 h-4 rounded-sm bg-indigo-900 hover:bg-indigo-700 cursor-pointer"
           :title="`Activity level: Coming soon`">
      </div>
    </div>

    <div class="mt-6 flex items-center gap-2">
      <span class="text-sm text-gray-400">Less</span>
      <div class="flex gap-1">
        <div class="w-4 h-4 rounded-sm bg-indigo-900"></div>
        <div class="w-4 h-4 rounded-sm bg-indigo-800"></div>
        <div class="w-4 h-4 rounded-sm bg-indigo-700"></div>
        <div class="w-4 h-4 rounded-sm bg-indigo-600"></div>
        <div class="w-4 h-4 rounded-sm bg-indigo-500"></div>
      </div>
      <span class="text-sm text-gray-400">More</span>
    </div>
  </section>
</template>

<script setup lang="ts">
// Coming soon: Integration with task activity data
</script> 