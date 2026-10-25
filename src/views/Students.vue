
<script setup>
import { ref } from 'vue'

const students = ref([
  {
    id: 1,
    name: 'Rainier Amparo',
    studentId: '2024-112030',
    course: 'BS Information Technology',
    year: '3rd Year',
    email: 'rainier.amparo@liceo.edu.ph',
    contact: '+63 917 025 0204',
    activeTransactions: [
      {
        title: 'Guidance — Career Guidance',
        status: 'Rescheduled'
      }
    ],
    history: [
      {
        title: 'Career Guidance Session',
        date: 'Oct. 6, 2026 · 10:15 AM',
        status: 'Completed'
      }
    ]
  },
  {
    id: 2,
    name: 'Angel Dadole',
    studentId: '2024-122805',
    course: 'BS Information Technology',
    year: '3rd Year',
    email: 'angel.dadole@liceo.edu.ph',
    contact: '+63 911 143 6269',
    activeTransactions: [
      {
        title: 'Guidance — Counseling Session',
        status: 'Pending'
      }
    ],
    history: []
  },
  {
    id: 3,
    name: 'Chloe Monteza',
    studentId: '2024-120331',
    course: 'BS Computer Science',
    year: '4th Year',
    email: 'chloe.monteza@liceo.edu.ph',
    contact: '+63 916 620 8041',
    activeTransactions: [],
    history: []
  }
])

const selectedStudent = ref(null)

function viewDetails(student) {
  selectedStudent.value = student
}

function closeDetails() {
  selectedStudent.value = null
}
</script>

<template>
  <section class="students-page">
    <header class="page-heading">
      <h1>Manage Students</h1>
      <p>Student library records by name or student ID.</p>
    </header>

    <!-- Student table: search bar removed -->
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
            v-for="student in students"
            :key="student.id"
          >
            <td class="student-name">
              {{ student.name }}
            </td>

            <td>{{ student.studentId }}</td>

            <td>{{ student.course }}</td>

            <td>{{ student.year }}</td>

            <td class="contact-cell">
              <span>{{ student.email }}</span>
              <span>{{ student.contact }}</span>
            </td>

            <td>
              <button
                class="view-details-button"
                type="button"
                @click="viewDetails(student)"
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Student details modal -->
    <Teleport to="body">
      <div
        v-if="selectedStudent"
        class="details-overlay"
        @click.self="closeDetails"
      >
        <section
          class="details-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-details-title"
        >
          <header class="details-header">
            <div>
              <p class="eyebrow">STUDENT DETAILS</p>
              <h2 id="student-details-title">
                {{ selectedStudent.name }}
              </h2>
            </div>

            <button
              class="close-top-button"
              type="button"
              aria-label="Close student details"
              @click="closeDetails"
            >
              Close
            </button>
          </header>

          <div class="details-content">
            <section class="information-section">
              <h3>Personal Information</h3>

              <div class="information-grid">
                <div class="information-item">
                  <span>Full Name</span>
                  <strong>{{ selectedStudent.name }}</strong>
                </div>

                <div class="information-item">
                  <span>Student ID</span>
                  <strong>{{ selectedStudent.studentId }}</strong>
                </div>

                <div class="information-item">
                  <span>Program</span>
                  <strong>{{ selectedStudent.course }}</strong>
                </div>

                <div class="information-item">
                  <span>Year Level</span>
                  <strong>{{ selectedStudent.year }}</strong>
                </div>

                <div class="information-item">
                  <span>Email</span>
                  <strong>{{ selectedStudent.email }}</strong>
                </div>

                <div class="information-item">
                  <span>Contact Number</span>
                  <strong>{{ selectedStudent.contact }}</strong>
                </div>
              </div>
            </section>

            <section class="transactions-section">
              <h3>Current Active Transactions</h3>

              <div
                v-if="selectedStudent.activeTransactions.length"
                class="transaction-list"
              >
                <article
                  v-for="(transaction, index) in selectedStudent.activeTransactions"
                  :key="index"
                  class="transaction-item active-transaction"
                >
                  <span>{{ transaction.title }}</span>
                  <strong>{{ transaction.status }}</strong>
                </article>
              </div>

              <p v-else class="empty-message">
                No active transactions.
              </p>
            </section>

            <section class="transactions-section history-section">
              <h3>Transaction History</h3>

              <div
                v-if="selectedStudent.history.length"
                class="history-list"
              >
                <article
                  v-for="(transaction, index) in selectedStudent.history"
                  :key="index"
                  class="transaction-item history-item"
                >
                  <div>
                    <strong>{{ transaction.title }}</strong>
                    <p>{{ transaction.date }}</p>
                  </div>

                  <strong
                    class="history-status"
                    :class="transaction.status.toLowerCase()"
                  >
                    {{ transaction.status }}
                  </strong>
                </article>
              </div>

              <p v-else class="empty-message">
                No transaction history available.
              </p>
            </section>
          </div>

          <!-- Removed the bottom Close Details button -->
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.students-page {
  width: 100%;
  min-width: 0;
  color: #39090c;
}

.page-heading {
  margin: 0 0 25px;
}

.page-heading h1 {
  margin: 0;
  color: #39090c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 36px;
  font-weight: normal;
}

.page-heading p {
  margin: 2px 0 0;
  font-size: 14px;
}

.students-table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: #f8eeee;
  border: 1px solid #d7b9bb;
  border-radius: 15px;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.students-table thead {
  background: #ead5d6;
}

.students-table th {
  padding: 17px 15px;
  color: #39090c;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.students-table td {
  padding: 19px 15px;
  border-bottom: 1px solid #ead5d6;
  vertical-align: middle;
}

.students-table tbody tr:last-child td {
  border-bottom: none;
}

.students-table tbody tr:hover {
  background: #f3e3e3;
}

.student-name {
  font-weight: 700;
  white-space: nowrap;
}

.contact-cell span {
  display: block;
  margin: 2px 0;
  overflow-wrap: anywhere;
}

.view-details-button {
  padding: 5px 0;
  color: #a4000b;
  background: transparent;
  border: none;
  font-size: 13px;
  white-space: nowrap;
}

.view-details-button:hover {
  text-decoration: underline;
}

/* Details modal */
.details-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  background: rgba(30, 17, 18, 0.38);
}

.details-modal {
  width: 100%;
  max-width: 800px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  color: #39090c;
  background: #f8eeee;
  border: 1px solid #d9c0c1;
  border-radius: 10px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 22px 25px 18px;
  border-bottom: 1px solid #ead5d6;
}

.eyebrow {
  margin: 0 0 4px;
  color: #987d7e;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.details-header h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 32px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.close-top-button {
  flex-shrink: 0;
  margin-top: 5px;
  padding: 5px 0 5px 10px;
  color: #80696a;
  background: transparent;
  border: none;
  font-size: 14px;
}

.close-top-button:hover {
  color: #39090c;
  text-decoration: underline;
}

.details-content {
  display: grid;
  gap: 24px;
  padding: 20px 25px 25px;
}

.information-section h3,
.transactions-section h3 {
  margin: 0 0 13px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: bold;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px 25px;
}

.information-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.information-item span {
  color: #987d7e;
  font-size: 13px;
}

.information-item strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.transaction-list,
.history-list {
  display: grid;
  gap: 8px;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 12px 13px;
  border-radius: 7px;
  font-size: 13px;
}

.active-transaction {
  background: #ead5d6;
}

.active-transaction strong {
  color: #8a1019;
  text-align: right;
}

.history-item {
  min-height: 62px;
  background: #f8eeee;
  border: 1px solid #e5cacc;
}

.history-item > div {
  min-width: 0;
}

.history-item > div strong {
  font-size: 13px;
}

.history-item p {
  margin: 5px 0 0;
  color: #987d7e;
  font-size: 12px;
}

.history-status {
  flex-shrink: 0;
  color: #356344;
  text-align: right;
}

.history-status.cancelled,
.history-status.no-show {
  color: #a4000b;
}

.empty-message {
  margin: 0;
  padding: 12px;
  color: #987d7e;
  background: #f4e5e5;
  border-radius: 7px;
  font-size: 13px;
}

@media (max-width: 700px) {
  .page-heading h1 {
    font-size: 29px;
  }

  .students-table {
    min-width: 800px;
  }

  .details-overlay {
    padding: 10px;
  }

  .details-modal {
    max-height: calc(100vh - 20px);
  }

  .details-header {
    padding: 18px 16px 14px;
  }

  .details-header h2 {
    font-size: 25px;
  }

  .details-content {
    gap: 20px;
    padding: 18px 16px 22px;
  }

  .information-grid {
    gap: 14px;
  }

  .information-section h3,
  .transactions-section h3 {
    font-size: 19px;
  }
}

@media (max-width: 430px) {
  .information-grid {
    grid-template-columns: 1fr;
  }

  .transaction-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .active-transaction strong,
  .history-status {
    text-align: left;
  }
}
</style>
