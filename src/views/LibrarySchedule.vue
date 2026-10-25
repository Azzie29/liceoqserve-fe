
<template>
  <div class="schedule-page">
    <div class="page-heading">
      <h1>Schedule Management</h1>
      <p>Manage office hours, availability, slots and blocked dates</p>
    </div>

    <div class="schedule-grid">
      <!-- OFFICE HOURS -->
      <section class="schedule-card">
        <h2>Office Hours</h2>

        <div v-for="day in officeHours" :key="day.day" class="office-row">
          <span>{{ day.day }}</span>
          <strong>{{ day.hours }}</strong>
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

          <button type="submit">BLOCK DATE AND TIME</button>
        </form>

        <p v-if="message" class="message">{{ message }}</p>
      </section>
    </div>

    <!-- BLOCKED SCHEDULES -->
    <section class="schedule-card blocked-card">
      <div class="blocked-heading">
        <h2>Blocked Dates and Times</h2>
        <span>{{ blockedSchedules.length }} blocked</span>
      </div>

      <div v-if="blockedSchedules.length === 0" class="empty-state">
        No blocked dates or times yet.
      </div>

      <div
        v-for="item in blockedSchedules"
        :key="item.id"
        class="blocked-row"
      >
        <div class="blocked-info">
          <strong>{{ formatDate(item.date) }}</strong>
          <span>{{ item.time }}</span>
          <small v-if="item.reason">{{ item.reason }}</small>
        </div>

        <button class="remove-button" @click="removeBlock(item.id)">
          Remove
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const officeHours = [
  { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Friday', hours: '9:00 AM - 5:00 PM' }
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

const today = new Date().toLocaleDateString('en-CA')
const blockDate = ref('')
const blockTime = ref('')
const blockReason = ref('')
const message = ref('')
const blockedSchedules = ref([])
let nextId = 1

function blockSchedule() {
  const exists = blockedSchedules.value.some(
    item => item.date === blockDate.value &&
      item.time === blockTime.value
  )

  if (exists) {
    message.value = 'This date and time is already blocked.'
    return
  }

  blockedSchedules.value.push({
    id: nextId++,
    date: blockDate.value,
    time: blockTime.value,
    reason: blockReason.value.trim()
  })

  blockedSchedules.value.sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  message.value = 'Date and time blocked successfully!'
  blockDate.value = ''
  blockTime.value = ''
  blockReason.value = ''
}

function removeBlock(id) {
  blockedSchedules.value = blockedSchedules.value.filter(
    item => item.id !== id
  )
  message.value = 'Blocked schedule removed.'
}

function formatDate(date) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
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
  color: #600b13;
}

.blocked-card {
  margin-top: 20px;
}

.blocked-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.blocked-heading span {
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
}
</style>
