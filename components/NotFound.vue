<template>
  <div class="not-found">
    <img src="/404.svg" alt="404" class="icon" />

    <VPButton text="返回首页" href="/" style="margin-top: 24px;" />
  </div>
</template>

<script setup lang="ts">
import { VPButton } from 'vitepress/theme';
</script>

<style scoped>
.not-found {
  height: calc(100vh - var(--vp-nav-height));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.not-found .icon {
  height: calc(100% - 160px);
}
</style>
