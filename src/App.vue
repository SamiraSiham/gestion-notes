<script setup lang="ts">
import ThemeProvider from "./components/layout/ThemeProvider.vue";
import SidebarProvider from "./components/layout/SidebarProvider.vue";
</script>

<template>
  <ThemeProvider>
    <SidebarProvider>
      <router-view />
    </SidebarProvider>
  </ThemeProvider>
</template>
