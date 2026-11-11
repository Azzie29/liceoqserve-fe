
<template>
  <div class="history-page">
    <header class="page-heading">
      <div>
        <h1>History</h1>
        <p>Select a concise history item to view its complete audit details.</p>
      </div>

      <button class="refresh-button" @click="fetchHistory" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </header>

    <p v-if="loading" class="message">Loading history records...</p>

    <p v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>

    <section v-else-if="historyItems.length" class="history-list">
      <article
        v-for="item in historyItems"
        :key="item.id"
        class="history-row"
      >
        <div class="history-info">
          <strong>{{ item.title }}</strong>
          <small>{{ item.date }} · {{ item.time }}</small>
        </div>

        <button class="view-button" @click="viewDetails(item)">
          View details
        </button>
      </article>
    </section>

    <div v-else class="empty-state">
      <strong>No history records found.</strong>
      <p>Completed Library transactions will appear here.</p>
    </div>

    <!-- HISTORY DETAILS MODAL -->
    <div
      v-if="selectedItem"
      class="modal-overlay"
      @click.self="selectedItem = null"
      @keydown.esc="selectedItem = null"
    >
      <section
        class="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <div class="modal-top">
          <span>HISTORY DETAILS</span>
          <button class="close-button" @click="selectedItem = null">
            Close
          </button>
        </div>

        <h2 id="details-title">{{ selectedItem.title }}</h2>
        <p class="modal-date">
          {{ selectedItem.date }} · {{ selectedItem.time }}
        </p>

        <div class="details-grid">
          <div>
            <label>What Happened</label>
            <strong>{{ selectedItem.title }}</strong>
          </div>

          <div>
            <label>Transaction Type</label>
            <strong>{{ selectedItem.transactionType }}</strong>
          </div>

          <div>
            <label>Student</label>
            <strong>{{ selectedItem.student }}</strong>
          </div>

          <div>
            <label>Transaction ID</label>
            <strong>{{ selectedItem.transactionId }}</strong>
          </div>

          <div>
            <label>Previous Status</label>
            <strong>{{ selectedItem.previousStatus }}</strong>
          </div>

          <div>
            <label>Updated Status</label>
            <strong>{{ selectedItem.status }}</strong>
          </div>

          <div>
            <label>Performed By</label>
            <strong>{{ selectedItem.performedBy }}</strong>
          </div>
        </div>

        <div class="notes-box">
          <strong>Notes / instructions:</strong>
          <p>{{ selectedItem.notes }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

// LIBRARY OFFICE ID
const LIBRARY_OFFICE_ID = '68828efd-4e49-4312-b4c5-3945793b0e10'

const selectedItem = ref(null)
const historyItems = ref([])
const loading = ref(false)
const errorMessage = ref('')

// Format date and time using Philippine timezone
function formatDateTime(value) {
  if (!value) {
    return {
      date: 'Date unavailable',
      time: 'Time unavailable'
    }
  }

  const dateValue = new Date(value)

  return {
    date: new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateValue),

    time: new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(dateValue)
  }
}

// Get additional notes from the original transaction
async function fetchTransactionNotes(records) {
  const requestIds = records
    .filter(item => item.transaction_type === 'request')
    .map(item => item.transaction_id)

  const appointmentIds = records
    .filter(item => item.transaction_type === 'appointment')
    .map(item => item.transaction_id)

  const requestMap = new Map()
  const appointmentMap = new Map()

  if (requestIds.length > 0) {
    const { data, error } = await supabase
      .from('service_requests')
      .select('id, details, staff_notes, instructions')
      .in('id', requestIds)

    if (error) {
      console.error('Request notes error:', error)
    } else {
      data.forEach(item => requestMap.set(item.id, item))
    }
  }

  if (appointmentIds.length > 0) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, student_notes, staff_notes')
      .in('id', appointmentIds)

    if (error) {
      console.error('Appointment notes error:', error)
    } else {
      data.forEach(item => appointmentMap.set(item.id, item))
    }
  }

  return { requestMap, appointmentMap }
}

function getTransactionNotes(item, requestMap, appointmentMap) {
  if (item.transaction_type === 'request') {
    const request = requestMap.get(item.transaction_id)

    if (!request) return 'No additional notes recorded.'

    return [
      request.details,
      request.staff_notes,
      request.instructions
    ]
      .filter(value => value && value.trim())
      .join('\n\n') || 'No additional notes recorded.'
  }

  if (item.transaction_type === 'appointment') {
    const appointment = appointmentMap.get(item.transaction_id)

    if (!appointment) return 'No additional notes recorded.'

    return [
      appointment.student_notes,
      appointment.staff_notes
    ]
      .filter(value => value && value.trim())
      .join('\n\n') || 'No additional notes recorded.'
  }

  return 'No additional notes recorded.'
}

// FETCH LIBRARY HISTORY
async function fetchHistory() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('service_history')
      .select(`
        id,
        student_id,
        service_id,
        transaction_type,
        transaction_id,
        title,
        final_status,
        completed_at,
        created_at,
        previous_status,
        performed_by,
        student:profiles!service_history_student_id_fkey (
          full_name,
          student_id
        ),
        performer:profiles!service_history_performed_by_fkey (
          full_name
        ),
        service:office_services!service_history_service_id_fkey (
          office_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Only show Library Office records
    const libraryRecords = (data || []).filter(
      item => item.service?.office_id === LIBRARY_OFFICE_ID
    )

    // Retrieve notes from their original transactions
    const { requestMap, appointmentMap } =
      await fetchTransactionNotes(libraryRecords)

    historyItems.value = libraryRecords.map(item => {
      const formatted = formatDateTime(
        item.completed_at || item.created_at
      )

      const transactionType =
        item.transaction_type === 'appointment'
          ? 'Appointment'
          : 'Service Request'

      return {
        id: item.id,
        title:
          item.transaction_type === 'appointment'
            ? `Appointment Completed - ${item.title}`
            : `Request Completed - ${item.title}`,

        date: formatted.date,
        time: formatted.time,

        student:
          item.student?.full_name ||
          item.student?.student_id ||
          'Not recorded',

        transactionId: item.transaction_id || 'Not recorded',

        transactionType,

        previousStatus:
          item.previous_status || 'Not recorded',

        status:
          item.final_status || 'Not recorded',

        performedBy:
          item.performer?.full_name || 'Not recorded',

        notes: getTransactionNotes(
          item,
          requestMap,
          appointmentMap
        )
      }
    })

  } catch (error) {
    console.error('History fetch error:', error)

    errorMessage.value =
      error.message || 'Unable to load history records.'
  } finally {
    loading.value = false
  }
}

function viewDetails(item) {
  selectedItem.value = item
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.history-page {
  min-height: calc(100vh - 100px);
  padding: 24px;
  background: #efdfdf;
  color: #350909;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  color: #3f2929;
}

.refresh-button {
  padding: 9px 16px;
  border: 1px solid #8c5555;
  border-radius: 8px;
  background: #f8eeee;
  color: #600b13;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.history-list {
  overflow: hidden;
  border: 1px solid #b99595;
  border-radius: 18px;
  background: #f8eeee;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  padding: 14px 20px;
  border-bottom: 1px solid #ead7d7;
  box-sizing: border-box;
}

.history-row:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.history-info strong {
  font-size: 14px;
  font-weight: 600;
}

.history-info small {
  color: #806868;
  font-size: 11px;
}

.view-button {
  flex-shrink: 0;
  padding: 8px 0 8px 12px;
  border: none;
  background: transparent;
  color: #600b13;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.view-button:hover,
.close-button:hover {
  text-decoration: underline;
}

.message,
.empty-state {
  padding: 30px;
  border: 1px solid #b99595;
  border-radius: 14px;
  background: #f8eeee;
  text-align: center;
  color: #806868;
  font-size: 13px;
}

.empty-state strong {
  color: #350909;
}

.empty-state p {
  margin-bottom: 0;
}

.error-message {
  padding: 16px;
  border: 1px solid #c98b8b;
  border-radius: 10px;
  background: #f8eeee;
  color: #a01818;
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.42);
  box-sizing: border-box;
}

.details-modal {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 22px;
  border-radius: 14px;
  background: #fff8f8;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-top span {
  color: #927a7a;
  font-size: 10px;
  letter-spacing: 0.5px;
}

.close-button {
  border: none;
  background: transparent;
  color: #806868;
  font-size: 11px;
  cursor: pointer;
}

.details-modal h2 {
  margin: 0 0 6px;
  color: #350909;
  font-size: 20px;
  line-height: 1.3;
}

.modal-date {
  margin: 0 0 22px;
  color: #806868;
  font-size: 11px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 16px;
}

.details-grid > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.details-grid label {
  color: #927a7a;
  font-size: 11px;
}

.details-grid strong {
  overflow-wrap: anywhere;
  color: #350909;
  font-size: 12px;
  font-weight: 600;
}

.notes-box {
  margin-top: 22px;
  padding: 14px;
  border-radius: 8px;
  background: #efdada;
  color: #482828;
  font-size: 12px;
  line-height: 1.6;
}

.notes-box p {
  margin: 6px 0 0;
  white-space: pre-line;
}

@media (max-width: 600px) {
  .history-page {
    padding: 16px;
  }

  .page-heading {
    align-items: flex-start;
  }

  .history-row {
    padding: 12px;
  }

  .history-info strong {
    font-size: 12px;
  }

  .view-button {
    font-size: 11px;
  }

  .details-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px 10px;
  }
}
</style>
