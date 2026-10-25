<template>
  <main class="main-content">
    <section class="page-heading">
      <div>
        <p class="eyebrow">REGISTRAR PORTAL</p>
        <h1>Students</h1>
        <p class="page-description">
          Search and view student records in the registrar office.
        </p>
      </div>
      <button class="primary-button" type="button" @click="openAddModal">
        ＋ Add Student
      </button>
    </section>

    <section class="records-panel">
      <header class="panel-heading">
        <div>
          <h2>Student Records</h2>
          <p>Search Registrar records by name or student ID.</p>
        </div>
        <span class="record-count">
          {{ filteredStudents.length }}
          {{ filteredStudents.length === 1 ? 'record' : 'records' }}
        </span>
      </header>

      <div class="toolbar">
        <label class="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="Search name or Student ID"
            aria-label="Search name or Student ID"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clear-button"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            ×
          </button>
        </label>

        <label class="filter-label">
          <span>Status</span>
          <select v-model="statusFilter" aria-label="Filter by status">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div v-if="filteredStudents.length" class="table-scroll">
        <table class="students-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>STUDENT ID</th>
              <th>COURSE</th>
              <th>YEAR</th>
              <th>EMAIL / CONTACT</th>
              <th>STATUS</th>
              <th class="action-heading">ACTION</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td>
                <div class="student-name-cell">
                  <span class="avatar">
                    {{ getInitials(student.fullName) }}
                  </span>
                  <span class="student-name-text">
                    <strong>{{ student.fullName }}</strong>
                    <small>{{ student.gender || 'Student' }}</small>
                  </span>
                </div>
              </td>

              <td>
                <span class="student-id">{{ student.studentNumber }}</span>
              </td>

              <td class="course-cell">{{ student.course || '—' }}</td>
              <td>{{ student.yearLevel || '—' }}</td>

              <td>
                <span class="contact-cell">{{ student.email || '—' }}</span>
                <small v-if="student.phone" class="phone-cell">
                  {{ student.phone }}
                </small>
              </td>

              <td>
                <span class="status" :class="student.status.toLowerCase()">
                  <i></i>
                  {{ student.status }}
                </span>
              </td>

              <td>
                <div class="actions">
                  <button type="button" class="text-action" @click="viewStudent(student)">
                    View
                  </button>
                  <button type="button" class="text-action" @click="openEditModal(student)">
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-action delete-action"
                    @click="studentToDelete = student"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <span class="empty-symbol">S</span>
        <h3>
          {{ students.length ? 'No matching students' : 'No student records yet' }}
        </h3>
        <p>
          {{
            students.length
              ? 'Try another name or student ID, or clear the status filter.'
              : 'Add a student to start building the registrar records.'
          }}
        </p>
        <button
          v-if="students.length"
          class="secondary-button"
          type="button"
          @click="resetFilters"
        >
          Clear filters
        </button>
        <button v-else class="primary-button" type="button" @click="openAddModal">
          Add Student
        </button>
      </div>

      <footer v-if="filteredStudents.length" class="table-footer">
        Showing {{ filteredStudents.length }} of {{ students.length }} student records
      </footer>
    </section>

    <!-- Student details modal -->
    <div v-if="viewingStudent" class="overlay" @click.self="viewingStudent = null">
      <section
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <header class="dialog-header">
          <div>
            <p class="eyebrow">STUDENT RECORD</p>
            <h2 id="details-title">Student Details</h2>
            <p>Review the selected student's information.</p>
          </div>
          <button
            class="close-button"
            type="button"
            aria-label="Close"
            @click="viewingStudent = null"
          >
            ×
          </button>
        </header>

        <div class="dialog-body">
          <div class="profile-summary">
            <span class="profile-avatar">
              {{ getInitials(viewingStudent.fullName) }}
            </span>
            <div>
              <h3>{{ viewingStudent.fullName }}</h3>
              <p>{{ viewingStudent.studentNumber }}</p>
              <span class="status" :class="viewingStudent.status.toLowerCase()">
                <i></i>
                {{ viewingStudent.status }}
              </span>
            </div>
          </div>

          <h3 class="section-title">Personal Information</h3>
          <div class="details-grid">
            <div>
              <label>Full Name</label>
              <p>{{ viewingStudent.fullName }}</p>
            </div>
            <div>
              <label>Gender</label>
              <p>{{ viewingStudent.gender || 'Not specified' }}</p>
            </div>
            <div>
              <label>Date of Birth</label>
              <p>{{ viewingStudent.dateOfBirth || 'Not specified' }}</p>
            </div>
            <div>
              <label>Contact Number</label>
              <p>{{ viewingStudent.phone || 'Not provided' }}</p>
            </div>
            <div>
              <label>Email Address</label>
              <p>{{ viewingStudent.email || 'Not provided' }}</p>
            </div>
            <div>
              <label>Address</label>
              <p>{{ viewingStudent.address || 'Not provided' }}</p>
            </div>
          </div>

          <h3 class="section-title">Academic Information</h3>
          <div class="details-grid">
            <div>
              <label>Student ID</label>
              <p>{{ viewingStudent.studentNumber }}</p>
            </div>
            <div>
              <label>Course</label>
              <p>{{ viewingStudent.course || '—' }}</p>
            </div>
            <div>
              <label>Year Level</label>
              <p>{{ viewingStudent.yearLevel || '—' }}</p>
            </div>
            <div>
              <label>Status</label>
              <p>{{ viewingStudent.status }}</p>
            </div>
          </div>
        </div>

        <footer class="dialog-footer">
          <button class="secondary-button" type="button" @click="viewingStudent = null">
            Close
          </button>
          <button class="primary-button" type="button" @click="openEditModal(viewingStudent)">
            Edit Student
          </button>
        </footer>
      </section>
    </div>

    <!-- Add / edit student modal -->
    <div v-if="showFormModal" class="overlay" @click.self="closeFormModal">
      <section
        class="dialog form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <header class="dialog-header">
          <div>
            <p class="eyebrow">STUDENT RECORDS</p>
            <h2 id="form-title">
              {{ editingStudentId === null ? 'Add Student' : 'Edit Student' }}
            </h2>
            <p>
              {{
                editingStudentId === null
                  ? 'Enter the student information below.'
                  : 'Update the student information below.'
              }}
            </p>
          </div>
          <button class="close-button" type="button" aria-label="Close" @click="closeFormModal">
            ×
          </button>
        </header>

        <form @submit.prevent="saveStudent">
          <div class="form-body">
            <h3 class="section-title">Personal Information</h3>
            <div class="form-grid">
              <label>
                Student ID <em>*</em>
                <input v-model.trim="form.studentNumber" required placeholder="e.g. 2026-00123" />
              </label>

              <label>
                Full Name <em>*</em>
                <input v-model.trim="form.fullName" required placeholder="Enter full name" />
              </label>

              <label>
                Email Address <em>*</em>
                <input
                  v-model.trim="form.email"
                  type="email"
                  required
                  placeholder="student@example.com"
                />
              </label>

              <label>
                Contact Number
                <input v-model.trim="form.phone" type="tel" placeholder="Enter contact number" />
              </label>

              <label>
                Gender
                <select v-model="form.gender">
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Prefer not to say</option>
                </select>
              </label>

              <label>
                Date of Birth
                <input v-model="form.dateOfBirth" type="date" />
              </label>

              <label class="full-width">
                Address
                <textarea v-model.trim="form.address" rows="2" placeholder="Enter home address"></textarea>
              </label>
            </div>

            <h3 class="section-title">Academic Information</h3>
            <div class="form-grid">
              <label>
                Course <em>*</em>
                <input v-model.trim="form.course" required placeholder="Enter course" />
              </label>

              <label>
                Year Level <em>*</em>
                <select v-model="form.yearLevel" required>
                  <option value="" disabled>Select year level</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>5th Year</option>
                </select>
              </label>

              <label>
                Status
                <select v-model="form.status">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>

            <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
          </div>

          <footer class="dialog-footer">
            <button class="secondary-button" type="button" @click="closeFormModal">
              Cancel
            </button>
            <button class="primary-button" type="submit">
              {{ editingStudentId === null ? 'Add Student' : 'Save Changes' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="studentToDelete" class="overlay" @click.self="studentToDelete = null">
      <section
        class="dialog confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <span class="warning-icon">!</span>
        <h2 id="delete-title">Delete Student?</h2>
        <p>
          Are you sure you want to delete
          <strong>{{ studentToDelete.fullName }}</strong>
          ({{ studentToDelete.studentNumber }})? This action cannot be undone.
        </p>
        <footer class="dialog-footer">
          <button class="secondary-button" type="button" @click="studentToDelete = null">
            Cancel
          </button>
          <button class="danger-button" type="button" @click="deleteStudent">
            Delete Student
          </button>
        </footer>
      </section>
    </div>

    <Transition name="toast">
      <div v-if="toastMessage" class="toast" role="status">
        <span>✓</span>
        {{ toastMessage }}
        <button type="button" aria-label="Dismiss message" @click="toastMessage = ''">×</button>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const students = ref([
  {
    id: 1,
    studentNumber: '2026-00123',
    fullName: 'Maria Santos',
    course: 'BS Information Technology',
    yearLevel: '3rd Year',
    email: 'maria.santos@example.com',
    phone: '09171234567',
    gender: 'Female',
    dateOfBirth: '2004-05-12',
    address: 'Quezon City, Philippines',
    status: 'Active',
  },
  {
    id: 2,
    studentNumber: '2026-00124',
    fullName: 'Juan Dela Cruz',
    course: 'BS Computer Science',
    yearLevel: '2nd Year',
    email: 'juan.delacruz@example.com',
    phone: '09181234567',
    gender: 'Male',
    dateOfBirth: '2005-02-20',
    address: 'Manila, Philippines',
    status: 'Active',
  },
  {
    id: 3,
    studentNumber: '2026-00125',
    fullName: 'Carlo Mendoza',
    course: 'BS Information Technology',
    yearLevel: '4th Year',
    email: 'carlo.mendoza@example.com',
    phone: '09191234567',
    gender: 'Male',
    dateOfBirth: '2003-11-08',
    address: 'Caloocan City, Philippines',
    status: 'Active',
  },
  {
    id: 4,
    studentNumber: '2026-00126',
    fullName: 'Angela Reyes',
    course: 'BS Accountancy',
    yearLevel: '1st Year',
    email: 'angela.reyes@example.com',
    phone: '09201234567',
    gender: 'Female',
    dateOfBirth: '2006-07-18',
    address: 'Makati City, Philippines',
    status: 'Inactive',
  },
  {
    id: 5,
    studentNumber: '2026-00127',
    fullName: 'Gabriel Garcia',
    course: 'BS Business Administration',
    yearLevel: '2nd Year',
    email: 'gabriel.garcia@example.com',
    phone: '09211234567',
    gender: 'Male',
    dateOfBirth: '2005-09-03',
    address: 'Pasig City, Philippines',
    status: 'Active',
  },
  {
    id: 6,
    studentNumber: '2026-00128',
    fullName: 'Sofia Bautista',
    course: 'BS Psychology',
    yearLevel: '3rd Year',
    email: 'sofia.bautista@example.com',
    phone: '09221234567',
    gender: 'Female',
    dateOfBirth: '2004-03-25',
    address: 'Taguig City, Philippines',
    status: 'Active',
  },
])

const searchQuery = ref('')
const statusFilter = ref('All')
const viewingStudent = ref(null)
const showFormModal = ref(false)
const editingStudentId = ref(null)
const studentToDelete = ref(null)
const toastMessage = ref('')
const formError = ref('')

let nextId = Math.max(0, ...students.value.map(student => student.id)) + 1

const emptyForm = () => ({
  studentNumber: '',
  fullName: '',
  course: '',
  yearLevel: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  status: 'Active',
})

const form = reactive(emptyForm())

const filteredStudents = computed(() => {
  const query = searchQuery.value.toLowerCase()

  return students.value.filter(student => {
    const matchesQuery =
      !query ||
      [student.fullName, student.studentNumber].some(value =>
        value?.toLowerCase().includes(query),
      )

    return (
      matchesQuery &&
      (statusFilter.value === 'All' || student.status === statusFilter.value)
    )
  })
})

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('')
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = 'All'
}

function resetForm() {
  Object.assign(form, emptyForm())
  formError.value = ''
}

function openAddModal() {
  viewingStudent.value = null
  editingStudentId.value = null
  resetForm()
  showFormModal.value = true
}

function openEditModal(student) {
  const id = student.id
  viewingStudent.value = null
  editingStudentId.value = id
  resetForm()

  const current = students.value.find(item => item.id === id)
  if (!current) return

  Object.assign(form, current)
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editingStudentId.value = null
  formError.value = ''
}

function saveStudent() {
  formError.value = ''

  const duplicateNumber = students.value.some(
    student =>
      student.studentNumber.toLowerCase() === form.studentNumber.trim().toLowerCase() &&
      student.id !== editingStudentId.value,
  )

  if (duplicateNumber) {
    formError.value = 'This student ID already exists.'
    return
  }

  const duplicateEmail = students.value.some(
    student =>
      student.email.toLowerCase() === form.email.trim().toLowerCase() &&
      student.id !== editingStudentId.value,
  )

  if (duplicateEmail) {
    formError.value = 'This email address is already registered.'
    return
  }

  const data = {
    ...form,
    studentNumber: form.studentNumber.trim(),
    fullName: form.fullName.trim(),
    course: form.course.trim(),
    email: form.email.trim(),
  }

  if (editingStudentId.value !== null) {
    const index = students.value.findIndex(
      student => student.id === editingStudentId.value,
    )

    if (index < 0) {
      formError.value = 'Student record not found. Please try again.'
      return
    }

    students.value[index] = { ...students.value[index], ...data }
    toastMessage.value = 'Student record updated successfully.'
  } else {
    students.value.unshift({ id: nextId++, ...data })
    toastMessage.value = 'Student added successfully.'
  }

  closeFormModal()
}

function viewStudent(student) {
  viewingStudent.value = student
}

function deleteStudent() {
  if (!studentToDelete.value) return

  const id = studentToDelete.value.id
  students.value = students.value.filter(student => student.id !== id)

  if (viewingStudent.value?.id === id) {
    viewingStudent.value = null
  }

  studentToDelete.value = null
  toastMessage.value = 'Student record deleted.'
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.main-content {
  --maroon: #650b18;
  --maroon-dark: #50070e;
  --border: #e5d4d5;
  --muted: #887477;
  --ink: #4c2026;

  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 3px 2px 24px;
  background: transparent;
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

/* PAGE HEADING — matches Notifications.vue */
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 0 0 8px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.2;
}

.eyebrow {
  margin: 0 0 7px;
  color: #92777a;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.page-description,
.panel-heading p,
.dialog-header p {
  margin: 0;
  color: #887477;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

/* BUTTONS */
.primary-button,
.secondary-button,
.danger-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid transparent;
  border-radius: 5px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.primary-button {
  background: var(--maroon);
  border-color: var(--maroon);
  color: #fff;
}

.primary-button:hover {
  background: #7a1320;
  border-color: #7a1320;
}

.secondary-button {
  background: #fff8f8;
  border-color: #d8bfc1;
  color: #57252a;
}

.secondary-button:hover {
  background: #efdfdf;
}

.danger-button {
  background: #a12a35;
  border-color: #a12a35;
  color: #fff;
}

.danger-button:hover {
  background: #8e202b;
}

/* RECORDS PANEL */
.records-panel {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e6cdd0;
  border-radius: 17px;
  background: #f9f0f0;
  box-shadow: 0 2px 5px rgb(75 29 32 / 8%);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 16px 18px;
  border-bottom: 1px solid #e6cdd0;
}

.panel-heading h2 {
  margin: 0 0 5px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
}

.panel-heading p {
  font-size: 13px;
}

.record-count {
  flex-shrink: 0;
  padding: 5px 9px;
  border: 1px solid #dfbfc2;
  border-radius: 15px;
  background: #fff7f7;
  color: #765258;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
}

/* SEARCH AND FILTERS */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 18px;
  border-bottom: 1px solid #e6cdd0;
  background: #f9f0f0;
}

.search-box {
  display: flex;
  min-width: 190px;
  min-height: 39px;
  flex: 1;
  align-items: center;
  gap: 9px;
  padding: 0 11px;
  border: 1px solid #dfbfc2;
  border-radius: 5px;
  background: #fffafa;
}

.search-box:focus-within {
  border-color: #9d6870;
  box-shadow: 0 0 0 2px rgb(101 11 24 / 6%);
}

.search-box svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  fill: none;
  stroke: #8d777a;
  stroke-width: 1.7;
  stroke-linecap: round;
}

.search-box input {
  width: 100%;
  min-width: 0;
  height: 36px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
}

.search-box input::placeholder {
  color: #a08d90;
}

.clear-button,
.close-button {
  border: 0;
  background: transparent;
  color: #86696d;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  cursor: pointer;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #81696c;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

.filter-label select,
.form-grid input,
.form-grid select,
.form-grid textarea {
  min-width: 0;
  border: 1px solid #dfbfc2;
  border-radius: 5px;
  outline: none;
  background: #fffafa;
  color: #4c2026;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
}

.filter-label select {
  min-height: 39px;
  padding: 0 10px;
}

.filter-label select:focus,
.form-grid input:focus,
.form-grid select:focus,
.form-grid textarea:focus {
  border-color: #9d6870;
  box-shadow: 0 0 0 2px rgb(101 11 24 / 6%);
}

/* STUDENT TABLE */
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
  font-family: Arial, Helvetica, sans-serif;
}

.students-table thead {
  background: #f5e6e7;
}

.students-table th {
  padding: 12px 14px;
  border-top: 1px solid #eedfe1;
  border-bottom: 1px solid #e6cdd0;
  color: #78565b;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.students-table td {
  padding: 13px 14px;
  border-bottom: 1px solid #e6cdd0;
  color: #4c2026;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  vertical-align: middle;
}

.students-table tbody tr:last-child td {
  border-bottom: 0;
}

.students-table tbody tr:hover {
  background: #f2e5e6;
}

.student-name-cell {
  display: flex;
  min-width: 160px;
  align-items: center;
  gap: 10px;
}

.avatar,
.profile-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5c9ce;
  border-radius: 7px;
  background: #ead5d6;
  color: var(--maroon);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
}

.avatar {
  width: 36px;
  height: 36px;
}

.student-name-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name-text strong {
  color: #351819;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 700;
}

.student-name-text small,
.phone-cell {
  color: #947d7e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
}

.student-id {
  color: #6c2730;
  font-weight: 700;
}

.course-cell {
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-cell {
  display: block;
  color: #6e575a;
  font-size: 12px;
}

.phone-cell {
  display: block;
  margin-top: 4px;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 15px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
}

.status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status.active {
  background: #cde5d2;
  color: #3e704b;
}

.status.inactive {
  background: #f3e6bd;
  color: #81651a;
}

.action-heading {
  text-align: right;
}

.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.text-action {
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: #762832;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.text-action:hover {
  text-decoration: underline;
}

.delete-action {
  color: #a12a35;
}

/* TABLE FOOTER AND EMPTY STATE */
.table-footer {
  padding: 12px 18px;
  border-top: 1px solid #e6cdd0;
  color: #887477;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

.empty-state {
  display: flex;
  min-height: 230px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.empty-symbol {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: #ead5d6;
  color: var(--maroon);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 700;
}

.empty-state h3 {
  margin: 5px 0 0;
  color: #432224;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 700;
}

.empty-state p {
  max-width: 360px;
  margin: 0 0 5px;
  color: #998182;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  line-height: 1.6;
}

/* MODALS */
.overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  overflow-y: auto;
  background: rgb(30 8 10 / 50%);
}

.dialog {
  width: min(100%, 620px);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #dfc4c6;
  border-radius: 12px;
  background: #fff7f7;
  box-shadow: 0 12px 40px rgb(0 0 0 / 15%);
}

.form-dialog {
  width: min(100%, 700px);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 20px;
  border-bottom: 1px solid #e5ced0;
}

.dialog-header h2 {
  margin: 8px 0 6px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-header p {
  font-size: 12px;
}

.close-button {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #dec4c6;
  border-radius: 6px;
  background: #fff7f7;
  color: #59080e;
  font-size: 22px;
}

.close-button:hover {
  background: #f0dddd;
}

.dialog-body,
.form-body {
  padding: 20px;
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border: 1px solid #e3ccce;
  border-radius: 9px;
  background: #f4e5e6;
}

.profile-avatar {
  width: 42px;
  height: 42px;
  font-size: 14px;
}

.profile-summary h3 {
  margin: 0 0 5px;
  color: #351819;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 700;
}

.profile-summary p {
  margin: 0 0 7px;
  color: #887477;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

.section-title {
  margin: 22px 0 14px;
  padding-bottom: 9px;
  border-bottom: 1px solid #e6cdd0;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 17px;
  font-weight: 600;
}

.details-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.details-grid label {
  display: block;
  margin-bottom: 6px;
  color: #887477;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
}

.details-grid p {
  margin: 0;
  overflow-wrap: anywhere;
  color: #4c2026;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 9px;
  padding: 15px 20px;
  border-top: 1px solid #e2cacc;
}

.form-body {
  padding-bottom: 5px;
}

.form-grid label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: #6c5054;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
}

.form-grid em {
  color: #a12a35;
  font-style: normal;
}

.form-grid input,
.form-grid select,
.form-grid textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
}

.form-grid input,
.form-grid select {
  min-height: 38px;
}

.form-grid textarea {
  resize: vertical;
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

.form-error {
  padding: 10px 12px;
  border: 1px solid #e7c3c7;
  border-radius: 5px;
  background: #fff1f2;
  color: #a12a35;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

.confirm-dialog {
  width: min(100%, 410px);
  padding: 25px;
  text-align: center;
}

.warning-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #f9e6e7;
  color: #a12a35;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 22px;
  font-weight: 700;
}

.confirm-dialog h2 {
  margin: 0 0 10px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
}

.confirm-dialog > p {
  color: #887477;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.confirm-dialog .dialog-footer {
  margin-top: 20px;
  padding: 15px 0 0;
}

/* TOAST */
.toast {
  position: fixed;
  z-index: 1200;
  right: 22px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100vw - 32px);
  padding: 12px 14px;
  border: 1px solid #cfe3d3;
  border-radius: 6px;
  background: #f5fbf6;
  color: #3e704b;
  box-shadow: 0 5px 20px rgb(0 0 0 / 10%);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
}

.toast > span {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  background: #deeee1;
}

.toast button {
  margin-left: 4px;
  border: 0;
  background: transparent;
  color: #557d5e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 19px;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(7px);
}

/* RESPONSIVE */
@media (max-width: 760px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-heading .primary-button {
    width: 100%;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
    padding: 13px;
  }

  .filter-label {
    justify-content: space-between;
  }

  .filter-label select {
    flex: 1;
  }

  .panel-heading {
    padding: 15px 13px;
  }

  .students-table th,
  .students-table td {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .page-heading h1 {
    font-size: 25px;
  }

  .page-description {
    font-size: 14px;
  }

  .panel-heading h2 {
    font-size: 18px;
  }

  .details-grid,
  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .form-grid .full-width {
    grid-column: auto;
  }

  .dialog-header,
  .dialog-body,
  .form-body {
    padding: 15px;
  }

  .dialog-header h2 {
    font-size: 18px;
  }

  .dialog-footer {
    padding: 12px 15px;
  }

  .dialog-footer button {
    flex: 1;
  }

  .confirm-dialog {
    padding: 20px 16px;
  }
}
</style>
