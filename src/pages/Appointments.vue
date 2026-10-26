<script setup>

import { ref, computed, watch } from 'vue'

const emit = defineEmits(['reschedule'])

const filters = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-Show'
]

const STORAGE_KEY = 'appointmentsData'

const defaultAppointments = [
  {
    id: 'OSA-2026-0099',
    date: '2026-10-04',
    time: '13:00',
    student: 'Maria Santos',
    studentId: '2022-00341',
    service: 'Student ID Application',
    status: 'Pending'
  }
]

function loadAppointments() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : [...defaultAppointments]
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultAppointments)
    )

    return defaultAppointments.map(appointment => ({ ...appointment }))
  } catch (error) {
    console.error('Unable to load appointments:', error)
    return defaultAppointments.map(appointment => ({ ...appointment }))
  }
}

const appointments = ref(loadAppointments())
const selectedFilter = ref('All')

const showModal = ref(false)
const selectedAppointment = ref(null)
const selectedAction = ref('')

const modalContent = computed(() => {
  const content = {
    confirm: {
      title: 'Confirm this appointment?',
      button: 'Confirm appointment',
      tone: 'maroon'
    },
    completed: {
      title: 'Completed this appointment?',
      button: 'Confirm completed',
      tone: 'maroon'
    },
    cancel: {
      title: 'Cancel this appointment?',
      button: 'Confirm Cancelled',
      tone: 'red'
    },
    noShow: {
      title: 'No-Show this appointment?',
      button: 'Confirm no-show',
      tone: 'red'
    }
  }

  return content[selectedAction.value] || content.confirm
})

const filteredAppointments = computed(() => {
  if (selectedFilter.value === 'All') {
    return appointments.value
  }

  return appointments.value.filter(
    appointment => appointment.status === selectedFilter.value
  )
})

function saveAppointments() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appointments.value)
    )
    return true
  } catch (error) {
    console.error('Unable to save appointments:', error)
    window.alert('Unable to save the appointment. Please try again.')
    return false
  }
}

function formatDate(date) {
  if (!date) return 'Date not set'

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-')
    const months = [
      'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
      'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
    ]

    return `${months[Number(month) - 1]} ${Number(day)}, ${year}`
  }

  return date
}

function formatTime(time) {
  if (!time) return 'Time not set'

  if (/^\d{1,2}:\d{2}$/.test(time)) {
    const [hourString, minutes] = time.split(':')
    const hour = Number(hourString)

    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  return time
}

function getStudentName(appointment) {
  return appointment?.student || appointment?.studentName || 'Student'
}

function openModal(appointment, action) {
  selectedAppointment.value = appointment
  selectedAction.value = action
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedAppointment.value = null
  selectedAction.value = ''
}

function confirmAction() {
  if (!selectedAppointment.value) return

  const statusMap = {
    confirm: 'Confirmed',
    completed: 'Completed',
    cancel: 'Cancelled',
    noShow: 'No-Show'
  }

  const newStatus = statusMap[selectedAction.value]

  if (!newStatus) return

  const appointment = appointments.value.find(
    item => String(item.id) === String(selectedAppointment.value.id)
  )

  if (!appointment) {
    closeModal()
    window.alert('Appointment not found.')
    return
  }

  const previousStatus = appointment.status
  appointment.status = newStatus

  if (!saveAppointments()) {
    appointment.status = previousStatus
    return
  }

  closeModal()
}

function rescheduleAppointment(appointment) {
  emit('reschedule', { ...appointment })
}

watch(selectedFilter, () => {
  // Keep the selected filter in sync with the displayed list.
})

</script>

<template>

  <section class="appointments-page">

    <header class="appointments-heading">
      <h1>APPOINTMENTS</h1>
      <p>
        Confirm, reschedule and complete Office of Student Affairs appointments.
      </p>
    </header>

    <nav class="appointment-filters">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        class="filter-button"
        :class="{ active: selectedFilter === filter }"
        @click="selectedFilter = filter"
      >
        {{ filter }}
      </button>
    </nav>

    <div class="appointment-list">

      <article
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        class="appointment-card"
      >

        <div class="appointment-date">
          <span>{{ formatDate(appointment.date) }}</span>
          <span>{{ formatTime(appointment.time) }}</span>
        </div>

        <h2 class="appointment-title">
          {{ getStudentName(appointment) }} · {{ appointment.service }}
        </h2>

        <p class="appointment-reference">
          {{ appointment.studentId }} · {{ appointment.id }}
        </p>

        <div class="appointment-actions">

          <button
            v-if="appointment.status === 'Pending'"
            type="button"
            class="action-button primary-action"
            @click="openModal(appointment, 'confirm')"
          >
            Confirm
          </button>

          <button
            v-if="['Pending', 'Confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="rescheduleAppointment(appointment)"
          >
            Reschedule
          </button>

          <button
            v-if="['Pending', 'Confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="openModal(appointment, 'completed')"
          >
            Mark Completed
          </button>

          <button
            v-if="['Pending', 'Confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="openModal(appointment, 'cancel')"
          >
            Cancel
          </button>

          <button
            v-if="['Pending', 'Confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="openModal(appointment, 'noShow')"
          >
            No-Show
          </button>

          <!-- Pending is hidden; other status badges remain unchanged. -->
          <span
            v-if="appointment.status !== 'Pending'"
            class="status-badge"
            :class="appointment.status.toLowerCase().replace(/[^a-z]+/g, '-')"
          >
            {{ appointment.status }}
          </span>

        </div>
      </article>

      <div
        v-if="filteredAppointments.length === 0"
        class="empty-state"
      >
        No appointments found for this status.
      </div>

    </div>

    <Teleport to="body">
      <div
        v-if="showModal && selectedAppointment"
        class="modal-overlay"
        @click.self="closeModal"
        @keydown.esc="closeModal"
      >
        <section
          class="action-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="modalContent.title"
        >

          <div class="modal-heading">
            <div class="warning-icon" aria-hidden="true">
              <span>!</span>
            </div>

            <h2>{{ modalContent.title }}</h2>
          </div>

          <p class="modal-description">
            {{ getStudentName(selectedAppointment) }} ·
            {{ selectedAppointment.service }} ·
            {{ formatDate(selectedAppointment.date) }} at
            {{ formatTime(selectedAppointment.time) }}
          </p>

          <div class="modal-actions">
            <button
              type="button"
              class="modal-button modal-back-button"
              @click="closeModal"
            >
              Go Back
            </button>

            <button
              type="button"
              class="modal-button modal-confirm-button"
              :class="`tone-${modalContent.tone}`"
              @click="confirmAction"
            >
              {{ modalContent.button }}
            </button>
          </div>

        </section>
      </div>
    </Teleport>

  </section>

</template>

<style scoped>
.appointments-page {
  width: 100%;
  min-height: 100%;
  color: #35080b;
}

.appointments-heading {
  margin: 23px 8px 28px;
}

.appointments-heading h1 {
  margin: 0;
  color: #59080e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 700;
}

.appointments-heading p {
  margin: 7px 0 0;
  color: #927879;
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 1.5;
}

.appointment-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin: 0 28px 12px;
}

.filter-button {
  min-height: 33px;
  padding: 7px 14px;
  border: 1px solid #7a252b;
  border-radius: 22px;
  background: transparent;
  color: #39090d;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.filter-button:hover,
.filter-button.active {
  background: #59080e;
  color: #ffffff;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 0 15px 25px;
}

.appointment-card {
  width: 100%;
  max-width: 600px;
  padding: 14px 16px 17px;
  border: 1px solid #e2c6c7;
  border-radius: 14px;
  background: #f8eeee;
}

.appointment-date {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 6px;
  color: #a18485;
  font-family: Arial, sans-serif;
  font-size: 10px;
  text-transform: uppercase;
}

.appointment-title {
  margin: 0 0 5px;
  color: #321014;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 12px;
  font-weight: 700;
}

.appointment-reference {
  margin: 0;
  color: #a18485;
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.appointment-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 17px;
}

.action-button {
  min-height: 21px;
  padding: 4px 8px;
  border: 1px solid #7c363b;
  border-radius: 12px;
  background: transparent;
  color: #39090d;
  font-family: Arial, sans-serif;
  font-size: 9px;
  white-space: nowrap;
  cursor: pointer;
}

.action-button:hover {
  background: #ead5d6;
}

.primary-action {
  background: #59080e;
  color: #ffffff;
}

.primary-action:hover {
  background: #760d15;
  color: #ffffff;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  background: #ead5d6;
  color: #59080e;
  font-family: Arial, sans-serif;
  font-size: 9px;
  font-weight: 700;
}

.status-badge.confirmed {
  background: #d8ead9;
  color: #285b31;
}

.status-badge.completed {
  background: #d8ead9;
  color: #285b31;
}

.status-badge.cancelled,
.status-badge.no-show {
  background: #f3dada;
  color: #a20f19;
}

.empty-state {
  width: 100%;
  max-width: 600px;
  padding: 30px 20px;
  border: 1px solid #e2c6c7;
  border-radius: 12px;
  color: #927879;
  font-family: Arial, sans-serif;
  font-size: 13px;
  text-align: center;
}

/* Confirmation modal: layout follows the supplied screenshots. */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 20px;
  background: rgb(25 12 13 / 42%);
}

.action-modal {
  width: 100%;
  max-width: 400px;
  padding: 16px;
  border: 1px solid #ead9da;
  border-radius: 13px;
  background: #f8eeee;
  box-shadow: 0 12px 35px rgb(0 0 0 / 12%);
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 17px;
}

.warning-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 62px;
  height: 50px;
  border-radius: 11px;
  background: #a77b7f;
  color: #ffffff;
}

.warning-icon span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #650c14;
  font-family: Arial, sans-serif;
  font-size: 23px;
  font-weight: 700;
  line-height: 1;
}

.modal-heading h2 {
  margin: 0;
  color: #35080b;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.35;
}

.modal-description {
  margin: 18px 16px 26px;
  color: #351a1c;
  font-family: Arial, sans-serif;
  font-size: 15px;
  letter-spacing: 0.3px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.modal-actions {
  display: flex;
  gap: 7px;
  width: 100%;
}

.modal-button {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 37px;
  padding: 8px 10px;
  border: 1px solid #6e3d40;
  border-radius: 13px;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}

.modal-back-button {
  background: transparent;
  color: #35080b;
}

.modal-back-button:hover {
  background: #efdfdf;
}

.modal-confirm-button.tone-maroon {
  border-color: #59080e;
  background: #59080e;
  color: #ffffff;
}

.modal-confirm-button.tone-maroon:hover {
  background: #760d15;
}

.modal-confirm-button.tone-red {
  border-color: #d00000;
  background: #d00000;
  color: #ffffff;
}

.modal-confirm-button.tone-red:hover {
  background: #b90000;
}

@media (max-width: 700px) {
  .appointments-heading {
    margin: 15px 0 22px;
  }

  .appointment-filters {
    gap: 7px;
    margin: 0 0 22px;
  }

  .appointment-list {
    padding: 0 0 20px;
  }

  .appointment-card {
    max-width: 100%;
  }
}

@media (max-width: 420px) {
  .filter-button {
    padding: 7px 10px;
    font-size: 11px;
  }

  .action-modal {
    padding: 14px;
  }

  .modal-heading {
    gap: 11px;
  }

  .warning-icon {
    width: 48px;
    height: 45px;
  }

  .modal-heading h2 {
    font-size: 18px;
  }

  .modal-description {
    margin: 18px 5px 22px;
    font-size: 13px;
  }

  .modal-button {
    padding: 8px 6px;
    font-size: 10px;
  }
}
</style>
