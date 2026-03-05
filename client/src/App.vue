<script setup>
import { RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import FloatingButtons from './components/FloatingButtons.vue'
</script>

<template>
  <SiteHeader />
  <main>
    <RouterView />
  </main>
  <SiteFooter />
  <FloatingButtons />
</template>

<style>
/* App layout styles */
main {
  min-height: calc(100vh - 100px); /* Adjust based on header height */
  width: 100%;
}
</style>
