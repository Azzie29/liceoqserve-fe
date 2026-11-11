
<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

import AppointmentFilters from '../components/AppointmentFilters.vue'
import AppointmentTable from '../components/AppointmentTable.vue'
import AppointmentConfirmationModal from '../components/AppointmentConfirmationModal.vue'
import RescheduleAppointmentModal from '../components/RescheduleAppointmentModal.vue'
import RescheduleReviewModal from '../components/RescheduleReviewModal.vue'
import { supabase } from '../lib/Supabase.js'

// LIBRARY SERVICES
const LIBRARY_SERVICE_IDS = [
  '987d7769-8a02-44a1-9b95-cdfec559a70e',
  'faa4239d-cae7-4fe7-af69-3f25bec2fe44',
]

const SERVICE_NAMES = {
  '987d7769-8a02-44a1-9b95-cdfec559a70e':
    'Discussion Room Reservation',
  'faa4239d-cae7-4fe7-af69-3f25bec2fe44':
    'Viewing Room Reservation',
}

// PAGE STATE
const search = ref('')
const status = ref('All')
const appointments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

let reservationChannel = null

// CONFIRMATION MODAL
const showConfirmation = ref(false)
const selectedAppointment = ref(null)
const selectedAction = ref('complete')

// RESCHEDULE MODALS
const showReschedule = ref(false)
const showRescheduleReview = ref(false)
const rescheduleAppointmentData = ref(null)
const rescheduleDate = ref('')
const rescheduleTime = ref('')

// FORMAT DATE
function formatDate(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// FORMAT TIME
function formatTime(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// FORMAT STATUS
function formatStatus(value) {
  const statuses = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No-show',
  }

  return statuses[value?.toLowerCase()] || value || 'Pending'
}

// LOAD LIBRARY RESERVATIONS
async function loadAppointments() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        id,
        student_id,
        service_id,
        resource_name,
        room_id,
        start_at,
        end_at,
        purpose,
        status,
        handled_by,
        created_at
      `)
      .in('service_id', LIBRARY_SERVICE_IDS)
      .order('start_at', { ascending: false })

    if (error) throw error

    const studentIds = [
      ...new Set((reservations || []).map(item => item.student_id)),
    ]

    const roomIds = [
      ...new Set(
        (reservations || [])
          .map(item => item.room_id)
          .filter(Boolean),
      ),
    ]

    let profiles = []
    let rooms = []

    // GET STUDENT NAMES
    if (studentIds.length > 0) {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds)

      if (profileError) throw profileError

      profiles = data || []
    }

    // GET ROOM NAMES
    if (roomIds.length > 0) {
      const { data, error: roomError } = await supabase
        .from('rooms')
        .select('id, name')
        .in('id', roomIds)

      if (roomError) throw roomError

      rooms = data || []
    }

    const profileMap = new Map(
      profiles.map(item => [item.id, item.full_name]),
    )

    const roomMap = new Map(
      rooms.map(item => [item.id, item.name]),
    )

    appointments.value = (reservations || []).map(item => ({
      // DISPLAY ID
      id: `LIB-${item.id.slice(0, 8).toUpperCase()}`,

      // ORIGINAL DATABASE ID
      reservationId: item.id,

      student: profileMap.get(item.student_id) || 'Student',
      purpose:
        item.purpose ||
        SERVICE_NAMES[item.service_id] ||
        'Library Reservation',

      resourceName:
        roomMap.get(item.room_id) ||
        item.resource_name ||
        'Not specified',

      date: formatDate(item.start_at),
      time: formatTime(item.start_at),
      status: formatStatus(item.status),

      // ORIGINAL DATABASE VALUES
      startAt: item.start_at,
      endAt: item.end_at,
      studentId: item.student_id,
      serviceId: item.service_id,
    }))
  } catch (error) {
    console.error('Error loading Library reservations:', error)
    errorMessage.value = error.message || 'Unable to load reservations.'
  } finally {
    isLoading.value = false
  }
}

// AUTOMATIC COUNTS
const pendingCount = computed(
  () => appointments.value.filter(a => a.status === 'Pending').length,
)

const confirmedCount = computed(
  () => appointments.value.filter(a => a.status === 'Confirmed').length,
)

// SEARCH AND FILTER
const filteredAppointments = computed(() => {
  const term = search.value.trim().toLowerCase()

  return appointments.value.filter(item => {
    const matchesSearch =
      item.student.toLowerCase().includes(term) ||
      item.id.toLowerCase().includes(term) ||
      item.purpose.toLowerCase().includes(term) ||
      item.resourceName.toLowerCase().includes(term)

    const matchesStatus =
      status.value === 'All' || item.status === status.value

    return matchesSearch && matchesStatus
  })
})

// GET CURRENT STAFF USER
async function getStaffId() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error

  return data.user?.id || null
}

// UPDATE RESERVATION
async function updateReservation(reservationId, changes) {
  const staffId = await getStaffId()

  const updateData = {
    ...changes,
    updated_at: new Date().toISOString(),
  }

  if (staffId) {
    updateData.handled_by = staffId
  }

  const { data, error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', reservationId)
    .in('service_id', LIBRARY_SERVICE_IDS)
    .select('id')
    .single()

  if (error) throw error

  if (!data) {
    throw new Error('Reservation was not updated.')
  }

  await loadAppointments()
}

// OPEN CONFIRMATION
function openConfirmation(appointment, action) {
  selectedAppointment.value = appointment
  selectedAction.value = action
  showConfirmation.value = true
}

function closeConfirmation() {
  showConfirmation.value = false
  selectedAppointment.value = null
}

// COMPLETE, CANCEL, NO-SHOW
async function confirmAction(action) {
  if (!selectedAppointment.value) return

  const newStatus = {
    complete: 'completed',
    cancel: 'cancelled',
    'no-show': 'no_show',
  }[action]

  if (!newStatus) return

  try {
    await updateReservation(
      selectedAppointment.value.reservationId,
      { status: newStatus },
    )

    closeConfirmation()
  } catch (error) {
    console.error('Error updating reservation:', error)
    window.alert(error.message || 'Unable to update appointment.')
  }
}

// OPEN RESCHEDULE
function rescheduleAppointment(appointment) {
  rescheduleAppointmentData.value = appointment
  rescheduleDate.value = ''
  rescheduleTime.value = ''
  showReschedule.value = true
}

// REVIEW RESCHEDULE
function reviewReschedule(changes) {
  rescheduleAppointmentData.value = changes.appointment
  rescheduleDate.value = changes.date
  rescheduleTime.value = changes.time

  showReschedule.value = false
  showRescheduleReview.value = true
}

// CLOSE RESCHEDULE
function closeReschedule() {
  showReschedule.value = false
  rescheduleAppointmentData.value = null
  rescheduleDate.value = ''
  rescheduleTime.value = ''
}

// BACK TO RESCHEDULE FORM
function closeRescheduleReview() {
  showRescheduleReview.value = false
  showReschedule.value = true
}

// CONVERT DATE AND TIME TO JAVASCRIPT DATE
function createNewSchedule(dateValue, timeValue) {
  const [year, month, day] = dateValue.split('-').map(Number)

  const timeMatch = timeValue.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  )

  if (!timeMatch) {
    throw new Error('Invalid appointment time.')
  }

  let hours = Number(timeMatch[1])
  const minutes = Number(timeMatch[2])
  const period = timeMatch[3].toUpperCase()

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return new Date(year, month - 1, day, hours, minutes)
}

// CONFIRM RESCHEDULE
async function confirmReschedule() {
  const appointment = rescheduleAppointmentData.value

  if (!appointment || !rescheduleDate.value || !rescheduleTime.value) {
    return
  }

  try {
    const newStart = createNewSchedule(
      rescheduleDate.value,
      rescheduleTime.value,
    )

    if (newStart <= new Date()) {
      window.alert('Please select a future date and time.')
      return
    }

    const oldStart = new Date(appointment.startAt)
    const oldEnd = new Date(appointment.endAt)

    // PRESERVE ORIGINAL RESERVATION DURATION
    const duration = oldEnd.getTime() - oldStart.getTime()

    if (duration <= 0) {
      throw new Error('The original reservation duration is invalid.')
    }

    const newEnd = new Date(newStart.getTime() + duration)

    await updateReservation(appointment.reservationId, {
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString(),
      status: 'pending',
    })

    showRescheduleReview.value = false
    rescheduleAppointmentData.value = null
    rescheduleDate.value = ''
    rescheduleTime.value = ''
  } catch (error) {
    console.error('Error rescheduling reservation:', error)
    window.alert(error.message || 'Unable to reschedule appointment.')
  }
}

// VIEW APPOINTMENT
function viewAppointment(appointment) {
  window.alert(
    `Appointment: ${appointment.id}\n` +
    `Student: ${appointment.student}\n` +
    `Purpose: ${appointment.purpose}\n` +
    `Resource: ${appointment.resourceName}\n` +
    `Date: ${appointment.date}\n` +
    `Time: ${appointment.time}\n` +
    `Status: ${appointment.status}`,
  )
}

// SUPABASE REALTIME
onMounted(() => {
  loadAppointments()

  reservationChannel = supabase
    .channel('library-reservations-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
      },
      () => {
        loadAppointments()
      },
    )
    .subscribe()
})

onUnmounted(() => {
  if (reservationChannel) {
    supabase.removeChannel(reservationChannel)
    reservationChannel = null
  }
})
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

      <p v-if="isLoading" class="message">
        Loading Library appointments...
      </p>

      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <p
        v-else-if="appointments.length === 0"
        class="message"
      >
        No Library reservations found.
      </p>

      <p
        v-else-if="filteredAppointments.length === 0"
        class="message"
      >
        No appointments match your search or selected filter.
      </p>

      <AppointmentTable
        v-if="!isLoading && !errorMessage && filteredAppointments.length > 0"
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

.message {
  margin: 24px 0;
  color: #765456;
  font-size: 13px;
  text-align: center;
}

.error-message {
  margin: 24px 0;
  color: #b00020;
  font-size: 13px;
  text-align: center;
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
