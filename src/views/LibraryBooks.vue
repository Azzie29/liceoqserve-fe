
<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const LIBRARY_SERVICE_ID = '99a740ad-96d7-43a5-9bcc-3f9723cabd28'

const activeTab = ref('Borrow Requests')
const searchBook = ref('')
const selectedRequest = ref(null)
const selectedLoan = ref(null)
const confirmationAction = ref('')
const showConfirmation = ref(false)

const books = ref([])
const requests = ref([])
const borrowedBooks = ref([])

const loadingBooks = ref(false)
const loadingRequests = ref(false)
const loadingLoans = ref(false)
const processing = ref(false)

const booksError = ref('')
const requestsError = ref('')
const loansError = ref('')
const actionMessage = ref('')
const actionError = ref('')

let subscriptions = []

const filteredBooks = computed(() => {
  const keyword = searchBook.value.trim().toLowerCase()

  if (!keyword) return books.value

  return books.value.filter(book =>
    [
      book.title,
      book.author,
      book.isbn,
      book.category,
      book.shelf_location,
    ].some(value =>
      String(value || '').toLowerCase().includes(keyword),
    ),
  )
})

function getAvailability(book) {
  return Number(book.available_copies) > 0
    ? 'Available'
    : 'Unavailable'
}

function formatDate(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDateOnly(value) {
  if (!value) return 'Not available'

  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStudentName(profile) {
  return profile?.full_name || 'Unknown student'
}

async function fetchBooks() {
  loadingBooks.value = true
  booksError.value = ''

  const { data, error } = await supabase
    .from('library_books')
    .select(`
      id,
      isbn,
      title,
      author,
      category,
      shelf_location,
      total_copies,
      available_copies,
      is_active
    `)
    .eq('is_active', true)
    .order('title', { ascending: true })

  if (error) {
    booksError.value = error.message
    console.error('Error fetching books:', error)
  } else {
    books.value = data || []
  }

  loadingBooks.value = false
}

async function fetchRequests() {
  loadingRequests.value = true
  requestsError.value = ''

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      id,
      student_id,
      book_id,
      title,
      details,
      request_type,
      status,
      staff_notes,
      submitted_at
    `)
    .eq('service_id', LIBRARY_SERVICE_ID)
    .order('submitted_at', { ascending: false })

  if (error) {
    requestsError.value = error.message
    console.error('Error fetching borrow requests:', error)
    loadingRequests.value = false
    return
  }

  const rows = data || []

  const studentIds = [
    ...new Set(rows.map(item => item.student_id).filter(Boolean)),
  ]

  const bookIds = [
    ...new Set(rows.map(item => item.book_id).filter(Boolean)),
  ]

  let profiles = []
  let selectedBooks = []

  if (studentIds.length) {
    const result = await supabase
      .from('profiles')
      .select('id, student_id, full_name, university_email, program, year_level')
      .in('id', studentIds)

    if (result.error) {
      requestsError.value = result.error.message
      loadingRequests.value = false
      return
    }

    profiles = result.data || []
  }

  if (bookIds.length) {
    const result = await supabase
      .from('library_books')
      .select('id, title, author, isbn, category, available_copies')
      .in('id', bookIds)

    if (result.error) {
      requestsError.value = result.error.message
      loadingRequests.value = false
      return
    }

    selectedBooks = result.data || []
  }

  requests.value = rows.map(request => ({
    ...request,
    student: profiles.find(
      profile => profile.id === request.student_id,
    ) || null,
    book: selectedBooks.find(
      book => book.id === request.book_id,
    ) || null,
  }))

  loadingRequests.value = false
}

async function fetchBorrowedBooks() {
  loadingLoans.value = true
  loansError.value = ''

  const { data, error } = await supabase
    .from('book_loans')
    .select(`
      id,
      book_id,
      student_id,
      borrowed_at,
      due_at,
      returned_at,
      status,
      source_request_id
    `)
    .order('borrowed_at', { ascending: false })

  if (error) {
    loansError.value = error.message
    console.error('Error fetching book loans:', error)
    loadingLoans.value = false
    return
  }

  const rows = data || []

  const studentIds = [
    ...new Set(rows.map(item => item.student_id).filter(Boolean)),
  ]

  const bookIds = [
    ...new Set(rows.map(item => item.book_id).filter(Boolean)),
  ]

  let profiles = []
  let selectedBooks = []

  if (studentIds.length) {
    const result = await supabase
      .from('profiles')
      .select('id, student_id, full_name')
      .in('id', studentIds)

    if (result.error) {
      loansError.value = result.error.message
      loadingLoans.value = false
      return
    }

    profiles = result.data || []
  }

  if (bookIds.length) {
    const result = await supabase
      .from('library_books')
      .select('id, title, author')
      .in('id', bookIds)

    if (result.error) {
      loansError.value = result.error.message
      loadingLoans.value = false
      return
    }

    selectedBooks = result.data || []
  }

  borrowedBooks.value = rows.map(loan => ({
    ...loan,
    student: profiles.find(
      profile => profile.id === loan.student_id,
    ) || null,
    book: selectedBooks.find(
      book => book.id === loan.book_id,
    ) || null,
  }))

  loadingLoans.value = false
}

async function refreshAll() {
  await Promise.all([
    fetchBooks(),
    fetchRequests(),
    fetchBorrowedBooks(),
  ])
}

function openConfirmation(request, action) {
  selectedRequest.value = request
  selectedLoan.value = null
  confirmationAction.value = action
  actionMessage.value = ''
  actionError.value = ''
  showConfirmation.value = true
}

function openReturnConfirmation(loan) {
  selectedLoan.value = loan
  selectedRequest.value = null
  confirmationAction.value = 'Return'
  actionMessage.value = ''
  actionError.value = ''
  showConfirmation.value = true
}

async function confirmRequest() {
  if (processing.value) return

  processing.value = true
  actionError.value = ''
  actionMessage.value = ''

  try {
    if (confirmationAction.value === 'Approve') {
      if (!selectedRequest.value) return

      if (!selectedRequest.value.book_id) {
        throw new Error(
          'This request has no selected book. The student must submit a request with a book selection.',
        )
      }

      const { error } = await supabase.rpc(
        'approve_library_borrow_request',
        {
          p_request_id: selectedRequest.value.id,
        },
      )

      if (error) throw error

      actionMessage.value = 'Borrow request approved successfully.'
    }

    if (confirmationAction.value === 'Reject') {
      if (!selectedRequest.value) return

      const { data: userData, error: userError } =
        await supabase.auth.getUser()

      if (userError) throw userError

      const { data: updatedRequest, error } = await supabase
        .from('service_requests')
        .update({
          status: 'rejected',
          handled_by: userData.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.value.id)
        .eq('service_id', LIBRARY_SERVICE_ID)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()

      if (error) throw error

      if (!updatedRequest) {
        throw new Error(
          'The request is no longer pending or you do not have permission to update it.',
        )
      }

      actionMessage.value = 'Borrow request rejected successfully.'
    }

    if (confirmationAction.value === 'Return') {
      if (!selectedLoan.value) return

      const { error } = await supabase.rpc(
        'return_library_book',
        {
          p_loan_id: selectedLoan.value.id,
        },
      )

      if (error) throw error

      actionMessage.value = 'Book returned successfully.'
    }

    showConfirmation.value = false
    selectedRequest.value = null
    selectedLoan.value = null

    await refreshAll()
  } catch (error) {
    console.error('Library transaction error:', error)
    actionError.value = error.message || 'Something went wrong.'
  } finally {
    processing.value = false
  }
}

function closeConfirmation() {
  if (processing.value) return

  showConfirmation.value = false
  selectedRequest.value = null
  selectedLoan.value = null
  actionError.value = ''
}

const confirmationTitle = computed(() => {
  if (confirmationAction.value === 'Approve') {
    return 'Approve borrow request?'
  }

  if (confirmationAction.value === 'Reject') {
    return 'Reject borrow request?'
  }

  return 'Confirm book return?'
})

const confirmationMessage = computed(() => {
  if (confirmationAction.value === 'Return') {
    return `Confirm that ${selectedLoan.value?.book?.title || 'this book'} has been returned by ${getStudentName(selectedLoan.value?.student)}?`
  }

  const request = selectedRequest.value

  if (!request) return ''

  const bookTitle = request.book?.title || request.title || 'this book'
  const studentName = getStudentName(request.student)

  return confirmationAction.value === 'Approve'
    ? `Approve ${studentName}'s request for ${bookTitle}? The book will be recorded as borrowed with a 5-day due date.`
    : `Reject ${studentName}'s request for ${bookTitle}?`
})

const pendingRequests = computed(() =>
  requests.value.filter(request => request.status === 'pending'),
)

const otherRequests = computed(() =>
  requests.value.filter(request => request.status !== 'pending'),
)

const activeLoans = computed(() =>
  borrowedBooks.value.filter(loan => loan.status === 'borrowed'),
)

const returnedLoans = computed(() =>
  borrowedBooks.value.filter(loan => loan.status === 'returned'),
)

function statusLabel(status) {
  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    ready_for_pickup: 'Ready for Pickup',
    claimed: 'Approved / Issued',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    borrowed: 'Borrowed',
    returned: 'Returned',
  }

  return labels[status] || status
}

function statusClass(status) {
  return String(status || '').toLowerCase().replaceAll('_', '-')
}

function subscribeToChanges() {
  const channel = supabase
    .channel('library-books-page-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'library_books' },
      () => refreshAll(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'service_requests' },
      payload => {
        if (
          payload.new?.service_id === LIBRARY_SERVICE_ID ||
          payload.old?.service_id === LIBRARY_SERVICE_ID
        ) {
          fetchRequests()
          fetchBorrowedBooks()
        }
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'book_loans' },
      () => {
        fetchBorrowedBooks()
        fetchBooks()
      },
    )
    .subscribe()

  subscriptions.push(channel)
}

onMounted(async () => {
  await refreshAll()
  subscribeToChanges()
})

onUnmounted(() => {
  subscriptions.forEach(channel => {
    supabase.removeChannel(channel)
  })

  subscriptions = []
})
</script>

<template>
  <main class="books-page">
    <header class="page-heading">
      <h1>Books</h1>
      <p>Record only the essential Borrow → Return transaction flow.</p>
    </header>

    <nav class="book-tabs" aria-label="Book sections">
      <button
        v-for="tab in ['Borrow Requests', 'Catalog', 'Borrowed & Returns']"
        :key="tab"
        type="button"
        class="tab-button"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </nav>

    <p v-if="actionMessage" class="success-message">
      {{ actionMessage }}
    </p>

    <!-- BORROW REQUESTS -->
    <section v-if="activeTab === 'Borrow Requests'" class="request-list">
      <div class="section-toolbar">
        <span>Pending requests: {{ pendingRequests.length }}</span>
        <button
          type="button"
          class="refresh-button"
          :disabled="loadingRequests"
          @click="fetchRequests"
        >
          {{ loadingRequests ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <p v-if="requestsError" class="error-message">
        Unable to load requests: {{ requestsError }}
      </p>

      <p
        v-if="loadingRequests && requests.length === 0"
        class="empty-message"
      >
        Loading borrow requests...
      </p>

      <article
        v-for="request in pendingRequests"
        :key="request.id"
        class="request-row"
      >
        <div class="request-info">
          <p class="request-id">
            {{ request.student?.student_id || 'No student number' }}
            · {{ request.id }}
          </p>

          <h2>{{ request.book?.title || request.title || 'Book not specified' }}</h2>

          <p class="request-meta">
            {{ getStudentName(request.student) }}
            · {{ request.student?.program || 'No program' }}
            · {{ formatDate(request.submitted_at) }}
          </p>

          <p v-if="request.book" class="request-book-info">
            {{ request.book.author || 'Author not specified' }}
            · {{ request.book.category || 'No category' }}
          </p>

          <p v-else class="request-book-info">
            Selected book information is unavailable.
          </p>

          <p v-if="request.details" class="request-purpose">
            <strong>Student Notes / Purpose:</strong>
            {{ request.details }}
          </p>
        </div>

        <div class="request-actions">
          <button
            type="button"
            class="action-button approve-button"
            :disabled="!request.book_id"
            @click="openConfirmation(request, 'Approve')"
          >
            Approve
          </button>

          <button
            type="button"
            class="action-button reject-button"
            @click="openConfirmation(request, 'Reject')"
          >
            Reject
          </button>
        </div>
      </article>

      <p
        v-if="!loadingRequests && !requestsError && pendingRequests.length === 0"
        class="empty-message"
      >
        No pending borrow requests.
      </p>

      <div v-if="otherRequests.length" class="other-requests">
        <h3>Request History</h3>

        <article
          v-for="request in otherRequests"
          :key="request.id"
          class="request-row history-row"
        >
          <div class="request-info">
            <p class="request-id">
              {{ request.student?.student_id || 'No student number' }}
              · {{ request.id }}
            </p>

            <h2>{{ request.book?.title || request.title || 'Book not specified' }}</h2>

            <p class="request-meta">
              {{ getStudentName(request.student) }}
              · {{ formatDate(request.submitted_at) }}
            </p>
          </div>

          <span
            class="request-status"
            :class="statusClass(request.status)"
          >
            {{ statusLabel(request.status) }}
          </span>
        </article>
      </div>
    </section>

    <!-- CATALOG -->
    <section v-else-if="activeTab === 'Catalog'" class="catalog-section">
      <div class="catalog-toolbar">
        <label class="search-box">
          <span class="visually-hidden">Search books</span>

          <input
            v-model="searchBook"
            type="search"
            placeholder="Search book"
          />

          <svg
            viewBox="0 0 24 24"
            width="19"
            height="19"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.2 4.2" />
          </svg>
        </label>

        <button
          type="button"
          class="refresh-button"
          :disabled="loadingBooks"
          @click="fetchBooks"
        >
          {{ loadingBooks ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <p v-if="booksError" class="error-message">
        Unable to load books: {{ booksError }}
      </p>

      <div class="catalog-table-wrap">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Available Copies</th>
              <th>Availability</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loadingBooks && books.length === 0">
              <td colspan="5" class="no-results">Loading books...</td>
            </tr>

            <tr v-for="book in filteredBooks" :key="book.id">
              <td>
                <strong>{{ book.title }}</strong>
                <small class="book-category">
                  {{ book.category || 'No category' }}
                  · {{ book.shelf_location || 'No shelf assigned' }}
                </small>
              </td>

              <td>{{ book.author || 'Not specified' }}</td>
              <td>{{ book.isbn || 'No ISBN' }}</td>
              <td>{{ book.available_copies }} / {{ book.total_copies }}</td>

              <td>
                <span
                  class="availability-badge"
                  :class="getAvailability(book).toLowerCase()"
                >
                  {{ getAvailability(book) }}
                </span>
              </td>
            </tr>

            <tr
              v-if="
                !loadingBooks &&
                !booksError &&
                filteredBooks.length === 0
              "
            >
              <td colspan="5" class="no-results">
                {{
                  books.length === 0
                    ? 'No books available in the catalog.'
                    : 'No books match your search.'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- BORROWED AND RETURNS -->
    <section v-else class="borrowed-list">
      <div class="section-toolbar">
        <span>Currently borrowed: {{ activeLoans.length }}</span>

        <button
          type="button"
          class="refresh-button"
          :disabled="loadingLoans"
          @click="fetchBorrowedBooks"
        >
          {{ loadingLoans ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <p v-if="loansError" class="error-message">
        Unable to load book loans: {{ loansError }}
      </p>

      <p
        v-if="loadingLoans && borrowedBooks.length === 0"
        class="empty-message"
      >
        Loading book transactions...
      </p>

      <article
        v-for="loan in activeLoans"
        :key="loan.id"
        class="borrowed-row"
      >
        <div class="borrowed-info">
          <h2>{{ loan.book?.title || 'Unknown book' }}</h2>

          <p class="borrowed-reference">
            {{ loan.student?.full_name || 'Unknown student' }}
            · {{ loan.student?.student_id || 'No student number' }}
          </p>

          <p class="return-date">
            Borrowed: {{ formatDate(loan.borrowed_at) }}
          </p>

          <p class="return-date">
            Due: {{ formatDate(loan.due_at) }}
          </p>
        </div>

        <div class="loan-actions">
          <span class="availability-badge borrowed">
            Borrowed
          </span>

          <button
            type="button"
            class="action-button return-button"
            @click="openReturnConfirmation(loan)"
          >
            Mark Returned
          </button>
        </div>
      </article>

      <p
        v-if="!loadingLoans && !loansError && activeLoans.length === 0"
        class="empty-message"
      >
        No currently borrowed books.
      </p>

      <div v-if="returnedLoans.length" class="returned-section">
        <h3>Returned Books</h3>

        <article
          v-for="loan in returnedLoans"
          :key="loan.id"
          class="borrowed-row returned-row"
        >
          <div>
            <h2>{{ loan.book?.title || 'Unknown book' }}</h2>

            <p class="borrowed-reference">
              {{ loan.student?.full_name || 'Unknown student' }}
              · {{ loan.student?.student_id || 'No student number' }}
            </p>

            <p class="return-date">
              Returned: {{ formatDate(loan.returned_at) }}
            </p>
          </div>

          <span class="availability-badge available">
            Returned
          </span>
        </article>
      </div>
    </section>

    <!-- CONFIRMATION POPUP -->
    <div
      v-if="showConfirmation"
      class="modal-overlay"
      @click.self="closeConfirmation"
      @keydown.esc="closeConfirmation"
    >
      <section
        class="confirmation-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="confirmationTitle"
      >
        <div
          class="warning-icon"
          :class="{
            danger: confirmationAction === 'Reject',
            returned: confirmationAction === 'Return',
          }"
        >
          !
        </div>

        <h2>{{ confirmationTitle }}</h2>

        <p class="confirmation-message">
          {{ confirmationMessage }}
        </p>

        <p v-if="actionError" class="error-message modal-error">
          {{ actionError }}
        </p>

        <div class="confirmation-actions">
          <button
            type="button"
            class="action-button go-back-button"
            :disabled="processing"
            @click="closeConfirmation"
          >
            Go Back
          </button>

          <button
            type="button"
            class="action-button confirm-button"
            :class="{
              'confirm-reject': confirmationAction === 'Reject',
              'confirm-return': confirmationAction === 'Return',
            }"
            :disabled="processing"
            @click="confirmRequest"
          >
            {{
              processing
                ? 'Processing...'
                : confirmationAction
            }}
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.books-page {
  min-width: 0;
  min-height: calc(100vh - 104px);
  padding: 22px;
  background: #eedfdf;
  color: #39070a;
  font-family: Arial, Helvetica, sans-serif;
}

.page-heading h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
}

.page-heading p {
  margin: 0 0 15px;
  font-size: 12px;
  line-height: 1.5;
}

.book-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-button {
  min-height: 34px;
  padding: 0 17px;
  border: 1px solid #a76c70;
  border-radius: 22px;
  background: #f8eeee;
  color: #39070a;
  font-size: 12px;
  cursor: pointer;
}

.tab-button:hover {
  background: #e7cecf;
}

.tab-button.active {
  border-color: #570910;
  background: #570910;
  color: #fff7f5;
}

.request-list,
.borrowed-list,
.catalog-table-wrap {
  overflow: hidden;
  border: 1px solid #c4a1a2;
  border-radius: 14px;
  background: #f8eeee;
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 15px;
  border-bottom: 1px solid #e6d2d2;
  color: #554041;
  font-size: 11px;
  font-weight: 600;
}

.request-row,
.borrowed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 17px;
  border-bottom: 1px solid #e6d2d2;
}

.request-row:last-child,
.borrowed-row:last-child {
  border-bottom: none;
}

.request-info,
.borrowed-info {
  min-width: 0;
  flex: 1;
}

.request-id {
  margin: 0 0 4px;
  color: #70595a;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.request-info h2,
.borrowed-row h2 {
  margin: 0 0 4px;
  color: #2f080a;
  font-size: 15px;
  font-weight: 600;
}

.request-meta,
.borrowed-reference,
.return-date,
.request-book-info {
  margin: 0;
  color: #554041;
  font-size: 10px;
  line-height: 1.6;
}

.request-purpose {
  max-width: 470px;
  margin: 9px 0 0;
  padding: 7px 9px;
  border-radius: 5px;
  background: #e7d0d1;
  color: #44282a;
  font-size: 10px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.request-actions,
.loan-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
}

.action-button {
  min-height: 31px;
  padding: 0 15px;
  border: 1px solid #570910;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.approve-button,
.confirm-button {
  background: #570910;
  color: white;
}

.reject-button,
.go-back-button {
  background: #f8eeee;
  color: #39070a;
}

.approve-button:hover,
.confirm-button:hover {
  background: #74121b;
}

.reject-button:hover,
.go-back-button:hover {
  background: #ead6d7;
}

.return-button {
  border-color: #28744b;
  background: #28744b;
  color: white;
}

.return-button:hover {
  background: #1e5d3b;
}

.request-status {
  display: inline-block;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
}

.request-status.claimed,
.request-status.completed {
  color: #28744b;
}

.request-status.rejected,
.request-status.cancelled {
  color: #c60000;
}

.request-status.pending {
  color: #9a6a13;
}

.request-status.processing,
.request-status.ready-for-pickup {
  color: #70551a;
}

.other-requests,
.returned-section {
  border-top: 1px solid #e6d2d2;
}

.other-requests h3,
.returned-section h3 {
  margin: 0;
  padding: 14px 17px 8px;
  color: #542d30;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 15px;
  font-weight: 500;
}

.history-row {
  padding-top: 11px;
  padding-bottom: 11px;
}

.catalog-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-box {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid #bd9194;
  border-radius: 7px;
  background: #f8eeee;
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #39070a;
  font: inherit;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #927879;
}

.refresh-button {
  min-height: 36px;
  padding: 0 15px;
  border: 1px solid #570910;
  border-radius: 7px;
  background: #570910;
  color: white;
  font-size: 11px;
  cursor: pointer;
}

.refresh-button:hover {
  background: #74121b;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin: 10px 14px;
  padding: 10px 12px;
  border-radius: 7px;
  background: #f4dada;
  color: #a00000;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.success-message {
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid #a7d1b4;
  border-radius: 7px;
  background: #e1f2e5;
  color: #245c3b;
  font-size: 11px;
}

.catalog-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.catalog-table th {
  padding: 13px 14px;
  background: #f1e3e3;
  color: #542d30;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.catalog-table td {
  padding: 12px 14px;
  border-top: 1px solid #e6d2d2;
  color: #2f080a;
  font-size: 11px;
}

.catalog-table tbody tr:hover {
  background: #f4e6e6;
}

.book-category {
  display: block;
  margin-top: 4px;
  color: #795f60;
  font-size: 9px;
}

.availability-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
}

.availability-badge.available {
  background: #b9dfc7;
  color: #245c3b;
}

.availability-badge.unavailable {
  background: #f0df91;
  color: #70551a;
}

.availability-badge.borrowed {
  background: #ecdda8;
  color: #6a4b18;
}

.borrowed-row {
  padding: 19px 17px;
}

.borrowed-reference {
  margin-bottom: 4px;
}

.return-date {
  font-size: 10px;
}

.returned-row {
  background: #fbf3f3;
}

.empty-message,
.no-results {
  padding: 22px;
  color: #795f60;
  font-size: 12px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgb(20 12 12 / 42%);
}

.confirmation-modal {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  width: min(100%, 490px);
  padding: 20px;
  border: 1px solid #ead1d1;
  border-radius: 13px;
  background: #fff6f3;
  box-shadow: 0 12px 35px rgb(40 0 0 / 20%);
}

.warning-icon {
  display: flex;
  grid-row: span 2;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e9c4c5;
  color: #650b13;
  font-size: 27px;
  font-weight: 700;
}

.warning-icon.danger {
  background: #f4c6c6;
  color: #c90000;
}

.warning-icon.returned {
  background: #b9dfc7;
  color: #245c3b;
}

.confirmation-modal h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 500;
}

.confirmation-message {
  grid-column: 1 / -1;
  margin: 13px 0 18px;
  color: #553638;
  font-size: 12px;
  line-height: 1.5;
}

.modal-error {
  grid-column: 1 / -1;
  margin: 0 0 15px;
}

.confirmation-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirm-button {
  min-width: 115px;
}

.confirm-button.confirm-reject {
  border-color: #c90000;
  background: #c90000;
}

.confirm-button.confirm-return {
  border-color: #28744b;
  background: #28744b;
}

.visually-hidden {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 800px) {
  .books-page {
    padding: 18px 13px 30px;
  }

  .request-row,
  .borrowed-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .request-actions,
  .loan-actions {
    align-self: flex-end;
  }

  .catalog-table-wrap {
    overflow-x: auto;
  }

  .catalog-table {
    min-width: 700px;
  }
}

@media (max-width: 420px) {
  .tab-button {
    padding: 0 12px;
    font-size: 11px;
  }

  .catalog-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .confirmation-modal {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    padding: 15px;
  }

  .warning-icon {
    width: 34px;
    height: 34px;
  }

  .confirmation-modal h2 {
    font-size: 17px;
  }
}
</style>
