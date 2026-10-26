
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: [Number, String],
    default: 0
  },
  subtitle: {
    type: String,
    default: 'View Details'
  }
})
</script>

<template>
  <article class="stat-card">
    <span class="stat-title">{{ title }}</span>
    <strong class="stat-count">{{ count }}</strong>
    <span class="stat-subtitle">{{ subtitle }}</span>
  </article>
</template>
