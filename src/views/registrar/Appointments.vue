
<template>
  <div class="appointments-page">
    <div class="page-heading">
      <h1>Appointments</h1>
      <p>Confirm, reschedule and complete Registrar appointments.</p>
    </div>

    <div class="status-filters">
      <button
        v-for="status in statuses"
        :key="status"
        type="button"
        class="filter-button"
        :class="{ active: activeStatus === status }"
        @click="activeStatus = status"
      >
        <span v-if="status === 'All'" class="all-icon">▦</span>
        {{ status }}
        <span v-if="status !== 'All'" class="filter-count">
          {{ countStatus(status) }}
        </span>
      </button>
    </div>

    <section class="appointment-list">
      <article
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        class="appointment-card"
      >
        <div class="appointment-main">
          <div class="appointment-topline">
            <span class="appointment-id">{{ appointment.id }}</span>
            <span
              class="status-badge"
              :class="statusClass(appointment.status)"
            >
              {{ appointment.status }}
            </span>
          </div>

          <h2>{{ appointment.service }}</h2>

          <div class="appointment-details">
            <span class="detail-item">
              <span class="detail-icon">♙</span>
              {{ appointment.student }}
            </span>

            <span class="detail-item">
              <span class="detail-icon">▦</span>
              {{ formatDate(appointment.date) }}
            </span>

            <span class="detail-item">
              <span class="detail-icon">◷</span>
              {{ formatTime(appointment.time) }}
            </span>
          </div>

          <p v-if="appointment.note" class="appointment-note">
            {{ appointment.note }}
          </p>

          <div class="appointment-actions">
            <button
              v-if="appointment.status === 'Pending'"
              class="action-button primary"
              type="button"
              @click="updateStatus(appointment, 'Confirmed')"
            >
              Confirm
            </button>

            <button
              v-if="appointment.status === 'Confirmed'"
              class="action-button primary"
              type="button"
              @click="updateStatus(appointment, 'Completed')"
            >
              Mark Completed
            </button>

            <button
              v-if="['Pending', 'Confirmed'].includes(appointment.status)"
              class="action-button secondary"
              type="button"
              @click="openReschedule(appointment)"
            >
              Reschedule
            </button>

            <button
              v-if="['Pending', 'Confirmed'].includes(appointment.status)"
              class="action-button cancel"
              type="button"
              @click="cancelAppointment(appointment)"
            >
              Cancel
            </button>
          </div>
        </div>
      </article>

      <div
        v-if="filteredAppointments.length === 0"
        class="empty-state"
      >
        <div class="empty-symbol">▦</div>
        <h2>No appointments found</h2>
        <p>There are no appointments under this status.</p>
        <button
          type="button"
          class="action-button secondary"
          @click="activeStatus = 'All'"
        >
          View All Appointments
        </button>
      </div>
    </section>

    <!-- Reschedule dialog -->
    <div
      v-if="rescheduleTarget"
      class="modal-overlay"
      @click.self="closeReschedule"
    >
      <section
        class="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-title"
      >
        <div class="modal-heading">
          <div>
            <span class="modal-eyebrow">APPOINTMENT MANAGEMENT</span>
            <h2 id="reschedule-title">Reschedule Appointment</h2>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close"
            @click="closeReschedule"
          >
            ×
          </button>
        </div>

        <p class="modal-description">
          Update the appointment schedule for
          <strong>{{ rescheduleTarget.student }}</strong>.
        </p>

        <form @submit.prevent="saveReschedule">
          <label for="new-date">Appointment Date</label>
          <input
            id="new-date"
            v-model="newDate"
            type="date"
            :min="todayISO"
            required
          />

          <label for="new-time">Appointment Time</label>
          <select id="new-time" v-model="newTime" required>
            <option disabled value="">Select a time</option>
            <option
              v-for="time in timeSlots"
              :key="time"
              :value="time"
            >
              {{ formatTime(time) }}
            </option>
          </select>

          <p v-if="formError" class="form-error" role="alert">
            {{ formError }}
          </p>

          <div class="modal-actions">
            <button
              type="button"
              class="action-button secondary"
              @click="closeReschedule"
            >
              Back
            </button>

            <button type="submit" class="action-button primary">
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- Action feedback -->
    <div v-if="message" class="feedback-message" role="status">
      <span>✓</span>
      {{ message }}
      <button
        type="button"
        aria-label="Dismiss"
        @click="message = ''"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const statuses = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-show'
]

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  date.setDate(date.getDate() + amount)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

const todayISO = getLocalDate()
const activeStatus = ref('All')
const message = ref('')
const rescheduleTarget = ref(null)
const newDate = ref('')
const newTime = ref('')
const formError = ref('')

const timeSlots = [
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00'
]

const appointments = ref([
  {
    id: 'APT-001',
    student: 'Maria Santos',
    service: 'Form 137',
    date: todayISO,
    time: '09:00',
    status: 'Confirmed',
    note: 'Academic records request'
  },
  {
    id: 'APT-002',
    student: 'Juan Dela Cruz',
    service: 'Transcript of Records',
    date: addDays(todayISO, 1),
    time: '10:00',
    status: 'Pending',
    note: 'Document request'
  },
  {
    id: 'APT-003',
    student: 'Nina Reyes',
    service: 'Certificate of Enrollment',
    date: addDays(todayISO, 1),
    time: '13:30',
    status: 'Confirmed',
    note: 'Enrollment verification'
  },
  {
    id: 'APT-004',
    student: 'Carlo Mendoza',
    service: 'Good Moral Certificate',
    date: addDays(todayISO, 2),
    time: '09:30',
    status: 'Pending',
    note: 'Certificate request'
  },
  {
    id: 'APT-005',
    student: 'Eliza Flores',
    service: 'Transcript of Records',
    date: addDays(todayISO, -1),
    time: '14:00',
    status: 'Completed',
    note: 'Academic records request'
  },
  {
    id: 'APT-006',
    student: 'Mark Ramos',
    service: 'Student Record Inquiry',
    date: addDays(todayISO, 2),
    time: '10:30',
    status: 'Cancelled',
    note: ''
  },
  {
    id: 'APT-007',
    student: 'Grace Lim',
    service: 'Certificate of Enrollment',
    date: addDays(todayISO, -1),
    time: '11:00',
    status: 'No-show',
    note: ''
  }
])

const filteredAppointments = computed(() => {
  return appointments.value
    .filter(appointment =>
      activeStatus.value === 'All' ||
      appointment.status === activeStatus.value
    )
    .sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    )
})

function countStatus(status) {
  return appointments.value.filter(
    appointment => appointment.status === status
  ).length
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(value) {
  const [hour, minute] = value.split(':').map(Number)
  const date = new Date()

  date.setHours(hour, minute, 0, 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function updateStatus(appointment, status) {
  appointment.status = status

  message.value = status === 'Confirmed'
    ? `${appointment.student}'s appointment has been confirmed.`
    : `${appointment.student}'s appointment has been completed.`
}

function cancelAppointment(appointment) {
  if (!window.confirm(`Cancel the appointment for ${appointment.student}?`)) {
    return
  }

  appointment.status = 'Cancelled'
  message.value = `${appointment.id} has been cancelled.`
}

function openReschedule(appointment) {
  rescheduleTarget.value = appointment
  newDate.value = appointment.date
  newTime.value = appointment.time
  formError.value = ''
}

function closeReschedule() {
  rescheduleTarget.value = null
  newDate.value = ''
  newTime.value = ''
  formError.value = ''
}

function saveReschedule() {
  if (!rescheduleTarget.value || !newDate.value || !newTime.value) {
    formError.value = 'Please choose an appointment date and time.'
    return
  }

  if (newDate.value < todayISO) {
    formError.value = 'Please select today or a future date.'
    return
  }

  const conflict = appointments.value.some(appointment =>
    appointment.id !== rescheduleTarget.value.id &&
    appointment.date === newDate.value &&
    appointment.time === newTime.value &&
    appointment.status === 'Confirmed'
  )

  if (conflict) {
    formError.value =
      'That time is already assigned to a confirmed appointment.'
    return
  }

  rescheduleTarget.value.date = newDate.value
  rescheduleTarget.value.time = newTime.value

  message.value =
    `${rescheduleTarget.value.student}'s appointment has been rescheduled.`

  closeReschedule()
}
</script>

<style scoped>
/* Base typography — matched to Dashboard */
.appointments-page {
  padding: 3px 2px 24px;
  color: #4c2026;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

.page-heading {
  margin: 0 0 22px;
}

.page-heading h1 {
  margin: 0;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.2;
}

.page-heading p {
  margin: 7px 0 0;
  color: #887477;
  font-size: 15px;
  line-height: 1.5;
}

.status-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 19px;
}

.filter-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 22px;
  background: #fff;
  color: #75565b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.filter-button:hover {
  border-color: #e6cdd0;
  background: #f8eeee;
}

.filter-button.active {
  background: #650b18;
  color: #fff;
}

.all-icon {
  font-size: 15px;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 19px;
  padding: 0 4px;
  border-radius: 12px;
  background: #f2e2e3;
  color: #650b18;
  font-size: 11px;
}

.filter-button.active .filter-count {
  background: #fff;
  color: #650b18;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appointment-card {
  overflow: hidden;
  border: 1px solid #e6cdd0;
  border-radius: 12px;
  background: #f9f0f0;
  box-shadow: 0 2px 6px rgb(80 7 14 / 3%);
}

.appointment-main {
  padding: 16px 18px;
}

.appointment-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.appointment-id {
  color: #8b6268;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 18px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.pending {
  background: #f6e9b9;
  color: #876818;
}

.status-badge.confirmed {
  background: #dcefe2;
  color: #367653;
}

.status-badge.completed {
  background: #e6e2e2;
  color: #62595a;
}

.status-badge.cancelled {
  background: #f4dfe1;
  color: #a33240;
}

.status-badge.no-show {
  background: #f1e3d7;
  color: #895334;
}

.appointment-main h2 {
  margin: 0 0 12px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.appointment-details {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px 20px;
}

.detail-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #765e62;
  font-size: 13px;
}

.detail-icon {
  color: #8c535b;
  font-size: 15px;
}

.appointment-note {
  margin: 12px 0 0;
  color: #927d81;
  font-size: 13px;
  line-height: 1.5;
}

.appointment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1px solid #ead6d8;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 8px 13px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.action-button.primary {
  background: #650b18;
  color: #fff;
}

.action-button.primary:hover {
  background: #4c0711;
}

.action-button.secondary {
  border-color: #d9b9be;
  background: #fff;
  color: #650b18;
}

.action-button.secondary:hover {
  background: #f3e3e5;
}

.action-button.cancel {
  border-color: #e7c7cb;
  background: #fff;
  color: #a33240;
}

.action-button.cancel:hover {
  background: #f9e7e9;
}

.empty-state {
  padding: 38px 20px;
  border: 1px solid #e6cdd0;
  border-radius: 12px;
  background: #f9f0f0;
  text-align: center;
}

.empty-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 13px;
  border-radius: 50%;
  background: #f0dcdf;
  color: #650b18;
  font-size: 22px;
}

.empty-state h2 {
  margin: 0 0 8px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 16px;
  color: #887477;
  font-size: 14px;
  line-height: 1.5;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(35 10 13 / 48%);
}

.modal-card {
  width: 100%;
  max-width: 440px;
  padding: 24px;
  border: 1px solid #e6cdd0;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 18px 55px rgb(0 0 0 / 18%);
}

.modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.modal-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #8c5a60;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.modal-heading h2 {
  margin: 0;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.close-button {
  border: 0;
  background: transparent;
  color: #887477;
  font-size: 25px;
  cursor: pointer;
}

.modal-description {
  margin: 15px 0;
  color: #887477;
  font-size: 14px;
  line-height: 1.6;
}

.modal-description strong {
  color: #50070e;
}

.modal-card form label {
  display: block;
  margin: 15px 0 7px;
  color: #59353a;
  font-size: 14px;
  font-weight: 700;
}

.modal-card input,
.modal-card select {
  box-sizing: border-box;
  width: 100%;
  padding: 11px;
  border: 1px solid #e2cbd0;
  border-radius: 7px;
  background: #fff;
  color: #4c2026;
  font-family: inherit;
  font-size: 14px;
  outline-color: #9b515a;
}

.form-error {
  margin: 12px 0 0;
  padding: 10px;
  border-radius: 6px;
  background: #fbe9ea;
  color: #a33240;
  font-size: 13px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 23px;
}

.feedback-message {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(400px, calc(100vw - 44px));
  padding: 13px 15px;
  border: 1px solid #d5e6d9;
  border-left: 4px solid #367653;
  border-radius: 8px;
  background: #fff;
  color: #345b42;
  box-shadow: 0 7px 24px rgb(45 20 24 / 12%);
  font-size: 14px;
}

.feedback-message > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #e1f0e6;
}

.feedback-message button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #66806d;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .page-heading h1 {
    font-size: 25px;
  }

  .page-heading p {
    font-size: 14px;
  }

  .status-filters {
    gap: 6px;
  }

  .filter-button {
    padding: 7px 10px;
    font-size: 12px;
  }

  .appointment-main {
    padding: 14px;
  }

  .appointment-main h2 {
    font-size: 18px;
  }

  .appointment-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 9px;
  }

  .modal-card {
    padding: 19px;
  }

  .modal-heading h2 {
    font-size: 21px;
  }
}
</style>