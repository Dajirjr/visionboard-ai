<script setup lang="ts">
import DashboardView from './views/DashboardView.vue';
import Toast from '@/components/Toast.vue'
</script>

<template>
  <div class="app">
    <DashboardView />
    <Toast />
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-height: 100vh;
}
</style>