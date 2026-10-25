```vue
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['navigate'])

const selectedDate = ref('')
const selectedTime = ref('')
const blockReason = ref('')

const blockedSchedules = ref([
  {
    id: 1,
    date: '2026-10-10',
    time: '9:00 AM - 5:00 PM',
    reason: 'University Event'
  }
])

const timeOptions = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '9:00 AM - 5:00 PM'
]

function formatDate(date) {
  if (!date) return ''

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric'
    }
  )
}

function blockSchedule() {
  if (!selectedDate.value || !selectedTime.value) {
    alert('Please select a date and time.')
    return
  }

  const alreadyBlocked = blockedSchedules.value.some(
    item =>
      item.date === selectedDate.value &&
      item.time === selectedTime.value
  )

  if (alreadyBlocked) {
    alert('This date and time are already blocked.')
    return
  }

  blockedSchedules.value.push({
    id: Date.now(),
    date: selectedDate.value,
    time: selectedTime.value,
    reason: blockReason.value.trim() || 'Unavailable'
  })

  selectedDate.value = ''
  selectedTime.value = ''
  blockReason.value = ''
}

function removeBlockedSchedule(id) {
  blockedSchedules.value = blockedSchedules.value.filter(
    item => item.id !== id
  )
}
</script>

<template>
  <div class="schedule-page">
    <header class="page-heading">
      <h1>Manage Schedule</h1>
      <p>
        Manage office hours, availability, slots and blocked dates
      </p>
    </header>

    <div class="schedule-grid">
      <section class="schedule-panel office-panel">
        <h2>Office Hours</h2>

        <div class="office-hours-list">
          <div class="office-hour-row">
            <strong>Monday</strong>
            <span>9:00 AM - 5:00 PM</span>
          </div>

          <div class="office-hour-row">
            <strong>Tuesday</strong>
            <span>9:00 AM - 5:00 PM</span>
          </div>

          <div class="office-hour-row">
            <strong>Wednesday</strong>
            <span>9:00 AM - 5:00 PM</span>
          </div>

          <div class="office-hour-row">
            <strong>Thursday</strong>
            <span>9:00 AM - 5:00 PM</span>
          </div>

          <div class="office-hour-row">
            <strong>Friday</strong>
            <span>9:00 AM - 5:00 PM</span>
          </div>
        </div>
      </section>

      <section class="schedule-panel block-panel">
        <h2>Block a date or time</h2>

        <form @submit.prevent="blockSchedule">
          <label for="block-date" class="visually-hidden">
            Select date
          </label>

          <input
            id="block-date"
            v-model="selectedDate"
            type="date"
            required
          />

          <label for="block-time" class="visually-hidden">
            Choose a time
          </label>

          <select
            id="block-time"
            v-model="selectedTime"
            required
          >
            <option value="" disabled>Choose a time</option>

            <option
              v-for="time in timeOptions"
              :key="time"
              :value="time"
            >
              {{ time }}
            </option>
          </select>

          <label for="block-reason" class="visually-hidden">
            Reason for blocking
          </label>

          <input
            id="block-reason"
            v-model="blockReason"
            type="text"
            placeholder="Reason (e.g. University Event)"
          />

          <button type="submit" class="block-button">
            BLOCK DATE AND TIME
          </button>
        </form>

        <div
          v-for="item in blockedSchedules"
          :key="item.id"
          class="blocked-item"
        >
          <span>
            {{ formatDate(item.date) }}
            · {{ item.time }}
            · {{ item.reason }}
          </span>

          <button
            type="button"
            class="remove-button"
            aria-label="Remove blocked schedule"
            @click="removeBlockedSchedule(item.id)"
          >
            ×
          </button>
        </div>

        <p
          v-if="!blockedSchedules.length"
          class="empty-message"
        >
          No blocked dates or times.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.schedule-page {
  width: 100%;
  min-width: 0;
  color: #39090c;
}

.page-heading {
  margin-bottom: 34px;
}

.page-heading h1 {
  margin: 0 0 2px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(27px, 3vw, 34px);
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  font-size: 15px;
}

.schedule-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 26px;
  padding: 0;
}

.schedule-panel {
  min-width: 0;
  padding: 15px 16px 20px;
  background: #f8eeee;
  border: 1px solid #853c43;
  border-radius: 16px;
}

.schedule-panel h2 {
  margin: 0 0 23px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
}

.office-hours-list {
  display: grid;
  gap: 15px;
  padding-top: 3px;
}

.office-hour-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 15px;
}

.office-hour-row strong {
  font-weight: 600;
}

.office-hour-row span {
  text-align: right;
  white-space: nowrap;
}

.block-panel form {
  display: grid;
  gap: 12px;
}

.block-panel input,
.block-panel select {
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 6px 11px;
  color: #39090c;
  background: #f8eeee;
  border: 1px solid #9b555b;
  border-radius: 9px;
  font: inherit;
  font-size: 14px;
}

.block-panel input::placeholder,
.block-panel select:invalid {
  color: #927878;
}

.block-button {
  justify-self: start;
  min-height: 35px;
  padding: 9px 12px;
  color: #fffafa;
  background: #650f18;
  border: 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.block-button:hover {
  background: #51090e;
}

.blocked-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 35px;
  padding: 8px;
  margin-top: 9px;
  color: #39090c;
  background: #dfc7c8;
  border-radius: 8px;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.remove-button {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #650f18;
  background: transparent;
  border: 0;
  border-radius: 5px;
  font-size: 20px;
  cursor: pointer;
}

.remove-button:hover {
  background: #f3dfe0;
}

.empty-message {
  margin: 14px 0 0;
  color: #775f60;
  font-size: 12px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1000px) {
  .schedule-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 600px) {
  .page-heading {
    margin-bottom: 22px;
  }

  .schedule-panel {
    padding: 15px 13px;
  }

  .office-hour-row {
    font-size: 13px;
  }

  .schedule-panel h2 {
    font-size: 22px;
  }
}
</style>