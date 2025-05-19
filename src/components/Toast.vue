<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="flex items-center p-4 rounded-lg shadow-lg min-w-[300px] max-w-md transform transition-all duration-300"
        :class="{
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
          'bg-blue-500 text-white': toast.type === 'info'
        }"
      >
        <div class="flex-1">{{ toast.message }}</div>
        <button
          @click="remove(toast.id)"
          class="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { toast } from '@/composables/useToast'

const { toasts, remove } = toast
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 