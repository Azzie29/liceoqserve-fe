
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const todayAppointments = ref([])
const pendingRequests = ref([])
const overdueLoans = ref([])
const roomReservations = ref([])
const profiles = ref([])

const loading = ref(false)
const modalOpen = ref(false)
const selectedStat = ref(null)

let realtimeChannel = null
let refreshTimeout = null

const stats = computed(() => [
  {
    title: "TODAY'S TRANSACTION",
    count: todayAppointments.value.length,
    subtitle: 'Appointments created today',
    type: 'transactions'
  },
  {
    title: 'PENDING REQUESTS',
    count: pendingRequests.value.length,
    subtitle: 'Requests awaiting action',
    type: 'requests'
  },
  {
    title: 'OVERDUE REQUESTS',
    count: overdueLoans.value.length,
    subtitle: 'Loans past their due date',
    type: 'overdue'
  },
  {
    title: 'ROOM RESERVATION',
    count: roomReservations.value.length,
    subtitle: 'Recorded room reservations',
    type: 'reservations'
  }
])

const todayDate = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())

  const year = parts.find(p => p.type === 'year').value
  const month = parts.find(p => p.type === 'month').value
  const day = parts.find(p => p.type === 'day').value

  return `${year}-${month}-${day}`
}

const getStudentName = (studentId) => {
  if (!studentId) return 'Not available'

  const profile = profiles.value.find(
    p => p.id === studentId || p.student_id === studentId
  )

  return profile?.full_name || profile?.name || 'Not available'
}

const formatDate = (date) => {
  if (!date) return 'Not available'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const normalizeStatus = (status) => {
  return String(status || 'Pending')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

const fetchDashboardData = async () => {
  if (loading.value) return

  loading.value = true

  try {
    // CHECK CURRENT LOGGED-IN ACCOUNT
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    console.log('AUTH USER:', authData?.user?.id)
    console.log('AUTH EMAIL:', authData?.user?.email)
    console.log('AUTH ERROR:', authError)

    // FETCH DASHBOARD TABLES
    const results = await Promise.all([
      supabase.from('appointments').select('*'),
      supabase.from('registrar_requests').select('*'),
      supabase.from('book_loans').select('*'),
      supabase.from('reservations').select('*'),
      supabase.from('profiles').select('*')
    ])

    const tableNames = [
      'appointments',
      'registrar_requests',
      'book_loans',
      'reservations',
      'profiles'
    ]

    const tableData = {}

    results.forEach((result, index) => {
      const tableName = tableNames[index]

      if (result.error) {
        console.error(
          `${tableName} ERROR:`,
          result.error.message
        )

        tableData[tableName] = []
      } else {
        tableData[tableName] = result.data || []

        console.log(
          `${tableName} records:`,
          tableData[tableName].length,
          tableData[tableName]
        )
      }
    })

    profiles.value = tableData.profiles

    // TODAY'S TRANSACTIONS
    const today = todayDate()

    todayAppointments.value = tableData.appointments.filter(row => {
      if (!row.created_at) return false

      const createdDate = new Date(row.created_at)

      if (Number.isNaN(createdDate.getTime())) return false

      const manilaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(createdDate)

      return manilaDate === today
    })

    // PENDING REQUESTS
    pendingRequests.value = tableData.registrar_requests.filter(row => {
      return String(row.status || '').toLowerCase() === 'pending'
    })

    // OVERDUE LOANS
    const currentDate = new Date()

    overdueLoans.value = tableData.book_loans.filter(row => {
      const dueDate =
        row.due_date ||
        row.due_at ||
        row.return_due_date

      if (!dueDate) return false

      const due = new Date(dueDate)

      if (Number.isNaN(due.getTime())) return false

      const status = String(row.status || '').toLowerCase()

      const finishedStatuses = [
        'returned',
        'completed',
        'cancelled',
        'canceled',
        'resolved'
      ]

      return due < currentDate &&
        !finishedStatuses.includes(status)
    })

    // ROOM RESERVATIONS
    roomReservations.value = tableData.reservations

    console.log('Dashboard successfully updated:', {
      todayAppointments: todayAppointments.value.length,
      pendingRequests: pendingRequests.value.length,
      overdueLoans: overdueLoans.value.length,
      roomReservations: roomReservations.value.length
    })

  } catch (error) {
    console.error('Dashboard fetch error:', error)
  } finally {
    loading.value = false
  }
}

// MODAL DETAILS
const getRecords = (type) => {
  switch (type) {
    case 'transactions':
      return todayAppointments.value
    case 'requests':
      return pendingRequests.value
    case 'overdue':
      return overdueLoans.value
    case 'reservations':
      return roomReservations.value
    default:
      return []
  }
}

const openDetails = (stat) => {
  selectedStat.value = stat
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  selectedStat.value = null
}

const modalRecords = computed(() => {
  if (!selectedStat.value) return []
  return getRecords(selectedStat.value.type)
})

const getRecordTitle = (record) => {
  return (
    record.purpose ||
    record.title ||
    record.request_type ||
    record.service_name ||
    record.room_name ||
    record.name ||
    'Record'
  )
}

const getRecordDate = (record) => {
  return formatDate(
    record.scheduled_at ||
    record.created_at ||
    record.expected_completion ||
    record.due_date ||
    record.due_at
  )
}

// REALTIME REFRESH
const scheduleRefresh = () => {
  clearTimeout(refreshTimeout)

  refreshTimeout = setTimeout(() => {
    fetchDashboardData()
  }, 400)
}

const subscribeToChanges = () => {
  realtimeChannel = supabase
    .channel('registrar-dashboard-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments'
      },
      payload => {
        console.log('Realtime appointments:', payload.eventType)
        scheduleRefresh()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'registrar_requests'
      },
      payload => {
        console.log('Realtime registrar_requests:', payload.eventType)
        scheduleRefresh()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'book_loans'
      },
      payload => {
        console.log('Realtime book_loans:', payload.eventType)
        scheduleRefresh()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations'
      },
      payload => {
        console.log('Realtime reservations:', payload.eventType)
        scheduleRefresh()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      payload => {
        console.log('Realtime profiles:', payload.eventType)
        scheduleRefresh()
      }
    )
    .subscribe(status => {
      console.log('Dashboard realtime status:', status)
    })
}

onMounted(async () => {
  await fetchDashboardData()
  subscribeToChanges()
})

onUnmounted(() => {
  clearTimeout(refreshTimeout)

  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})
</script>

<template>
  <section class="dashboard-stats">

    <div class="stats-header">
      <div>
        <h2>Dashboard Overview</h2>
        <p>Monitor your office transactions and activities.</p>
      </div>

      <button
        class="refresh-button"
        @click="fetchDashboardData"
        :disabled="loading"
      >
        <span :class="{ spinning: loading }">↻</span>
        Refresh
      </button>
    </div>

    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.type"
        class="stat-card"
      >
        <div class="stat-top">
          <span class="stat-count">
            {{ stat.count }}
          </span>
        </div>

        <div class="stat-content">
          <h3>{{ stat.title }}</h3>
          <p>{{ stat.subtitle }}</p>
        </div>

        <button
          class="details-button"
          @click="openDetails(stat)"
        >
          View Details
          <span>→</span>
        </button>
      </div>
    </div>

    <!-- DETAILS MODAL -->
    <div
      v-if="modalOpen"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="details-modal">

        <div class="modal-header">
          <div>
            <h2>{{ selectedStat?.title }}</h2>
            <p>{{ selectedStat?.subtitle }}</p>
          </div>

          <button
            class="close-button"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <div class="modal-count">
          <span>{{ modalRecords.length }}</span>
          <p>Total Records</p>
        </div>

        <div
          v-if="modalRecords.length"
          class="records-list"
        >
          <div
            v-for="(record, index) in modalRecords"
            :key="record.id || index"
            class="record-item"
          >
            <div class="record-info">
              <h3>{{ getRecordTitle(record) }}</h3>

              <p>
                Student:
                {{ getStudentName(record.student_id) }}
              </p>

              <p>
                Date:
                {{ getRecordDate(record) }}
              </p>

              <p v-if="record.purpose">
                Purpose: {{ record.purpose }}
              </p>
            </div>

            <span class="status-badge">
              {{ normalizeStatus(record.status) }}
            </span>
          </div>
        </div>

        <div
          v-else
          class="empty-state"
        >
          <div class="empty-icon">📂</div>
          <h3>No Records Found</h3>
          <p>There are currently no records to display.</p>
        </div>

        <div class="modal-footer">
          <button
            class="modal-close-button"
            @click="closeModal"
          >
            Close
          </button>
        </div>

      </div>
    </div>

  </section>
</template>

<style scoped>
.dashboard-stats {
  width: 100%;
  font-family: Arial, sans-serif;
  color: #4c2026;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.stats-header h2 {
  font-family: Georgia, serif;
  font-size: 21px;
  color: #650b18;
  margin: 0 0 6px;
}

.stats-header p {
  font-size: 13px;
  color: #896d70;
  margin: 0;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #650b18;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s ease;
}

.refresh-button:hover {
  background: #50070e;
}

.refresh-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.refresh-button span {
  font-size: 18px;
}

.spinning {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #f0dfe1;
  border-radius: 11px;
  padding: 19px;
  min-height: 185px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 3px 12px rgba(80, 7, 14, 0.045);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 18px rgba(80, 7, 14, 0.09);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.stat-count {
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: bold;
  color: #650b18;
}

.stat-content {
  margin-top: 17px;
}

.stat-content h3 {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.35px;
  color: #650b18;
  margin: 0 0 7px;
}

.stat-content p {
  font-size: 12px;
  color: #987d80;
  margin: 0;
}

.details-button {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 17px;
  background: transparent;
  border: none;
  color: #650b18;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.details-button:hover {
  color: #a52a3b;
}

.details-button span {
  transition: transform 0.2s ease;
}

.details-button:hover span {
  transform: translateX(4px);
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 12, 15, 0.48);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 9999;
}

.details-modal {
  background: #ffffff;
  width: 100%;
  max-width: 650px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 13px;
  padding: 25px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  animation: modalAppear 0.2s ease;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  border-bottom: 1px solid #f0e3e4;
  padding-bottom: 17px;
}

.modal-header h2 {
  font-family: Georgia, serif;
  font-size: 20px;
  color: #650b18;
  margin: 0 0 6px;
}

.modal-header p {
  color: #987d80;
  font-size: 12px;
  margin: 0;
}

.close-button {
  border: none;
  background: #f9eeee;
  color: #650b18;
  border-radius: 50%;
  width: 31px;
  height: 31px;
  font-size: 22px;
  cursor: pointer;
}

.modal-count {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0;
  background: #fbf5f5;
  border-radius: 8px;
  padding: 12px 15px;
}

.modal-count span {
  font-size: 24px;
  font-weight: bold;
  color: #650b18;
}

.modal-count p {
  font-size: 12px;
  color: #896d70;
  margin: 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border: 1px solid #f0e3e4;
  border-radius: 9px;
}

.record-info {
  min-width: 0;
}

.record-info h3 {
  font-size: 14px;
  color: #650b18;
  margin: 0 0 9px;
}

.record-info p {
  font-size: 12px;
  color: #80686b;
  margin: 5px 0;
  overflow-wrap: anywhere;
}

.status-badge {
  flex-shrink: 0;
  background: #f9eeee;
  color: #650b18;
  border-radius: 20px;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 35px 15px;
}

.empty-icon {
  font-size: 35px;
  margin-bottom: 10px;
}

.empty-state h3 {
  font-family: Georgia, serif;
  font-size: 17px;
  color: #650b18;
  margin: 0 0 7px;
}

.empty-state p {
  font-size: 12px;
  color: #987d80;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  border-top: 1px solid #f0e3e4;
  padding-top: 15px;
}

.modal-close-button {
  background: #650b18;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 10px 22px;
  font-size: 12px;
  cursor: pointer;
}

.modal-close-button:hover {
  background: #50070e;
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-header {
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .record-item {
    flex-direction: column;
  }

  .details-modal {
    padding: 18px;
  }
}
</style>
