
<template>
  <div class="requests-page">
    <div class="page-heading">
      <h1>Request Management</h1>
      <p>Update status, expected completion, and transaction-specific instructions.</p>
    </div>

    <!-- Status filters -->
    <div class="status-filters">
      <button
        v-for="status in statuses"
        :key="status"
        type="button"
        class="filter-button"
        :class="{ active: activeStatus === status }"
        @click="setStatus(status)"
      >
        <span v-if="status === 'All'" class="all-icon">▦</span>
        {{ status }}
        <span v-if="status !== 'All'" class="filter-count">
          {{ countStatus(status) }}
        </span>
      </button>
    </div>

    <!-- Sort controls -->
    <div class="sort-row">
      <label for="request-sort">Sort by</label>
      <select id="request-sort" v-model="sortBy">
        <option value="expected">Expected completion</option>
        <option value="oldest">Oldest</option>
        <option value="updated">Recently updated</option>
      </select>
    </div>

    <!-- Request list and details -->
    <section class="requests-layout">
      <div class="request-list-panel">
        <div class="panel-heading">
          <h2>Requests</h2>
          <span class="filter-count">{{ filteredRequests.length }}</span>
        </div>

        <div class="request-list">
          <article
            v-for="request in filteredRequests"
            :key="request.id"
            class="request-card"
            :class="{ selected: selectedRequest?.id === request.id }"
            role="button"
            tabindex="0"
            @click="selectRequest(request)"
            @keydown.enter="selectRequest(request)"
            @keydown.space.prevent="selectRequest(request)"
          >
            <div class="request-topline">
              <span class="request-student">{{ request.studentName }}</span>
              <span
                class="status-badge"
                :class="statusClass(request.status)"
              >
                {{ request.status }}
              </span>
            </div>

            <p class="request-description">
              {{ request.id }} · {{ request.documentType }}
            </p>

            <p class="request-date">
              Expected: {{ formatDate(request.expectedCompletion) }}
            </p>
          </article>

          <div v-if="filteredRequests.length === 0" class="empty-state">
            <div class="empty-symbol">▦</div>
            <h2>No requests found</h2>
            <p>There are no requests under this status.</p>
            <button
              type="button"
              class="action-button secondary"
              @click="activeStatus = 'All'"
            >
              View All Requests
            </button>
          </div>
        </div>
      </div>

      <!-- Request details -->
      <div class="request-details-panel">
        <template v-if="selectedRequest">
          <div class="details-topline">
            <div>
              <span class="details-eyebrow">REQUEST DETAILS</span>
              <h2>{{ selectedRequest.studentName }}</h2>
              <p class="details-subtitle">
                {{ selectedRequest.id }} · {{ selectedRequest.documentType }}
              </p>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close request details"
              @click="selectedRequest = null"
            >
              ×
            </button>
          </div>

          <div class="details-section">
            <h3>Student information</h3>

            <div class="information-grid">
              <div class="information-item">
                <span class="field-label">Student name</span>
                <span class="field-value">{{ selectedRequest.studentName }}</span>
              </div>

              <div class="information-item">
                <span class="field-label">Student ID</span>
                <span class="field-value">{{ selectedRequest.studentId }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3>Request information</h3>

            <div class="information-item request-number">
              <span class="field-label">Request number</span>
              <span class="field-value">{{ selectedRequest.id }}</span>
            </div>

            <div class="form-field">
              <label for="request-status">Status</label>
              <select id="request-status" v-model="selectedRequest.status">
                <option
                  v-for="status in requestStatuses"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label for="expected-completion">Expected completion date</label>
              <input
                id="expected-completion"
                v-model="selectedRequest.expectedCompletion"
                type="date"
              />
            </div>
          </div>

          <div class="details-section">
            <h3>Transaction-specific instructions</h3>

            <div class="form-field">
              <label for="instruction-template">Instruction template</label>
              <select
                id="instruction-template"
                v-model="selectedRequest.instructionTemplate"
                @change="applyTemplate"
              >
                <option value="">Choose a template</option>
                <option value="pickup">Document pickup instructions</option>
                <option value="processing">Processing instructions</option>
                <option value="requirements">Additional requirements</option>
              </select>
            </div>

            <div class="form-field">
              <label for="custom-instructions">Custom instructions</label>
              <textarea
                id="custom-instructions"
                v-model="selectedRequest.instructions"
                rows="4"
                placeholder="Enter instructions for the student..."
              ></textarea>
            </div>

            <p
              v-if="selectedRequest.instructionsSentAt"
              class="instruction-history"
            >
              <span class="history-dot"></span>
              Instructions last recorded:
              {{ formatDateTime(selectedRequest.instructionsSentAt) }}
            </p>
          </div>

          <p v-if="message" class="save-message" role="status">
            {{ message }}
          </p>

          <div class="details-actions">
            <button
              type="button"
              class="action-button secondary"
              @click="selectedRequest = null"
            >
              Close
            </button>

            <button
              type="button"
              class="action-button primary"
              @click="saveChanges"
            >
              Save Changes
            </button>
          </div>
        </template>

        <div v-else class="details-empty-state">
          <div class="empty-symbol">▤</div>
          <p>Select a request to open its details.</p>
        </div>
      </div>
    </section>

    <!-- Action feedback -->
    <div v-if="message && !selectedRequest" class="feedback-message" role="status">
      <span>✓</span>
      {{ message }}
      <button type="button" aria-label="Dismiss" @click="message = ''">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const statuses = [
  'All',
  'Pending',
  'Processing',
  'Ready for Pickup',
  'Claimed',
  'Completed'
]

const requestStatuses = [
  'Pending',
  'Processing',
  'Ready for Pickup',
  'Claimed',
  'Completed'
]

const templates = {
  pickup: 'Bring your original school ID and request receipt.',
  processing: 'Your request is being processed. Please wait for an update.',
  requirements: 'Please prepare the required documents for verification.'
}

function localDateOffset(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const activeStatus = ref('All')
const sortBy = ref('expected')
const selectedRequest = ref(null)
const message = ref('')

const requests = ref([
  {
    id: 'REQ-2026-00126',
    studentName: 'Maria Santos',
    studentId: '2023-00126',
    documentType: 'Good Moral Certificate',
    status: 'Ready for Pickup',
    expectedCompletion: '2026-10-05',
    instructions: 'Bring your original school ID and request receipt.',
    instructionTemplate: 'pickup',
    instructionsSentAt: '2026-10-02T14:35:00',
    createdAt: '2026-10-01T09:00:00',
    updatedAt: '2026-10-02T14:35:00'
  },
  {
    id: 'REQ-2026-00125',
    studentName: 'Juan Dela Cruz',
    studentId: '2023-00125',
    documentType: 'Form 137',
    status: 'Processing',
    expectedCompletion: '2026-10-06',
    instructions: '',
    instructionTemplate: '',
    instructionsSentAt: '',
    createdAt: '2026-09-30T10:00:00',
    updatedAt: '2026-10-02T09:30:00'
  }
])

const filteredRequests = computed(() => {
  const result = requests.value.filter(request =>
    activeStatus.value === 'All' || request.status === activeStatus.value
  )

  return [...result].sort((a, b) => {
    if (sortBy.value === 'oldest') {
      return a.createdAt.localeCompare(b.createdAt)
    }

    if (sortBy.value === 'updated') {
      return b.updatedAt.localeCompare(a.updatedAt)
    }

    return a.expectedCompletion.localeCompare(b.expectedCompletion)
  })
})

function setStatus(status) {
  activeStatus.value = status
  message.value = ''

  if (
    selectedRequest.value &&
    status !== 'All' &&
    selectedRequest.value.status !== status
  ) {
    selectedRequest.value = null
  }
}

function countStatus(status) {
  return requests.value.filter(request => request.status === status).length
}

function selectRequest(request) {
  selectedRequest.value = request
  message.value = ''
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

function formatDate(value) {
  if (!value) return 'Not set'

  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatDateTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function applyTemplate() {
  if (!selectedRequest.value) return

  const template = selectedRequest.value.instructionTemplate

  if (template && templates[template]) {
    selectedRequest.value.instructions = templates[template]
  }
}

function saveChanges() {
  if (!selectedRequest.value) return

  selectedRequest.value.updatedAt = new Date().toISOString()

  if (selectedRequest.value.instructions.trim()) {
    selectedRequest.value.instructionsSentAt = new Date().toISOString()
  }

  message.value = 'Changes updated for this session.'
}
</script>

<style scoped>
/* Same base styling as Appointments.vue */
.requests-page {
  padding: 3px 2px 24px;
  color: #4c2026;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

.page-heading {
  margin: 0 0 22px;
}

.page-heading h1 {
  margin: 0;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.2;
}

.page-heading p {
  margin: 7px 0 0;
  color: #887477;
  font-size: 15px;
  line-height: 1.5;
}

/* Filters match Appointments */
.status-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 19px;
}

.filter-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 22px;
  background: #fff;
  color: #75565b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.filter-button:hover {
  border-color: #e6cdd0;
  background: #f8eeee;
}

.filter-button.active {
  background: #650b18;
  color: #fff;
}

.all-icon {
  font-size: 15px;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 19px;
  padding: 0 4px;
  border-radius: 12px;
  background: #f2e2e3;
  color: #650b18;
  font-size: 11px;
}

.filter-button.active .filter-count {
  background: #fff;
  color: #650b18;
}

/* Sort row */
.sort-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin: -5px 0 18px;
}

.sort-row label {
  color: #887477;
  font-size: 13px;
}

.sort-row select,
.form-field select,
.form-field input,
.form-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2cbd0;
  border-radius: 7px;
  background: #fff;
  color: #4c2026;
  font-family: inherit;
  font-size: 13px;
}

.sort-row select {
  width: 205px;
  min-height: 40px;
}

.form-field select,
.form-field input {
  min-height: 40px;
}

.form-field textarea {
  min-height: 95px;
  resize: vertical;
  line-height: 1.5;
}

.sort-row select:focus,
.form-field select:focus,
.form-field input:focus,
.form-field textarea:focus {
  outline: 2px solid rgb(101 11 24 / 14%);
  border-color: #9b515a;
}

/* Two panels use the same card colors as Appointments */
.requests-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.request-list-panel,
.request-details-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e6cdd0;
  border-radius: 17px;
  background: #f9f0f0;
  box-shadow: 0 2px 6px rgb(80 7 14 / 3%);
}

.request-list-panel {
  padding: 16px 18px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 6px;
}

.panel-heading h2 {
  margin: 0;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
}

.request-list {
  display: flex;
  flex-direction: column;
}

.request-card {
  padding: 15px 2px;
  border-bottom: 1px solid #ead6d8;
  cursor: pointer;
  transition: background 0.15s;
}

.request-card:last-child {
  border-bottom: none;
}

.request-card:hover,
.request-card.selected {
  background: #f3e5e6;
}

.request-card.selected {
  padding-right: 9px;
  padding-left: 9px;
  border-radius: 7px;
}

.request-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.request-student {
  color: #4c2026;
  font-size: 14px;
  font-weight: 700;
}

.request-description {
  margin: 6px 0 4px;
  color: #8b6268;
  font-size: 12px;
  line-height: 1.5;
}

.request-date {
  margin: 0;
  color: #765e62;
  font-size: 12px;
  line-height: 1.5;
}

/* Status badges follow the Appointments palette */
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 18px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
}

.status-badge.pending {
  background: #f6e9b9;
  color: #876818;
}

.status-badge.processing {
  background: #f6e9b9;
  color: #876818;
}

.status-badge.ready-for-pickup {
  background: #dcefe2;
  color: #367653;
}

.status-badge.claimed {
  background: #dcefe2;
  color: #367653;
}

.status-badge.completed {
  background: #e6e2e2;
  color: #62595a;
}

/* Details panel */
.request-details-panel {
  padding: 18px;
}

.details-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ead6d8;
}

.details-eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #8b6268;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.7px;
}

.details-topline h2 {
  margin: 0;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.details-subtitle {
  margin: 6px 0 0;
  color: #8b6268;
  font-size: 12px;
  line-height: 1.5;
}

.close-button {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: 1px solid #e6cdd0;
  border-radius: 50%;
  background: #fff;
  color: #650b18;
  font-size: 21px;
  cursor: pointer;
}

.close-button:hover {
  background: #f3e3e5;
}

.details-section {
  padding: 17px 0;
  border-bottom: 1px solid #ead6d8;
}

.details-section h3 {
  margin: 0 0 13px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 17px;
  font-weight: 600;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.information-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.request-number {
  margin-bottom: 15px;
}

.field-label,
.form-field label {
  display: block;
  color: #887477;
  font-size: 12px;
  line-height: 1.5;
}

.field-value {
  overflow-wrap: anywhere;
  color: #4c2026;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.instruction-history {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 10px 0 0;
  color: #887477;
  font-size: 12px;
  line-height: 1.5;
}

.history-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  margin-top: 5px;
  border-radius: 50%;
  background: #367653;
}

/* Details empty state */
.details-empty-state {
  display: flex;
  min-height: 275px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9a7b80;
  text-align: center;
}

.details-empty-state p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
}

.empty-state {
  padding: 35px 15px;
  text-align: center;
}

.empty-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #f0dcdf;
  color: #650b18;
  font-size: 21px;
}

.empty-state h2 {
  margin: 0 0 7px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 19px;
}

.empty-state p {
  margin: 0 0 15px;
  color: #887477;
  font-size: 13px;
}

/* Actions match Appointments buttons */
.details-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 17px;
}

.action-button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  padding: 8px 13px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.action-button.primary {
  background: #650b18;
  color: #fff;
}

.action-button.primary:hover {
  background: #4c0711;
}

.action-button.secondary {
  border-color: #d9b9be;
  background: #fff;
  color: #650b18;
}

.action-button.secondary:hover {
  background: #f3e3e5;
}

.save-message {
  margin: 12px 0 0;
  color: #367653;
  font-size: 12px;
  line-height: 1.5;
}

.feedback-message {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(400px, calc(100vw - 44px));
  padding: 13px 15px;
  border: 1px solid #d5e6d9;
  border-left: 4px solid #367653;
  border-radius: 8px;
  background: #fff;
  color: #345b42;
  box-shadow: 0 7px 24px rgb(45 20 24 / 12%);
  font-size: 14px;
}

.feedback-message button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #66806d;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 1000px) {
  .requests-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .page-heading h1 {
    font-size: 25px;
  }

  .page-heading p {
    font-size: 14px;
  }

  .status-filters {
    gap: 6px;
  }

  .filter-button {
    padding: 7px 10px;
    font-size: 12px;
  }

  .sort-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .sort-row select {
    width: 100%;
  }

  .request-list-panel,
  .request-details-panel {
    padding: 14px;
  }

  .request-topline {
    gap: 7px;
  }

  .status-badge {
    max-width: 125px;
    white-space: normal;
  }

  .information-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .details-actions {
    flex-direction: column-reverse;
  }

  .details-actions button {
    width: 100%;
  }
}
</style>