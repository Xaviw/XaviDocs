<template>
  <div class="previewable" @click="preview">
    <img v-bind="$attrs" :src="src" :style="{ width: cssWidth }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { api } from "v-viewer";

const props = withDefaults(
  defineProps<{
    src: string;
    width?: number | string;
  }>(),
  {
    width: 200,
  }
);

const cssWidth = computed(() => {
  return typeof props.width === "string" ? props.width : props.width + "px";
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
