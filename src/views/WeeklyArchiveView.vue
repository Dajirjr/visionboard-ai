<template>
  <section class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">📚 Weekly Summary Archive</h1>
      <p class="text-gray-400">Access and manage weekly summaries</p>
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
          <p class="font-medium">Failed to load summaries</p>
          <p class="text-sm mt-1">{{ error }}</p>
          <button 
            @click="loadFiles"
            class="mt-2 text-sm text-red-300 hover:text-red-200 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Storage Selection (Admin/Editor Only) -->
    <div v-if="['admin', 'editor'].includes(userRole)" class="mb-6">
      <label class="block text-sm font-medium text-gray-300 mb-2">Storage Provider</label>
      <select
        v-model="selectedStorage"
        class="bg-zinc-800 text-white border border-zinc-700 rounded-md px-3 py-2 w-48"
        @change="loadFiles"
      >
        <option 
          v-for="provider in providers" 
          :key="provider.name"
          :value="provider.name"
        >
          {{ provider.displayName }}
        </option>
      </select>
    </div>

    <!-- Upload Section (Admin/Editor Only) -->
    <div v-if="['admin', 'editor'].includes(userRole)" class="mb-6">
      <div class="flex items-center space-x-4">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          class="hidden"
          accept=".md,.txt"
        />
        <button
          @click="$refs.fileInput.click()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          :disabled="loading"
        >
          <div class="flex items-center space-x-2">
            <UploadIcon class="w-4 h-4" />
            <span>Upload Summary</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="flex items-center justify-between mb-6">
      <div class="relative flex-1 max-w-xs">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search summaries..."
          class="w-full bg-zinc-800 text-white pl-10 pr-4 py-2 rounded-md border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      <button
        @click="sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'"
        class="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-zinc-700"
        :title="sortDirection === 'desc' ? 'Newest first' : 'Oldest first'"
      >
        <component :is="sortDirection === 'desc' ? SortDescIcon : SortAscIcon" class="w-5 h-5" />
      </button>
    </div>

    <!-- Files List -->
    <div v-if="sortedFiles.length > 0" class="space-y-2">
      <div v-for="file in sortedFiles" :key="file.name" 
        class="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700/80 transition group">
        <div class="flex items-center justify-between">
          <a
            :href="file.publicUrl"
            target="_blank"
            rel="noopener"
            class="text-indigo-300 hover:text-indigo-200 font-medium"
          >
            {{ file.name }}
          </a>
          
          <!-- Admin/Editor Actions -->
          <div v-if="['admin', 'editor'].includes(userRole)" class="opacity-0 group-hover:opacity-100 transition">
            <button
              @click="handleDelete(file)"
              class="text-red-400 hover:text-red-300 p-1"
              :disabled="loading"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div class="mt-1 text-sm text-gray-400">
          {{ new Date(file.created_at || file.updated_at).toLocaleDateString() }}
          <span v-if="file.size" class="ml-2">
            ({{ formatFileSize(file.size) }})
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State with Search -->
    <div v-else-if="!loading" class="text-center py-12 text-gray-400">
      <DocumentIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p v-if="searchQuery && files.length > 0">
        No summaries match your search
      </p>
      <p v-else>
        No weekly summaries found
      </p>
      <button 
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="mt-4 text-sm text-blue-400 hover:text-blue-300"
      >
        Clear search
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Loader2Icon, AlertCircleIcon, TrashIcon, DocumentIcon, UploadIcon, SearchIcon, FilterIcon, SortAscIcon, SortDescIcon } from 'lucide-vue-next'
import { useUserRole } from '@/composables/useUserRole'
import { useToast } from '@/composables/useToast'
import { useFileStorage, type FileInfo } from '@/composables/useFileStorage'
import { useAdminLogs } from '@/composables/useAdminLogs'

const { role: userRole } = useUserRole()
const toast = useToast()
const {
  loading,
  error,
  providers,
  uploadFile,
  deleteFile,
  listFiles
} = useFileStorage()

const { logAdminAction } = useAdminLogs()

const files = ref<FileInfo[]>([])
const selectedStorage = ref<'supabase' | 'github'>('supabase')
const fileInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const sortDirection = ref<'asc' | 'desc'>('desc')

// Add computed properties for filtered and sorted files
const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value

  const query = searchQuery.value.toLowerCase()
  return files.value.filter(file => 
    file.name.toLowerCase().includes(query)
  )
})

const sortedFiles = computed(() => {
  return [...filteredFiles.value].sort((a, b) => {
    const dateA = new Date(a.created_at || a.updated_at || 0)
    const dateB = new Date(b.created_at || b.updated_at || 0)
    return sortDirection.value === 'desc' 
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime()
  })
})

const loadFiles = async () => {
  try {
    files.value = await listFiles('weekly-updates', selectedStorage.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load files'
    toast.error('Failed to load files')
  }
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const toastId = toast.loading('Uploading file...')
  
  try {
    const uploadedFile = await uploadFile(file, 'weekly-updates', selectedStorage.value)
    files.value.unshift(uploadedFile)
    toast.success('File uploaded successfully', { id: toastId })
    input.value = '' // Reset input

    // Log admin action
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logAdminAction(
        user,
        'Uploaded Summary',
        file.name,
        { 
          storage: selectedStorage.value,
          path: `weekly-updates/${file.name}`,
          size: file.size
        }
      )
    }
  } catch (e) {
    toast.error('Failed to upload file', { id: toastId })
  }
}

const handleDelete = async (file: FileInfo) => {
  if (!confirm(`Are you sure you want to delete ${file.name}?`)) return

  const toastId = toast.loading('Deleting file...')
  try {
    await deleteFile(`weekly-updates/${file.name}`, selectedStorage.value)
    files.value = files.value.filter(f => f.name !== file.name)
    toast.success('File deleted successfully', { id: toastId })
    
    // Log admin action
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logAdminAction(
        user,
        'Deleted Summary',
        file.name,
        { 
          storage: selectedStorage.value,
          path: `weekly-updates/${file.name}`
        }
      )
    }
  } catch (e) {
    toast.error('Failed to delete file', { id: toastId })
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

onMounted(loadFiles)
</script> 