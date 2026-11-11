
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentDate = ref('')

let dateInterval = null

const updateCurrentDate = () => {
  currentDate.value = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date())
}

onMounted(() => {
  updateCurrentDate()
  dateInterval = setInterval(updateCurrentDate, 60000)
})

onUnmounted(() => {
  if (dateInterval) {
    clearInterval(dateInterval)
  }
})
</script>

<template>
  <section class="welcome">
    <p>{{ currentDate }}</p>

    <h1>Library Dashboard</h1>

    <span>
      Review today's workload and continue the next transaction
    </span>
  </section>
</template>

<style scoped>
.welcome {
  padding: 24px 26px;
  border-radius: 24px;
  background: #56090d;
  color: #fff7f5;
  margin-bottom: 19px;
}

.welcome p {
  margin: 0 0 9px;
  font-size: 12px;
}

.welcome h1 {
  margin: 0 0 5px;
  font: 26px Georgia, serif;
}

.welcome span {
  font-size: 12px;
}

@media (max-width: 480px) {
  .welcome {
    padding: 20px;
  }

  .welcome h1 {
    font-size: 22px;
  }
}
</style>
