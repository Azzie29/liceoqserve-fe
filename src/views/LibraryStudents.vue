
<template>
  <div class="students-page">
    <header class="page-heading">
      <h1>Students</h1>
      <p>Search library records by name or student ID.</p>
    </header>

    <div class="search-box">
      <span class="search-icon">⌕</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search name or student ID..."
      />
      <button
        v-if="searchQuery"
        class="clear-search"
        @click="searchQuery = ''"
      >
        ×
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>NAME</th>
            <th>STUDENT ID</th>
            <th>COURSE</th>
            <th>YEAR</th>
            <th>EMAIL / CONTACT</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="student in filteredStudents"
            :key="student.id"
          >
            <td class="student-name">{{ student.name }}</td>
            <td>{{ student.id }}</td>
            <td>{{ student.course }}</td>
            <td>{{ student.year }}</td>

            <td class="contact-cell">
              <span>{{ student.email }}</span>
              <span>{{ student.contact }}</span>
            </td>

            <td>
              <button
                class="view-button"
                @click="viewDetails(student)"
              >
                View Details
              </button>
            </td>
          </tr>

          <tr v-if="filteredStudents.length === 0">
            <td colspan="6" class="no-results">
              No student records found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Student Details Modal -->
    <div
      v-if="selectedStudent"
      class="modal-overlay"
      @click.self="selectedStudent = null"
    >
      <div class="student-modal">
        <div class="modal-top">
          <div>
            <span class="eyebrow">STUDENT DETAILS</span>
            <h2>{{ selectedStudent.name }}</h2>
          </div>

          <button
            class="close-button"
            @click="selectedStudent = null"
          >
            Close
          </button>
        </div>

        <section class="detail-section">
          <h3>Personal Information</h3>

          <div class="info-grid">
            <div class="info-item">
              <span>Full name</span>
              <strong>{{ selectedStudent.name }}</strong>
            </div>

            <div class="info-item">
              <span>Student ID</span>
              <strong>{{ selectedStudent.id }}</strong>
            </div>

            <div class="info-item">
              <span>Program</span>
              <strong>{{ selectedStudent.course }}</strong>
            </div>

            <div class="info-item">
              <span>Year level</span>
              <strong>{{ selectedStudent.year }}</strong>
            </div>

            <div class="info-item">
              <span>Email</span>
              <strong>{{ selectedStudent.email }}</strong>
            </div>

            <div class="info-item">
              <span>Contact number</span>
              <strong>{{ selectedStudent.contact }}</strong>
            </div>
          </div>
        </section>

        <section class="detail-section">
          <h3>Current Active Transactions</h3>

          <div
            v-for="(transaction, index) in selectedStudent.activeTransactions"
            :key="index"
            class="transaction-item"
          >
            {{ transaction }}
          </div>

          <p
            v-if="selectedStudent.activeTransactions.length === 0"
            class="empty-message"
          >
            No active transactions.
          </p>
        </section>

        <section class="detail-section">
          <h3>Transaction History</h3>

          <div
            v-for="(transaction, index) in selectedStudent.history"
            :key="index"
            class="history-item"
          >
            <strong>{{ transaction.title }}</strong>
            <span>{{ transaction.date }}</span>
          </div>

          <p
            v-if="selectedStudent.history.length === 0"
            class="empty-message"
          >
            No transaction history available.
          </p>
        </section>

        <button
          class="done-button"
          @click="selectedStudent = null"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const searchQuery = ref('')
const selectedStudent = ref(null)

const students = ref([
  {
    name: 'Rainier Amparo',
    id: '2024-1203',
    course: 'BS Information Technology',
    year: '3rd Year',
    email: 'rainier.amparo@liceo.edu.ph',
    contact: '+63 917 023 0504',
    activeTransactions: [
      'Library — Clearance — Pending',
      'Library — Book Borrowing — Pending'
    ],
    history: [
      {
        title: 'Request Completed — Certification of Registration',
        date: 'Sep. 10, 2026 · 2:40 PM'
      },
      {
        title: 'Appointment Completed — Student Consultation',
        date: 'Aug. 24, 2026 · 10:15 AM'
      }
    ]
  },
  {
    name: 'Mary Jane Dee',
    id: '2024-1320',
    course: 'BS Business Administration',
    year: '2nd Year',
    email: 'mary.jane.dee@liceo.edu.ph',
    contact: '+63 905 771 3499',
    activeTransactions: [
      'Library — Room Reservation — Pending'
    ],
    history: [
      {
        title: 'Appointment Completed — Library Visit',
        date: 'Sep. 15, 2026 · 9:00 AM'
      }
    ]
  },
  {
    name: 'Chloe Monteza',
    id: '2024-2033',
    course: 'BS Computer Science',
    year: '4th Year',
    email: 'chloe.monteza@liceo.edu.ph',
    contact: '+63 991 620 8041',
    activeTransactions: [
      'Library — Clearance — Pending',
      'Library — Clearance — Pending'
    ],
    history: [
      {
        title: 'Request Completed — Certification of Registration',
        date: 'Sep. 10, 2026 · 2:40 PM'
      },
      {
        title: 'Appointment Completed — Student Consultation',
        date: 'Aug. 24, 2026 · 10:15 AM'
      }
    ]
  }
])

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return students.value

  return students.value.filter(student =>
    [
      student.name,
      student.id,
      student.course,
      student.year,
      student.email,
      student.contact
    ].some(value =>
      value.toLowerCase().includes(query)
    )
  )
})

function viewDetails(student) {
  selectedStudent.value = student
}
</script>

<style scoped>
.students-page {
  min-height: 100%;
  padding: 18px 29px 35px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #39090c;
  font-family: Arial, Helvetica, sans-serif;
}

.page-heading h1 {
  margin: 0 0 2px;
  color: #39070a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 26px;
  font-weight: 600;
}

.page-heading p {
  margin: 0 0 10px;
  color: #351113;
  font-size: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 11px;
  margin-bottom: 13px;
  box-sizing: border-box;
  border: 1px solid #e1c9ca;
  border-radius: 7px;
  background: #f8eeee;
}

.search-icon {
  color: #7b2027;
  font-size: 20px;
  line-height: 1;
}

.search-box input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #3b090d;
  font-size: 11px;
}

.search-box input::placeholder {
  color: #a38b8d;
}

.clear-search {
  border: none;
  background: transparent;
  color: #650b12;
  font-size: 19px;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #d7b7b9;
  border-radius: 9px;
  background: #f8eeee;
}

table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
  text-align: left;
}

thead {
  background: #ead2d3;
}

th {
  padding: 12px 10px;
  color: #5c1117;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

td {
  padding: 12px 10px;
  border-top: 1px solid #e8d5d6;
  color: #987e80;
  font-size: 10px;
  vertical-align: middle;
}

.student-name {
  color: #321013;
  font-weight: 500;
  white-space: nowrap;
}

.contact-cell span {
  display: block;
  max-width: 155px;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.view-button {
  padding: 4px 0;
  border: none;
  background: transparent;
  color: #5a0a10;
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;
}

.view-button:hover {
  text-decoration: underline;
}

.no-results {
  padding: 25px;
  text-align: center;
  color: #997c7e;
}

/* Student details modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
  background: rgba(24, 5, 6, 0.42);
}

.student-modal {
  position: relative;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 23px 25px;
  box-sizing: border-box;
  border: 1px solid #e2cdce;
  border-radius: 12px;
  background: #f8eeee;
  box-shadow: 0 8px 35px rgba(30, 0, 0, 0.15);
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 21px;
}

.eyebrow {
  color: #997b7d;
  font-size: 9px;
}

.modal-top h2 {
  margin: 5px 0 0;
  color: #40090d;
  font-size: 20px;
  font-weight: 600;
}

.close-button {
  padding: 3px 0;
  border: none;
  background: transparent;
  color: #9b7f81;
  font-size: 10px;
  cursor: pointer;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  margin: 0 0 11px;
  color: #3f0a0d;
  font-size: 13px;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 18px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-item span {
  color: #9b8082;
  font-size: 9px;
}

.info-item strong {
  color: #451014;
  font-size: 10px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.transaction-item {
  margin-bottom: 7px;
  padding: 11px 12px;
  border-radius: 6px;
  background: #ead5d6;
  color: #775759;
  font-size: 10px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 5px;
  padding: 10px;
  border: 1px solid #e3cecf;
  border-radius: 6px;
}

.history-item strong {
  color: #5c3437;
  font-size: 10px;
  font-weight: 500;
}

.history-item span {
  color: #a18a8c;
  font-size: 9px;
}

.empty-message {
  color: #987b7d;
  font-size: 11px;
}

.done-button {
  width: 100%;
  padding: 11px;
  border: 1px solid #51090e;
  border-radius: 6px;
  background: #51090e;
  color: #fff2ef;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.done-button:hover {
  background: #6b1118;
}

@media (max-width: 600px) {
  .students-page {
    padding: 18px 14px 25px;
  }

  .page-heading h1 {
    font-size: 23px;
  }

  .student-modal {
    padding: 20px 17px;
  }

  .info-grid {
    gap: 13px;
  }
}
</style>
