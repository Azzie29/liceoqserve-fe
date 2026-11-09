
<template>
  <section class="schedule-page">
    <div class="page-heading">
      <h1>SCHEDULE MANAGEMENT</h1>
      <p>Manage office hours, availability, slots and blocked dates.</p>
    </div>

    <p v-if="loading" class="status-message">
      Loading schedule...
    </p>

    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>

    <div class="schedule-layout">
      <!-- OFFICE HOURS -->
      <section class="schedule-card office-hours-card">
        <h2>Office Hours</h2>

        <div
          v-for="officeHour in officeHours"
          :key="officeHour.day"
          class="office-hour-row"
        >
          <span>{{ officeHour.day }}</span>
          <strong>{{ officeHour.hours }}</strong>
        </div>

        <p v-if="!loading && officeHours.length === 0" class="empty-state">
          No office hours available.
        </p>
      </section>

      <!-- BLOCK A DATE -->
      <section class="schedule-card block-date-card">
        <h2>Block a date or time</h2>

        <form @submit.prevent="blockDate">
          <input
            v-model="selectedDate"
            type="date"
            lang="en-US"
            aria-label="Select date to block"
            :min="today"
            required
          />

          <button
            type="submit"
            class="block-button"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Block date' }}
          </button>
        </form>

        <div class="blocked-dates">
          <div
            v-for="item in blockedDates"
            :key="item.id"
            class="blocked-date-item"
          >
            <span>{{ item.label }}</span>

            <button
              type="button"
              class="delete-button"
              :disabled="deletingId === item.id"
              @click="deleteBlockedDate(item)"
            >
              {{ deletingId === item.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>

          <p v-if="!loading && blockedDates.length === 0" class="empty-state">
            No blocked dates.
          </p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const today = getLocalDate()

const officeHours = ref([])
const blockedDates = ref([])
const selectedDate = ref('')

const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const errorMessage = ref('')

let officeId = null
let scheduleChannel = null

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-')
  return `${month}-${day}-${year}`
}

function formatTime(timeString) {
  if (!timeString) return ''

  const [hour, minute] = timeString.split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0, 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatOfficeHours(schedule) {
  if (schedule.is_closed) {
    return 'Closed'
  }

  if (!schedule.opens_at || !schedule.closes_at) {
    return 'Not set'
  }

  return `${formatTime(schedule.opens_at)} - ${formatTime(schedule.closes_at)}`
}

// GET LOGGED-IN STAFF OFFICE
async function getStaffOffice() {
  const { data: authData, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError

  const user = authData.user

  if (!user) {
    throw new Error('Please log in first.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, office_id')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  if (!profile.office_id) {
    throw new Error('Your account is not assigned to an office.')
  }

  if (!['staff', 'admin'].includes(profile.role)) {
    throw new Error('Only office staff can manage schedules.')
  }

  officeId = profile.office_id
}

// FETCH SCHEDULES FROM SUPABASE
async function fetchSchedules() {
  if (!officeId) return

  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('office_schedules')
      .select('*')
      .eq('office_id', officeId)
      .order('effective_date', {
        ascending: true,
        nullsFirst: true
      })
      .order('day_of_week', {
        ascending: true
      })

    if (error) throw error

    const schedules = data || []

    // Regular weekly office hours
    officeHours.value = schedules
      .filter(item => item.effective_date === null)
      .map(item => ({
        day: daysOfWeek[item.day_of_week] || 'Unknown',
        hours: formatOfficeHours(item)
      }))

    // Blocked dates
    blockedDates.value = schedules
      .filter(item => item.effective_date !== null && item.is_closed)
      .map(item => ({
        id: item.id,
        date: item.effective_date,
        label: `${formatDate(item.effective_date)} - ${item.note || 'Blocked Date'}`
      }))
  } catch (error) {
    console.error('Unable to fetch schedules:', error)
    errorMessage.value = error.message || 'Unable to load schedules.'
  } finally {
    loading.value = false
  }
}

// BLOCK A DATE
async function blockDate() {
  if (!selectedDate.value || !officeId) return

  if (selectedDate.value < today) {
    window.alert('Please select a future date.')
    return
  }

  const alreadyBlocked = blockedDates.value.some(
    item => item.date === selectedDate.value
  )

  if (alreadyBlocked) {
    window.alert('This date is already blocked.')
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase
      .from('office_schedules')
      .insert({
        office_id: officeId,
        day_of_week: null,
        opens_at: null,
        closes_at: null,
        is_closed: true,
        effective_date: selectedDate.value,
        note: 'Blocked Date'
      })

    if (error) throw error

    selectedDate.value = ''

    await fetchSchedules()

    window.alert('Date successfully blocked.')
  } catch (error) {
    console.error('Unable to block date:', error)

    if (error.code === '23505') {
      errorMessage.value = 'This date is already blocked.'
    } else {
      errorMessage.value = error.message || 'Unable to block date.'
    }
  } finally {
    saving.value = false
  }
}

// DELETE BLOCKED DATE
async function deleteBlockedDate(item) {
  const confirmed = window.confirm(
    `Are you sure you want to remove the blocked date ${item.label}?`
  )

  if (!confirmed) return

  deletingId.value = item.id
  errorMessage.value = ''

  try {
    const { error } = await supabase
      .from('office_schedules')
      .delete()
      .eq('id', item.id)
      .eq('office_id', officeId)

    if (error) throw error

    await fetchSchedules()
  } catch (error) {
    console.error('Unable to delete blocked date:', error)
    errorMessage.value = error.message || 'Unable to delete blocked date.'
  } finally {
    deletingId.value = null
  }
}

// REALTIME UPDATES
function subscribeToSchedules() {
  if (!officeId) return

  scheduleChannel = supabase
    .channel(`office-schedules-${officeId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'office_schedules',
        filter: `office_id=eq.${officeId}`
      },
      () => {
        fetchSchedules()
      }
    )
    .subscribe()
}

onMounted(async () => {
  try {
    await getStaffOffice()
    await fetchSchedules()
    subscribeToSchedules()
  } catch (error) {
    console.error('Schedule initialization error:', error)
    errorMessage.value = error.message || 'Unable to initialize schedule.'
  }
})

onUnmounted(async () => {
  if (scheduleChannel) {
    await supabase.removeChannel(scheduleChannel)
  }
})
</script>

<style scoped>
.schedule-page {
  min-height: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #350609;
  font-family: Georgia, 'Times New Roman', serif;
}

.page-heading {
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 0 0 5px;
  color: #59070d;
  font-size: 19px;
  font-weight: 700;
}

.page-heading p {
  margin: 0;
  color: #987e7e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  line-height: 1.5;
}

.schedule-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  align-items: start;
  gap: 20px;
  width: 100%;
}

.schedule-card {
  min-width: 0;
  padding: 30px 50px;
  border: 1px solid #c9babb;
  border-radius: 12px;
  background: #f8eeee;
  box-sizing: border-box;
}

.schedule-card h2 {
  margin: 0 0 14px;
  color: #211314;
  font-size: 20px;
  font-weight: 700;
}

.office-hours-card {
  min-height: 300px;
}

.office-hour-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 20px;
  color: #211314;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 500;
}

.office-hour-row:last-child {
  margin-bottom: 0;
}

.office-hour-row strong {
  font-size: 14px;
  font-weight: 650;
  white-space: nowrap;
}

/* BLOCK DATE FORM */
.block-date-card form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.block-date-card input[type='date'] {
  width: 100%;
  height: 60px;
  padding: 5px 9px;
  border: 1px solid #a86d72;
  border-radius: 6px;
  outline: none;
  background: #f8eeee;
  color: #350609;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  box-sizing: border-box;
}

.block-date-card input[type='date']:focus {
  border-color: #59070d;
  box-shadow: 0 0 0 2px rgba(89, 7, 13, 0.1);
}

.block-button {
  min-height: 31px;
  padding: 7px 12px;
  border: 1px solid #59070d;
  border-radius: 6px;
  background: #59070d;
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.block-button:hover {
  background: #760d16;
}

.block-button:disabled,
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* BLOCKED DATES */
.blocked-dates {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.blocked-date-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 24px;
  padding: 15px;
  border-radius: 8px;
  background: #f4dddd;
  color: #350609;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  box-sizing: border-box;
}

.blocked-date-item span {
  overflow-wrap: anywhere;
}

.delete-button {
  flex-shrink: 0;
  padding: 6px 9px;
  border: 1px solid #59070d;
  border-radius: 5px;
  background: transparent;
  color: #59070d;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.delete-button:hover {
  background: #59070d;
  color: #fff;
}

.empty-state,
.status-message {
  margin: 0;
  color: #987e7e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
}

.error-message {
  margin: 0 0 15px;
  padding: 10px 12px;
  border: 1px solid #d9a5a5;
  border-radius: 6px;
  background: #f8dddd;
  color: #8a1010;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .schedule-page {
    padding: 20px 12px;
  }

  .schedule-layout {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .schedule-card {
    padding: 24px;
  }

  .office-hours-card {
    min-height: auto;
  }
}
</style>
