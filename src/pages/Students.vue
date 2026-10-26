<template>
  <section class="students-page">
    <div class="students-heading">
      <h1>STUDENTS</h1>
      <p>Search Office of Student Affairs records by name or student ID.</p>
    </div>

    <div class="students-toolbar">
      <input
        v-model="searchQuery"
        type="search"
        class="search-input"
        placeholder="Search name or Student ID"
        aria-label="Search students"
      />
    </div>

    <div class="students-table-wrapper">
      <table class="students-table">
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
            <td>{{ student.name }}</td>
            <td>{{ student.studentId }}</td>
            <td>{{ student.course }}</td>
            <td>{{ student.yearLevel }}</td>
            <td>
              <div>{{ student.email }}</div>
              <div>{{ student.contact }}</div>
            </td>
            <td>
              <button
                type="button"
                class="view-details"
                @click="openDetails(student)"
              >
                View Details
              </button>
            </td>
          </tr>

          <tr v-if="filteredStudents.length === 0">
            <td colspan="6" class="empty-state">
              No students found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="students-footer">
      Showing {{ filteredStudents.length }} student(s)
    </div>

    <!-- Student Details Modal -->
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
        aria-labelledby="student-details-title"
      >
        <div class="modal-top">
          <span class="eyebrow">STUDENT DETAILS</span>

          <button
            type="button"
            class="close-button"
            @click="closeDetails"
          >
            CLOSE
          </button>
        </div>

        <h2 id="student-details-title">
          {{ selectedStudent.name }}
        </h2>

        <div class="section-divider"></div>

        <h3>Personal Information</h3>

        <div class="personal-grid">
          <div class="info-item">
            <span>Full name</span>
            <strong>{{ selectedStudent.name }}</strong>
          </div>

          <div class="info-item">
            <span>Student ID</span>
            <strong>{{ selectedStudent.studentId }}</strong>
          </div>

          <div class="info-item">
            <span>Program</span>
            <strong>{{ selectedStudent.course }}</strong>
          </div>

          <div class="info-item">
            <span>Year Level</span>
            <strong>{{ selectedStudent.yearLevel }}</strong>
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

        <div class="section-divider"></div>

        <h3>Current Active Transactions</h3>

        <div class="transaction-row">
          <span>OSA — Student Certification</span>
          <strong class="transaction-status processing">
            Processing
          </strong>
        </div>

        <div class="transaction-row">
          <span>Library — Clearance</span>
          <strong class="transaction-status pending">
            Pending
          </strong>
        </div>

        <h3 class="history-heading">Transaction History</h3>

        <div class="history-card">
          <strong>
            Request Completed — Certificate of Registration
          </strong>
          <span>Sep. 18, 2026 · 2:40 PM</span>
        </div>

        <div class="history-card">
          <strong>
            Appointment Completed — Student Consultation
          </strong>
          <span>Aug. 29, 2026 · 10:15 AM</span>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const searchQuery = ref('')
const selectedStudent = ref(null)

const students = ref([
  {
    id: 1,
    studentId: '2026-001',
    name: 'Juan Dela Cruz',
    course: 'BS Information Technology',
    yearLevel: '3rd Year',
    email: 'juan.delacruz@liceo.edu.ph',
    contact: '+63 917 321 4501'
  },
  {
    id: 2,
    studentId: '2026-002',
    name: 'Maria Santos',
    course: 'BS Business Administration',
    yearLevel: '2nd Year',
    email: 'maria.santos@liceo.edu.ph',
    contact: '+63 918 557 1082'
  },
  {
    id: 3,
    studentId: '2024-11203',
    name: 'Ryan Garcia',
    course: 'BS Computer Science',
    yearLevel: '4th Year',
    email: 'ryan.garcia@liceo.edu.ph',
    contact: '+63 920 884 3390'
  }
])

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return students.value

  return students.value.filter(student =>
    [
      student.name,
      student.studentId,
      student.course,
      student.yearLevel,
      student.email,
      student.contact
    ].some(value => value.toLowerCase().includes(query))
  )
})

function openDetails(student) {
  selectedStudent.value = student
  document.body.style.overflow = 'hidden'
}

function closeDetails() {
  selectedStudent.value = null
  document.body.style.overflow = ''
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeDetails()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.students-page {
  min-height: 100%;
  padding: 32px 34px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #350609;
  font-family: Georgia, "Times New Roman", serif;
}

.students-heading {
  margin-bottom: 28px;
}

.students-heading h1 {
  margin: 0 0 5px;
  color: #5b090f;
  font-size: 24px;
  font-weight: 700;
}

.students-heading p {
  margin: 0;
  color: #927a7b;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.students-toolbar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid #d8b6b8;
  border-radius: 7px;
  outline: none;
  background: #f8eeee;
  color: #350609;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.search-input:focus {
  border-color: #760e16;
  box-shadow: 0 0 0 2px rgb(89 8 14 / 10%);
}

.students-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2c4c6;
  border-radius: 12px;
  background: #f8eeee;
  box-shadow: 0 2px 5px rgb(53 6 9 / 4%);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.students-table th {
  padding: 15px 12px;
  background: #bd9294;
  color: #350609;
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.students-table td {
  padding: 17px 12px;
  border-bottom: 1px solid #ead4d5;
  color: #350609;
  font-family: Arial, sans-serif;
  font-size: 11px;
  line-height: 1.5;
}

.students-table tbody tr:last-child td {
  border-bottom: none;
}

.students-table tbody tr:hover {
  background: #f3e4e5;
}

.view-details {
  padding: 4px 0;
  border: none;
  background: transparent;
  color: #59080e;
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.view-details:hover {
  text-decoration: underline;
}

.empty-state {
  padding: 28px 14px !important;
  color: #927a7b !important;
  text-align: center;
}

.students-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  color: #927a7b;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

/* Modal backdrop */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow-y: auto;
  background: rgb(35 20 20 / 45%);
  box-sizing: border-box;
}

/* Student details panel */
.details-modal {
  position: relative;
  width: 100%;
  max-width: 472px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 22px 20px 20px;
  border: 1px solid #e5cecf;
  border-radius: 13px;
  background: #f8eeee;
  color: #350609;
  box-shadow: 0 10px 35px rgb(53 6 9 / 15%);
  box-sizing: border-box;
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 7px;
}

.eyebrow {
  color: #a18b8c;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

.close-button {
  flex-shrink: 0;
  padding: 3px 0 3px 10px;
  border: none;
  background: transparent;
  color: #59080e;
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.close-button:hover {
  text-decoration: underline;
}

.details-modal h2 {
  margin: 0 0 4px;
  color: #350609;
  font-size: 22px;
  line-height: 1.25;
}

.details-modal h3 {
  margin: 10px 0 9px;
  color: #59080e;
  font-size: 12px;
  font-weight: 700;
}

.section-divider {
  height: 1px;
  margin: 7px 0 9px;
  background: #e8d6d7;
}

.personal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}

.info-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.info-item span {
  color: #a18b8c;
  font-family: Arial, sans-serif;
  font-size: 9px;
}

.info-item strong {
  color: #350609;
  font-size: 10px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.transaction-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 38px;
  margin-bottom: 8px;
  padding: 9px 11px;
  border: 1px solid #e7cdcf;
  border-radius: 6px;
  background: #f8eeee;
  box-sizing: border-box;
}

.transaction-row > span {
  color: #350609;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
}

.transaction-status {
  flex-shrink: 0;
  font-family: Arial, sans-serif;
  font-size: 9px;
  font-weight: 700;
}

.transaction-status.processing {
  color: #926022;
}

.transaction-status.pending {
  color: #8a2828;
}

.details-modal .history-heading {
  margin-top: 10px;
  margin-bottom: 8px;
}

.history-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 9px;
  padding: 12px 11px;
  border-radius: 6px;
  background: #fff;
}

.history-card:last-child {
  margin-bottom: 0;
}

.history-card strong {
  color: #350609;
  font-size: 10px;
  line-height: 1.4;
}

.history-card span {
  color: #a18b8c;
  font-family: Arial, sans-serif;
  font-size: 9px;
}

@media (max-width: 600px) {
  .students-page {
    padding: 22px 15px;
  }

  .students-heading h1 {
    font-size: 20px;
  }

  .students-table th,
  .students-table td {
    padding: 12px 10px;
  }

  .modal-overlay {
    padding: 12px;
  }

  .details-modal {
    max-height: calc(100vh - 24px);
    padding: 20px 16px;
  }

  .details-modal h2 {
    font-size: 20px;
  }

  .personal-grid {
    gap: 12px;
  }
}

@media (max-width: 360px) {
  .personal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
