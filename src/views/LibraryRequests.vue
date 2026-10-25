
<script setup>
import { computed, ref } from 'vue'

import RequestCard from '../components/RequestCard.vue'
import RequestDetails from '../components/RequestDetails.vue'
import StatusConfirmModal from '../components/StatusConfirmModal.vue'

const filters = [
  'All',
  'Pending',
  'Processing',
  'Completed',
  'Cancelled',
]

const activeFilter = ref('All')
const selectedRequestId = ref(1)
const showStatusModal = ref(false)
const pendingStatus = ref('Pending')
const searchQuery = ref('')
const notice = ref('')

const requests = ref([
  {
    id: 1,
    requestNumber: 'REQ-2026-001',
    studentName: 'Maria Santos',
    studentId: '2024-00125',
    type: 'Certificate of Enrollment',
    requestDate: '2026-10-20',
    expectedDate: '2026-10-28',
    status: 'Pending',
    instruction: 'Please bring your school ID when claiming.',
  },
  {
    id: 2,
    requestNumber: 'REQ-2026-002',
    studentName: 'Juan Dela Cruz',
    studentId: '2023-00418',
    type: 'Good Moral Certificate',
    requestDate: '2026-10-21',
    expectedDate: '2026-10-29',
    status: 'Processing',
    instruction: 'Please wait for the office confirmation.',
  },
  {
    id: 3,
    requestNumber: 'REQ-2026-003',
    studentName: 'Ana Reyes',
    studentId: '2024-00076',
    type: 'Library Clearance',
    requestDate: '2026-10-22',
    expectedDate: '2026-10-25',
    status: 'Completed',
    instruction: 'Ready for claiming at the library office.',
  },
  {
    id: 4,
    requestNumber: 'REQ-2026-004',
    studentName: 'Mark Garcia',
    studentId: '2022-00332',
    type: 'Transcript Request',
    requestDate: '2026-10-23',
    expectedDate: '',
    status: 'Cancelled',
    instruction: 'Request cancelled by the student.',
  },
  {
    id: 5,
    requestNumber: 'REQ-2026-005',
    studentName: 'Sofia Lim',
    studentId: '2025-00108',
    type: 'Certificate of Registration',
    requestDate: '2026-10-24',
    expectedDate: '2026-10-30',
    status: 'Pending',
    instruction: '',
  },
])

const selectedRequest = computed(() =>
  requests.value.find(
    (request) => request.id === selectedRequestId.value,
  ) || null,
)

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return requests.value.filter((request) => {
    const matchesStatus =
      activeFilter.value === 'All' ||
      request.status === activeFilter.value

    const matchesSearch =
      !query ||
      request.studentName.toLowerCase().includes(query) ||
      request.requestNumber.toLowerCase().includes(query) ||
      request.type.toLowerCase().includes(query) ||
      request.studentId.toLowerCase().includes(query)

    return matchesStatus && matchesSearch
  })
})

function selectRequest(request) {
  selectedRequestId.value = request.id
  notice.value = ''
}

function saveRequest(updatedRequest) {
  const index = requests.value.findIndex(
    (request) => request.id === updatedRequest.id,
  )

  if (index === -1) return

  requests.value[index] = { ...updatedRequest }
  notice.value = 'Request details saved successfully.'
}

function askForStatusChange(status) {
  if (!selectedRequest.value) return

  if (selectedRequest.value.status === status) {
    notice.value = `This request is already ${status.toLowerCase()}.`
    return
  }

  pendingStatus.value = status
  showStatusModal.value = true
}

function confirmStatusChange() {
  if (!selectedRequest.value) return

  const request = requests.value.find(
    (item) => item.id === selectedRequestId.value,
  )

  if (request) {
    request.status = pendingStatus.value
    notice.value = `Request status changed to ${pendingStatus.value}.`
  }

  showStatusModal.value = false
}

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
                requests.filter((request) => request.status === filter).length
              }}
            </span>
          </button>
        </div>

        <div v-if="filteredRequests.length" class="request-cards">
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
          <p>Try another status filter or search term.</p>
        </div>
      </div>

      <div class="request-details-column">
        <RequestDetails
          :request="selectedRequest"
          @save="saveRequest"
          @change-status="askForStatusChange"
          @close="selectedRequestId = null"
        />

        <section v-if="selectedRequest" class="timeline-panel">
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
      @cancel="showStatusModal = false"
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
