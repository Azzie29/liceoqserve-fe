
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

const TARGET_SERVICE_ID = '5c2ab6fc-5f24-4573-896a-f5a11ad6625e'

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

async function fetchRequests() {
  loading.value = true
  errorMessage.value = ''

  console.log('========== OSA REQUEST FETCH START ==========')

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    console.log('OSA AUTH USER:', user?.id)
    console.log('OSA AUTH ERROR:', authError)

    const {
      data: rawData,
      error: rawError
    } = await supabase
      .from('service_requests')
      .select('*')
      .eq('service_id', TARGET_SERVICE_ID)
      .order('submitted_at', { ascending: false })

    console.log('OSA RAW REQUEST DATA:', rawData)
    console.log('OSA RAW REQUEST COUNT:', rawData?.length)
    console.log('OSA RAW REQUEST ERROR:', rawError)

    if (rawError) throw rawError

    const {
      data,
      error
    } = await supabase
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
      .eq('service_id', TARGET_SERVICE_ID)
      .order('submitted_at', { ascending: false })

    console.log('OSA JOINED REQUEST DATA:', data)
    console.log('OSA JOINED REQUEST ERROR:', error)

    if (error) throw error

    requests.value = (data || []).map(mapRequest)

    console.log('OSA MAPPED REQUESTS:', requests.value)
    console.log('OSA FINAL REQUEST COUNT:', requests.value.length)

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
    console.log('========== OSA REQUEST FETCH END ==========')
  }
}

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

async function updateStatus(request, newStatus) {
  if (!request || request.status === newStatus || updatingStatus.value) {
    return
  }

  const previousStatus = request.status

  updatingStatus.value = true
  errorMessage.value = ''

  console.log('========== OSA STATUS UPDATE START ==========')
  console.log('REQUEST ID:', request.id)
  console.log('PREVIOUS STATUS:', previousStatus)
  console.log('NEW STATUS:', newStatus)

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

    console.log('OSA STATUS UPDATE RESULT:', {
      data,
      error,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    })

    if (error) throw error

    if (!data) {
      throw new Error(
        'The request was not updated. Check your staff permissions.'
      )
    }

    await fetchRequests()

    window.alert('Request status updated successfully.')

  } catch (error) {
    console.error('Unable to update request status:', error)

    request.status = previousStatus
    request.displayStatus = getDisplayStatus(previousStatus)

    window.alert(error.message || 'Unable to update request status.')
  } finally {
    updatingStatus.value = false
    console.log('========== OSA STATUS UPDATE END ==========')
  }
}

async function saveAndNotify() {
  const request = selectedRequest.value

  if (!request) {
    window.alert('Please select a request first.')
    return
  }

  if (saving.value) return

  saving.value = true
  errorMessage.value = ''

  console.log('========== OSA SAVE AND NOTIFY START ==========')
  console.log('SELECTED REQUEST:', request)
  console.log('SELECTED REQUEST ID:', request.id)

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    console.log('SAVE AUTH USER:', user?.id)
    console.log('SAVE AUTH ERROR:', userError)

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

    console.log('REQUEST UPDATE VALUES:', updateValues)
    console.log('STEP 1: Updating service_requests...')

    const { data, error } = await supabase
      .from('service_requests')
      .update(updateValues)
      .eq('id', request.id)
      .select('id, student_id')
      .maybeSingle()

    console.log('SAVE REQUEST UPDATE RESULT:', {
      data,
      error,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    })

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

    console.log('STEP 2: Inserting student notification...')
    console.log('NOTIFICATION VALUES:', notificationValues)

    const {
      data: notificationData,
      error: notificationError
    } = await supabase
      .from('notifications')
      .insert(notificationValues)
      .select()

    console.log('NOTIFICATION INSERT RESULT:', {
      data: notificationData,
      error: notificationError,
      code: notificationError?.code,
      message: notificationError?.message,
      details: notificationError?.details,
      hint: notificationError?.hint
    })

    if (notificationError) {
      console.error(
        'Request saved, but notification failed:',
        notificationError
      )

      await fetchRequests()

      window.alert(
        'Request details saved, but the student notification could not be sent: ' +
        notificationError.message
      )

      return
    }

    console.log('STEP 3: Updating instructions_sent_at...')

    const {
      data: timestampData,
      error: timestampError
    } = await supabase
      .from('service_requests')
      .update({
        instructions_sent_at: new Date().toISOString()
      })
      .eq('id', request.id)
      .select('id, instructions_sent_at')
      .maybeSingle()

    console.log('TIMESTAMP UPDATE RESULT:', {
      data: timestampData,
      error: timestampError,
      code: timestampError?.code,
      message: timestampError?.message,
      details: timestampError?.details,
      hint: timestampError?.hint
    })

    if (timestampError) {
      console.error(
        'Notification sent, but timestamp update failed:',
        timestampError
      )
    }

    await fetchRequests()

    window.alert('Request details saved and student notified successfully.')

  } catch (error) {
    console.error('========== SAVE AND NOTIFY ERROR ==========')
    console.error('ERROR OBJECT:', error)
    console.error('ERROR CODE:', error.code)
    console.error('ERROR MESSAGE:', error.message)
    console.error('ERROR DETAILS:', error.details)
    console.error('ERROR HINT:', error.hint)
    console.error('========== END ERROR ==========')

    window.alert(error.message || 'Unable to save request details.')
  } finally {
    saving.value = false
    console.log('========== OSA SAVE AND NOTIFY END ==========')
  }
}

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

      <section v-if="selectedRequest" class="request-details">
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
          :disabled="saving"
          @click="saveAndNotify"
        >
          {{ saving ? 'Saving...' : 'Save and notify student' }}
        </button>

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

      <section
        v-else
        class="request-details details-placeholder"
      >
        Select a request to open its details
      </section>
    </div>
  </section>
</template>
