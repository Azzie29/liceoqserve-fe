
<script setup>
import DashboardWelcome from '../components/DashboardWelcome.vue'
import DashboardStats from '../components/DashboardStats.vue'
import TodayAppointment from '../components/TodayAppointment.vue'
import RecentWork from '../components/RecentWork.vue'
</script>

<template>
  <main class="dashboard">
    <DashboardWelcome />
    <DashboardStats />

    <section class="activity-grid">
      <TodayAppointment />
      <RecentWork />
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  min-width: 0;
  padding: 14px 20px 28px;
  color: #390607;
}

.activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

@media (max-width: 900px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }
}
</style>
