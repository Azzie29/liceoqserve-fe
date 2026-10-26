<script setup>
import { ref, computed, onMounted } from 'vue'

import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import LoginView from './views/LoginView.vue'

import Dashboard from './pages/Dashboard.vue'
import Appointments from './pages/Appointments.vue'
import Requests from './pages/Requests.vue'
import Students from './pages/Students.vue'
import Notifications from './pages/Notifications.vue'
import History from './pages/History.vue'
import Schedule from './pages/Schedule.vue'
import Profile from './pages/Profile.vue'
import RescheduleAppointment from './pages/RescheduleAppointment.vue'

const isLoggedIn = ref(
  sessionStorage.getItem('liceoqserveLoggedIn') === 'true'
)

const showLogoutConfirm = ref(false)

const activePage = ref('Dashboard')
const selectedAppointment = ref(null)
const appointmentsVersion = ref(0)

const pages = {
  Dashboard,
  Appointments,
  Request: Requests,
  Students,
  Notifications,
  History,
  Schedule,
  Profile
}

const currentPage = computed(() => {
  if (activePage.value === 'RescheduleAppointment') {
    return RescheduleAppointment
  }

  return pages[activePage.value] || Dashboard
})

function navigateToPage(page) {
  activePage.value = page

  if (page === 'Request') {
    selectedAppointment.value = null
  }
}

function openReschedule(appointment) {
  selectedAppointment.value = { ...appointment }
  activePage.value = 'RescheduleAppointment'
}

function saveRescheduledAppointment(updatedAppointment) {
  try {
    const saved = sessionStorage.getItem('appointmentsData')
    const appointments = saved ? JSON.parse(saved) : []

    const index = appointments.findIndex(
      item => String(item.id) === String(updatedAppointment.id)
    )

    if (index === -1) {
      window.alert(
        'Appointment not found. Please return to the appointment list.'
      )
      return
    }

    appointments[index] = {
      ...appointments[index],
      date: updatedAppointment.date,
      time: updatedAppointment.time
    }

    sessionStorage.setItem(
      'appointmentsData',
      JSON.stringify(appointments)
    )

    sessionStorage.removeItem('rescheduleAppointmentId')

    selectedAppointment.value = null
    activePage.value = 'Appointments'
    appointmentsVersion.value++

    window.alert('Appointment successfully rescheduled!')
  } catch (error) {
    console.error('Unable to save rescheduled appointment:', error)
    window.alert('Unable to save the new schedule. Please try again.')
  }
}

function cancelReschedule() {
  selectedAppointment.value = null
  sessionStorage.removeItem('rescheduleAppointmentId')
  activePage.value = 'Appointments'
}

function logout() {
  showLogoutConfirm.value = true
}

function cancelLogout() {
  showLogoutConfirm.value = false
}

function confirmLogout() {
  showLogoutConfirm.value = false
  isLoggedIn.value = false

  sessionStorage.removeItem('liceoqserveLoggedIn')
  sessionStorage.removeItem('returnToAppointments')
  sessionStorage.removeItem('rescheduleAppointmentId')

  selectedAppointment.value = null
  activePage.value = 'Dashboard'
}

function handleLogin() {
  isLoggedIn.value = true
  sessionStorage.setItem('liceoqserveLoggedIn', 'true')
  activePage.value = 'Dashboard'
}

onMounted(() => {
  const requestPage = sessionStorage.getItem('returnToAppointments')

  if (requestPage === 'true' && isLoggedIn.value) {
    activePage.value = 'Appointments'
    sessionStorage.removeItem('returnToAppointments')
  }
})
</script>

<template>
  <LoginView
    v-if="!isLoggedIn"
    @login="handleLogin"
  />

  <div v-else class="app-shell">
    <Header />

    <div class="app-layout">
      <Sidebar
        :active-page="
          activePage === 'RescheduleAppointment'
            ? 'Appointments'
            : activePage
        "
        @navigate="navigateToPage"
        @logout="logout"
      />

      <main class="main-content">
        <Appointments
          v-if="activePage === 'Appointments'"
          :key="appointmentsVersion"
          @reschedule="openReschedule"
        />

        <RescheduleAppointment
          v-else-if="activePage === 'RescheduleAppointment'"
          :appointment="selectedAppointment"
          @save="saveRescheduledAppointment"
          @cancel="cancelReschedule"
        />

        <component
          :is="currentPage"
          v-else
          @navigate="navigateToPage"
        />
      </main>
    </div>

    <div
      v-if="showLogoutConfirm"
      class="logout-overlay"
      @click.self="cancelLogout"
    >
      <section
        class="logout-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <div class="logout-heading">
          <div class="logout-icon">!</div>
          <h2 id="logout-title">Log Out QueueLess?</h2>
        </div>

        <p>You will return to the login screen.</p>

        <div class="logout-actions">
          <button
            type="button"
            class="logout-cancel"
            @click="cancelLogout"
          >
            Go Back
          </button>

          <button
            type="button"
            class="logout-confirm"
            @click="confirmLogout"
          >
            Yes, Log Out
          </button>
        </div>
      </section>
    </div>
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
  min-height: 100%;
  margin: 0;
}

body {
  background: #efdfdf;
}

.app-shell {
  min-height: 100vh;
  padding: 7px;
  background: #211e1e;
}

.app-layout {
  display: flex;
  min-height: calc(100vh - 101px);
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: calc(100vh - 101px);
  background: #efdfdf;
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
  background: rgba(20, 12, 12, 0.48);
}

.logout-dialog {
  width: 100%;
  max-width: 480px;
  padding: 28px;
  color: #39090c;
  background: #f8eeee;
  border: 1px solid #ead5d6;
  border-radius: 17px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.logout-heading {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-icon {
  display: flex;
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  color: #fffafa;
  background: #79353b;
  border-radius: 12px;
  font-size: 30px;
  font-weight: 700;
}

.logout-heading h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 25px;
}

.logout-dialog > p {
  margin: 30px 0;
  color: #806667;
  font-size: 15px;
  line-height: 1.5;
}

.logout-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.logout-actions button {
  min-height: 46px;
  padding: 0 17px;
  border: 1px solid #79353b;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.logout-cancel {
  color: #51090e;
  background: transparent;
}

.logout-confirm {
  color: #fffafa;
  background: #51090e;
}

.logout-confirm:hover {
  background: #650f18;
}

.logout-cancel:hover {
  background: #efdfdf;
}

@media (max-width: 600px) {
  .logout-dialog {
    padding: 22px;
  }

  .logout-heading h2 {
    font-size: 21px;
  }

  .logout-actions {
    flex-direction: column-reverse;
  }

  .logout-actions button {
    width: 100%;
  }
}
</style>
