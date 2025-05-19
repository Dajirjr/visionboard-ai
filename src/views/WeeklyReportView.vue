<template>
  <section class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">📘 Weekly Report</h1>
      <p class="text-gray-400">Generate and save weekly summaries</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2Icon class="w-8 h-8 animate-spin text-blue-500" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
      <div class="flex items-start">
        <AlertCircleIcon class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p class="font-medium">{{ error }}</p>
          <button 
            @click="generateSummary"
            class="mt-2 text-sm text-red-300 hover:text-red-200 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Summary Settings -->
      <div class="bg-zinc-800 p-4 rounded-lg">
        <h2 class="text-lg font-medium text-white mb-4">Summary Settings</h2>
        
        <!-- Tone Selection -->
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-2">Summary Tone</label>
          <div class="flex gap-2">
            <button
              v-for="tone in ['formal', 'casual', 'bullet-points']"
              :key="tone"
              @click="summarySettings.tone = tone"
              class="px-3 py-1.5 rounded-md text-sm transition-colors"
              :class="[
                summarySettings.tone === tone
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              ]"
            >
              {{ tone.charAt(0).toUpperCase() + tone.slice(1).replace('-', ' ') }}
            </button>
          </div>
        </div>

        <!-- Additional Options -->
        <div class="space-y-3">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="summarySettings.includeTldr"
              class="rounded bg-zinc-700 border-zinc-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-300">Include TL;DR section</span>
          </label>
          
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="summarySettings.includeTaskLabels"
              class="rounded bg-zinc-700 border-zinc-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-300">Include task labels and categories</span>
          </label>
        </div>
      </div>

      <!-- Date Range Selection -->
      <div class="bg-zinc-800 p-4 rounded-lg">
        <h2 class="text-lg font-medium text-white mb-4">Select Date Range</h2>
        <div class="flex items-center gap-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              v-model="startDate"
              class="bg-zinc-700 text-white px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              v-model="endDate"
              class="bg-zinc-700 text-white px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <button
          @click="generateSummary"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          :disabled="loading || !startDate || !endDate"
        >
          <SparklesIcon class="w-5 h-5" />
          <span>Generate with AI</span>
        </button>

        <button
          v-if="summary"
          @click="saveSummary"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
          :disabled="loading || saving"
        >
          <SaveIcon class="w-5 h-5" />
          <span>Save to {{ selectedStorage }}</span>
        </button>
      </div>

      <!-- Summary Preview -->
      <div v-if="summary" class="bg-zinc-800 p-6 rounded-lg">
        <div class="mb-4 pb-4 border-b border-zinc-700 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Weekly Summary Preview</h2>
            <p class="text-gray-400">
              {{ formatDateRange(startDate, endDate) }}
            </p>
          </div>
          <button
            @click="copyToClipboard"
            class="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-zinc-700"
            :title="copied ? 'Copied!' : 'Copy to clipboard'"
          >
            <component :is="copied ? CheckIcon : CopyIcon" class="w-5 h-5" />
          </button>
        </div>
        <div class="prose prose-invert max-w-none" v-html="renderedSummary"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { 
  Loader2Icon, 
  AlertCircleIcon, 
  SparklesIcon, 
  SaveIcon,
  CopyIcon,
  CheckIcon,
  SearchIcon
} from 'lucide-vue-next'
import { useFileStorage } from '@/composables/useFileStorage'
import { useToast } from '@/composables/useToast'
import { useUserRole } from '@/composables/useUserRole'

// Add new interface for summary settings
interface SummarySettings {
  tone: 'formal' | 'casual' | 'bullet-points'
  includeTldr: boolean
  includeTaskLabels: boolean
}

const startDate = ref('')
const endDate = ref('')
const summary = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const toast = useToast()
const { role: userRole } = useUserRole()
const copied = ref(false)
const generatingPreview = ref(false)

const {
  providers,
  uploadFile,
  error: storageError
} = useFileStorage()

const selectedStorage = ref(providers[0].name)

// Update the script section
const summarySettings = ref<SummarySettings>({
  tone: 'formal',
  includeTldr: true,
  includeTaskLabels: true
})

const renderedSummary = computed(() => {
  if (!summary.value) return ''
  return marked(summary.value)
})

const generateSummary = async () => {
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select both start and end dates'
    return
  }

  loading.value = true
  generatingPreview.value = true
  error.value = null

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [{
          role: 'system',
          content: `You are a helpful assistant that generates weekly summaries in markdown format.
            Please structure the summary with the following sections:
            ${summarySettings.value.includeTldr ? '- TL;DR (Brief 2-3 sentence overview)\n' : ''}
            - Highlights
            - Achievements
            - Challenges
            - Next Steps
            ${summarySettings.value.includeTaskLabels ? '- Task Categories & Labels\n' : ''}
            
            Tone should be ${summarySettings.value.tone}.
            ${summarySettings.value.tone === 'formal' 
              ? 'Use professional language and business terminology.' 
              : summarySettings.value.tone === 'casual'
              ? 'Use conversational language and a friendly tone.'
              : 'Use concise bullet points and minimal prose.'}
            
            Use proper markdown formatting including:
            - Headers (##)
            - Lists (-)
            - Code blocks (\`\`\`)
            - Bold text (**)
            - Links [text](url)
            `
        }, {
          role: 'user',
          content: `Generate a detailed weekly summary for the period between ${startDate.value} and ${endDate.value}.`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to generate summary')
    }

    const data = await response.json()
    summary.value = data.choices[0].message.content
    toast.success('Summary generated successfully')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to generate summary'
    toast.error(error.value)
  } finally {
    loading.value = false
    generatingPreview.value = false
  }
}

const saveSummary = async () => {
  if (!summary.value) return

  saving.value = true
  try {
    const date = startDate.value
    const filename = `summary-${date}.md`
    const file = new File([summary.value], filename, { type: 'text/markdown' })
    
    await uploadFile(file, 'weekly-updates', selectedStorage.value)
    toast.success(`Summary saved to ${selectedStorage.value}`)
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Failed to save summary'
    toast.error(errorMessage)
  } finally {
    saving.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(summary.value)
    copied.value = true
    toast.success('Copied to clipboard')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    toast.error('Failed to copy to clipboard')
  }
}

const formatDateRange = (start: string, end: string) => {
  if (!start || !end) return ''
  
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
}
</script>

<style>
.prose {
  @apply text-gray-300;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  @apply text-white;
}

.prose a {
  @apply text-blue-400 hover:text-blue-300;
}

.prose strong {
  @apply text-white;
}

.prose ul, .prose ol {
  @apply text-gray-300;
}

.prose blockquote {
  @apply border-l-4 border-zinc-600 text-gray-400;
}

.prose code {
  @apply bg-zinc-700 text-gray-300 px-1 py-0.5 rounded;
}

.prose pre {
  @apply bg-zinc-900 border border-zinc-700;
}

.prose hr {
  @apply border-zinc-700;
}
</style> 