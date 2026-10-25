
<script setup>
import { computed, ref } from 'vue'

import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import AppointmentsView from './views/AppointmentsView.vue'
import RescheduleView from './views/RescheduleView.vue'
import PlaceholderView from './views/PlaceholderView.vue'
import GuidanceSessionDetails from './views/GuidanceSessionDetails.vue'
import Students from './views/Students.vue'
import ScheduleView from './views/ScheduleView.vue'
import HistoryView from './views/HistoryView.vue'
import ProfileView from './views/ProfileView.vue'

const isLoggedIn = ref(true)

const activePage = ref('Dashboard')
const activeFilter = ref('All')
const searchText = ref('')

const showDialog = ref(false)
const dialogAction = ref('')
const selectedAppointment = ref(null)
const rescheduleValues = ref(null)
const selectedGuidanceSession = ref(null)

const showLogoutDialog = ref(false)

const appointments = ref([
  {
    id: 1,
    student: 'Daniel Padilla',
    type: 'Counseling Session',
    reference: 'GDN-005',
    date: '2026-10-25',
    time: '10:00',
    status: 'Confirmed'
  },
  {
    id: 2,
    student: 'Angel Dadole',
    type: 'Follow-up Appointment',
    reference: 'GDN-006',
    date: '2026-10-25',
    time: '13:00',
    status: 'Pending'
  },
  {
    id: 3,
    student: 'Maria Santos',
    type: 'Guidance Consultation',
    reference: 'GDN-007',
    date: '2026-10-26',
    time: '09:00',
    status: 'Confirmed'
  }
])

const guidanceSessions = ref([
  {
    id: 101,
    student: 'Angel Dadole',
    type: 'Counseling Session',
    reference: 'GDN-005',
    date: '2026-10-05',
    time: '10:15',
    status: 'Pending',
    notes: '',
    checkedInAt: ''
  },
  {
    id: 102,
    student: 'Rainier Amparo',
    type: 'Career Guidance',
    reference: 'GDN-006',
    date: '2026-10-05',
    time: '15:30',
    status: 'Pending',
    notes: '',
    checkedInAt: ''
  }
])

const notifications = ref([
  {
    id: 1,
    title: 'Review reschedule session',
    date: 'Oct. 4, 2026',
    time: '9:45 AM',
    read: false,
    destination: 'Reschedule'
  },
  {
    id: 2,
    title: 'Appointment requires confirmation',
    date: 'Today',
    time: '10:00 AM',
    read: false,
    destination: 'Appointments'
  },
  {
    id: 3,
    title: 'Student Session needs Review',
    date: 'Oct. 5, 2026',
    time: '1:53 PM',
    read: true,
    destination: 'Guidance Sessions'
  }
])

const unreadCount = computed(() =>
  notifications.value.filter(item => !item.read).length
)

const today = new Date().toLocaleDateString('en-CA', {
  timeZone: 'Asia/Manila'
})

const todayAppointments = computed(() =>
  appointments.value.filter(item => item.date === today)
)

const completedCount = computed(() =>
  appointments.value.filter(item => item.status === 'Completed').length + 11
)

const visibleAppointments = computed(() => {
  const search = searchText.value.trim().toLowerCase()

  return appointments.value.filter(item => {
    const matchesFilter =
      activeFilter.value === 'All' ||
      item.status === activeFilter.value

    const matchesSearch =
      item.student.toLowerCase().includes(search) ||
      item.reference.toLowerCase().includes(search) ||
      item.type.toLowerCase().includes(search)

    return matchesFilter && matchesSearch
  })
})

const historyAppointments = computed(() => {
  const search = searchText.value.trim().toLowerCase()
  const historyStatuses = ['Completed', 'Cancelled', 'No-show']

  return appointments.value.filter(item => {
    const isHistoryItem = historyStatuses.includes(item.status)

    const matchesFilter =
      activeFilter.value === 'All' ||
      item.status === activeFilter.value

    const matchesSearch =
      item.student.toLowerCase().includes(search) ||
      item.reference.toLowerCase().includes(search) ||
      item.type.toLowerCase().includes(search)

    return isHistoryItem && matchesFilter && matchesSearch
  })
})

function navigate(page) {
  activePage.value = page
  activeFilter.value = 'All'
  searchText.value = ''
}

function markAllAsRead() {
  notifications.value.forEach(item => {
    item.read = true
  })
}

function openNotification(notification) {
  notification.read = true

  if (notification.destination === 'Reschedule') {
    selectedAppointment.value =
      appointments.value.find(item => item.id === 2) ||
      appointments.value[0] ||
      null

    activePage.value = 'Reschedule'
    return
  }

  if (notification.destination === 'Appointments') {
    activePage.value = 'Appointments'
    activeFilter.value = 'Pending'
    searchText.value = ''
    return
  }

  if (notification.destination === 'Guidance Sessions') {
    activePage.value = 'Guidance Sessions'
    return
  }

  navigate(notification.destination)
}

function openGuidanceSession(session) {
  selectedGuidanceSession.value = session
  activePage.value = 'Guidance Sessions Details'
}

function updateGuidanceSession(payload) {
  const session = guidanceSessions.value.find(
    item => item.id === payload.appointment?.id
  )

  if (!session) return

  session.status = payload.status
  session.checkedInAt = payload.checkedInAt || session.checkedInAt
}

function saveGuidanceNotes(payload) {
  const session = guidanceSessions.value.find(
    item => item.id === payload.appointment?.id
  )

  if (!session) return

  session.notes = payload.notes
}

function openAction(appointment, action) {
  selectedAppointment.value = appointment
  dialogAction.value = action
  rescheduleValues.value = null
  showDialog.value = true
}

function openReschedule(appointment) {
  selectedAppointment.value = appointment
  activePage.value = 'Reschedule'
}

function reviewReschedule(values) {
  rescheduleValues.value = values
  dialogAction.value = 'Reschedule'
  showDialog.value = true
}

function formatDialogTime(time) {
  if (!time) return ''

  const [hour, minute] = time.split(':').map(Number)

  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${
    hour >= 12 ? 'PM' : 'AM'
  }`
}

function formatDialogDate(date) {
  if (!date) return ''

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila'
  })
}

const dialogTitle = computed(() => {
  switch (dialogAction.value) {
    case 'Reschedule':
      return 'Reschedule this Appointment?'
    case 'Confirm':
      return 'Confirm this Appointment?'
    case 'Complete':
      return 'Complete this Appointment?'
    case 'Cancel':
      return 'Cancel this Appointment?'
    case 'No-show':
      return 'No-show this Appointment?'
    default:
      return 'Confirm this action?'
  }
})

const dialogMessage = computed(() => {
  const appointment = selectedAppointment.value

  if (!appointment) return ''

  const date = rescheduleValues.value?.date || appointment.date
  const time = rescheduleValues.value?.time || appointment.time

  return `${appointment.student} · ${appointment.type} · ${formatDialogDate(date)} at ${formatDialogTime(time)}`
})

const dialogConfirmText = computed(() => {
  switch (dialogAction.value) {
    case 'Reschedule':
      return 'Confirm changes'
    case 'Confirm':
      return 'Confirm appointment'
    case 'Complete':
      return 'Confirm completed'
    case 'Cancel':
      return 'Confirm cancelled'
    case 'No-show':
      return 'Confirm no-show'
    default:
      return 'Confirm'
  }
})

function confirmAction() {
  const appointment = appointments.value.find(
    item => item.id === selectedAppointment.value?.id
  )

  if (!appointment) return

  if (dialogAction.value === 'Confirm') {
    appointment.status = 'Confirmed'
  } else if (dialogAction.value === 'Complete') {
    appointment.status = 'Completed'
  } else if (dialogAction.value === 'Cancel') {
    appointment.status = 'Cancelled'
  } else if (dialogAction.value === 'No-show') {
    appointment.status = 'No-show'
  } else if (
    dialogAction.value === 'Reschedule' &&
    rescheduleValues.value
  ) {
    appointment.date = rescheduleValues.value.date
    appointment.time = rescheduleValues.value.time
    appointment.status = 'Pending'
    activePage.value = 'Appointments'
  }

  showDialog.value = false
  selectedAppointment.value = null
  rescheduleValues.value = null
}

function formatSessionDate(date) {
  if (!date) return ''

  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila'
  })
}

function formatSessionTime(time) {
  if (!time) return ''

  const [hour, minute] = time.split(':').map(Number)

  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${
    hour >= 12 ? 'PM' : 'AM'
  }`
}

// Logout modal
function logout() {
  showLogoutDialog.value = true
}

function cancelLogout() {
  showLogoutDialog.value = false
}

function confirmLogout() {
  showLogoutDialog.value = false
  isLoggedIn.value = false
  activePage.value = 'Dashboard'
}

function handleLogin() {
  isLoggedIn.value = true
  activePage.value = 'Dashboard'
  activeFilter.value = 'All'
  searchText.value = ''
}
</script>

<template>
  <LoginView
    v-if="!isLoggedIn"
    @login="handleLogin"
  />

  <div v-else class="app-shell">
    <AppHeader />

    <div class="app-body">
      <AppSidebar
        :active-page="activePage"
        @navigate="navigate"
        @logout="logout"
      />

      <main class="main-content">
        <DashboardView
          v-if="activePage === 'Dashboard'"
          :appointments="todayAppointments"
          :completed-count="completedCount"
          @navigate="navigate"
        />

        <AppointmentsView
          v-else-if="activePage === 'Appointments'"
          :appointments="visibleAppointments"
          :active-filter="activeFilter"
          :search-text="searchText"
          @update:active-filter="activeFilter = $event"
          @update:search-text="searchText = $event"
          @action="openAction"
          @reschedule="openReschedule"
        />

        <HistoryView
          v-else-if="activePage === 'History'"
          :appointments="historyAppointments"
          :active-filter="activeFilter"
          :search-text="searchText"
          @update:active-filter="activeFilter = $event"
          @update:search-text="searchText = $event"
        />

        <ProfileView
          v-else-if="activePage === 'Profile'"
        />

        <RescheduleView
          v-else-if="activePage === 'Reschedule'"
          :appointment="selectedAppointment"
          @save="reviewReschedule"
          @cancel="navigate('Appointments')"
        />

        <!-- Notifications -->
        <section
          v-else-if="activePage === 'Notifications'"
          class="notifications-page"
        >
          <header class="notifications-heading">
            <h1>Notifications</h1>
            <p>Select an update to open the related transaction.</p>
          </header>

          <div class="notification-toolbar">
            <button
              class="mark-read-button"
              :disabled="unreadCount === 0"
              @click="markAllAsRead"
            >
              Mark all as read
            </button>
          </div>

          <div class="notification-list">
            <article
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-card"
              :class="{ 'is-read': notification.read }"
            >
              <span
                class="notification-dot"
                :class="{ 'dot-read': notification.read }"
                aria-hidden="true"
              ></span>

              <div class="notification-content">
                <h2>{{ notification.title }}</h2>
                <p>
                  {{ notification.date }} · {{ notification.time }}
                </p>
              </div>

              <button
                class="notification-open"
                @click="openNotification(notification)"
              >
                Open
              </button>
            </article>

            <p
              v-if="notifications.length === 0"
              class="notification-empty"
            >
              You're all caught up. No notifications available.
            </p>
          </div>
        </section>

        <!-- Guidance Sessions -->
        <section
          v-else-if="activePage === 'Guidance Sessions'"
          class="guidance-page"
        >
          <header class="guidance-heading">
            <div>
              <h1>Guidance Sessions</h1>
              <p>
                Select a guidance appointment before session actions
                become available.
              </p>
            </div>

            <button
              class="record-button"
              @click="navigate('Appointments')"
            >
              Record Return
            </button>
          </header>

          <div class="guidance-list">
            <article
              v-for="session in guidanceSessions"
              :key="session.id"
              class="guidance-card"
            >
              <div class="guidance-info">
                <strong>{{ session.student }}</strong>
                <span>{{ session.type }}</span>
                <small>
                  {{ formatSessionDate(session.date) }} ·
                  {{ formatSessionTime(session.time) }}
                </small>
              </div>

              <button
                class="view-session-button"
                @click="openGuidanceSession(session)"
              >
                View Appointment
              </button>
            </article>
          </div>
        </section>

        <GuidanceSessionDetails
          v-else-if="activePage === 'Guidance Sessions Details'"
          :appointment="selectedGuidanceSession"
          @back="navigate('Guidance Sessions')"
          @navigate="navigate"
          @session-action="updateGuidanceSession"
          @save-notes="saveGuidanceNotes"
        />

        <!-- Students: only one Students component import is used -->
        <Students
          v-else-if="activePage === 'Students'"
        />

        <ScheduleView
          v-else-if="activePage === 'Schedule'"
          @navigate="navigate"
        />

        <PlaceholderView
          v-else
          :page-title="activePage"
          @navigate="navigate"
        />
      </main>
    </div>

    <ConfirmDialog
      :visible="showDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      :confirm-text="dialogConfirmText"
      :danger="['Cancel', 'No-show'].includes(dialogAction)"
      @confirm="confirmAction"
      @close="showDialog = false"
    />

    <Teleport to="body">
      <div
        v-if="showLogoutDialog"
        class="logout-overlay"
        @click.self="cancelLogout"
      >
        <section
          class="logout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div class="logout-modal-heading">
            <div class="logout-icon" aria-hidden="true">!</div>

            <h2 id="logout-title">
              Log Out of LiceoQServe?
            </h2>
          </div>

          <p class="logout-message">
            You will return to the login screen.
          </p>

          <div class="logout-actions">
            <button
              class="logout-cancel"
              type="button"
              @click="cancelLogout"
            >
              Go Back
            </button>

            <button
              class="logout-confirm"
              type="button"
              @click="confirmLogout"
            >
              Log Out
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style>
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
  padding: 0;
}

body {
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  color: #39090c;
  background: #efdfdf;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: default;
  opacity: 0.45;
}

.app-shell {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background: #efdfdf;
}

.app-body {
  display: grid;
  grid-template-columns: 225px minmax(0, 1fr);
  width: 100%;
  min-height: calc(100vh - 89px);
  margin: 0;
  padding: 0;
  gap: 0;
}

.main-content {
  min-width: 0;
  padding: 25px 24px;
  overflow-x: hidden;
  background: #efdfdf;
}

.page-heading {
  margin-bottom: 22px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card,
.panel,
.appointment-card,
.reschedule-panel {
  background: #f8eeee;
  border: 1px solid #c9b8b8;
  border-radius: 12px;
}

.stat-card {
  padding: 20px;
}

.stat-card strong {
  display: block;
  margin: 10px 0;
  font-size: 30px;
}

.appointment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 0;
  border-top: 1px solid #eadada;
}

.status-badge {
  display: inline-block;
  padding: 6px 10px;
  font-size: 11px;
  border-radius: 20px;
  background: #f2e5c8;
  color: #75551a;
}

.status-badge.confirmed,
.status-badge.completed {
  background: #c6e4ce;
  color: #356344;
}

.status-badge.cancelled,
.status-badge.no-show {
  background: #f3d5d7;
  color: #912e36;
}

.status-badge.pending {
  background: #f2e5c8;
  color: #75551a;
}

/* Shared buttons */
.primary-button,
.outline-button {
  padding: 10px 14px;
  border-radius: 7px;
  cursor: pointer;
}

.primary-button {
  color: white;
  background: #650f18;
  border: 1px solid #650f18;
}

.outline-button {
  color: #650f18;
  background: #fffafa;
  border: 1px solid #d7b9bb;
}

/* Notifications */
.notifications-page {
  width: 100%;
  min-width: 0;
}

.notifications-heading {
  margin-bottom: 7px;
}

.notifications-heading h1 {
  margin: 0;
  color: #39090c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 29px;
  font-weight: normal;
  line-height: 1.3;
}

.notifications-heading p {
  margin: 0;
  color: #39090c;
  font-size: 14px;
}

.notification-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 27px;
  margin-top: 0;
}

.mark-read-button {
  padding: 4px 6px;
  color: #51090e;
  background: transparent;
  border: 0;
  font-size: 14px;
  font-weight: 600;
}

.mark-read-button:not(:disabled):hover {
  text-decoration: underline;
}

.notification-list {
  display: grid;
  gap: 16px;
  padding: 0 11px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-height: 75px;
  padding: 17px 14px;
  background: #f8eeee;
  border: 1px solid #a8787c;
  border-radius: 15px;
  transition: background 0.15s ease;
}

.notification-card.is-read {
  background: #f5ebeb;
  border-color: #c6a6a7;
  color: #987d7e;
}

.notification-dot {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: #650f18;
}

.notification-dot.dot-read {
  background: #ad898b;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h2 {
  margin: 0;
  color: #290d0e;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.notification-content p {
  margin: 6px 0 0;
  color: #432c2d;
  font-size: 11px;
  line-height: 1.4;
}

.notification-card.is-read .notification-content h2,
.notification-card.is-read .notification-content p {
  color: #987d7e;
}

.notification-open {
  flex-shrink: 0;
  align-self: center;
  padding: 5px 10px;
  color: #b00009;
  background: transparent;
  border: 0;
  font-size: 14px;
  font-weight: 500;
}

.notification-open:hover {
  text-decoration: underline;
}

.notification-card.is-read .notification-open {
  color: #d66d70;
}

.notification-empty {
  padding: 24px 10px;
  color: #775f60;
  font-size: 13px;
  text-align: center;
}

/* Guidance Sessions */
.guidance-page {
  width: 100%;
  min-width: 0;
}

.guidance-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.guidance-heading h1 {
  margin: 0;
  color: #39090c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 29px;
  font-weight: normal;
}

.guidance-heading p {
  margin: 4px 0 0;
  font-size: 12px;
}

.record-button {
  padding: 8px 13px;
  color: #fffafa;
  background: #51090e;
  border: 1px solid #51090e;
  border-radius: 6px;
  font-size: 11px;
}

.guidance-list {
  width: 100%;
  overflow: hidden;
  background: #f8eeee;
  border: 1px solid #bda0a1;
  border-radius: 12px;
}

.guidance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 15px 12px;
  background: #f8eeee;
}

.guidance-card + .guidance-card {
  border-top: 1px solid #bda0a1;
}

.guidance-card:first-child {
  background: #dfc1c2;
}

.guidance-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.guidance-info strong {
  font-size: 13px;
}

.guidance-info span,
.guidance-info small {
  font-size: 10px;
}

.guidance-info small {
  color: #594545;
}

.view-session-button {
  flex-shrink: 0;
  padding: 6px 9px;
  color: #51090e;
  background: transparent;
  border: 0;
  font-size: 10px;
  font-weight: bold;
}

.view-session-button:hover {
  text-decoration: underline;
}

/* Logout confirmation */
.logout-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(25, 12, 13, 0.38);
}

.logout-modal {
  width: 100%;
  max-width: 475px;
  padding: 22px 20px 24px;
  color: #39090c;
  background: #f8eeee;
  border-radius: 17px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.logout-modal-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-icon {
  display: flex;
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  color: #fffafa;
  background: #b18487;
  border-radius: 12px;
  font-size: 30px;
  font-weight: bold;
}

.logout-modal-heading h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 27px;
  font-weight: normal;
}

.logout-message {
  margin: 24px 14px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.35;
}

.logout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 26px;
}

.logout-actions button {
  min-width: 127px;
  padding: 12px 18px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
}

.logout-cancel {
  color: #39090c;
  background: transparent;
  border: 1px solid #51090e;
}

.logout-confirm {
  color: #fffafa;
  background: #51090e;
  border: 1px solid #51090e;
}

.logout-cancel:hover {
  background: #ead6d7;
}

.logout-confirm:hover {
  background: #710f18;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .app-body {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .main-content {
    padding: 20px 16px;
  }

  .notification-list {
    padding: 0;
  }
}

@media (max-width: 600px) {
  .app-body {
    grid-template-columns: 1fr;
  }

  .main-content {
    padding: 14px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .notifications-heading h1,
  .guidance-heading h1 {
    font-size: 25px;
  }

  .notification-card {
    gap: 8px;
    padding: 14px 10px;
  }

  .notification-content h2 {
    font-size: 14px;
  }

  .notification-open {
    padding: 5px;
    font-size: 12px;
  }

  .guidance-card {
    align-items: flex-start;
    gap: 8px;
    padding: 13px 10px;
  }

  .view-session-button {
    max-width: 105px;
    white-space: normal;
    text-align: right;
  }

  .logout-modal-heading h2 {
    font-size: 21px;
  }

  .logout-message {
    margin: 20px 0;
    font-size: 15px;
  }

  .logout-actions button {
    min-width: 0;
    flex: 1;
  }
}
</style>
