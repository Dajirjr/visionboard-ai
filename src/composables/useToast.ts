import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = nextId++
    const newToast = { ...toast, id }
    toasts.value.push(newToast)

    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration = 3000) => {
    addToast({
      message,
      type: 'success',
      duration
    })
  }

  const error = (message: string, duration = 5000) => {
    addToast({
      message,
      type: 'error',
      duration
    })
  }

  const info = (message: string, duration = 3000) => {
    addToast({
      message,
      type: 'info',
      duration
    })
  }

  return {
    toasts,
    success,
    error,
    info,
    remove: removeToast
  }
}

// Create a single instance to be used across the app
export const toast = useToast() 