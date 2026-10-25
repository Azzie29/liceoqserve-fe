<template>
  <section class="dashboard-page">
    <!-- Dashboard heading banner -->
    <header class="dashboard-banner">
      <p class="banner-date">Friday, October 1, 2026</p>
      <h1>Registrar Dashboard</h1>
      <p class="banner-description">
        Review today’s workload and continue the next transaction.
      </p>
    </header>

    <!-- Summary cards -->
    <section class="stats-grid">
      <article class="stat-card">
        <p class="stat-label">WAITING</p>
        <h2>6</h2>
        <button class="details-link" @click="goTo('/registrar/queue')">
          View details
        </button>
      </article>

      <article class="stat-card">
        <p class="stat-label">TODAY’S APPOINTMENT</p>
        <h2>1</h2>
        <button
          class="details-link"
          @click="goTo('/registrar/appointments')"
        >
          View details
        </button>
      </article>

      <article class="stat-card">
        <p class="stat-label">PENDING REQUESTS</p>
        <h2>1</h2>
        <button class="details-link" @click="goTo('/registrar/requests')">
          View details
        </button>
      </article>

      <article class="stat-card">
        <p class="stat-label">READY FOR PICKUP</p>
        <h2>1</h2>
        <button class="details-link" @click="goTo('/registrar/requests')">
          View details
        </button>
      </article>
    </section>

    <!-- Lower dashboard panels -->
    <section class="dashboard-panels">
      <!-- Appointment panel -->
      <article class="content-panel appointment-panel">
        <h2>Registrar Dashboard</h2>

        <div v-if="appointment" class="appointment-row">
          <span class="appointment-time">{{ appointment.time }}</span>

          <div class="appointment-information">
            <p class="person-name">{{ appointment.name }}</p>
            <p class="secondary-text">{{ appointment.service }}</p>
          </div>

          <span class="status-pill confirmed">
            {{ appointment.status }}
          </span>
        </div>

        <div v-else class="empty-state">
          No appointments scheduled for today.
        </div>
      </article>

      <!-- Recent work panel -->
      <article class="content-panel recent-work-panel">
        <h2>Recent Work</h2>

        <div
          v-for="request in recentWork"
          :key="request.id"
          class="recent-work-row"
          @click="openRequests"
        >
          <div class="request-information">
            <p class="person-name">
              {{ request.name }} · {{ request.service }}
            </p>
            <p class="secondary-text">{{ request.id }}</p>
          </div>

          <span
            class="status-pill"
            :class="statusClass(request.status)"
          >
            {{ request.status }}
          </span>
        </div>

        <div v-if="recentWork.length === 0" class="empty-state">
          No recent requests to display.
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const appointment = ref({
  time: '10:30 AM',
  name: 'Angel Dadole',
  service: 'Transcript of Records',
  status: 'Confirmed',
})

const recentWork = ref([
  {
    id: 'REQ-2026-00125',
    name: 'Juan Dela Cruz',
    service: 'Form 137',
    status: 'Processing',
  },
  {
    id: 'REQ-2026-00126',
    name: 'Maria Santos',
    service: 'Good Moral Certificate',
    status: 'Ready For Pickup',
  },
])

function goTo(path) {
  router.push(path)
}

function openRequests() {
  router.push('/registrar/requests')
}

function statusClass(status) {
  const normalized = status.toLowerCase()

  if (normalized.includes('ready') || normalized.includes('completed')) {
    return 'ready'
  }

  if (normalized.includes('confirmed')) {
    return 'confirmed'
  }

  if (normalized.includes('processing')) {
    return 'processing'
  }

  return 'default-status'
}
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  color: #26090b;
  font-family: Arial, Helvetica, sans-serif;
}

/* Main banner */
.dashboard-banner {
  min-height: 178px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #57080f;
  color: #fff8f6;
  border-radius: 28px;
  margin-bottom: 26px;
}

.banner-date {
  margin: 0 0 12px;
  color: #f2dada;
  font-size: 14px;
}

.dashboard-banner h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 500;
}

.banner-description {
  margin: 2px 0 0;
  font-size: 15px;
  color: #fff4f1;
}

/* Statistic cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin: 0 8px 26px;
}

.stat-card {
  min-height: 198px;
  padding: 28px 28px 24px;
  background: #f8eeee;
  border: 1px solid #4c2427;
  border-radius: 20px;
  box-shadow: 0 2px 3px rgb(47 9 13 / 12%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-label {
  margin: 8px 0 24px;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 400;
  color: #211416;
}

.stat-card h2 {
  margin: 0 0 2px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.1;
  color: #120809;
}

.details-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #89575c;
  font-size: 12px;
  cursor: pointer;
}

.details-link:hover {
  color: #57080f;
  text-decoration: underline;
}

/* Lower panels */
.dashboard-panels {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 12px;
  margin: 0 8px;
  align-items: stretch;
}

.content-panel {
  min-width: 0;
  min-height: 290px;
  padding: 24px 12px 12px;
  background: #f8eeee;
  border: 1px solid #4c2427;
  border-radius: 20px;
  box-shadow: 0 2px 3px rgb(47 9 13 / 12%);
}

.content-panel h2 {
  margin: 0 14px 18px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 29px;
  line-height: 1.25;
  font-weight: 600;
  color: #100809;
}

.appointment-row {
  min-height: 66px;
  padding: 14px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #c9b5b7;
}

.appointment-time {
  flex-shrink: 0;
  color: #241719;
  font-size: 13px;
  font-weight: 700;
}

.appointment-information,
.request-information {
  min-width: 0;
  flex: 1;
}

.person-name {
  margin: 0;
  color: #241719;
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.secondary-text {
  margin: 0;
  color: #896a6e;
  font-size: 13px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.status-pill {
  flex-shrink: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 112px;
  max-width: 150px;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}

.confirmed,
.ready {
  background: #b9e2c8;
  color: #426c50;
}

.processing {
  background: #f0df81;
  color: #6c5c18;
}

.default-status {
  background: #eadcdd;
  color: #63474a;
}

/* Recent work rows */
.recent-work-row {
  min-height: 66px;
  padding: 14px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #c9b5b7;
  cursor: pointer;
  transition: background 0.15s ease;
}

.recent-work-row:hover {
  background: #f1e1e2;
}

.empty-state {
  padding: 22px 14px;
  color: #896a6e;
  font-size: 14px;
}

/* Responsive layouts */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .dashboard-banner {
    min-height: 150px;
    padding: 26px 22px;
    border-radius: 20px;
  }

  .dashboard-banner h1 {
    font-size: 25px;
  }

  .stats-grid {
    margin-right: 0;
    margin-left: 0;
    gap: 12px;
  }

  .stat-card {
    min-height: 160px;
    padding: 18px 14px;
    border-radius: 16px;
  }

  .stat-label {
    margin-top: 4px;
    margin-bottom: 20px;
    font-size: 12px;
  }

  .stat-card h2 {
    font-size: 28px;
  }

  .dashboard-panels {
    margin-right: 0;
    margin-left: 0;
  }

  .content-panel {
    padding: 20px 8px 10px;
    border-radius: 16px;
  }

  .content-panel h2 {
    font-size: 24px;
  }

  .appointment-row,
  .recent-work-row {
    flex-wrap: wrap;
  }

  .status-pill {
    min-width: auto;
  }
}
</style>