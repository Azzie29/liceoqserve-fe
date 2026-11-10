<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'
import './Request.css'

const props = defineProps({
  initialFilter: {
    type: String,
    default: 'All'
  }
})

const filters = [
  'All',
  'Pending',
  'Processing',
  'Ready for Pick Up',
  'Claimed',
  'Completed'
]

const templates = [
  { label: 'Choose a template', value: '' },
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

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Ready for Pick Up', value: 'ready_for_pickup' },
  { label: 'Claimed', value: 'claimed' },
  { label: 'Completed', value: 'completed' }
]

// Both existing and new OSA service IDs
const OSA_SERVICE_IDS = [
  '5c2ab6fc-5f24-4573-896a-f5a11ad6625e',
  '65a94572-bce2-460f-b3e8-2ed568ee7bbf'
]

const requests = ref([])
const loading = ref(false)
const saving = ref(false)
const updatingStatus = ref(false)
const errorMessage = ref('')
const selectedRequestId = ref(null)

const selectedTemplate = ref('')
const customInstructions = ref('')
const expectedCompletion = ref('')

const selectedFilter = ref(
  filters.includes(props.initialFilter)
    ? props.initialFilter
    : 'All'
)

// SUCCESS MODAL
const showSuccessModal = ref(false)
const successMessage = ref('Request status updated successfully.')

function showSuccessPopup(message = 'Request status updated successfully.') {
  successMessage.value = message
  showSuccessModal.value = true
}

function closeSuccessPopup() {
  showSuccessModal.value = false
}

let requestSubscription = null

const filteredRequests = computed(() => {
  const result = selectedFilter.value === 'All'
    ? requests.value
    : requests.value.filter(
        request => request.displayStatus === selectedFilter.value
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

function getDisplayStatus(status) {
  const option = statusOptions.find(
    item => item.value === status
  )

  if (option) return option.label

  return status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : 'Pending'
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/[^a-z]+/g, '-')
}

function mapRequest(row) {
  const student = row.student || {}
  const service = row.service || {}

  return {
    id: row.id,
    reference: `OSA-${row.id.slice(0, 8).toUpperCase()}`,
    student: student.full_name || 'Unknown Student',
    studentId: student.student_id || 'Not available',
    email: student.university_email || '',
    service: service.name || row.title || row.request_type || 'Service Request',
    requestType: row.request_type || 'General',
    title: row.title || '',
    details: row.details || '',
    submittedAt: row.submitted_at,
    expectedCompletion: row.expected_completion || '',
    status: row.status || 'pending',
    displayStatus: getDisplayStatus(row.status),
    template: row.instruction_template || '',
    instructions: row.instructions || '',
    staffNotes: row.staff_notes || '',
    handledBy: row.handled_by || null
  }
}

// FETCH REQUESTS
async function fetchRequests() {
  loading.value = true
  errorMessage.value = ''

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    console.log('OSA AUTH USER:', user?.id)
    console.log('OSA AUTH ERROR:', authError)

    if (authError) throw authError

    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        student_id,
        service_id,
        request_type,
        title,
        details,
        status,
        staff_notes,
        handled_by,
        submitted_at,
        updated_at,
        completed_at,
        expected_completion,
        instructions,
        instruction_template,
        instructions_sent_at,
        student:profiles!service_requests_student_id_fkey (
          id,
          student_id,
          full_name,
          university_email
        ),
        service:office_services!service_requests_service_id_fkey (
          id,
          name,
          office_id
        )
      `)
      .in('service_id', OSA_SERVICE_IDS)
      .order('submitted_at', { ascending: false })

    console.log('OSA REQUEST DATA:', data)
    console.log('OSA REQUEST COUNT:', data?.length)
    console.log('OSA REQUEST ERROR:', error)

    if (error) throw error

    requests.value = (data || []).map(mapRequest)

    console.log('OSA MAPPED REQUESTS:', requests.value)

    if (
      selectedRequestId.value &&
      !requests.value.some(
        request => request.id === selectedRequestId.value
      )
    ) {
      clearSelectedRequest()
    }

  } catch (error) {
    console.error('Unable to fetch OSA requests:', error)

    errorMessage.value = error.message || 'Unable to load requests.'
    requests.value = []
  } finally {
    loading.value = false
  }
}

// SELECT REQUEST
function selectRequest(request) {
  selectedRequestId.value = request.id
  selectedTemplate.value = request.template || ''
  customInstructions.value = request.instructions || ''
  expectedCompletion.value = request.expectedCompletion || ''
}

function clearSelectedRequest() {
  selectedRequestId.value = null
  selectedTemplate.value = ''
  customInstructions.value = ''
  expectedCompletion.value = ''
}

// DATE FORMATTING
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

function formatSubmittedDate(date) {
  if (!date) return 'Not available'

  return new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila'
  })
}

// FILTERS
function selectFilter(filter) {
  selectedFilter.value = filter
}

watch(
  () => props.initialFilter,
  (filter) => {
    selectedFilter.value = filters.includes(filter) ? filter : 'All'
  }
)

watch(selectedFilter, () => {
  if (
    selectedRequestId.value &&
    !filteredRequests.value.some(
      request => request.id === selectedRequestId.value
    )
  ) {
    clearSelectedRequest()
  }
})

// UPDATE REQUEST STATUS
async function updateStatus(request, newStatus) {
  if (!request || updatingStatus.value) return

  const previousStatus = request.status

  updatingStatus.value = true
  errorMessage.value = ''

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError

    if (!user) {
      throw new Error('Your staff session has expired. Please log in again.')
    }

    const { data, error } = await supabase
      .from('service_requests')
      .update({
        status: newStatus,
        handled_by: user.id,
        completed_at: newStatus === 'completed'
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.id)
      .select('id, status')
      .maybeSingle()

    console.log('OSA STATUS UPDATE RESULT:', { data, error })

    if (error) throw error

    if (!data) {
      throw new Error(
        'The request was not updated. Check your staff permissions.'
      )
    }

    await fetchRequests()

    showSuccessPopup('Request status updated successfully.')

  } catch (error) {
    console.error('Unable to update request status:', error)

    request.status = previousStatus
    request.displayStatus = getDisplayStatus(previousStatus)

    window.alert(error.message || 'Unable to update request status.')
  } finally {
    updatingStatus.value = false
  }
}

// SAVE DETAILS AND NOTIFY STUDENT
async function saveAndNotify() {
  const request = selectedRequest.value

  if (!request) {
    window.alert('Please select a request first.')
    return
  }

  if (saving.value) return

  saving.value = true
  errorMessage.value = ''

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) throw userError

    if (!user) {
      throw new Error('Your staff session has expired. Please log in again.')
    }

    let instructions = customInstructions.value.trim()

    if (!instructions && selectedTemplate.value) {
      instructions = selectedTemplate.value
    }

    const updateValues = {
      expected_completion: expectedCompletion.value || null,
      instruction_template: selectedTemplate.value || null,
      instructions: instructions || null,
      staff_notes: instructions || null,
      handled_by: user.id,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('service_requests')
      .update(updateValues)
      .eq('id', request.id)
      .select('id, student_id')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw new Error(
        'Request details were not saved. Check your staff permissions.'
      )
    }

    if (!data.student_id) {
      throw new Error('The request has no associated student.')
    }

    const message = instructions
      ? instructions
      : 'Your OSA service request has been updated.'

    const notificationValues = {
      recipient_id: data.student_id,
      title: 'OSA Request Update',
      message,
      category: 'request',
      related_id: request.id,
      is_read: false
    }

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationValues)

    if (notificationError) {
      console.error('Notification insert failed:', notificationError)

      await fetchRequests()

      window.alert(
        'Request details saved, but the student notification could not be sent: ' +
        notificationError.message
      )

      return
    }

    const { error: timestampError } = await supabase
      .from('service_requests')
      .update({
        instructions_sent_at: new Date().toISOString()
      })
      .eq('id', request.id)

    if (timestampError) {
      console.error('Timestamp update failed:', timestampError)
    }

    await fetchRequests()

    showSuccessPopup('Request details saved and student notified successfully.')

  } catch (error) {
    console.error('Unable to save request details:', error)

    window.alert(error.message || 'Unable to save request details.')
  } finally {
    saving.value = false
  }
}

// REALTIME SUBSCRIPTION
function subscribeToRequests() {
  requestSubscription = supabase
    .channel('osa-service-requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_requests'
      },
      () => {
        console.log('OSA request database change detected.')
        fetchRequests()
      }
    )
    .subscribe((status) => {
      console.log('OSA request realtime status:', status)
    })
}

onMounted(async () => {
  await fetchRequests()
  subscribeToRequests()
})

onUnmounted(() => {
  if (requestSubscription) {
    supabase.removeChannel(requestSubscription)
    requestSubscription = null
  }
})
</script>

<template>
  <section class="request-page">

    <header class="request-heading">
      <h1>REQUEST MANAGEMENT</h1>
      <p>
        Update status, expected completion, and transaction-specific instructions.
      </p>
    </header>

    <!-- FILTER TOOLBAR -->
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
        <option
          v-for="filter in filters"
          :key="filter"
          :value="filter"
        >
          {{ filter === 'All' ? 'All Requests' : filter }}
        </option>
      </select>

      <button
        type="button"
        class="request-filter"
        @click="fetchRequests"
        :disabled="loading"
      >
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </nav>

    <div class="request-workspace">

      <!-- REQUEST LIST -->
      <div class="request-list">

        <div v-if="loading" class="request-empty">
          Loading requests...
        </div>

        <div v-else-if="errorMessage" class="request-empty">
          {{ errorMessage }}

          <button type="button" @click="fetchRequests">
            Try Again
          </button>
        </div>

        <template v-else>

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

              <span>
                {{ request.reference }} · {{ request.service }}
              </span>

              <small>
                Expected: {{ formatDate(request.expectedCompletion) }}
              </small>
            </div>

            <span
              class="request-status"
              :class="getStatusClass(request.displayStatus)"
            >
              {{ request.displayStatus }}
            </span>
          </button>

          <div v-if="filteredRequests.length === 0" class="request-empty">
            No requests found for this status.
          </div>

        </template>
      </div>

      <!-- REQUEST DETAILS -->
      <section
        v-if="selectedRequest"
        class="request-details"
      >

        <div class="details-topline">
          <span>REQUEST DETAILS</span>

          <button
            type="button"
            class="details-close"
            @click="clearSelectedRequest"
          >
            Close
          </button>
        </div>

        <h2>{{ selectedRequest.student }}'s Request</h2>

        <p class="request-service-name">
          {{ selectedRequest.service }}
        </p>

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
            <strong>{{ selectedRequest.reference }}</strong>
          </div>

          <div>
            <span>Request type</span>
            <strong>{{ selectedRequest.requestType }}</strong>
          </div>

          <div>
            <span>Submitted</span>
            <strong>
              {{ formatSubmittedDate(selectedRequest.submittedAt) }}
            </strong>
          </div>

          <div>
            <span>Expected completion</span>
            <strong>
              {{ formatDate(selectedRequest.expectedCompletion) }}
            </strong>
          </div>

        </div>

        <div v-if="selectedRequest.title || selectedRequest.details">

          <div
            v-if="selectedRequest.title"
            class="request-field"
          >
            <label>Request title</label>
            <p>{{ selectedRequest.title }}</p>
          </div>

          <div
            v-if="selectedRequest.details"
            class="request-field"
          >
            <label>Student description</label>
            <p>{{ selectedRequest.details }}</p>
          </div>

        </div>

        <!-- EXPECTED COMPLETION -->
        <div class="request-field">
          <label for="expected-completion">
            Expected completion date
          </label>

          <input
            id="expected-completion"
            v-model="expectedCompletion"
            type="date"
          />
        </div>

        <!-- INSTRUCTION TEMPLATE -->
        <div class="request-field">
          <label for="instruction-template">
            Instruction template
          </label>

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

        <!-- CUSTOM INSTRUCTIONS -->
        <div class="request-field">
          <label for="custom-instructions">
            Custom instructions
          </label>

          <textarea
            id="custom-instructions"
            v-model="customInstructions"
            rows="4"
            placeholder="Please submit the missing document."
          ></textarea>
        </div>

        <!-- SAVE AND NOTIFY -->
        <button
          type="button"
          class="request-save"
          :disabled="saving"
          @click="saveAndNotify"
        >
          {{ saving ? 'Saving...' : 'Save and notify student' }}
        </button>

        <!-- STATUS BUTTONS -->
        <div class="request-status-actions">

          <button
            v-for="status in statusOptions"
            :key="status.value"
            type="button"
            :disabled="updatingStatus"
            :class="{
              'current-status': selectedRequest.status === status.value
            }"
            @click="updateStatus(selectedRequest, status.value)"
          >
            {{ status.label }}
          </button>

        </div>

      </section>

      <!-- EMPTY DETAILS -->
      <section
        v-else
        class="request-details details-placeholder"
      >
        Select a request to open its details
      </section>

    </div>

    <!-- CUSTOM SUCCESS MODAL -->
    <Teleport to="body">
      <div
        v-if="showSuccessModal"
        class="request-success-overlay"
        @click.self="closeSuccessPopup"
      >

        <div
          class="request-success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-success-title"
        >

          <div class="request-success-header">

            <div class="request-success-icon">
              ✔
            </div>

            <h2 id="request-success-title">
              Success!
            </h2>

          </div>

          <p class="request-success-message">
            {{ successMessage }}
          </p>

          <div class="request-success-actions">

            <button
              type="button"
              class="request-success-button"
              @click="closeSuccessPopup"
            >
              OK
            </button>

          </div>

        </div>
      </div>
    </Teleport>

  </section>
</template>

<style>
/* =====================================
   REQUEST SUCCESS MODAL - SMALLER SIZE
===================================== */

.request-success-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(35, 20, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: requestOverlayFade 0.2s ease;
}

.request-success-modal {
  width: 90%;
  max-width: 420px;
  background: #f9eeee;
  border: 1px solid #e8dada;
  border-radius: 18px;
  padding: 24px 26px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  animation: requestModalAppear 0.25s ease;
}

.request-success-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.request-success-icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 12px;
  background: #803b43;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  font-size: 32px;
  font-weight: bold;
}

.request-success-header h2 {
  color: #400b10;
  font-family: Georgia, serif;
  font-size: 23px;
  font-weight: bold;
  margin: 0;
}

.request-success-message {
  color: #806d6d;
  font-family: Arial, sans-serif;
  font-size: 15px;
  margin: 24px 0;
  line-height: 1.5;
}

.request-success-actions {
  display: flex;
  justify-content: flex-end;
}

.request-success-button {
  background: #570b13;
  color: white;
  border: 1px solid #570b13;
  border-radius: 9px;
  padding: 11px 23px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s ease;
}

.request-success-button:hover {
  background: #7a1722;
  transform: translateY(-2px);
}

.request-success-button:active {
  transform: scale(0.97);
}

@keyframes requestOverlayFade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes requestModalAppear {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 600px) {
  .request-success-modal {
    max-width: 340px;
    padding: 20px;
  }

  .request-success-header h2 {
    font-size: 21px;
  }

  .request-success-icon {
    width: 46px;
    height: 46px;
    min-width: 46px;
    font-size: 28px;
  }

  .request-success-message {
    font-size: 14px;
    margin: 20px 0;
  }
}
</style>  