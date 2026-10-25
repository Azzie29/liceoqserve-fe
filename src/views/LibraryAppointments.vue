
<script setup>
import { computed, ref } from 'vue'

import AppointmentFilters from '../components/AppointmentFilters.vue'
import AppointmentTable from '../components/AppointmentTable.vue'
import AppointmentConfirmationModal from '../components/AppointmentConfirmationModal.vue'
import RescheduleAppointmentModal from '../components/RescheduleAppointmentModal.vue'
import RescheduleReviewModal from '../components/RescheduleReviewModal.vue'

const search = ref('')
const status = ref('All')

const appointments = ref([
  {
    id: 'LIB-2026-0033',
    student: 'Rainier Amparo',
    purpose: 'Book Borrowing',
    date: 'Oct 25, 2026',
    time: '11:00 AM',
    status: 'Confirmed',
  },
  {
    id: 'LIB-2026-0034',
    student: 'Chloe Monteza',
    purpose: 'Room Reservation',
    date: 'Oct 26, 2026',
    time: '1:00 PM',
    status: 'Pending',
  },
  {
    id: 'LIB-2026-0035',
    student: 'Azzie Umbay',
    purpose: 'Book Return',
    date: 'Oct 27, 2026',
    time: '9:00 AM',
    status: 'Completed',
  },
])

// Complete, Cancel, and No-show popup
const showConfirmation = ref(false)
const selectedAppointment = ref(null)
const selectedAction = ref('complete')

// Reschedule form and review popup
const showReschedule = ref(false)
const showRescheduleReview = ref(false)
const rescheduleAppointmentData = ref(null)
const rescheduleDate = ref('')
const rescheduleTime = ref('')

const filteredAppointments = computed(() => {
  const term = search.value.trim().toLowerCase()

  return appointments.value.filter((item) => {
    const matchesSearch =
      item.student.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.purpose.toLowerCase().includes(term)

    const matchesStatus =
      status.value === 'All' || item.status === status.value

    return matchesSearch && matchesStatus
  })
})

const pendingCount = computed(
  () => appointments.value.filter(a => a.status === 'Pending').length,
)

const confirmedCount = computed(
  () => appointments.value.filter(a => a.status === 'Confirmed').length,
)

function openConfirmation(appointment, action) {
  selectedAppointment.value = appointment
  selectedAction.value = action
  showConfirmation.value = true
}

function closeConfirmation() {
  showConfirmation.value = false
  selectedAppointment.value = null
}

function confirmAction(action) {
  if (!selectedAppointment.value) return

  const newStatus = {
    complete: 'Completed',
    cancel: 'Cancelled',
    'no-show': 'No-show',
  }[action]

  if (newStatus) {
    selectedAppointment.value.status = newStatus
  }

  closeConfirmation()
}

function rescheduleAppointment(appointment) {
  rescheduleAppointmentData.value = appointment
  rescheduleDate.value = ''
  rescheduleTime.value = ''
  showReschedule.value = true
}

function reviewReschedule(changes) {
  rescheduleAppointmentData.value = changes.appointment
  rescheduleDate.value = changes.date
  rescheduleTime.value = changes.time

  showReschedule.value = false
  showRescheduleReview.value = true
}

function closeReschedule() {
  showReschedule.value = false
  rescheduleAppointmentData.value = null
  rescheduleDate.value = ''
  rescheduleTime.value = ''
}

function closeRescheduleReview() {
  showRescheduleReview.value = false
  showReschedule.value = true
}

function confirmReschedule() {
  const appointmentId = rescheduleAppointmentData.value?.id

  const appointment = appointments.value.find(
    item => item.id === appointmentId,
  )

  if (!appointment || !rescheduleDate.value || !rescheduleTime.value) {
    return
  }

  const [year, month, day] = rescheduleDate.value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  appointment.date = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  appointment.time = rescheduleTime.value
  appointment.status = 'Pending'

  showRescheduleReview.value = false
  rescheduleAppointmentData.value = null
  rescheduleDate.value = ''
  rescheduleTime.value = ''
}

function viewAppointment(appointment) {
  window.alert(
    `Appointment: ${appointment.id}\n` +
    `Student: ${appointment.student}\n` +
    `Purpose: ${appointment.purpose}\n` +
    `Date: ${appointment.date}\n` +
    `Time: ${appointment.time}\n` +
    `Status: ${appointment.status}`,
  )
}
</script>

<template>
  <main class="appointments-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">LIBRARY PORTAL / APPOINTMENTS</p>
        <h1>Appointments</h1>
        <p>Confirm, reschedule and complete Library Appointments</p>
      </div>

      <span class="total">
        {{ filteredAppointments.length }} appointments
      </span>
    </header>

    <section class="summary">
      <article>
        <span>Total Appointments</span>
        <strong>{{ appointments.length }}</strong>
      </article>

      <article>
        <span>Pending</span>
        <strong>{{ pendingCount }}</strong>
      </article>

      <article>
        <span>Confirmed</span>
        <strong>{{ confirmedCount }}</strong>
      </article>
    </section>

    <section class="records">
      <h2>Appointment Records</h2>

      <AppointmentFilters
        v-model:search="search"
        v-model:status="status"
      />

      <AppointmentTable
        :appointments="filteredAppointments"
        @view="viewAppointment"
        @complete="openConfirmation($event, 'complete')"
        @cancel="openConfirmation($event, 'cancel')"
        @no-show="openConfirmation($event, 'no-show')"
        @reschedule="rescheduleAppointment"
      />
    </section>

    <AppointmentConfirmationModal
      :show="showConfirmation"
      :action="selectedAction"
      :appointment="selectedAppointment || {}"
      @close="closeConfirmation"
      @confirm="confirmAction"
    />

    <RescheduleAppointmentModal
      :show="showReschedule"
      :appointment="rescheduleAppointmentData || {}"
      @close="closeReschedule"
      @review="reviewReschedule"
    />

    <RescheduleReviewModal
      :show="showRescheduleReview"
      :appointment="rescheduleAppointmentData || {}"
      :new-date="rescheduleDate"
      :new-time="rescheduleTime"
      @close="closeRescheduleReview"
      @confirm="confirmReschedule"
    />
  </main>
</template>

<style scoped>
.appointments-page {
  min-width: 0;
  padding: 24px;
  color: #390607;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #765456;
  font-size: 11px;
  letter-spacing: 1px;
}

h1 {
  margin: 0 0 8px;
  font: 30px Georgia, serif;
}

.page-heading p:last-child {
  margin: 0;
  font-size: 13px;
}

.total {
  padding: 9px 14px;
  border-radius: 20px;
  background: #f1e2e1;
  font-size: 12px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary article {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border: 1px solid #b98b8c;
  border-radius: 14px;
  background: #f8eeee;
}

.summary span {
  font-size: 12px;
  color: #765456;
}

.summary strong {
  font: bold 28px Georgia, serif;
}

.records {
  padding: 20px;
  border: 1px solid #b98b8c;
  border-radius: 16px;
  background: #f8eeee;
}

.records h2 {
  margin: 0 0 18px;
  font: 23px Georgia, serif;
}

@media (max-width: 700px) {
  .appointments-page {
    padding: 16px;
  }

  .summary {
    grid-template-columns: 1fr;
  }

  .records {
    padding: 12px;
  }
}
</style>
