
<script setup>
import { ref, onMounted } from 'vue'
import StatCard from '../components/StatCard.vue'
import { supabase } from '../lib/Supabase.js'

const emit = defineEmits(['navigate'])

const NICO_STUDENT_ID = '2921235d-a3c7-4864-8dbc-b517081eec7d'

const stats = [
  { title: "TODAY'S APPOINTMENTS", count: 0, subtitle: 'View Details' },
  { title: 'PENDING REQUEST', count: 1, subtitle: 'View Details' },
  { title: 'READY FOR PICK UP', count: 0, subtitle: 'View Details' }
]

const requests = ref([])
const studentName = ref('Nico Da')
const loading = ref(false)
const errorMessage = ref('')

function goToAppointments() {
  emit('navigate', 'Appointments')
}

function goToPending() {
  emit('navigate', 'Request', 'Pending')
}

function goToReadyForPickup() {
  emit('navigate', 'Request', 'Ready for Pick Up')
}

async function fetchDashboardRequests() {
  loading.value = true
  errorMessage.value = ''

  try {
    // Get Nico Da profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', NICO_STUDENT_ID)
      .single()

    if (profileError) throw profileError

    studentName.value = profile.full_name

    // Get Nico Da requests from Supabase
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        title,
        request_type,
        details,
        status,
        submitted_at,
        expected_completion
      `)
      .eq('student_id', NICO_STUDENT_ID)
      .order('submitted_at', { ascending: false })

    if (error) throw error

    requests.value = data || []
  } catch (error) {
    console.error('Dashboard request fetch error:', error)
    errorMessage.value = error.message || 'Unable to load requests.'
  } finally {
    loading.value = false
  }
}

// Display time only, without the date
function formatRequestDate(date) {
  if (!date) return 'Time not available'

  return new Date(date).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatStatus(status) {
  if (!status) return 'Pending'

  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

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

  if (normalized === 'rejected' || normalized === 'cancelled') {
    return 'rejected'
  }

  return 'pending'
}

onMounted(() => {
  fetchDashboardRequests()
})
</script>

<template>
  <section class="page-container dashboard-page">
    <div class="welcome-banner">
      <span class="dashboard-date">OCTOBER 1, 2026</span>

      <h2>Office of Student Affairs DASHBOARD</h2>

      <p>
        Review today's workload and continue the next transaction.
      </p>
    </div>

    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="stat.title"
      >
        <StatCard
          v-bind="stat"
          @click="
            index === 0
              ? goToAppointments()
              : index === 1
                ? goToPending()
                : goToReadyForPickup()
          "
        />
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="panel dashboard-panel">
        <h3>TODAY'S APPOINTMENTS</h3>

        <div v-if="loading" class="record-row">
          <div class="record-info">
            <span>Loading Nico Da requests...</span>
          </div>
        </div>

        <div v-else-if="errorMessage" class="record-row">
          <div class="record-info">
            <strong>Unable to load requests</strong>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <div
          v-else-if="requests.length === 0"
          class="record-row"
        >
          <div class="record-info">
            <strong>{{ studentName }}</strong>
            <span>No requests found.</span>
          </div>
        </div>

        <div
          v-else
          v-for="item in requests"
          :key="item.id"
          class="record-row"
        >
          <div class="record-time">
            {{ formatRequestDate(item.submitted_at) }}
          </div>

          <div class="record-info">
            <strong>{{ studentName }}</strong>
            <span>{{ item.title || item.request_type }}</span>
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
