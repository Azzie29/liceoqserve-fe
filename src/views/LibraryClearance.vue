
<script setup>
import { computed, ref } from 'vue'

const activeFilter = ref('Pending')
const selectedStudentId = ref(null)
const showConfirm = ref(false)
const notice = ref('')

const students = ref([
  {
    id: 1,
    name: 'Rainier Amparo',
    studentId: '2024-11203',
    status: 'Pending',
    requirements: [
      {
        id: 1,
        name: 'Clean Code',
        dueDate: 'Sep 29, 2026',
        condition: 'Overdue',
        returned: false,
      },
      {
        id: 2,
        name: 'Database Systems',
        dueDate: 'Oct 1, 2026',
        condition: 'Due',
        returned: false,
      },
    ],
  },
  {
    id: 2,
    name: 'Chloe Monteza',
    studentId: '2024-12033',
    status: 'Cleared',
    requirements: [],
  },
])

const filteredStudents = computed(() =>
  students.value.filter(
    student => student.status === activeFilter.value,
  ),
)

const selectedStudent = computed(() =>
  students.value.find(
    student => student.id === selectedStudentId.value,
  ) || null,
)

const outstandingCount = student =>
  student.requirements.filter(book => !book.returned).length

function openDetails(student) {
  selectedStudentId.value = student.id
  notice.value = ''
}

function closeDetails() {
  selectedStudentId.value = null
  showConfirm.value = false
}

function markBookReturned(book) {
  if (!selectedStudent.value || book.returned) return

  book.returned = true
  book.condition = 'Returned'

  notice.value = `${book.name} marked as returned.`
}

function markAsCleared() {
  if (!selectedStudent.value) return

  if (outstandingCount(selectedStudent.value) > 0) {
    notice.value =
      'Please return all outstanding books before clearing this student.'
    return
  }

  showConfirm.value = true
}

function confirmClearance() {
  if (!selectedStudent.value) return

  selectedStudent.value.status = 'Cleared'
  showConfirm.value = false
  activeFilter.value = 'Cleared'
  notice.value =
    `${selectedStudent.value.name} has been marked as cleared.`
}

function clearNotice() {
  notice.value = ''
}
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

    <section class="student-list">
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

              <span class="due-date">Due: {{ book.dueDate }}</span>

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
                @click="markBookReturned(book)"
              >
                Mark as Returned
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

            <button
              class="mark-button"
              type="button"
              :disabled="outstandingCount(selectedStudent) > 0"
              @click="markAsCleared"
            >
              Mark as Cleared
            </button>
          </div>

          <span v-else class="cleared-label">
            ✓ Clearance Completed
          </span>
        </section>
      </div>

      <div
        v-if="showConfirm && selectedStudent"
        class="modal-overlay confirm-overlay"
        @click.self="showConfirm = false"
      >
        <section
          class="confirm-modal"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div class="warning-icon">!</div>

          <h2 id="confirm-title">Mark as Cleared?</h2>

          <p>
            Confirm that {{ selectedStudent.name }} has returned all
            outstanding books and completed the library clearance.
          </p>

          <div class="confirm-actions">
            <button
              class="back-button"
              type="button"
              @click="showConfirm = false"
            >
              Go Back
            </button>

            <button
              class="mark-button"
              type="button"
              @click="confirmClearance"
            >
              Confirm
            </button>
          </div>
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

.details-modal,
.confirm-modal {
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

.return-button:hover,
.mark-button:not(:disabled):hover {
  background: #720f15;
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

.mark-button {
  padding: 9px 12px;
  border: 0;
  border-radius: 5px;
  background: #56090d;
  color: white;
  cursor: pointer;
  font-size: 11px;
}

.mark-button:disabled {
  background: #b99b9c;
  cursor: not-allowed;
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

.confirm-modal {
  width: min(100%, 350px);
}

.warning-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  background: #ead1d1;
  color: #760f16;
  font-size: 23px;
  font-weight: bold;
}

.confirm-modal h2 {
  font: 21px Georgia, serif;
}

.confirm-modal p {
  font-size: 12px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.back-button {
  padding: 9px 12px;
  border: 1px solid #bda0a0;
  border-radius: 6px;
  background: transparent;
  color: #390607;
  cursor: pointer;
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
