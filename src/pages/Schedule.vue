
<template>
  <section class="schedule-page">
    <div class="page-heading">
      <h1>SCHEDULE MANAGEMENT</h1>
      <p>Manage office hours, availability, slots and blocked dates.</p>
    </div>

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
      </section>

      <!-- BLOCK A DATE OR TIME -->
      <section class="schedule-card block-date-card">
        <h2>Block a date or time</h2>

        <form @submit.prevent="blockDate">
          <input
            v-model="selectedDate"
            type="date"
            aria-label="Select date to block"
            :min="today"
            required
          />

          <button type="submit" class="block-button">
            Block date
          </button>
        </form>

        <div class="blocked-dates">
          <div
            v-for="item in blockedDates"
            :key="item.id"
            class="blocked-date-item"
          >
            <span>{{ item.label }}</span>
          </div>

          <p v-if="blockedDates.length === 0" class="empty-state">
            No blocked dates.
          </p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const today = new Date().toLocaleDateString('en-CA')

const officeHours = [
  { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Friday', hours: '9:00 AM - 5:00 PM' }
]

function loadBlockedDates() {
  try {
    const saved = localStorage.getItem('osaBlockedDates')

    if (saved !== null) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Unable to load blocked dates:', error)
  }

  return [
    {
      id: 'blocked-001',
      date: '2026-10-10',
      label: 'October 10 - University Event'
    }
  ]
}

const blockedDates = ref(loadBlockedDates())
const selectedDate = ref('')

function saveBlockedDates() {
  try {
    localStorage.setItem(
      'osaBlockedDates',
      JSON.stringify(blockedDates.value)
    )
  } catch (error) {
    console.error('Unable to save blocked dates:', error)
    window.alert('Unable to save blocked dates.')
  }
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)

  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })
}

function blockDate() {
  if (!selectedDate.value) {
    window.alert('Please select a date.')
    return
  }

  const alreadyBlocked = blockedDates.value.some(
    item => item.date === selectedDate.value
  )

  if (alreadyBlocked) {
    window.alert('This date is already blocked.')
    return
  }

  const newBlockedDate = {
    id: `${Date.now()}`,
    date: selectedDate.value,
    label: `${formatDate(selectedDate.value)} - Blocked Date`
  }

  blockedDates.value.push(newBlockedDate)
  saveBlockedDates()

  selectedDate.value = ''
}
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
  width: 100%;
  min-height: 24px;
  padding: 15px 15px;
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

.empty-state {
  margin: 0;
  color: #987e7e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
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

  .office-hours-card {
    min-height: auto;
  }
}
</style>
