
<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

import RequestCard from '../components/RequestCard.vue'
import RequestDetails from '../components/RequestDetails.vue'
import StatusConfirmModal from '../components/StatusConfirmModal.vue'

// LIBRARY OFFICE SERVICE IDs
const LIBRARY_SERVICE_IDS = [
  '987d7769-8a02-44a1-9b95-cdfec559a70e',
  'faa4239d-cae7-4fe7-af69-3f25bec2fe44',
  '99a740ad-96d7-43a5-9bcc-3f9723cabd28',
  '11153e05-a183-48cd-83b0-12e46d921915',
  'be4db8a9-3ac2-41ae-ba72-5e96a3034512',
  '2e171fa5-701e-4e91-9d3a-a99214dfce59',
]

const filters = [
  'All',
  'Pending',
  'Processing',
  'Completed',
  'Cancelled',
]

const activeFilter = ref('All')
const selectedRequestId = ref(null)
const showStatusModal = ref(false)
const pendingStatus = ref('Pending')
const searchQuery = ref('')
const notice = ref('')
const requests = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

let requestSubscription = null

// DATABASE STATUS TO DISPLAY STATUS
function formatStatus(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'pending') return 'Pending'
  if (normalized === 'processing') return 'Processing'
  if (normalized === 'completed') return 'Completed'
  if (normalized === 'cancelled') return 'Cancelled'

  if (
    normalized === 'ready_for_pickup' ||
    normalized === 'claimed'
  ) {
    return 'Processing'
  }

  if (normalized === 'rejected') return 'Cancelled'

  return 'Pending'
}

// FETCH REQUESTS FROM SUPABASE
async function fetchRequests() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data: requestData, error: requestError } = await supabase
      .from('service_requests')
      .select('*')
      .in('service_id', LIBRARY_SERVICE_IDS)
      .order('submitted_at', { ascending: false })

    if (requestError) throw requestError

    const studentIds = [
      ...new Set(
        (requestData || [])
          .map((request) => request.student_id)
          .filter(Boolean),
      ),
    ]

    let profilesMap = {}

    if (studentIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, student_id')
        .in('id', studentIds)

      if (profileError) throw profileError

      profilesMap = Object.fromEntries(
        (profiles || []).map((profile) => [
          profile.id,
          profile,
        ]),
      )
    }

    requests.value = (requestData || []).map((request) => {
      const student = profilesMap[request.student_id]

      return {
        id: request.id,
        requestNumber: `REQ-${request.id.slice(0, 8).toUpperCase()}`,
        studentName: student?.full_name || 'Unknown Student',
        studentId: student?.student_id || 'Not available',
        type:
          request.request_type ||
          request.title ||
          'Library Request',
        requestDate: request.submitted_at
          ? request.submitted_at.slice(0, 10)
          : '',
        expectedDate: request.expected_completion || '',
        status: formatStatus(request.status),
        instruction:
          request.instructions ||
          request.staff_notes ||
          '',
        details: request.details || '',
        studentUuid: request.student_id,
        serviceId: request.service_id,
        databaseStatus: request.status,
      }
    })

    const selectedStillExists = requests.value.some(
      (request) => request.id === selectedRequestId.value,
    )

    if (!selectedStillExists) {
      selectedRequestId.value = requests.value[0]?.id || null
    }
  } catch (error) {
    console.error('Error fetching Library requests:', error)
    errorMessage.value =
      error.message || 'Unable to load requests from Supabase.'
  } finally {
    loading.value = false
  }
}

// SELECTED REQUEST
const selectedRequest = computed(() =>
  requests.value.find(
    (request) => request.id === selectedRequestId.value,
  ) || null,
)

// FILTER AND SEARCH
const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return requests.value.filter((request) => {
    const matchesStatus =
      activeFilter.value === 'All' ||
      request.status === activeFilter.value

    const matchesSearch =
      !query ||
      [
        request.studentName,
        request.requestNumber,
        request.type,
        request.studentId,
      ].some((value) =>
        String(value || '').toLowerCase().includes(query),
      )

    return matchesStatus && matchesSearch
  })
})

// SELECT REQUEST
function selectRequest(request) {
  selectedRequestId.value = request.id
  notice.value = ''
}

// SAVE EXPECTED DATE AND INSTRUCTIONS
async function saveRequest(updatedRequest) {
  if (!updatedRequest?.id || saving.value) return

  saving.value = true
  notice.value = ''

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    const userId = authData.user?.id

    const updateData = {
      expected_completion:
        updatedRequest.expectedDate || null,
      instructions:
        updatedRequest.instruction?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    if (userId) {
      updateData.handled_by = userId
    }

    const { error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', updatedRequest.id)

    if (error) throw error

    notice.value = 'Request details saved successfully.'

    await fetchRequests()
  } catch (error) {
    console.error('Error saving request:', error)
    notice.value =
      error.message || 'Failed to save request details.'
  } finally {
    saving.value = false
  }
}

// OPEN STATUS CONFIRMATION
function askForStatusChange(status) {
  if (!selectedRequest.value) return

  if (selectedRequest.value.status === status) {
    notice.value = `This request is already ${status.toLowerCase()}.`
    return
  }

  pendingStatus.value = status
  showStatusModal.value = true
}

// UPDATE REQUEST STATUS IN SUPABASE
async function confirmStatusChange() {
  if (!selectedRequest.value || saving.value) return

  saving.value = true
  notice.value = ''

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    const userId = authData.user?.id

    const databaseStatus = {
      Pending: 'pending',
      Processing: 'processing',
      Completed: 'completed',
      Cancelled: 'cancelled',
    }[pendingStatus.value]

    const updateData = {
      status: databaseStatus,
      updated_at: new Date().toISOString(),
      completed_at:
        pendingStatus.value === 'Completed'
          ? new Date().toISOString()
          : null,
    }

    if (userId) {
      updateData.handled_by = userId
    }

    const { error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', selectedRequest.value.id)

    if (error) throw error

    showStatusModal.value = false
    notice.value = `Request status changed to ${pendingStatus.value}.`

    await fetchRequests()
  } catch (error) {
    console.error('Error updating request status:', error)
    notice.value =
      error.message || 'Failed to update request status.'
  } finally {
    saving.value = false
  }
}

// CLOSE STATUS MODAL
function closeStatusModal() {
  if (saving.value) return
  showStatusModal.value = false
}

// FORMAT DATE
function formatDate(date) {
  if (!date) return 'Not set'

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )
}

// REALTIME REFRESH
function subscribeToRequests() {
  requestSubscription = supabase
    .channel('library-service-requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_requests',
      },
      () => {
        fetchRequests()
      },
    )
    .subscribe()
}

onMounted(async () => {
  await fetchRequests()
  subscribeToRequests()
})

onUnmounted(() => {
  if (requestSubscription) {
    supabase.removeChannel(requestSubscription)
  }
})
</script>

<template>
  <main class="requests-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">LIBRARY MANAGEMENT</p>
        <h1>Requests</h1>
        <p class="subtitle">
          Manage student requests, track progress, and update status.
        </p>
      </div>

      <div class="request-total">
        <span>Total requests</span>
        <strong>{{ requests.length }}</strong>
      </div>
    </header>

    <div v-if="notice" class="notice" role="status">
      <span>{{ notice }}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        @click="notice = ''"
      >
        ×
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button type="button" @click="fetchRequests">
        Try again
      </button>
    </div>

    <section class="requests-workspace">
      <div class="request-list-panel">
        <div class="list-heading">
          <h2>Student requests</h2>
          <span>{{ filteredRequests.length }} found</span>
        </div>

        <label class="search-box">
          <span class="sr-only">Search requests</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search name, request number..."
          />
        </label>

        <div class="filter-list" aria-label="Filter requests">
          <button
            v-for="filter in filters"
            :key="filter"
            type="button"
            :class="{ active: activeFilter === filter }"
            :aria-pressed="activeFilter === filter"
            @click="activeFilter = filter"
          >
            {{ filter }}
            <span v-if="filter === 'All'">
              {{ requests.length }}
            </span>
            <span v-else>
              {{
                requests.filter(
                  (request) => request.status === filter,
                ).length
              }}
            </span>
          </button>
        </div>

        <div v-if="loading" class="empty-list">
          <p>Loading requests...</p>
        </div>

        <div
          v-else-if="filteredRequests.length"
          class="request-cards"
        >
          <RequestCard
            v-for="request in filteredRequests"
            :key="request.id"
            :request="request"
            :selected="selectedRequestId === request.id"
            @select="selectRequest"
          />
        </div>

        <div v-else class="empty-list">
          <h3>No requests found</h3>
          <p>
            {{
              requests.length === 0
                ? 'No Library requests have been submitted yet.'
                : 'Try another status filter or search term.'
            }}
          </p>
        </div>
      </div>

      <div class="request-details-column">
        <RequestDetails
          :request="selectedRequest"
          @save="saveRequest"
          @change-status="askForStatusChange"
          @close="selectedRequestId = null"
        />

        <section
          v-if="selectedRequest"
          class="timeline-panel"
        >
          <h2>Request overview</h2>

          <div class="timeline-row">
            <span class="timeline-dot"></span>
            <div>
              <strong>Request submitted</strong>
              <p>{{ formatDate(selectedRequest.requestDate) }}</p>
            </div>
          </div>

          <div class="timeline-row">
            <span
              class="timeline-dot"
              :class="{
                completed:
                  selectedRequest.status === 'Processing' ||
                  selectedRequest.status === 'Completed',
              }"
            ></span>
            <div>
              <strong>Current status</strong>
              <p>{{ selectedRequest.status }}</p>
            </div>
          </div>

          <div class="timeline-row">
            <span
              class="timeline-dot"
              :class="{
                completed: selectedRequest.status === 'Completed',
              }"
            ></span>
            <div>
              <strong>Expected completion</strong>
              <p>{{ formatDate(selectedRequest.expectedDate) }}</p>
            </div>
          </div>
        </section>
      </div>
    </section>

    <StatusConfirmModal
      :show="showStatusModal"
      :status="pendingStatus"
      @confirm="confirmStatusChange"
      @cancel="closeStatusModal"
    />
  </main>
</template>

<style scoped>
.requests-page {
  flex: 1;
  min-width: 0;
  min-height: calc(100vh - 104px);
  padding: 28px;
  background: #eadcda;
  color: #390607;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 7px;
  color: #805d5e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

h1 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 32px;
}

.subtitle {
  margin: 8px 0 0;
  color: #795f60;
  font-size: 12px;
  line-height: 1.6;
}

.request-total {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 105px;
  padding: 14px 17px;
  border: 1px solid #d5bdbc;
  border-radius: 10px;
  background: #f8eeee;
}

.request-total span {
  color: #795f60;
  font-size: 10px;
}

.request-total strong {
  font-family: Georgia, serif;
  font-size: 26px;
}

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 15px;
  border: 1px solid #c6d9bf;
  border-radius: 8px;
  background: #edf5e9;
  color: #315a2e;
  font-size: 12px;
}

.notice button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 15px;
  border: 1px solid #d8aaaa;
  border-radius: 8px;
  background: #fceaea;
  color: #8a1717;
  font-size: 12px;
}

.error-message button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-weight: 700;
}

.requests-workspace {
  display: grid;
  grid-template-columns: minmax(260px, 0.95fr) minmax(0, 1.2fr);
  align-items: start;
  gap: 20px;
}

.request-list-panel,
.timeline-panel {
  min-width: 0;
  padding: 18px;
  border: 1px solid #d5bdbc;
  border-radius: 12px;
  background: #f6eded;
}

.list-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.list-heading h2,
.timeline-panel h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 17px;
}

.list-heading > span {
  color: #795f60;
  font-size: 10px;
}

.search-box {
  display: block;
  margin-bottom: 14px;
}

.search-box input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px;
  border: 1px solid #d5bdbc;
  border-radius: 7px;
  background: #fff9f8;
  color: #390607;
  font-size: 12px;
}

.filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.filter-list button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid #d5bdbc;
  border-radius: 7px;
  background: transparent;
  color: #5f3839;
  cursor: pointer;
  font-size: 10px;
}

.filter-list button span {
  font-size: 9px;
  opacity: 0.8;
}

.filter-list button.active {
  border-color: #56090d;
  background: #56090d;
  color: white;
}

.request-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-list {
  padding: 28px 10px;
  text-align: center;
}

.empty-list h3 {
  font-size: 14px;
}

.empty-list p {
  color: #795f60;
  font-size: 11px;
}

.request-details-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.timeline-panel h2 {
  margin-bottom: 20px;
}

.timeline-row {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 20px;
}

.timeline-row:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 3px;
  border: 2px solid #9c7778;
  border-radius: 50%;
  background: #f6eded;
}

.timeline-dot.completed {
  border-color: #276d39;
  background: #276d39;
}

.timeline-row strong {
  font-size: 11px;
}

.timeline-row p {
  margin: 5px 0 0;
  color: #795f60;
  font-size: 10px;
}

.sr-only {
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

@media (max-width: 1050px) {
  .requests-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 700px) {
  .requests-page {
    padding: 18px 12px;
  }

  .page-header {
    align-items: flex-start;
  }

  h1 {
    font-size: 27px;
  }

  .request-total {
    min-width: 75px;
    padding: 10px;
  }

  .request-list-panel,
  .timeline-panel {
    padding: 12px;
  }
}
</style>
