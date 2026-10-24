
<script setup>
import { computed, ref } from 'vue'

const activePage = ref('Dashboard')
const activeFilter = ref('All')
const searchText = ref('')
const showDialog = ref(false)
const dialogAction = ref('')
const selectedAppointment = ref(null)
const newDate = ref('')
const newTime = ref('')

const menuItems = [
  'Dashboard',
  'Appointments',
  'Guidance Sessions',
  'Students',
  'Notifications',
  'Schedule',
  'History',
  'Profile'
]

const filters = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-show'
]

const appointments = ref([
  {
    id: 1,
    student: 'Angel Dadole',
    type: 'Counseling Session',
    reference: 'GDN 2026-0055',
    date: '2026-10-26',
    time: '10:00',
    status: 'Confirmed'
  },
  {
    id: 2,
    student: 'Daniel Padilla',
    type: 'Follow-up Appointment',
    reference: 'GDN 2026-0056',
    date: '2026-10-26',
    time: '13:00',
    status: 'Pending'
  },
  {
    id: 3,
    student: 'Maria Santos',
    type: 'Guidance Consultation',
    reference: 'GDN 2026-0057',
    date: '2026-10-27',
    time: '09:00',
    status: 'Confirmed'
  }
])

const recentWork = ref([
  {
    id: 1,
    title: 'Daniel Padilla - Follow-up Appointment',
    reference: 'GDN-0056',
    status: 'Approved'
  }
])

const visibleAppointments = computed(() => {
  const search = searchText.value.toLowerCase()

  return appointments.value.filter((appointment) => {
    const matchesFilter =
      activeFilter.value === 'All' ||
      appointment.status === activeFilter.value

    const matchesSearch =
      appointment.student.toLowerCase().includes(search) ||
      appointment.reference.toLowerCase().includes(search) ||
      appointment.type.toLowerCase().includes(search)

    const matchesPage =
      activePage.value !== 'History' ||
      ['Completed', 'Cancelled', 'No-show'].includes(appointment.status)

    return matchesFilter && matchesSearch && matchesPage
  })
})

const todayAppointments = computed(() =>
  appointments.value.filter(
    (appointment) => appointment.date === '2026-10-26'
  )
)

const completedCount = computed(() =>
  appointments.value.filter(
    (appointment) => appointment.status === 'Completed'
  ).length
)

function selectPage(page) {
  activePage.value = page
  activeFilter.value = 'All'
  searchText.value = ''
}

function openAction(appointment, action) {
  selectedAppointment.value = appointment
  dialogAction.value = action
  showDialog.value = true
}

function openReschedule(appointment) {
  selectedAppointment.value = appointment
  newDate.value = appointment.date
  newTime.value = appointment.time
  activePage.value = 'Reschedule'
}

function reviewReschedule() {
  if (!newDate.value || !newTime.value) {
    alert('Please select a new date and time.')
    return
  }

  if (new Date(`${newDate.value}T${newTime.value}`) <= new Date()) {
    alert('Please select a future date and time.')
    return
  }

  openAction(selectedAppointment.value, 'Reschedule')
}

function confirmAction() {
  const appointment = appointments.value.find(
    (item) => item.id === selectedAppointment.value?.id
  )

  if (!appointment) return

  if (dialogAction.value === 'Complete') {
    appointment.status = 'Completed'

    recentWork.value.unshift({
      id: Date.now(),
      title: `${appointment.student} - ${appointment.type}`,
      reference: appointment.reference,
      status: 'Completed'
    })
  } else if (dialogAction.value === 'Cancel') {
    appointment.status = 'Cancelled'
  } else if (dialogAction.value === 'No-show') {
    appointment.status = 'No-show'
  } else if (dialogAction.value === 'Confirm') {
    appointment.status = 'Confirmed'
  } else if (dialogAction.value === 'Reschedule') {
    appointment.date = newDate.value
    appointment.time = newTime.value
    appointment.status = 'Pending'
    activePage.value = 'Appointments'
    activeFilter.value = 'All'
  }

  showDialog.value = false
  selectedAppointment.value = null
}

function formatDate(date) {
  if (!date) return ''

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(time) {
  if (!time) return ''

  const [hour, minute] = time.split(':').map(Number)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

function logout() {
  alert('Authentication and logout will be connected later.')
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-logo">LQ</div>

        <div class="brand-info">
          <h2>LiceoQServe</h2>
          <p>Guidance Office Portal</p>
        </div>
      </div>

      <div class="staff">
        <span>Dr. Lindsay Montejo</span>
        <small>Authorized Staff</small>
      </div>
    </header>

    <div class="app-body">
      <aside class="sidebar">
        <nav class="navigation">
          <button
            v-for="item in menuItems"
            :key="item"
            :class="{ selected: activePage === item }"
            @click="selectPage(item)"
          >
            {{ item }}
          </button>
        </nav>

        <div class="sidebar-bottom">
          <div class="office-status">
            <strong>Office status</strong>
            <span>Open · 8:00 AM–5:00 PM</span>
          </div>

          <button class="logout-button" @click="logout">
            LOG OUT
          </button>
        </div>
      </aside>

      <main class="main-content">
        <template v-if="activePage === 'Dashboard'">
          <section class="hero">
            <p class="eyebrow">OCTOBER 2026</p>
            <h1>Guidance Office Dashboard</h1>
            <p>Review today's workload and continue the next transaction.</p>
          </section>

          <section class="stats-grid">
            <article class="stat-card">
              <span>Today's appointments</span>
              <strong>{{ todayAppointments.length }}</strong>
              <button @click="selectPage('Appointments')">View details</button>
            </article>

            <article class="stat-card">
              <span>Completed sessions</span>
              <strong>{{ completedCount }}</strong>
              <button @click="selectPage('History')">View details</button>
            </article>

            <article class="stat-card">
              <span>Counselors available</span>
              <strong>3</strong>
              <button @click="selectPage('Guidance Sessions')">View details</button>
            </article>

            <article class="stat-card">
              <span>Ready for pickup</span>
              <strong>0</strong>
              <button @click="selectPage('Notifications')">View details</button>
            </article>
          </section>

          <section class="dashboard-grid">
            <article class="panel">
              <h2>Today's appointments</h2>

              <div
                v-for="appointment in todayAppointments"
                :key="appointment.id"
                class="compact-item"
              >
                <div class="compact-info">
                  <strong>{{ formatTime(appointment.time) }}</strong>
                  <span>{{ appointment.student }}</span>
                  <small>{{ appointment.type }}</small>
                </div>

                <span
                  class="status-badge"
                  :class="appointment.status.toLowerCase()"
                >
                  {{ appointment.status }}
                </span>
              </div>

              <p v-if="!todayAppointments.length" class="empty-message">
                No appointments scheduled.
              </p>
            </article>

            <article class="panel">
              <h2>Recent work</h2>

              <div
                v-for="work in recentWork"
                :key="work.id"
                class="compact-item"
              >
                <div class="compact-info">
                  <strong>{{ work.title }}</strong>
                  <small>{{ work.reference }}</small>
                </div>

                <span class="status-badge completed">
                  {{ work.status }}
                </span>
              </div>
            </article>
          </section>
        </template>

        <template
          v-else-if="activePage === 'Appointments' || activePage === 'History'"
        >
          <section class="page-heading">
            <h1>{{ activePage }}</h1>
            <p>
              {{
                activePage === 'History'
                  ? 'Review completed and past appointments.'
                  : 'Confirm, reschedule and complete Guidance appointments.'
              }}
            </p>
          </section>

          <section class="appointment-tools">
            <div class="filter-list">
              <button
                v-for="filter in filters"
                :key="filter"
                :class="{ active: activeFilter === filter }"
                @click="activeFilter = filter"
              >
                {{ filter }}
              </button>
            </div>

            <input
              v-model="searchText"
              class="search-input"
              type="search"
              placeholder="Search student or reference..."
            />
          </section>

          <section class="appointment-list">
            <article
              v-for="appointment in visibleAppointments"
              :key="appointment.id"
              class="appointment-card"
            >
              <div class="appointment-top">
                <small>
                  {{ formatDate(appointment.date) }} ·
                  {{ formatTime(appointment.time) }}
                </small>

                <span
                  class="status-badge"
                  :class="appointment.status.toLowerCase()"
                >
                  {{ appointment.status }}
                </span>
              </div>

              <h2>{{ appointment.student }} - {{ appointment.type }}</h2>
              <p>{{ appointment.reference }}</p>

              <div class="action-list">
                <button
                  v-if="['Pending', 'Confirmed'].includes(appointment.status)"
                  class="outline-button"
                  @click="openReschedule(appointment)"
                >
                  Reschedule
                </button>

                <button
                  v-if="appointment.status === 'Pending'"
                  class="outline-button"
                  @click="openAction(appointment, 'Confirm')"
                >
                  Confirm
                </button>

                <button
                  v-if="['Pending', 'Confirmed'].includes(appointment.status)"
                  class="outline-button"
                  @click="openAction(appointment, 'Complete')"
                >
                  Complete
                </button>

                <button
                  v-if="['Pending', 'Confirmed'].includes(appointment.status)"
                  class="outline-button"
                  @click="openAction(appointment, 'Cancel')"
                >
                  Cancel
                </button>

                <button
                  v-if="['Pending', 'Confirmed'].includes(appointment.status)"
                  class="outline-button"
                  @click="openAction(appointment, 'No-show')"
                >
                  No-show
                </button>
              </div>
            </article>

            <div v-if="!visibleAppointments.length" class="empty-state">
              <h2>No appointments found</h2>
              <p>Try another filter or search term.</p>
            </div>
          </section>
        </template>

        <template v-else-if="activePage === 'Reschedule'">
          <section class="page-heading">
            <h1>Reschedule Appointments</h1>
            <p>
              {{ selectedAppointment?.student }} ·
              {{ selectedAppointment?.reference }}
            </p>
          </section>

          <section v-if="selectedAppointment" class="reschedule-panel">
            <div class="current-schedule">
              <strong>Current Schedule:</strong>
              {{ formatDate(selectedAppointment.date) }} at
              {{ formatTime(selectedAppointment.time) }}
            </div>

            <form @submit.prevent="reviewReschedule">
              <label for="new-date">New Date</label>
              <input
                id="new-date"
                v-model="newDate"
                type="date"
                :min="new Date().toLocaleDateString('en-CA')"
                required
              />

              <label for="new-time">New Time</label>
              <select id="new-time" v-model="newTime" required>
                <option value="" disabled>Choose a time</option>
                <option value="08:00">8:00 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>

              <div class="form-actions">
                <button class="primary-button" type="submit">
                  Review Changes
                </button>

                <button
                  class="outline-button"
                  type="button"
                  @click="selectPage('Appointments')"
                >
                  Cancel Editing
                </button>
              </div>
            </form>
          </section>
        </template>

        <template v-else>
          <section class="page-heading">
            <h1>{{ activePage }}</h1>
            <p>LiceoQServe Guidance Office Portal</p>
          </section>

          <section class="panel placeholder-panel">
            <h2>{{ activePage }}</h2>
            <p>This page will be developed next based on your Figma design.</p>
            <button class="primary-button" @click="selectPage('Dashboard')">
              Back to Dashboard
            </button>
          </section>
        </template>
      </main>
    </div>

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <section class="modal-card">
        <div class="modal-icon">!</div>

        <h2>
          {{
            dialogAction === 'Reschedule'
              ? 'Review Reschedule?'
              : dialogAction === 'Confirm'
                ? 'Confirm this Appointment?'
                : `${dialogAction} this Appointment?`
          }}
        </h2>

        <p v-if="selectedAppointment">
          {{ selectedAppointment.student }} ·
          {{ selectedAppointment.type }} ·
          {{ formatDate(selectedAppointment.date) }} at
          {{ formatTime(selectedAppointment.time) }}
        </p>

        <p v-if="dialogAction === 'Reschedule'">
          New schedule: {{ formatDate(newDate) }} at {{ formatTime(newTime) }}.
        </p>

        <div class="modal-actions">
          <button class="outline-button" @click="showDialog = false">
            Go Back
          </button>

          <button class="primary-button" @click="confirmAction">
            {{
              dialogAction === 'Reschedule'
                ? 'Confirm Changes'
                : dialogAction === 'Confirm'
                  ? 'Confirm Appointment'
                  : `Confirm ${dialogAction}`
            }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
:root {
  font-family: Arial, Helvetica, sans-serif;
  color: #39090c;
  background: #efdfdf;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-width: 320px;
  min-height: 100%;
  margin: 0;
}

body {
  min-height: 100vh;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

h1,
h2 {
  font-family: Georgia, 'Times New Roman', serif;
}

.app-shell {
  width: 100%;
  min-height: 100vh;
  background: #efdfdf;
}

.topbar {
  min-height: 84px;
  padding: 15px 24px;
  background: #51090e;
  color: #fff3f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: #76232a;
  border-radius: 9px;
  font-family: Georgia, serif;
  font-size: 19px;
  font-weight: bold;
}

.brand h2 {
  margin: 0;
  font-size: 18px;
}

.brand-info p,
.staff small {
  display: block;
  margin: 4px 0 0;
  font-size: 11px;
  color: #e0bfc0;
}

.staff {
  text-align: right;
  font-size: 14px;
}

.app-body {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  min-height: calc(100vh - 84px);
}

.sidebar {
  background: #f7eded;
  border-right: 1px solid #4b1013;
  padding: 16px 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 25px;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.navigation button {
  border: 0;
  background: transparent;
  color: #33090b;
  text-align: left;
  padding: 11px 13px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.navigation button:hover,
.navigation button.selected {
  background: #51090e;
  color: white;
}

.sidebar-bottom {
  display: grid;
  gap: 8px;
}

.office-status {
  background: #ead6d6;
  border-radius: 6px;
  padding: 10px;
  font-size: 10px;
}

.office-status strong,
.office-status span {
  display: block;
}

.office-status span {
  margin-top: 4px;
  color: #79595a;
}

.logout-button,
.outline-button {
  border: 1px solid #8b5155;
  color: #39090c;
  background: transparent;
  border-radius: 6px;
  padding: 9px 12px;
}

.logout-button {
  font-size: 12px;
  font-weight: 700;
}

.logout-button:hover,
.outline-button:hover {
  background: #f2dede;
}

.main-content {
  min-width: 0;
  padding: 24px;
  background: #efdfdf;
}

.hero {
  background: #51090e;
  color: #fff5f2;
  padding: 25px 28px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #e5bfc0;
}

.hero h1,
.page-heading h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  margin: 8px 0;
  font-size: clamp(24px, 3vw, 34px);
}

.hero h1 {
  color: #fff5f2;
}

.hero > p:last-child {
  margin-bottom: 0;
  font-size: 12px;
  color: #f0dada;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card,
.panel {
  background: #f7eded;
  border: 1px solid #c9b4b5;
  border-radius: 10px;
  padding: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.stat-card > span {
  color: #765d5e;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: .4px;
}

.stat-card > strong {
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: 500;
}

.stat-card button {
  border: 0;
  padding: 0;
  background: none;
  color: #39090c;
  font-size: 12px;
  font-weight: 600;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.panel h2 {
  margin: 0 0 12px;
  font-family: Georgia, serif;
  font-size: 20px;
}

.compact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #d7c4c5;
}

.compact-item:last-child {
  border-bottom: 0;
}

.compact-info {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.compact-info strong {
  font-size: 12px;
}

.compact-info span,
.compact-info small {
  font-size: 11px;
}

.compact-info small {
  color: #80696a;
}

.status-badge {
  display: inline-block;
  white-space: nowrap;
  border-radius: 20px;
  padding: 5px 9px;
  font-size: 10px;
  background: #e5d5d5;
  color: #654244;
}

.status-badge.confirmed,
.status-badge.completed,
.status-badge.approved {
  background: #c6e4d0;
  color: #285a3d;
}

.status-badge.pending {
  background: #f4e3b7;
  color: #72571b;
}

.status-badge.cancelled,
.status-badge.no-show {
  background: #f5d1d1;
  color: #a22020;
}

.page-heading {
  margin-bottom: 22px;
}

.page-heading h1 {
  margin-top: 0;
}

.page-heading p {
  color: #74595a;
  font-size: 13px;
  margin: 4px 0;
}

.appointment-tools {
  display: grid;
  gap: 14px;
  margin-bottom: 16px;
}

.filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-list button {
  border: 1px solid #a67a7c;
  border-radius: 24px;
  background: #f7eded;
  padding: 9px 14px;
  font-size: 12px;
}

.filter-list button.active,
.filter-list button:hover {
  background: #51090e;
  color: white;
  border-color: #51090e;
}

.search-input {
  width: 100%;
  border: 1px solid #c2a5a7;
  border-radius: 7px;
  padding: 11px;
  background: #f7eded;
  color: #39090c;
}

.appointment-list {
  display: grid;
  gap: 12px;
}

.appointment-card {
  padding: 16px;
  border: 1px solid #c8adaf;
  border-radius: 10px;
  background: #f7eded;
}

.appointment-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.appointment-top > small {
  color: #73595a;
}

.appointment-card h2 {
  margin: 11px 0 5px;
  font-family: Georgia, serif;
  font-size: 17px;
  font-weight: 500;
}

.appointment-card p {
  font-size: 12px;
  color: #74595a;
}

.action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.action-list button {
  padding: 8px 11px;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 36px 20px;
  background: #f7eded;
  border-radius: 10px;
}

.empty-state h2 {
  font-family: Georgia, serif;
}

.empty-message {
  color: #80696a;
  font-size: 12px;
}

.reschedule-panel {
  border: 1px solid #b78b8e;
  border-radius: 8px;
  padding: 22px;
  background: #f7eded;
  max-width: 850px;
}

.current-schedule {
  background: #d9b5b6;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.reschedule-panel form {
  display: grid;
  gap: 10px;
}

.reschedule-panel label {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.reschedule-panel input,
.reschedule-panel select {
  width: 100%;
  min-height: 42px;
  border: 1px solid #a9787c;
  border-radius: 6px;
  padding: 10px;
  background: #f7eded;
  color: #39090c;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 5px;
}

.primary-button {
  background: #51090e;
  color: white;
  border: 1px solid #51090e;
  border-radius: 6px;
  padding: 10px 14px;
  font-weight: 600;
}

.primary-button:hover {
  background: #74151d;
}

.placeholder-panel {
  min-height: 180px;
}

.placeholder-panel p {
  color: #74595a;
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(30 20 20 / 48%);
}

.modal-card {
  width: min(100%, 450px);
  padding: 24px;
  background: #f7eded;
  border-radius: 12px;
  box-shadow: 0 15px 45px rgb(0 0 0 / 20%);
}

.modal-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #e6babb;
  color: #7d151b;
  font-size: 24px;
  font-weight: bold;
}

.modal-card h2 {
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 500;
  margin: 15px 0 10px;
}

.modal-card p {
  color: #73595a;
  font-size: 12px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 20px;
}

@media (max-width: 900px) {
  .app-body {
    grid-template-columns: 180px minmax(0, 1fr);
  }

  .main-content {
    padding: 18px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .topbar {
    padding: 12px;
  }

  .brand h2 {
    font-size: 15px;
  }

  .staff {
    font-size: 11px;
  }

  .app-body {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid #4b1013;
    padding: 9px;
  }

  .navigation {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .navigation button {
    padding: 9px;
    font-size: 11px;
  }

  .sidebar-bottom {
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  .main-content {
    padding: 13px;
  }

  .hero {
    padding: 19px;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .appointment-card {
    padding: 12px;
  }
}
</style>
