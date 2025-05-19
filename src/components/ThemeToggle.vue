<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
  >
    <span v-if="isDark" class="icon">🌞</span>
    <span v-else class="icon">🌙</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const isDark = ref(false)
const THEME_KEY = 'theme-preference'

const setTheme = (dark: boolean) => {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  setTheme(!isDark.value)
}

// Initialize theme from localStorage or system preference
onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) {
    setTheme(savedTheme === 'dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark)
  }
})

// Watch for system theme changes
watch(() => window.matchMedia('(prefers-color-scheme: dark)').matches, (dark) => {
  if (!localStorage.getItem(THEME_KEY)) {
    setTheme(dark)
  }
})
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.theme-toggle:hover {
  background-color: var(--color-background-soft);
}

.icon {
  font-size: 1.25rem;
  line-height: 1;
}

/* Dark mode styles */
:root.dark {
  --color-background: #1a1a1a;
  --color-background-soft: #242424;
  --color-text: #ffffff;
}

:root {
  --color-background: #ffffff;
  --color-background-soft: #f3f4f6;
  --color-text: #1a1a1a;
}
</style> 