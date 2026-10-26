
<script setup>
import { useRouter } from 'vue-router'
import StatCard from '../components/StatCard.vue'

const router = useRouter()

const stats = [
  { title: "TODAY'S APPOINTMENTS", count: 1, subtitle: 'View Details' },
  { title: 'PENDING REQUEST', count: 1, subtitle: 'View Details' },
  { title: 'READY FOR PICK UP', count: 1, subtitle: 'View Details' }
]

function goToAppointments() {
  router.push('/appointments')
}

function goToPending() {
  router.push({
    path: '/requests',
    query: { status: 'Pending' }
  })
}

function goToReadyForPickup() {
  router.push({
    path: '/requests',
    query: { status: 'Ready for Pick Up' }
  })
}

const appointments = [
  {
    time: '1:00 PM',
    student: 'Maria Santos',
    purpose: 'Student ID Application',
    status: 'Pending'
  }
]

const requests = [
  {
    student: 'Juan Dela Cruz',
    purpose: 'Student Certification',
    office: 'OSA - 015',
    status: 'Ready for Pick Up'
  },
  {
    student: 'Maria Santos',
    purpose: 'Organization Document',
    office: 'OSA - 016',
    status: 'Processing'
  }
]
</script>

<template>
  <section class="page-container dashboard-page">
    <div class="welcome-banner">
      <span class="dashboard-date">OCTOBER 1, 2026</span>

      <h2>Office of Student Affairs DASHBOARD</h2>

      <p>
        Review today's workload and continue the next transaction.
      </p>
    </div>

    <div class="stats-grid">
  <div
    v-for="(stat, index) in stats"
    :key="stat.title"
  >
    <StatCard
      v-bind="stat"
      @click="[
        goToAppointments,
        goToPending,
        goToReadyForPickup
      ][index]()"
    />
  </div>
</div>

    <div class="dashboard-grid">
      <section class="panel dashboard-panel">
        <h3>TODAY'S APPOINTMENTS</h3>

        <div
          v-for="item in appointments"
          :key="item.student"
          class="record-row"
        >
          <div class="record-time">
            {{ item.time }}
          </div>

          <div class="record-info">
            <strong>{{ item.student }}</strong>
            <span>{{ item.purpose }}</span>
          </div>

          <span class="status-badge pending">
            {{ item.status }}
          </span>
        </div>
      </section>

      <section class="panel dashboard-panel">
        <h3>RECENT WORK</h3>

        <div
          v-for="item in requests"
          :key="item.student + item.purpose"
          class="request-row"
        >
          <div class="record-info">
            <strong>{{ item.student }} - {{ item.purpose }}</strong>
            <span>{{ item.office }}</span>
          </div>

          <span
            :class="[
              'status-badge',
              item.status === 'Processing'
                ? 'processing'
                : 'confirmed'
            ]"
          >
            {{ item.status }}
          </span>
        </div>
      </section>
    </div>
  </section>
</template>
