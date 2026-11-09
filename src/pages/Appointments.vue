
<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const emit = defineEmits(['reschedule'])

const NICO_STUDENT_ID = '2921235d-a3c7-4864-8dbc-b517081eec7d'

const filters = [
  'All',
  'Pending',
  'Confirmed',
  'Reschedule Requested',
  'Completed',
  'Cancelled',
  'No-Show'
]

const appointments = ref([])
const selectedFilter = ref('All')

const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

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
      title: 'Complete this appointment?',
      button: 'Confirm completed',
      tone: 'maroon'
    },
    cancel: {
      title: 'Cancel this appointment?',
      button: 'Confirm Cancelled',
      tone: 'red'
    },
    noShow: {
      title: 'Mark as No-Show?',
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
    appointment => appointment.displayStatus === selectedFilter.value
  )
})

function formatStatus(status) {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    reschedule_requested: 'Reschedule Requested',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    no_show: 'No-Show'
  }

  return statusMap[status] || status
}

function formatDate(date) {
  if (!date) return 'Date not set'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date not set'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila'
  }).format(parsedDate)
}

function formatTime(time) {
  if (!time) return 'Time not set'

  const parsedDate = new Date(time)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Time not set'
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  }).format(parsedDate)
}

function getStudentName(appointment) {
  return appointment?.student?.full_name || 'Unknown Student'
}

function getStudentNumber(appointment) {
  return appointment?.student?.student_id || 'No student number'
}

function getServiceName(appointment) {
  return appointment?.service?.name || 'Unknown Service'
}

function mapAppointment(row) {
  return {
    ...row,
    date: row.scheduled_at,
    time: row.scheduled_at,
    studentId: row.student?.student_id || 'No student number',
    displayStatus: formatStatus(row.status)
  }
}

// LOAD NICO DA APPOINTMENTS FROM SUPABASE
async function loadAppointments() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        student_id,
        service_id,
        scheduled_at,
        end_at,
        status,
        purpose,
        student_notes,
        staff_notes,
        handled_by,
        reschedule_requested_at,
        created_at,
        updated_at,
        student:profiles!appointments_student_id_fkey (
          id,
          student_id,
          full_name,
          university_email,
          program,
          year_level
        ),
        service:office_services!appointments_service_id_fkey (
          id,
          name,
          description,
          service_type,
          office_id
        )
      `)
      .eq('student_id', NICO_STUDENT_ID)
      .order('scheduled_at', { ascending: true })

    if (error) throw error

    appointments.value = (data || []).map(mapAppointment)

  } catch (error) {
    console.error('Error loading Nico Da appointments:', error)

    errorMessage.value =
      error.message || 'Unable to load appointments from Supabase.'

    appointments.value = []
  } finally {
    loading.value = false
  }
}

function openModal(appointment, action) {
  selectedAppointment.value = appointment
  selectedAction.value = action
  showModal.value = true
}

function closeModal() {
  if (saving.value) return

  showModal.value = false
  selectedAppointment.value = null
  selectedAction.value = ''
}

// UPDATE APPOINTMENT STATUS IN SUPABASE
async function confirmAction() {
  if (!selectedAppointment.value || saving.value) return

  const statusMap = {
    confirm: 'confirmed',
    completed: 'completed',
    cancel: 'cancelled',
    noShow: 'no_show'
  }

  const newStatus = statusMap[selectedAction.value]

  if (!newStatus) return

  saving.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedAppointment.value.id)
      .eq('student_id', NICO_STUDENT_ID)
      .select('id')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw new Error(
        'Appointment was not updated. Please check your office permissions.'
      )
    }

    closeModal()

    await loadAppointments()

  } catch (error) {
    console.error('Error updating appointment:', error)

    window.alert(
      error.message || 'Unable to update appointment. Please try again.'
    )
  } finally {
    saving.value = false
  }
}

// SEND APPOINTMENT TO THE RESCHEDULE PAGE
function rescheduleAppointment(appointment) {
  emit('reschedule', {
    ...appointment,
    date: appointment.scheduled_at,
    time: appointment.scheduled_at,
    student: getStudentName(appointment),
    studentId: getStudentNumber(appointment),
    service: getServiceName(appointment),
    status: appointment.displayStatus
  })
}

onMounted(() => {
  loadAppointments()
})
</script>

<template>
  <section class="appointments-page">

    <header class="appointments-heading">
      <div>
        <h1>APPOINTMENTS</h1>
        <p>
          Confirm, reschedule and complete Office of Student Affairs appointments.
        </p>
      </div>
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

      <button
        type="button"
        class="refresh-button"
        :disabled="loading"
        @click="loadAppointments"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </nav>

    <div v-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>

      <button
        type="button"
        class="retry-button"
        @click="loadAppointments"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="loading && appointments.length === 0" class="empty-state">
      Loading Nico Da appointments from Supabase...
    </div>

    <div v-else class="appointment-list">

      <article
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        class="appointment-card"
      >

        <div class="appointment-date">
          <span>{{ formatDate(appointment.scheduled_at) }}</span>
          <span>{{ formatTime(appointment.scheduled_at) }}</span>
        </div>

        <h2 class="appointment-title">
          {{ getStudentName(appointment) }} · {{ getServiceName(appointment) }}
        </h2>

        <p class="appointment-reference">
          {{ getStudentNumber(appointment) }} · {{ appointment.id }}
        </p>

        <p v-if="appointment.purpose" class="appointment-purpose">
          Purpose: {{ appointment.purpose }}
        </p>

        <div class="appointment-actions">

          <button
            v-if="appointment.status === 'pending'"
            type="button"
            class="action-button primary-action"
            @click="openModal(appointment, 'confirm')"
          >
            Confirm
          </button>

          <button
            v-if="['pending', 'confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="rescheduleAppointment(appointment)"
          >
            Reschedule
          </button>

          <button
            v-if="['pending', 'confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="openModal(appointment, 'completed')"
          >
            Mark Completed
          </button>

          <button
            v-if="['pending', 'confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="openModal(appointment, 'cancel')"
          >
            Cancel
          </button>

          <button
            v-if="['pending', 'confirmed'].includes(appointment.status)"
            type="button"
            class="action-button"
            @click="openModal(appointment, 'noShow')"
          >
            No-Show
          </button>

          <span
            class="status-badge"
            :class="appointment.displayStatus.toLowerCase().replace(/[^a-z]+/g, '-')"
          >
            {{ appointment.displayStatus }}
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
            {{ getServiceName(selectedAppointment) }} ·
            {{ formatDate(selectedAppointment.scheduled_at) }} at
            {{ formatTime(selectedAppointment.scheduled_at) }}
          </p>

          <div class="modal-actions">
            <button
              type="button"
              class="modal-button modal-back-button"
              :disabled="saving"
              @click="closeModal"
            >
              Go Back
            </button>

            <button
              type="button"
              class="modal-button modal-confirm-button"
              :class="`tone-${modalContent.tone}`"
              :disabled="saving"
              @click="confirmAction"
            >
              {{ saving ? 'Saving...' : modalContent.button }}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
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

.refresh-button,
.retry-button {
  padding: 8px 13px;
  border: 1px solid #7a252b;
  border-radius: 20px;
  background: transparent;
  color: #59080e;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.refresh-button {
  min-height: 33px;
  margin-left: auto;
  padding: 7px 14px;
  border-radius: 22px;
  white-space: nowrap;
  flex-shrink: 0;
}

.refresh-button:hover,
.retry-button:hover {
  background: #59080e;
  color: white;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  overflow-wrap: anywhere;
}

.appointment-purpose {
  margin: 9px 0 0;
  color: #76595b;
  font-family: Arial, sans-serif;
  font-size: 11px;
  overflow-wrap: anywhere;
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

.status-badge.confirmed,
.status-badge.completed {
  background: #d8ead9;
  color: #285b31;
}

.status-badge.cancelled,
.status-badge.no-show,
.status-badge.rejected {
  background: #f3dada;
  color: #a20f19;
}

.status-badge.reschedule-requested {
  background: #f7e8c8;
  color: #805515;
}

.empty-state,
.error-state {
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

.error-state {
  border-color: #e8baba;
  background: #fff5f5;
  color: #a20f19;
}

.error-state p {
  overflow-wrap: anywhere;
}

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

.modal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .appointments-heading {
    align-items: flex-start;
  }

  .appointment-filters {
    align-items: center;
  }

  .refresh-button {
    flex-shrink: 0;
  }

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
