<template>
  <div class="save-summary-button">
    <div class="flex items-center space-x-2">
      <button
        @click="handleSave"
        :disabled="!canSave || isSaving"
        class="inline-flex items-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSaving" class="mr-2">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span v-else class="mr-2">💾</span>
        {{ isSaving ? 'Saving...' : 'Save to Markdown' }}
      </button>

      <!-- Storage Options Dropdown -->
      <div class="relative" v-if="canSave">
        <button
          @click="showStorageOptions = !showStorageOptions"
          class="inline-flex items-center px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          :disabled="isSaving"
        >
          <span class="mr-2">{{ storageIcons[selectedStorage] }}</span>
          <ChevronDownIcon class="w-4 h-4" />
        </button>

        <div
          v-if="showStorageOptions"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1"
        >
          <button
            v-for="(icon, storage) in storageIcons"
            :key="storage"
            @click="selectStorage(storage)"
            class="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
            :class="{ 'bg-blue-50': selectedStorage === storage }"
          >
            <span class="mr-2">{{ icon }}</span>
            {{ storage.charAt(0).toUpperCase() + storage.slice(1) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'
import { useUserRole } from '@/composables/useUserRole'

const props = defineProps<{
  summary: string
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'error', error: string): void
}>()

const { permissions, loading: roleLoading } = useUserRole()
const isSaving = ref(false)
const error = ref('')
const showStorageOptions = ref(false)
const selectedStorage = ref<'local' | 'supabase' | 'github'>('local')

const storageIcons = {
  local: '💻',
  supabase: '📦',
  github: '📝'
}

const canSave = computed(() => {
  return !roleLoading && permissions.value.canSaveSummary
})

const selectStorage = (storage: 'local' | 'supabase' | 'github') => {
  selectedStorage.value = storage
  showStorageOptions.value = false
}

const handleSave = async () => {
  if (!canSave.value) {
    error.value = 'You do not have permission to save summaries.'
    emit('error', error.value)
    return
  }

  try {
    isSaving.value = true
    error.value = ''

    const filename = `summary-${new Date().toISOString().slice(0, 10)}.md`
    const response = await fetch('/api/save-summary', {
      method: 'POST',
      body: JSON.stringify({
        filename,
        text: props.summary,
        storage: selectedStorage.value
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to save summary')
    }

    emit('saved')
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An error occurred while saving'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    isSaving.value = false
  }
}

// Close storage options when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.save-summary-button')) {
    showStorageOptions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.save-summary-button {
  @apply inline-block;
}
</style> 