<template>
  <div class="previewable" @click="preview">
    <img v-bind="$attrs" :src="srcWiteBase" :style="{ width: cssWidth }" />
  </div>
</template>

<script setup lang="ts">
import { withBase } from "vitepress";
import { computed } from "vue";
import { api } from "v-viewer";

const props = withDefaults(
  defineProps<{
    src: string;
    width?: number | string;
  }>(),
  {
    width: "auto",
  }
);

const cssWidth = computed(() => {
  const width = Number(props.width) || props.width;
  return typeof width === "string" ? width : width + "px";
});

const srcWiteBase = computed(() => {
  return withBase(props.src);
});

function preview() {
  api({ images: [props.src] });
}
</script>

<style>
.previewable {
  position: relative;
  display: flex;
  justify-content: center;
}

.previewable::before {
  content: "🔍";
  transition: 0.3s all;
  opacity: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.previewable:hover::before {
  opacity: 1;
}
</style>
