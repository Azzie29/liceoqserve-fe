
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StatCard from '../components/StatCard.vue'
import { supabase } from '../lib/Supabase.js'

const emit = defineEmits(['navigate'])

// OSA SERVICE IDS
const OSA_SERVICE_IDS = [
  '5c2ab6fc-5f24-4573-896a-f5a11ad6625e',
  '65a94572-bce2-460f-b3e8-2ed568ee7bbf'
]

// DASHBOARD COUNTS
const todayAppointments = ref(0)
const pendingRequests = ref(0)
const readyForPickup = ref(0)

// APPOINTMENT RECORDS
const appointments = ref([])

const loading = ref(true)
const errorMessage = ref('')
const currentDate = ref('')

let dashboardSubscription = null
let isFetching = false
let refreshAgain = false
let isMounted = false

// DASHBOARD CARDS
const stats = computed(() => [
  {
    title: "TODAY'S APPOINTMENTS",
    count: todayAppointments.value,
    subtitle: 'View Details'
  },
  {
    title: 'PENDING REQUEST',
    count: pendingRequests.value,
    subtitle: 'View Details'
  },
  {
    title: 'READY FOR PICK UP',
    count: readyForPickup.value,
    subtitle: 'View Details'
  }
])

// NAVIGATION
function handleCardClick(index) {
  if (index === 0) {
    emit('navigate', 'Appointments')
  } else if (index === 1) {
    emit('navigate', 'Request', 'Pending')
  } else {
    emit('navigate', 'Request', 'Ready for Pick Up')
  }
}

// CURRENT DATE
function updateCurrentDate() {
  currentDate.value = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila'
  })
}

// PHILIPPINE TIME DATE RANGE
function getTodayDateRange() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  const today = formatter.format(new Date())
  const startDate = new Date(`${today}T00:00:00+08:00`)

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 1)

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }
}

// FORMAT APPOINTMENT TIME
function formatAppointmentTime(date) {
  if (!date) return 'Time not available'

  return new Date(date).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  })
}

// FORMAT STATUS
function formatStatus(status) {
  if (!status) return 'Pending'

  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

// STATUS CLASS
function statusClass(status) {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'processing') return 'processing'

  if (
    normalized === 'ready_for_pickup' ||
    normalized === 'claimed' ||
    normalized === 'completed'
  ) {
    return 'confirmed'
  }

  if (
    normalized === 'cancelled' ||
    normalized === 'rejected' ||
    normalized === 'no_show'
  ) {
    return 'rejected'
  }

  return 'pending'
}

// FETCH TODAY'S APPOINTMENTS
async function fetchTodayAppointments() {
  const { start, end } = getTodayDateRange()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      student_id,
      service_id,
      scheduled_at,
      status,
      purpose
    `)
    .in('service_id', OSA_SERVICE_IDS)
    .gte('scheduled_at', start)
    .lt('scheduled_at', end)
    .neq('status', 'cancelled')
    .neq('status', 'completed')
    .neq('status', 'no_show')
    .order('scheduled_at', { ascending: true })

  if (error) throw error

  const appointmentData = data || []

  // FETCH STUDENT PROFILES
  const studentIds = [
    ...new Set(
      appointmentData
        .map(item => item.student_id)
        .filter(Boolean)
    )
  ]

  let profiles = []

  if (studentIds.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, student_id')
      .in('id', studentIds)

    if (profileError) throw profileError

    profiles = profileData || []
  }

  const profileMap = new Map(
    profiles.map(profile => [profile.id, profile])
  )

  appointments.value = appointmentData.map(item => {
    const profile = profileMap.get(item.student_id)

    return {
      ...item,
      studentName: profile?.full_name || 'Unknown Student',
      studentNumber: profile?.student_id || 'Not available'
    }
  })

  todayAppointments.value = appointments.value.length
}

// FETCH PENDING REQUESTS
async function fetchPendingRequests() {
  const { count, error } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact', head: true })
    .in('service_id', OSA_SERVICE_IDS)
    .eq('status', 'pending')

  if (error) throw error

  pendingRequests.value = count ?? 0
}

// FETCH READY FOR PICK UP
async function fetchReadyForPickup() {
  const { count, error } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact', head: true })
    .in('service_id', OSA_SERVICE_IDS)
    .eq('status', 'ready_for_pickup')

  if (error) throw error

  readyForPickup.value = count ?? 0
}

// FETCH ALL DASHBOARD DATA
async function fetchDashboardData() {
  // If another fetch is ongoing, schedule another fetch afterward.
  if (isFetching) {
    refreshAgain = true
    return
  }

  isFetching = true

  do {
    refreshAgain = false

    try {
      await Promise.all([
        fetchTodayAppointments(),
        fetchPendingRequests(),
        fetchReadyForPickup()
      ])

      errorMessage.value = ''

      console.log('OSA DASHBOARD UPDATED:', {
        todayAppointments: todayAppointments.value,
        pendingRequests: pendingRequests.value,
        readyForPickup: readyForPickup.value
      })
    } catch (error) {
      console.error('OSA dashboard fetch error:', error)

      errorMessage.value =
        error.message || 'Unable to load dashboard data.'
    }
  } while (refreshAgain && isMounted)

  isFetching = false
  loading.value = false
}

// SUPABASE REALTIME
function subscribeToDashboardChanges() {
  dashboardSubscription = supabase
    .channel('osa-dashboard-realtime')

    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments'
      },
      (payload) => {
        console.log('OSA appointment change detected:', payload.eventType)
        fetchDashboardData()
      }
    )

    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_requests'
      },
      (payload) => {
        console.log('OSA service request change detected:', payload.eventType)
        fetchDashboardData()
      }
    )

    .subscribe((status, error) => {
      console.log('OSA dashboard realtime status:', status)

      if (error) {
        console.error('OSA dashboard realtime error:', error)
      }

      // Fetch the latest data once Realtime is connected.
      if (status === 'SUBSCRIBED') {
        fetchDashboardData()
      }
    })
}

// INITIALIZATION
onMounted(() => {
  isMounted = true

  updateCurrentDate()

  // Initial dashboard fetch
  fetchDashboardData()

  // Listen for database changes
  subscribeToDashboardChanges()
})

// CLEANUP
onUnmounted(() => {
  isMounted = false

  if (dashboardSubscription) {
    supabase.removeChannel(dashboardSubscription)
    dashboardSubscription = null
  }
})
</script>

<template>
  <section class="page-container dashboard-page">

    <!-- WELCOME BANNER -->
    <div class="welcome-banner">
      <span class="dashboard-date">
        {{ currentDate }}
      </span>

      <h2>Office of Student Affairs DASHBOARD</h2>

      <p>
        Review today's workload and continue the next transaction.
      </p>
    </div>

    <!-- DASHBOARD STAT CARDS -->
    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="stat.title"
      >
        <StatCard
          v-bind="stat"
          @click="handleCardClick(index)"
        />
      </div>
    </div>

    <!-- TODAY'S APPOINTMENTS -->
    <div class="dashboard-grid">
      <section class="panel dashboard-panel">

        <div class="dashboard-panel-header">
          <h3>TODAY'S APPOINTMENTS</h3>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="record-row">
          <div class="record-info">
            <span>Loading appointments...</span>
          </div>
        </div>

        <!-- ERROR -->
        <div v-else-if="errorMessage" class="record-row">
          <div class="record-info">
            <strong>Unable to load dashboard</strong>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <!-- NO APPOINTMENTS -->
        <div
          v-else-if="appointments.length === 0"
          class="record-row"
        >
          <div class="record-info">
            <strong>No appointments today</strong>
            <span>
              There are currently no scheduled appointments.
            </span>
          </div>
        </div>

        <!-- APPOINTMENT RECORDS -->
        <div
          v-else
          v-for="item in appointments"
          :key="item.id"
          class="record-row"
        >
          <div class="record-time">
            {{ formatAppointmentTime(item.scheduled_at) }}
          </div>

          <div class="record-info">
            <strong>{{ item.studentName }}</strong>

            <span>
              {{ item.purpose || 'Appointment' }}
            </span>

            <small>
              {{ item.studentNumber }}
            </small>
          </div>

          <span
            :class="[
              'status-badge',
              statusClass(item.status)
            ]"
          >
            {{ formatStatus(item.status) }}
          </span>
        </div>

      </section>
    </div>

  </section>
</template>
