<template>
  <Layout>
    <template #doc-after>
      <Comment style="margin-top: 24px;" />
    </template>

    <template #not-found>
      <NotFound />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme'
import Comment from './Comment.vue';
import NotFound from './NotFound.vue';

const { Layout } = DefaultTheme
</script>
