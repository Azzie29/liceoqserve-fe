<script setup>
import { ref, computed, watch } from 'vue'
import './Request.css'

const filters = [
  'All',
  'Pending',
  'Processing',
  'Ready for Pick Up',
  'Claimed',
  'Completed'
]

const STORAGE_KEY = 'osa-requests'

const defaultRequests = [
  {
    id: 'OSA-016',
    student: 'Maria Santos',
    studentId: '2026-002',
    service: 'Organization Document',
    expectedCompletion: '2026-10-03',
    status: 'Processing',
    template: '',
    instructions: ''
  },
  {
    id: 'OSA-015',
    student: 'Juan Dela Cruz',
    studentId: '2026-001',
    service: 'Student Certification',
    expectedCompletion: '2026-10-03',
    status: 'Ready for Pick Up',
    template: '',
    instructions: ''
  }
]

function loadRequests() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (error) {
    console.error('Unable to load requests:', error)
  }

  return defaultRequests.map(request => ({ ...request }))
}

const requests = ref(loadRequests())
const selectedFilter = ref('All')

// Start with no request selected.
const selectedRequestId = ref(null)

const selectedTemplate = ref('')
const customInstructions = ref('')
const expectedCompletion = ref('')

const templates = [
  {
    label: 'Choose a template',
    value: ''
  },
  {
    label: 'Missing document',
    value: 'Please submit the missing document.'
  },
  {
    label: 'Ready for collection',
    value: 'Your request is ready for pick up at the OSA office.'
  },
  {
    label: 'Request processing',
    value: 'Your request is currently being processed.'
  },
  {
    label: 'Additional requirements',
    value: 'Please submit the additional requirements to the OSA office.'
  }
]

const filteredRequests = computed(() => {
  const result = selectedFilter.value === 'All'
    ? requests.value
    : requests.value.filter(
        request => request.status === selectedFilter.value
      )

  return [...result].sort((a, b) => {
    if (!a.expectedCompletion) return 1
    if (!b.expectedCompletion) return -1
    return a.expectedCompletion.localeCompare(b.expectedCompletion)
  })
})

const selectedRequest = computed(() => {
  return requests.value.find(
    request => request.id === selectedRequestId.value
  ) || null
})

function selectRequest(request) {
  selectedRequestId.value = request.id
  selectedTemplate.value = request.template || ''
  customInstructions.value = request.instructions || ''
  expectedCompletion.value = request.expectedCompletion || ''
}

// When changing filters, clear the selected request if it is no longer visible.
// Do not automatically open the first request.
watch(selectedFilter, () => {
  const visible = filteredRequests.value

  if (!visible.some(request => request.id === selectedRequestId.value)) {
    selectedRequestId.value = null
    selectedTemplate.value = ''
    customInstructions.value = ''
    expectedCompletion.value = ''
  }
})

function saveRequests() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(requests.value))
    return true
  } catch (error) {
    console.error('Unable to save requests:', error)
    window.alert('Unable to save the request. Please try again.')
    return false
  }
}

function formatDate(date) {
  if (!date) return 'Not set'

  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function updateStatus(request, status) {
  const previousStatus = request.status
  request.status = status

  if (!saveRequests()) {
    request.status = previousStatus
    return
  }

  // If the selected request no longer belongs to the active filter,
  // close its details panel.
  if (
    selectedFilter.value !== 'All' &&
    request.status !== selectedFilter.value
  ) {
    selectedRequestId.value = null
    selectedTemplate.value = ''
    customInstructions.value = ''
    expectedCompletion.value = ''
  }
}

function saveAndNotify() {
  if (!selectedRequest.value) {
    window.alert('Please select a request first.')
    return
  }

  const request = selectedRequest.value

  const previousValues = {
    status: request.status,
    expectedCompletion: request.expectedCompletion,
    template: request.template,
    instructions: request.instructions
  }

  request.expectedCompletion = expectedCompletion.value
  request.template = selectedTemplate.value
  request.instructions = customInstructions.value

  if (selectedTemplate.value) {
    const selected = templates.find(
      template => template.value === selectedTemplate.value
    )

    if (selected && !customInstructions.value.trim()) {
      request.instructions = selected.value
    }
  }

  if (!saveRequests()) {
    Object.assign(request, previousValues)
    return
  }

  window.alert('Request details saved successfully.')
}

function selectFilter(filter) {
  selectedFilter.value = filter
}
</script>

<template>
  <section class="request-page">
    <header class="request-heading">
      <h1>REQUEST MANAGEMENT</h1>
      <p>
        Update status, expected completion, and transaction-specific instructions.
      </p>
    </header>

    <nav class="request-toolbar" aria-label="Request status filters">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        class="request-filter"
        :class="{ active: selectedFilter === filter }"
        @click="selectFilter(filter)"
      >
        {{ filter }}
      </button>

      <select
        v-model="selectedFilter"
        class="request-sort"
        aria-label="Filter requests by status"
      >
        <option value="All">Expected Completion</option>
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Ready for Pick Up">Ready for Pick Up</option>
        <option value="Claimed">Claimed</option>
        <option value="Completed">Completed</option>
      </select>
    </nav>

    <div class="request-workspace">
      <div class="request-list">
        <button
          v-for="request in filteredRequests"
          :key="request.id"
          type="button"
          class="request-list-card"
          :class="{ 'request-selected': selectedRequestId === request.id }"
          @click="selectRequest(request)"
        >
          <div class="request-card-info">
            <strong>{{ request.student }}</strong>
            <span>{{ request.id }} · {{ request.service }}</span>
            <small>
              Expected: {{ formatDate(request.expectedCompletion) }}
            </small>
          </div>

          <span
            class="request-status"
            :class="request.status.toLowerCase().replace(/[^a-z]+/g, '-')"
          >
            {{ request.status }}
          </span>
        </button>

        <div v-if="filteredRequests.length === 0" class="request-empty">
          No requests found for this status.
        </div>
      </div>

      <section v-if="selectedRequest" class="request-details">
        <div class="details-topline">
          <span>REQUEST DETAILS</span>
          <button
            type="button"
            class="details-close"
            @click="selectedRequestId = null"
          >
            Close
          </button>
        </div>

        <h2>{{ selectedRequest.service }}</h2>

        <div class="request-meta">
          <div>
            <span>Student</span>
            <strong>{{ selectedRequest.student }}</strong>
          </div>

          <div>
            <span>Student ID</span>
            <strong>{{ selectedRequest.studentId }}</strong>
          </div>

          <div>
            <span>Request number</span>
            <strong>{{ selectedRequest.id }}</strong>
          </div>

          <div>
            <span>Expected completion</span>
            <strong>{{ formatDate(selectedRequest.expectedCompletion) }}</strong>
          </div>
        </div>

        <div class="request-field">
          <label for="expected-completion">Expected completion date</label>
          <input
            id="expected-completion"
            v-model="expectedCompletion"
            type="date"
          />
        </div>

        <div class="request-field">
          <label for="instruction-template">Instruction template</label>
          <select
            id="instruction-template"
            v-model="selectedTemplate"
          >
            <option
              v-for="template in templates"
              :key="template.value"
              :value="template.value"
            >
              {{ template.label }}
            </option>
          </select>
        </div>

        <div class="request-field">
          <label for="custom-instructions">Custom instructions</label>
          <textarea
            id="custom-instructions"
            v-model="customInstructions"
            rows="4"
            placeholder="Please submit the missing document."
          ></textarea>
        </div>

        <button
          type="button"
          class="request-save"
          @click="saveAndNotify"
        >
          Save and notify student
        </button>

        <div class="request-status-actions">
          <button
            v-for="status in filters.slice(1)"
            :key="status"
            type="button"
            :class="{
              'current-status': selectedRequest.status === status
            }"
            @click="updateStatus(selectedRequest, status)"
          >
            {{ status }}
          </button>
        </div>
      </section>

      <section v-else class="request-details details-placeholder">
        Select a request to open its details
      </section>
    </div>
  </section>
</template>
