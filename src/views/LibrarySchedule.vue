
<template>
  <div class="schedule-page">
    <div class="page-heading">
      <h1>Schedule Management</h1>
      <p>Manage office hours, availability, slots and blocked dates</p>
    </div>

    <div class="schedule-grid">
      <!-- OFFICE HOURS -->
      <section class="schedule-card">
        <div class="card-heading">
          <h2>Office Hours</h2>
          <button class="refresh-button" @click="fetchOfficeHours" :disabled="loadingHours">
            {{ loadingHours ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <div v-if="loadingHours" class="empty-state">
          Loading office hours...
        </div>

        <div v-else-if="officeHours.length === 0" class="empty-state">
          No office hours found.
        </div>

        <div
          v-for="day in officeHours"
          :key="day.day_of_week"
          class="office-row"
        >
          <span>{{ dayNames[day.day_of_week] }}</span>
          <strong>
            {{ day.is_closed
              ? 'Closed'
              : `${formatTime(day.opening_time)} - ${formatTime(day.closing_time)}`
            }}
          </strong>
        </div>
      </section>

      <!-- BLOCK DATE OR TIME -->
      <section class="schedule-card">
        <h2>Block a date or time</h2>

        <form @submit.prevent="blockSchedule">
          <input
            v-model="blockDate"
            type="date"
            :min="today"
            required
          />

          <select v-model="blockTime" required>
            <option value="" disabled>Choose a time</option>
            <option value="All Day">All Day</option>
            <option
              v-for="time in timeOptions"
              :key="time"
              :value="time"
            >
              {{ time }}
            </option>
          </select>

          <input
            v-model="blockReason"
            type="text"
            placeholder="Reason (optional)"
          />

          <button type="submit" :disabled="saving">
            {{ saving ? 'SAVING...' : 'BLOCK DATE AND TIME' }}
          </button>
        </form>

        <p v-if="message" class="message" :class="{ error: isError }">
          {{ message }}
        </p>
      </section>
    </div>

    <!-- BLOCKED SCHEDULES -->
    <section class="schedule-card blocked-card">
      <div class="blocked-heading">
        <h2>Blocked Dates and Times</h2>

        <div class="blocked-actions">
          <span>{{ blockedSchedules.length }} blocked</span>
          <button
            class="refresh-button"
            @click="fetchBlockedSchedules"
            :disabled="loadingBlocks"
          >
            {{ loadingBlocks ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="loadingBlocks" class="empty-state">
        Loading blocked schedules...
      </div>

      <div v-else-if="blockedSchedules.length === 0" class="empty-state">
        No blocked dates or times yet.
      </div>

      <div
        v-for="item in blockedSchedules"
        :key="item.id"
        class="blocked-row"
      >
        <div class="blocked-info">
          <strong>{{ formatDate(item.blocked_date) }}</strong>
          <span>{{ item.time_slot }}</span>
          <small v-if="item.reason">{{ item.reason }}</small>
        </div>

        <button
          class="remove-button"
          @click="removeBlock(item.id)"
          :disabled="deletingId === item.id"
        >
          {{ deletingId === item.id ? 'Removing...' : 'Remove' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const LIBRARY_DEPARTMENT = 'library'

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

const timeOptions = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM'
]

const today = getLocalDate()

const officeHours = ref([])
const blockedSchedules = ref([])

const blockDate = ref('')
const blockTime = ref('')
const blockReason = ref('')

const message = ref('')
const isError = ref(false)

const loadingHours = ref(false)
const loadingBlocks = ref(false)
const saving = ref(false)
const deletingId = ref(null)

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatTime(time) {
  if (!time) return ''

  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0)

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatDate(date) {
  if (!date) return ''

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function showMessage(text, error = false) {
  message.value = text
  isError.value = error
}

async function fetchOfficeHours() {
  loadingHours.value = true

  const { data, error } = await supabase
    .from('office_hours')
    .select('*')
    .eq('department', LIBRARY_DEPARTMENT)
    .order('day_of_week', { ascending: true })

  loadingHours.value = false

  if (error) {
    console.error('Office hours error:', error)
    showMessage('Unable to load office hours: ' + error.message, true)
    return
  }

  officeHours.value = data || []
}

async function fetchBlockedSchedules() {
  loadingBlocks.value = true

  const { data, error } = await supabase
    .from('blocked_schedules')
    .select('*')
    .eq('department', LIBRARY_DEPARTMENT)
    .order('blocked_date', { ascending: true })

  loadingBlocks.value = false

  if (error) {
    console.error('Blocked schedules error:', error)
    showMessage('Unable to load blocked schedules: ' + error.message, true)
    return
  }

  blockedSchedules.value = data || []
}

async function blockSchedule() {
  if (!blockDate.value || !blockTime.value) {
    showMessage('Please select a date and time.', true)
    return
  }

  saving.value = true
  message.value = ''

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    saving.value = false
    showMessage('Please log in again before adding a blocked schedule.', true)
    return
  }

  const { error } = await supabase
    .from('blocked_schedules')
    .insert({
      department: LIBRARY_DEPARTMENT,
      blocked_date: blockDate.value,
      time_slot: blockTime.value,
      reason: blockReason.value.trim() || null,
      created_by: user.id
    })

  saving.value = false

  if (error) {
    console.error('Add blocked schedule error:', error)

    if (error.code === '23505') {
      showMessage('This date and time is already blocked.', true)
    } else {
      showMessage('Unable to block schedule: ' + error.message, true)
    }

    return
  }

  showMessage('Date and time blocked successfully!')

  blockDate.value = ''
  blockTime.value = ''
  blockReason.value = ''

  await fetchBlockedSchedules()
}

async function removeBlock(id) {
  if (!confirm('Are you sure you want to remove this blocked schedule?')) {
    return
  }

  deletingId.value = id

  const { error } = await supabase
    .from('blocked_schedules')
    .delete()
    .eq('id', id)
    .eq('department', LIBRARY_DEPARTMENT)

  deletingId.value = null

  if (error) {
    console.error('Remove blocked schedule error:', error)
    showMessage('Unable to remove blocked schedule: ' + error.message, true)
    return
  }

  showMessage('Blocked schedule removed successfully!')
  await fetchBlockedSchedules()
}

onMounted(() => {
  fetchOfficeHours()
  fetchBlockedSchedules()
})
</script>

<style scoped>
.schedule-page {
  min-height: calc(100vh - 100px);
  padding: 24px;
  background: #efdfdf;
  color: #350909;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.page-heading {
  margin-bottom: 24px;
}

.page-heading h1 {
  margin: 0 0 4px;
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  font-size: 13px;
  color: #634646;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.schedule-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #b99595;
  border-radius: 12px;
  background: #f8eeee;
  box-sizing: border-box;
}

.schedule-card h2 {
  margin: 0 0 18px;
  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: 500;
}

.card-heading,
.blocked-heading,
.blocked-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.refresh-button {
  padding: 7px 11px;
  border: 1px solid #600b13;
  border-radius: 6px;
  background: transparent;
  color: #600b13;
  font-size: 11px;
  cursor: pointer;
}

.refresh-button:disabled,
.remove-button:disabled,
.schedule-card form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.office-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  font-size: 13px;
}

.office-row strong {
  font-size: 12px;
  font-weight: 600;
  text-align: right;
}

.schedule-card form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-card input,
.schedule-card select {
  width: 100%;
  min-width: 0;
  padding: 11px;
  border: 1px solid #c9a8a8;
  border-radius: 7px;
  background: #fff8f8;
  color: #350909;
  font-size: 13px;
  box-sizing: border-box;
}

.schedule-card form button {
  align-self: flex-start;
  padding: 11px 16px;
  border: none;
  border-radius: 6px;
  background: #600b13;
  color: white;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
}

.schedule-card button:hover {
  opacity: 0.88;
}

.message {
  margin: 12px 0 0;
  font-size: 12px;
  color: #27632a;
}

.message.error {
  color: #b00020;
}

.blocked-card {
  margin-top: 20px;
}

.blocked-heading h2 {
  margin-bottom: 18px;
}

.blocked-heading > span,
.blocked-actions > span {
  padding: 6px 10px;
  border-radius: 20px;
  background: #ead2d2;
  font-size: 12px;
}

.empty-state {
  padding: 24px 10px;
  color: #806969;
  text-align: center;
  font-size: 13px;
}

.blocked-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #e1caca;
}

.blocked-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
}

.blocked-info span,
.blocked-info small {
  color: #745454;
}

.remove-button {
  padding: 8px 12px;
  border: 1px solid #600b13;
  border-radius: 6px;
  background: transparent;
  color: #600b13;
  cursor: pointer;
}

@media (max-width: 800px) {
  .schedule-page {
    padding: 16px;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
  }

  .office-row {
    font-size: 12px;
  }

  .blocked-heading {
    align-items: flex-start;
  }
}
</style>
