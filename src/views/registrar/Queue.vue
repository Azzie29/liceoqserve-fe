<template>
  <section class="queue-page">
    <div class="page-heading">
      <div>
        <h2>Queue Management</h2>
        <p>Current visits · automatic next and three recalls</p>
      </div>
    </div>

    <!-- NOW SERVING -->
    <section class="current-ticket">
      <span class="serving-label">Being Served</span>
      <strong class="ticket-number">{{ currentTicket.number || '—' }}</strong>

      <div class="student-details">
        <strong>{{ currentTicket.name || 'No active student' }}</strong>
        <span>{{ currentTicket.service || 'Call the next student' }}</span>
      </div>

      <div class="ticket-actions">
        <button
          class="arrived-button"
          :class="{ arrived: studentArrived }"
          :disabled="!currentTicket.number || studentArrived"
          @click="markArrived"
        >
          {{ studentArrived ? '✓ Student arrived' : 'Student arrived' }}
        </button>

        <button
          class="auto-next-button"
          :disabled="!currentTicket.number"
          @click="completeAndNext"
        >
          Complete &amp; auto-next
        </button>
      </div>
    </section>

    <p v-if="message" class="feedback-message" role="status">
      {{ message }}
    </p>

    <!-- QUEUE LIST -->
    <section class="queue-list-panel">
      <div class="queue-list-heading">
        <h3>Queue List</h3>
        <span>{{ waiting.length + (currentTicket.number ? 1 : 0) }} waiting</span>
      </div>

      <div class="queue-list">
        <article
          v-if="currentTicket.number"
          class="queue-row current-row"
        >
          <div class="student-info">
            <strong>{{ currentTicket.name }}</strong>
            <span>{{ currentTicket.service }}</span>
          </div>
          <span class="status-pill in-progress">In Progress</span>
        </article>

        <article
          v-for="ticket in waiting"
          :key="ticket.number"
          class="queue-row"
        >
          <div class="student-info">
            <strong>{{ ticket.name }}</strong>
            <span>{{ ticket.service }}</span>
          </div>
          <span class="status-pill waiting-status">Waiting</span>
        </article>

        <div v-if="!currentTicket.number && !waiting.length" class="empty-state">
          No students are currently in the queue.
        </div>
      </div>
    </section>

    <div class="queue-footer">
      <span>Authorized registrar staff only</span>
      <button class="reset-button" @click="resetQueue">Reset demo queue</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const initialCurrent = {
  number: 'R-001',
  name: 'Maria Santos',
  service: 'Form 137',
}

const initialWaiting = [
  { number: 'R-002', name: 'Juan dela Cruz', service: 'Transcript of Records' },
  { number: 'R-003', name: 'Nina Reyes', service: 'Certificate Request' },
  { number: 'R-004', name: 'Carlo Mendoza', service: 'Clearance · Representative' },
  { number: 'R-005', name: 'Eliza Flores', service: 'Other Registrar Document' },
  { number: 'R-006', name: 'Mark Ramos', service: 'Form 137' },
  { number: 'R-007', name: 'Grace Lim', service: 'Transcript of Records' },
  { number: 'R-008', name: 'Angela Dizon', service: 'Certificate of Enrollment' },
  { number: 'R-009', name: 'Paolo Garcia', service: 'Good Moral Certificate' },
  { number: 'R-010', name: 'Sofia Villanueva', service: 'Student Record Inquiry' },
  { number: 'R-011', name: 'Daniel Bautista', service: 'Transcript of Records' },
]

const currentTicket = ref({ ...initialCurrent })
const waiting = ref(initialWaiting.map(ticket => ({ ...ticket })))
const studentArrived = ref(false)
const message = ref('')
const recalls = ref(0)

function markArrived() {
  if (!currentTicket.value.number) return

  studentArrived.value = true
  message.value = `${currentTicket.value.name} has been marked as arrived.`
}

function completeAndNext() {
  if (!currentTicket.value.number) {
    message.value = 'There is no active ticket to complete.'
    return
  }

  const completedNumber = currentTicket.value.number
  const next = waiting.value.shift()

  if (next) {
    currentTicket.value = { ...next }
    studentArrived.value = false
    recalls.value = 0
    message.value = `${completedNumber} completed. ${next.number} is now being served.`
  } else {
    currentTicket.value = { number: '', name: '', service: '' }
    studentArrived.value = false
    recalls.value = 0
    message.value = `${completedNumber} completed. No more students are waiting.`
  }
}

function resetQueue() {
  currentTicket.value = { ...initialCurrent }
  waiting.value = initialWaiting.map(ticket => ({ ...ticket }))
  studentArrived.value = false
  recalls.value = 0
  message.value = 'Demo queue has been reset.'
}
</script>

<style scoped>
.queue-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  color: #300b0e;
}

.page-heading {
  padding: 0 0 2px;
}

.page-heading h2 {
  margin: 0 0 5px;
  color: #350a0d;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 27px;
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  color: #5f4143;
  font-size: 12px;
}

.current-ticket {
  display: flex;
  min-height: 198px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 22px 18px 17px;
  border-radius: 0 20px 20px 0;
  background: #50070e;
  color: #fff;
  text-align: center;
}

.serving-label {
  margin-bottom: 3px;
  color: #f1dfe0;
  font-size: 12px;
}

.ticket-number {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(48px, 6vw, 68px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 1px;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 7px;
}

.student-details strong {
  font-size: 12px;
  font-weight: 700;
}

.student-details span {
  color: #f1dfe0;
  font-size: 11px;
}

.ticket-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 13px;
}

.arrived-button,
.auto-next-button {
  min-height: 25px;
  padding: 4px 10px;
  border: 1px solid #d9bfc1;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}

.arrived-button:disabled {
  cursor: default;
  opacity: 0.55;
}

.arrived-button.arrived {
  border-color: #c9e2cd;
  color: #d7f1dc;
  opacity: 1;
}

.auto-next-button {
  border-color: #fff;
}

.auto-next-button:hover:not(:disabled) {
  background: #6c1720;
}

.auto-next-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.feedback-message {
  margin: -4px 0 0;
  padding: 10px 12px;
  border: 1px solid #d9bfc1;
  border-radius: 6px;
  background: #f8eeee;
  color: #50070e;
  font-size: 11px;
  line-height: 1.5;
}

.queue-list-panel {
  overflow: hidden;
  border: 1px solid #cfaeb2;
  border-radius: 0 0 19px 0;
  background: #f7eeee;
}

.queue-list-heading {
  display: flex;
  min-height: 41px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #d8b9bd;
  background: #f1e1e2;
}

.queue-list-heading h3 {
  margin: 0;
  color: #50070e;
  font-size: 13px;
  font-weight: 700;
}

.queue-list-heading > span {
  color: #50070e;
  font-size: 11px;
  font-weight: 700;
}

.queue-row {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 7px 14px;
  border-bottom: 1px solid #d8b9bd;
  background: #f8eeee;
}

.queue-row:last-child {
  border-bottom: 0;
}

.queue-row.current-row {
  background: #f2e2e3;
}

.student-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.student-info strong {
  overflow-wrap: anywhere;
  color: #261012;
  font-size: 11px;
  font-weight: 500;
}

.student-info span {
  overflow-wrap: anywhere;
  color: #8d6e72;
  font-size: 10px;
}

.status-pill {
  display: inline-flex;
  min-width: 86px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 500;
}

.in-progress {
  background: #eddf82;
  color: #5f5116;
}

.waiting-status {
  background: #eddf82;
  color: #5f5116;
}

.empty-state {
  padding: 28px 12px;
  color: #8d6e72;
  font-size: 12px;
  text-align: center;
}

.queue-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #8d6e72;
  font-size: 10px;
}

.reset-button {
  padding: 6px 10px;
  border: 1px solid #d9bfc1;
  border-radius: 6px;
  background: #f8eeee;
  color: #50070e;
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
}

.reset-button:hover {
  background: #f1e1e2;
}

@media (max-width: 600px) {
  .page-heading h2 {
    font-size: 23px;
  }

  .current-ticket {
    min-height: 185px;
    padding: 20px 12px;
  }

  .queue-row {
    gap: 8px;
    padding: 8px 10px;
  }

  .status-pill {
    min-width: 74px;
    padding: 4px 7px;
  }

  .queue-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>