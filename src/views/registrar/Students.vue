
<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../../lib/supabase'

const students = ref([])
const loading = ref(false)
const searchQuery = ref('')
const viewingStudent = ref(null)
const errorMessage = ref('')

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return students.value

  return students.value.filter(student =>
    [
      student.fullName,
      student.studentNumber,
      student.course,
      student.yearLevel,
      student.email,
    ].some(value => value?.toLowerCase().includes(query)),
  )
})

function mapStudent(profile) {
  return {
    id: profile.id,
    studentNumber: profile.student_id || '—',
    fullName: profile.full_name || 'Unnamed Student',
    course: profile.program || '—',
    yearLevel: profile.year_level || '—',
    email: profile.university_email || '—',
    status: profile.is_active ? 'Active' : 'Inactive',
    createdAt: profile.created_at || '',
  }
}

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
      .order('created_at', { ascending: false })

    if (error) throw error

    students.value = (data || []).map(mapStudent)

    console.log('Student records loaded:', students.value)
  } catch (error) {
    console.error('Error loading student profiles:', error)
    errorMessage.value =
      error.message || 'Unable to load student records.'
  } finally {
    loading.value = false
  }
}

function viewStudent(student) {
  viewingStudent.value = student
}

function closeStudentDetails() {
  viewingStudent.value = null
}

function formatDate(date) {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')
}

onMounted(fetchStudents)
</script>

<template>
  <section class="students-page">
    <section class="page-heading">
      <h1>Students</h1>
      <p>Search Registrar records by name or student ID.</p>
    </section>

    <!-- Search -->
    <div class="search-container">
      <span class="search-icon">⌕</span>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search name or Student ID"
        aria-label="Search students by name or student ID"
      />

      <button
        v-if="searchQuery"
        class="clear-search"
        type="button"
        aria-label="Clear search"
        @click="searchQuery = ''"
      >
        ×
      </button>
    </div>

    <!-- Student Records -->
    <section class="students-table-container">
      <div class="table-scroll">
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
            <tr v-if="loading">
              <td colspan="6" class="message-cell">
                Loading student records...
              </td>
            </tr>

            <tr v-else-if="errorMessage">
              <td colspan="6" class="message-cell error-message">
                {{ errorMessage }}
                <button type="button" @click="fetchStudents">
                  Try again
                </button>
              </td>
            </tr>

            <tr v-else-if="filteredStudents.length === 0">
              <td colspan="6" class="message-cell">
                {{
                  students.length
                    ? 'No matching student records found.'
                    : 'No student records available.'
                }}
              </td>
            </tr>

            <tr
              v-for="student in filteredStudents"
              :key="student.id"
            >
              <td class="student-name">
                {{ student.fullName }}
              </td>

              <td>{{ student.studentNumber }}</td>

              <td>{{ student.course }}</td>

              <td>{{ student.yearLevel }}</td>

              <td class="email-cell">
                {{ student.email }}
              </td>

              <td>
                <button
                  class="view-details-button"
                  type="button"
                  @click="viewStudent(student)"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Student Details Modal -->
    <div
      v-if="viewingStudent"
      class="modal-overlay"
      @click.self="closeStudentDetails"
    >
      <section
        class="student-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-details-title"
      >
        <div class="modal-header">
          <h2 id="student-details-title">STUDENT DETAILS</h2>

          <button
            class="close-button"
            type="button"
            aria-label="Close"
            @click="closeStudentDetails"
          >
            ×
          </button>
        </div>

        <div class="student-profile">
          <div class="student-avatar">
            {{ getInitials(viewingStudent.fullName) }}
          </div>

          <h3>{{ viewingStudent.fullName }}</h3>
        </div>

        <div class="details-section">
          <h4>Personal Information</h4>

          <div class="detail-field">
            <span>Full name</span>
            <strong>{{ viewingStudent.fullName }}</strong>
          </div>

          <div class="detail-field">
            <span>Student ID</span>
            <strong>{{ viewingStudent.studentNumber }}</strong>
          </div>

          <div class="detail-field">
            <span>Program</span>
            <strong>{{ viewingStudent.course }}</strong>
          </div>

          <div class="detail-field">
            <span>Year level</span>
            <strong>{{ viewingStudent.yearLevel }}</strong>
          </div>

          <div class="detail-field">
            <span>Email address</span>
            <strong>{{ viewingStudent.email }}</strong>
          </div>

          <div class="detail-field">
            <span>Account status</span>
            <strong>{{ viewingStudent.status }}</strong>
          </div>

          <div class="detail-field">
            <span>Date registered</span>
            <strong>{{ formatDate(viewingStudent.createdAt) }}</strong>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="close-modal-button"
            @click="closeStudentDetails"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.students-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 3px 2px 24px;
  color: #351c20;
}

.page-heading {
  margin-bottom: 22px;
  padding: 0;
}

.page-heading h1 {
  margin: 0 0 8px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  color: #887477;
  font-size: 15px;
  line-height: 1.5;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 38px;
  margin-bottom: 18px;
  padding: 0 11px;
  gap: 9px;
  background: #f8eeee;
  border: 1px solid #eadcda;
  border-radius: 7px;
}

.search-icon {
  color: #7a4a50;
  font-size: 20px;
  line-height: 1;
}

.search-container input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  color: #451c23;
  background: transparent;
  border: none;
  outline: none;
  font-size: 11px;
}

.search-container input::placeholder {
  color: #9a8586;
}

.clear-search {
  color: #75464d;
  background: transparent;
  border: none;
  font-size: 19px;
  cursor: pointer;
}

.students-table-container {
  width: 100%;
  overflow: hidden;
  background: #f9eeee;
  border: 1px solid #e7d7d5;
  border-radius: 9px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.students-table thead {
  background: #f5e5e5;
}

.students-table th {
  padding: 13px 11px;
  color: #5c2830;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid #e7d7d5;
}

.students-table td {
  padding: 13px 11px;
  color: #554346;
  font-size: 10px;
  border-bottom: 1px solid #eadedd;
}

.students-table tbody tr:last-child td {
  border-bottom: none;
}

.student-name {
  color: #4a2028 !important;
  font-weight: 600;
  white-space: nowrap;
}

.email-cell {
  min-width: 145px;
  overflow-wrap: anywhere;
}

.view-details-button {
  padding: 4px 0;
  color: #64202c;
  background: transparent;
  border: none;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.view-details-button:hover {
  color: #9a3547;
  text-decoration: underline;
}

.message-cell {
  padding: 28px 15px !important;
  color: #806d70 !important;
  text-align: center;
}

.error-message {
  color: #9a3547 !important;
}

.error-message button {
  display: block;
  margin: 9px auto 0;
  padding: 6px 12px;
  color: #fff;
  background: #64101b;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(35, 9, 14, 0.5);
}

.student-details-modal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 23px;
  background: #fffafa;
  border: 1px solid #e7d7d5;
  border-radius: 10px;
  box-shadow: 0 12px 35px rgba(40, 10, 15, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #eadedd;
}

.modal-header h2 {
  margin: 0;
  color: #5c1724;
  font-family: Georgia, serif;
  font-size: 17px;
}

.close-button {
  width: 29px;
  height: 29px;
  color: #6b343d;
  background: #f5e8e8;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.student-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
}

.student-avatar {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  color: #64101b;
  background: #f2dfe1;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 700;
}

.student-profile h3 {
  margin: 10px 0 0;
  color: #4b2029;
  font-size: 15px;
}

.details-section h4 {
  margin: 0 0 14px;
  color: #64202c;
  font-size: 12px;
}

.detail-field {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 11px 0;
  border-bottom: 1px solid #f0e5e4;
  font-size: 11px;
}

.detail-field span {
  color: #8b7779;
}

.detail-field strong {
  max-width: 65%;
  color: #4d3035;
  text-align: right;
  overflow-wrap: anywhere;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.close-modal-button {
  padding: 9px 20px;
  color: #fff;
  background: #590d19;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .page-heading h1 {
    font-size: 25px;
  }

  .page-heading p {
    font-size: 14px;
  }

  .students-table {
    min-width: 680px;
  }
}
</style>
