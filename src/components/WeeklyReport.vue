<template>
  <div class="weekly-report" ref="reportRef">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">Weekly Productivity Report</h2>
      <div class="flex items-center space-x-2">
        <button 
          @click="generateReport"
          class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          :disabled="loading || isGenerating"
        >
          <RefreshCwIcon v-if="!loading && !isGenerating" class="w-4 h-4" />
          <Loader2Icon v-else class="w-4 h-4 animate-spin" />
          <span>{{ getButtonText }}</span>
        </button>
        <SaveSummaryButton 
          v-if="report"
          :summary="formatReportToMarkdown"
          @saved="handleSaved"
          @error="handleError"
        />
        <button 
          @click="showPreview = true"
          class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          :disabled="!report"
        >
          <FileIcon class="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
      <AlertCircleIcon class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
      <div>
        <p class="font-medium">Failed to generate report</p>
        <p class="text-sm mt-1">{{ error }}</p>
        <button 
          @click="generateReport"
          class="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
        >
          Try again
        </button>
      </div>
    </div>

    <div v-if="loading || isGenerating" class="flex flex-col items-center justify-center py-12">
      <Loader2Icon class="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p class="text-gray-500">{{ loading ? 'Loading your data...' : 'Generating insights...' }}</p>
    </div>

    <template v-else-if="report">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="p-4 bg-white rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500">Tasks Completed</h3>
          <div class="mt-2 flex items-end">
            <span class="text-2xl font-bold">{{ report.stats.completed }}</span>
            <span class="ml-2 text-sm text-gray-500">tasks</span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500">In Progress</h3>
          <div class="mt-2 flex items-end">
            <span class="text-2xl font-bold">{{ report.stats.inProgress }}</span>
            <span class="ml-2 text-sm text-gray-500">tasks</span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500">Focus Time</h3>
          <div class="mt-2 flex items-end">
            <span class="text-2xl font-bold">{{ formatFocusTime }}</span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-lg shadow-sm">
          <h3 class="text-sm font-medium text-gray-500">Completion Rate</h3>
          <div class="mt-2 flex items-end">
            <span class="text-2xl font-bold">
              {{ completionRate }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          v-for="(count, priority) in report.stats.byPriority" 
          :key="priority"
          class="p-4 bg-white rounded-lg shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-500">
              {{ priority.charAt(0).toUpperCase() + priority.slice(1) }} Priority
            </h3>
            <div 
              class="w-3 h-3 rounded-full"
              :class="{
                'bg-red-500': priority === 'high',
                'bg-yellow-500': priority === 'medium',
                'bg-green-500': priority === 'low'
              }"
            ></div>
          </div>
          <div class="mt-2">
            <span class="text-2xl font-bold">{{ count }}</span>
            <span class="ml-2 text-sm text-gray-500">tasks</span>
          </div>
        </div>
      </div>

      <!-- Daily Activity -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 class="text-lg font-medium mb-4">Daily Activity</h3>
        <div class="space-y-4">
          <div 
            v-for="(count, day) in report.stats.byDay" 
            :key="day"
            class="flex items-center"
          >
            <span class="w-12 text-sm text-gray-500">{{ day }}</span>
            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-4">
              <div 
                class="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                :style="{ width: `${(count / maxDailyTasks) * 100}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 min-w-[3rem] text-right">{{ count }} tasks</span>
          </div>
        </div>
      </div>

      <!-- AI Summary -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium mb-4">AI Insights</h3>
        <div class="prose prose-sm max-w-none">
          {{ report.summary }}
        </div>
      </div>

      <!-- PDF Export View -->
      <PDFReport
        v-if="report"
        :stats="report.stats"
        :summary="report.summary"
      />
    </template>

    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
      <ClipboardListIcon class="w-12 h-12 mb-4" />
      <p>No report generated yet. Click the refresh button to generate one.</p>
    </div>

    <!-- PDF Preview Modal -->
    <PDFPreview
      v-if="showPreview && report"
      :stats="report.stats"
      :summary="report.summary"
      @close="showPreview = false"
      @export-start="isExporting = true"
      @export-end="isExporting = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { generateWeeklyReport } from '@/lib/ai/generateWeeklyReport'
import { exportReport } from '@/lib/pdf/exportReport'
import { RefreshCwIcon, DownloadIcon, Loader2Icon, ClipboardListIcon, AlertCircleIcon, FileIcon } from 'lucide-vue-next'
import PDFReport from '@/components/export/PDFReport.vue'
import PDFPreview from './export/PDFPreview.vue'
import SaveSummaryButton from './SaveSummaryButton.vue'
import { format } from 'date-fns'
import { useToast } from '@/composables/useToast'

interface Report {
  summary: string
  stats: {
    completed: number
    inProgress: number
    focusMinutes: number
    weekStart: string
    weekEnd: string
    byPriority: {
      high: number
      medium: number
      low: number
    }
    byDay: Record<string, number>
  }
}

const reportRef = ref<HTMLElement | null>(null)
const report = ref<Report | null>(null)
const loading = ref(false)
const isGenerating = ref(false)
const isExporting = ref(false)
const error = ref<string | null>(null)
const showPreview = ref(false)

const toast = useToast()

const getButtonText = computed(() => {
  if (loading.value) return 'Loading...'
  if (isGenerating.value) return 'Generating...'
  return report.value ? 'Refresh Report' : 'Generate Report'
})

const formatFocusTime = computed(() => {
  if (!report.value) return '0h 0m'
  const hours = Math.floor(report.value.stats.focusMinutes / 60)
  const minutes = report.value.stats.focusMinutes % 60
  return `${hours}h ${minutes}m`
})

const completionRate = computed(() => {
  if (!report.value) return 0
  const total = report.value.stats.completed + report.value.stats.inProgress
  return total ? Math.round((report.value.stats.completed / total) * 100) : 0
})

const maxDailyTasks = computed(() => {
  if (!report.value?.stats.byDay) return 0
  return Math.max(...Object.values(report.value.stats.byDay))
})

const generateReport = async () => {
  loading.value = true
  isGenerating.value = true
  error.value = null

  try {
    report.value = await generateWeeklyReport()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An unexpected error occurred'
  } finally {
    loading.value = false
    isGenerating.value = false
  }
}

// Format report data to markdown
const formatReportToMarkdown = computed(() => {
  if (!report.value) return ''

  const stats = report.value.stats
  const weekStart = new Date(stats.weekStart)
  const weekEnd = new Date(stats.weekEnd)

  return `# 📘 Weekly Update – ${format(weekEnd, 'MMMM d, yyyy')}

Here's what happened this week on **VisionBoard AI**:

## 📊 Key Metrics
- Tasks Completed: ${stats.completed}
- Tasks In Progress: ${stats.inProgress}
- Focus Time: ${formatFocusTime.value}
- Completion Rate: ${completionRate.value}%

## 🎯 Priority Distribution
- High Priority: ${stats.byPriority.high} tasks
- Medium Priority: ${stats.byPriority.medium} tasks
- Low Priority: ${stats.byPriority.low} tasks

## 📅 Daily Activity
${Object.entries(stats.byDay)
  .map(([day, count]) => `- ${day}: ${count} tasks`)
  .join('\n')}

## 🧠 AI Insights
${report.value.summary}

---
Generated on ${new Date().toLocaleDateString()} using VisionBoard AI
`
})

const handleSaved = () => {
  toast.success('Weekly summary saved successfully! 📝')
}

const handleError = (error: string) => {
  toast.error(`Failed to save summary: ${error}`)
}
</script>

<style scoped>
.weekly-report {
  @apply p-6 max-w-7xl mx-auto bg-gray-50;
}

@media print {
  .weekly-report {
    @apply p-0 bg-white;
  }
  
  button {
    @apply hidden;
  }
}
</style> 