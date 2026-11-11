
<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const activeFilter = ref('Pending')
const selectedStudentId = ref(null)
const notice = ref('')
const loading = ref(false)
const errorMessage = ref('')
const returningLoanId = ref(null)

const students = ref([])
let clearanceChannel = null

// FETCH CLEARANCE RECORDS FROM SUPABASE
async function fetchClearanceRecords() {
  loading.value = true
  errorMessage.value = ''

  try {
    // Get borrowed and returned book loans
    const { data: loans, error: loansError } = await supabase
      .from('book_loans')
      .select(`
        id,
        book_id,
        student_id,
        borrowed_at,
        due_at,
        returned_at,
        status
      `)
      .in('status', ['borrowed', 'returned'])
      .order('borrowed_at', { ascending: false })

    if (loansError) throw loansError

    if (!loans || loans.length === 0) {
      students.value = []
      return
    }

    // Get unique student IDs
    const studentIds = [
      ...new Set(loans.map(loan => loan.student_id)),
    ]

    // Get unique book IDs
    const bookIds = [
      ...new Set(loans.map(loan => loan.book_id)),
    ]

    // Fetch student profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, student_id, full_name')
      .in('id', studentIds)

    if (profilesError) throw profilesError

    // Fetch library book details
    const { data: books, error: booksError } = await supabase
      .from('library_books')
      .select('id, title')
      .in('id', bookIds)

    if (booksError) throw booksError

    // Create lookup maps
    const profileMap = new Map(
      (profiles || []).map(profile => [profile.id, profile]),
    )

    const bookMap = new Map(
      (books || []).map(book => [book.id, book]),
    )

    // Group book loans by student
    const studentMap = new Map()

    loans.forEach(loan => {
      const profile = profileMap.get(loan.student_id)
      const book = bookMap.get(loan.book_id)

      if (!studentMap.has(loan.student_id)) {
        studentMap.set(loan.student_id, {
          id: loan.student_id,
          name: profile?.full_name || 'Unknown Student',
          studentId: profile?.student_id || 'Not available',
          requirements: [],
        })
      }

      const student = studentMap.get(loan.student_id)

      const returned = loan.status === 'returned'

      student.requirements.push({
        id: loan.id,
        bookId: loan.book_id,
        name: book?.title || 'Unknown Book',
        dueDate: loan.due_at,
        condition: getBookCondition(loan.due_at, returned),
        returned,
        returnedAt: loan.returned_at,
      })
    })

    // Determine clearance status based on outstanding books
    students.value = Array.from(studentMap.values()).map(student => ({
      ...student,
      status: student.requirements.some(book => !book.returned)
        ? 'Pending'
        : 'Cleared',
    }))
  } catch (error) {
    console.error('Clearance fetch error:', error)
    errorMessage.value = error.message || 'Unable to load clearance records.'
  } finally {
    loading.value = false
  }
}

// DETERMINE BOOK CONDITION
function getBookCondition(dueDate, returned) {
  if (returned) return 'Returned'
  if (!dueDate) return 'Due'

  return new Date(dueDate) < new Date() ? 'Overdue' : 'Due'
}

// FORMAT DATE
function formatDate(date) {
  if (!date) return 'Not specified'

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// FILTER STUDENTS
const filteredStudents = computed(() =>
  students.value.filter(
    student => student.status === activeFilter.value,
  ),
)

// SELECTED STUDENT
const selectedStudent = computed(() =>
  students.value.find(
    student => student.id === selectedStudentId.value,
  ) || null,
)

// COUNT OUTSTANDING BOOKS
const outstandingCount = student =>
  student.requirements.filter(book => !book.returned).length

// OPEN DETAILS
function openDetails(student) {
  selectedStudentId.value = student.id
  notice.value = ''
}

// CLOSE DETAILS
function closeDetails() {
  selectedStudentId.value = null
}

// MARK BOOK AS RETURNED
async function markBookReturned(book) {
  if (!selectedStudent.value || book.returned || returningLoanId.value) {
    return
  }

  const studentName = selectedStudent.value.name

  returningLoanId.value = book.id
  notice.value = ''

  try {
    // Call the Supabase database function
    const { error } = await supabase.rpc('return_library_book', {
      p_loan_id: book.id,
    })

    if (error) throw error

    // Refresh clearance records
    await fetchClearanceRecords()

    notice.value = `${book.name} has been marked as returned for ${studentName}.`
  } catch (error) {
    console.error('Book return error:', error)
    notice.value = error.message || 'Unable to mark this book as returned.'
  } finally {
    returningLoanId.value = null
  }
}

// DISMISS NOTICE
function clearNotice() {
  notice.value = ''
}

// REALTIME SUBSCRIPTION
function subscribeToClearanceChanges() {
  clearanceChannel = supabase
    .channel('library-clearance-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'book_loans',
      },
      () => {
        fetchClearanceRecords()
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'library_books',
      },
      () => {
        fetchClearanceRecords()
      },
    )
    .subscribe()
}

onMounted(async () => {
  await fetchClearanceRecords()
  subscribeToClearanceChanges()
})

onUnmounted(() => {
  if (clearanceChannel) {
    supabase.removeChannel(clearanceChannel)
    clearanceChannel = null
  }
})
</script>

<template>
  <main class="clearance-page">
    <header class="page-header">
      <h1>Library Clearance</h1>
      <p>Pending and Cleared Records are kept in separate views.</p>
    </header>

    <div class="filter-tabs">
      <button
        v-for="filter in ['Pending', 'Cleared']"
        :key="filter"
        type="button"
        :class="{ active: activeFilter === filter }"
        :aria-pressed="activeFilter === filter"
        @click="activeFilter = filter"
      >
        {{ filter }}
      </button>
    </div>

    <div v-if="notice" class="notice" role="status">
      <span>{{ notice }}</span>
      <button type="button" aria-label="Dismiss" @click="clearNotice">
        ×
      </button>
    </div>

    <div v-if="errorMessage" class="notice error-notice" role="alert">
      {{ errorMessage }}
    </div>

    <div v-if="loading && students.length === 0" class="empty-state">
      Loading clearance records...
    </div>

    <section v-else class="student-list">
      <article
        v-for="student in filteredStudents"
        :key="student.id"
        class="student-card"
      >
        <div class="student-info">
          <strong>{{ student.name }}</strong>
          <span>
            {{ student.studentId }} ·
            {{
              outstandingCount(student) === 0
                ? 'No outstanding books'
                : `${outstandingCount(student)} outstanding books`
            }}
          </span>
        </div>

        <button
          class="details-button"
          type="button"
          @click="openDetails(student)"
        >
          View Details
        </button>
      </article>

      <div v-if="filteredStudents.length === 0" class="empty-state">
        No {{ activeFilter.toLowerCase() }} clearance records.
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="selectedStudent"
        class="modal-overlay"
        @click.self="closeDetails"
        @keydown.esc="closeDetails"
      >
        <section
          class="details-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clearance-title"
        >
          <div class="modal-top">
            <span>CLEARANCE DETAILS</span>
            <button
              class="close-button"
              type="button"
              @click="closeDetails"
            >
              Close
            </button>
          </div>

          <h2 id="clearance-title">
            {{ selectedStudent.name }} · {{ selectedStudent.studentId }}
          </h2>

          <p class="modal-description">
            {{
              selectedStudent.status === 'Cleared'
                ? 'Clearance completed. No outstanding books or fines.'
                : 'Clearance is pending until all books are returned.'
            }}
          </p>

          <div
            v-if="selectedStudent.requirements.length"
            class="requirements"
          >
            <div
              v-for="book in selectedStudent.requirements"
              :key="book.id"
              class="requirement-row"
            >
              <strong>{{ book.name }}</strong>

              <span class="due-date">
                Due: {{ formatDate(book.dueDate) }}
              </span>

              <span
                class="requirement-status"
                :class="book.condition.toLowerCase()"
              >
                {{ book.condition }}
              </span>

              <span
                class="return-status"
                :class="{ returned: book.returned }"
              >
                {{ book.returned ? 'Returned' : 'Not Returned' }}
              </span>

              <button
                v-if="!book.returned && selectedStudent.status === 'Pending'"
                class="return-button"
                type="button"
                :disabled="returningLoanId === book.id"
                @click="markBookReturned(book)"
              >
                {{
                  returningLoanId === book.id
                    ? 'Updating...'
                    : 'Mark as Returned'
                }}
              </button>
            </div>
          </div>

          <div v-else class="cleared-message">
            All library requirements have been completed.
          </div>

          <div
            v-if="selectedStudent.status === 'Pending'"
            class="modal-footer"
          >
            <span class="outstanding-count">
              Outstanding: {{ outstandingCount(selectedStudent) }}
            </span>
          </div>

          <span v-else class="cleared-label">
            ✓ Clearance Completed
          </span>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.clearance-page {
  flex: 1;
  min-width: 0;
  min-height: calc(100vh - 104px);
  padding: 28px;
  box-sizing: border-box;
  background: #eadcda;
  color: #390607;
  font-family: Arial, sans-serif;
}

.page-header h1 {
  margin: 0 0 5px;
  font: 28px Georgia, serif;
}

.page-header p {
  margin: 0;
  font-size: 12px;
}

.filter-tabs {
  display: flex;
  gap: 7px;
  margin: 22px 0 18px;
}

.filter-tabs button {
  min-width: 84px;
  padding: 9px 15px;
  border: 1px solid #a67b7d;
  border-radius: 22px;
  background: #f7eeee;
  color: #390607;
  cursor: pointer;
  font-size: 11px;
}

.filter-tabs button.active {
  border-color: #56090d;
  background: #56090d;
  color: white;
}

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
  padding: 11px 13px;
  border: 1px solid #c9b3a0;
  border-radius: 7px;
  background: #f7eeee;
  font-size: 11px;
}

.notice button {
  border: 0;
  background: transparent;
  color: #56090d;
  cursor: pointer;
  font-size: 18px;
}

.error-notice {
  border-color: #b94a48;
  color: #9b2525;
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.student-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px;
  border: 1px solid #bda0a0;
  border-radius: 10px;
  background: #f7eeee;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.student-info strong {
  font: 14px Georgia, serif;
}

.student-info span {
  font-size: 10px;
}

.details-button {
  flex-shrink: 0;
  padding: 8px 10px;
  border: 0;
  background: transparent;
  color: #56090d;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}

.details-button:hover,
.close-button:hover {
  text-decoration: underline;
}

.empty-state {
  padding: 35px;
  border: 1px dashed #bda0a0;
  border-radius: 10px;
  text-align: center;
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
  background: rgb(30 20 20 / 45%);
}

.details-modal {
  width: min(100%, 440px);
  max-height: 85vh;
  overflow-y: auto;
  padding: 18px;
  border-radius: 11px;
  background: #f8eeee;
  color: #390607;
  box-shadow: 0 12px 35px #0002;
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #8a6d6e;
  font-size: 9px;
}

.close-button {
  border: 0;
  background: transparent;
  color: #765c5d;
  cursor: pointer;
  font-size: 10px;
}

.details-modal h2 {
  margin: 8px 0 5px;
  font: 19px Georgia, serif;
}

.modal-description {
  margin: 0 0 15px;
  color: #795f60;
  font-size: 10px;
  line-height: 1.5;
}

.requirements {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.requirement-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #c9a7a8;
  border-radius: 6px;
  font-size: 10px;
}

.requirement-row strong {
  flex: 1 1 100%;
}

.due-date {
  color: #795f60;
}

.requirement-status,
.return-status {
  padding: 4px 7px;
  border-radius: 10px;
  font-size: 9px;
}

.requirement-status.overdue {
  background: #eee58b;
}

.requirement-status.due {
  background: #eee58b;
}

.requirement-status.returned,
.return-status.returned {
  background: #d9ead7;
  color: #276d39;
}

.return-status {
  background: #eadbdb;
  color: #795f60;
}

.return-button {
  padding: 7px 9px;
  border: 1px solid #56090d;
  border-radius: 5px;
  background: #56090d;
  color: white;
  cursor: pointer;
  font-size: 10px;
}

.return-button:hover:not(:disabled) {
  background: #720f15;
}

.return-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.outstanding-count {
  color: #795f60;
  font-size: 10px;
}

.cleared-message,
.cleared-label {
  color: #376b43;
  font-size: 11px;
}

.cleared-label {
  display: inline-block;
  margin-top: 15px;
}

@media (max-width: 700px) {
  .clearance-page {
    padding: 20px 14px;
  }

  .student-card {
    align-items: flex-start;
  }

  .details-modal {
    padding: 14px;
  }
}
</style>
