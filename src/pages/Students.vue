
<template>
  <section class="students-page">

    <div class="students-heading">
      <h1>STUDENTS</h1>
      <p>Search Office of Student Affairs records by name or student ID.</p>
    </div>

    <!-- SEARCH AND REFRESH -->
    <div class="students-toolbar">
      <input
        v-model="searchQuery"
        type="search"
        class="search-input"
        placeholder="Search name or Student ID"
        aria-label="Search students"
      />

      <button
        type="button"
        class="refresh-button"
        @click="fetchStudents"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- STUDENTS TABLE -->
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
          <tr v-if="loading && students.length === 0">
            <td colspan="6" class="empty-state">
              Loading students...
            </td>
          </tr>

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

          <tr
            v-if="!loading && filteredStudents.length === 0"
          >
            <td colspan="6" class="empty-state">
              {{
                students.length === 0
                  ? 'No student records found.'
                  : 'No students match your search.'
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="students-footer">
      <span>
        Showing {{ filteredStudents.length }} of
        {{ students.length }} student(s)
      </span>
    </div>

    <!-- STUDENT DETAILS MODAL -->
    <div
      v-if="selectedStudent"
      class="modal-overlay"
      @click.self="closeDetails"
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

          <div class="info-item">
            <span>Account Status</span>
            <strong
              :class="
                selectedStudent.isActive
                  ? 'active-status'
                  : 'inactive-status'
              "
            >
              {{ selectedStudent.isActive ? 'Active' : 'Inactive' }}
            </strong>
          </div>

        </div>

        <div class="section-divider"></div>

        <h3>Current Active Transactions</h3>

        <div class="not-connected-message">
          Transaction records are not connected to this page yet.
        </div>

        <h3 class="history-heading">Transaction History</h3>

        <div class="not-connected-message">
          Transaction history will appear here once it is connected to the database.
        </div>

      </section>
    </div>

  </section>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { supabase } from '../lib/Supabase.js'

const searchQuery = ref('')
const selectedStudent = ref(null)
const students = ref([])
const loading = ref(false)
const errorMessage = ref('')

let studentsChannel = null

// CONVERT DATABASE VALUES
function mapStudent(profile) {
  return {
    id: profile.id,
    studentId: profile.student_id || 'Not provided',
    name: profile.full_name || 'Not provided',
    course: profile.program || 'Not provided',
    yearLevel: profile.year_level || 'Not provided',
    email: profile.university_email || 'Not provided',
    contact: 'Not available',
    isActive: profile.is_active === true
  }
}

// FETCH STUDENTS FROM SUPABASE
async function fetchStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        student_id,
        full_name,
        university_email,
        program,
        year_level,
        role,
        is_active,
        created_at
      `)
      .eq('role', 'student')
      .order('full_name', { ascending: true })

    if (error) {
      throw error
    }

    students.value = (data || []).map(mapStudent)

    // UPDATE SELECTED STUDENT DETAILS
    if (selectedStudent.value) {
      const updatedStudent = students.value.find(
        student => student.id === selectedStudent.value.id
      )

      selectedStudent.value = updatedStudent || null
    }

  } catch (error) {
    console.error('FETCH STUDENTS ERROR:', error)

    errorMessage.value =
      error.message || 'Unable to load student records from Supabase.'

  } finally {
    loading.value = false
  }
}

// SEARCH STUDENTS
const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return students.value.filter(student => {
    return [
      student.name,
      student.studentId,
      student.course,
      student.yearLevel,
      student.email
    ].some(value =>
      String(value).toLowerCase().includes(query)
    )
  })
})

// OPEN STUDENT DETAILS
function openDetails(student) {
  selectedStudent.value = student
  document.body.style.overflow = 'hidden'
}

// CLOSE STUDENT DETAILS
function closeDetails() {
  selectedStudent.value = null
  document.body.style.overflow = ''
}

// ESCAPE KEY
function handleEscape(event) {
  if (event.key === 'Escape') {
    closeDetails()
  }
}

// SUPABASE REALTIME
function subscribeToStudentChanges() {
  studentsChannel = supabase
    .channel('osa-students-profiles')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      () => {
        fetchStudents()
      }
    )
    .subscribe(status => {
      console.log('STUDENTS REALTIME STATUS:', status)
    })
}

// LIFECYCLE
onMounted(() => {
  fetchStudents()
  subscribeToStudentChanges()

  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)

  document.body.style.overflow = ''

  if (studentsChannel) {
    supabase.removeChannel(studentsChannel)
    studentsChannel = null
  }
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

/* HEADING */
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

/* TOOLBAR */
.students-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid #d8b6b8;
  border-radius: 7px;
  outline: none;
  background: #f8eeee;
  color: #350609;
  font-family: Arial, sans-serif;
  font-size: 12px;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #760e16;
  box-shadow: 0 0 0 2px rgb(89 8 14 / 10%);
}

.refresh-button {
  padding: 9px 15px;
  border: 1px solid #59080e;
  border-radius: 7px;
  background: #59080e;
  color: #fff;
  font-family: Arial, sans-serif;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #760e16;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ERROR */
.error-message {
  margin-bottom: 15px;
  padding: 12px 14px;
  border: 1px solid #e5bfc1;
  border-radius: 7px;
  background: #f9e5e6;
  color: #8a2828;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

/* TABLE */
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

/* VIEW DETAILS */
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

/* FOOTER */
.students-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  color: #927a7b;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

/* MODAL BACKDROP */
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

/* STUDENT DETAILS PANEL */
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

/* PERSONAL INFORMATION */
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

.active-status {
  color: #287a3a !important;
}

.inactive-status {
  color: #a02c2c !important;
}

/* TRANSACTION PLACEHOLDER */
.not-connected-message {
  padding: 12px;
  border: 1px solid #e7cdcf;
  border-radius: 6px;
  background: #fff;
  color: #927a7b;
  font-family: Arial, sans-serif;
  font-size: 10px;
  line-height: 1.5;
}

.details-modal .history-heading {
  margin-top: 14px;
  margin-bottom: 8px;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .students-page {
    padding: 22px 15px;
  }

  .students-heading h1 {
    font-size: 20px;
  }

  .students-toolbar {
    flex-wrap: wrap;
  }

  .search-input {
    flex-basis: 100%;
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
