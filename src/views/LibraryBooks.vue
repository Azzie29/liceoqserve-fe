
<script setup>
import { computed, ref } from 'vue'

const activeTab = ref('Borrow Requests')
const searchBook = ref('')
const selectedRequest = ref(null)
const confirmationAction = ref('')
const showConfirmation = ref(false)

const requests = ref([
  {
    id: 'LIB-016',
    transactionId: '2024-122805',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    student: 'Angel Dadole',
    requested: 'Requested just now',
    purpose: '',
    status: 'Pending',
  },
  {
    id: 'LIB-016',
    transactionId: '2024-122803',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    student: 'Rainier Amparo',
    requested: 'Requested just now',
    purpose: 'For database coursework.',
    status: 'Pending',
  },
])

const books = ref([
  {
    title: 'Introduction to Algorithms',
    author: 'Cormen et al.',
    accessionId: 'ACC-00182',
    availability: 'Unavailable',
  },
  {
    title: 'Database Systems',
    author: 'Elmasri & Navathe',
    accessionId: 'ACC-00183',
    availability: 'Available',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    accessionId: 'ACC-00184',
    availability: 'Available',
  },
  {
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    accessionId: 'ACC-00185',
    availability: 'Unavailable',
  },
])

const borrowedBooks = ref([
  {
    title: 'Computer networks',
    reference: 'LIB-018 · Book Borrowing',
    expectedReturn: 'October 3, 2026',
    status: 'Borrowed',
  },
  {
    title: 'Database Systems',
    reference: 'CLR-011 · Clearance Signing',
    expectedReturn: 'October 6, 2026',
    status: 'Borrowed',
  },
])

const filteredBooks = computed(() => {
  const keyword = searchBook.value.trim().toLowerCase()

  if (!keyword) return books.value

  return books.value.filter((book) =>
    [
      book.title,
      book.author,
      book.accessionId,
      book.availability,
    ].some((value) => value.toLowerCase().includes(keyword)),
  )
})

function openConfirmation(request, action) {
  selectedRequest.value = request
  confirmationAction.value = action
  showConfirmation.value = true
}

function confirmRequest() {
  if (!selectedRequest.value) return

  const request = selectedRequest.value

  if (confirmationAction.value === 'Approve') {
    request.status = 'Approved'

    borrowedBooks.value.unshift({
      title: request.title,
      reference: `${request.id} · Book Borrowing`,
      expectedReturn: 'To be confirmed',
      status: 'Borrowed',
    })
  } else {
    request.status = 'Rejected'
  }

  showConfirmation.value = false
  selectedRequest.value = null
}

function closeConfirmation() {
  showConfirmation.value = false
  selectedRequest.value = null
}

const confirmationTitle = computed(() =>
  confirmationAction.value === 'Approve'
    ? 'Approved borrow request?'
    : 'Reject borrow request?',
)

const confirmationMessage = computed(() => {
  if (!selectedRequest.value) return ''

  const status =
    confirmationAction.value === 'Approve'
      ? 'Approved'
      : 'Rejected'

  return `${selectedRequest.value.student} will immediately see ${status} ${selectedRequest.value.title}.`
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
        v-for="tab in [
          'Borrow Requests',
          'Catalog',
          'Borrowed & Returns',
        ]"
        :key="tab"
        type="button"
        class="tab-button"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </nav>

    <!-- BORROW REQUESTS -->
    <section
      v-if="activeTab === 'Borrow Requests'"
      class="request-list"
    >
      <article
        v-for="request in requests"
        :key="request.transactionId"
        class="request-row"
      >
        <div class="request-info">
          <p class="request-id">
            {{ request.id }} · {{ request.transactionId }}
          </p>

          <h2>{{ request.title }}</h2>

          <p class="request-meta">
            {{ request.student }} · {{ request.requested }}
          </p>

          <p
            v-if="request.purpose"
            class="request-purpose"
          >
            <strong>Student Notes / Purpose:</strong>
            {{ request.purpose }}
          </p>

          <span
            v-if="request.status !== 'Pending'"
            class="request-status"
            :class="request.status.toLowerCase()"
          >
            {{ request.status }}
          </span>
        </div>

        <div
          v-if="request.status === 'Pending'"
          class="request-actions"
        >
          <button
            type="button"
            class="action-button approve-button"
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
        v-if="requests.length === 0"
        class="empty-message"
      >
        No borrow requests available.
      </p>
    </section>

    <!-- CATALOG -->
    <section
      v-else-if="activeTab === 'Catalog'"
      class="catalog-section"
    >
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

      <div class="catalog-table-wrap">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Accession ID</th>
              <th>Availability</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="book in filteredBooks"
              :key="book.accessionId"
            >
              <td>{{ book.title }}</td>
              <td>{{ book.author }}</td>
              <td>{{ book.accessionId }}</td>
              <td>
                <span
                  class="availability-badge"
                  :class="book.availability.toLowerCase()"
                >
                  {{ book.availability }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredBooks.length === 0">
              <td colspan="4" class="no-results">
                No books match your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- BORROWED AND RETURNS -->
    <section v-else class="borrowed-list">
      <article
        v-for="(book, index) in borrowedBooks"
        :key="`${book.reference}-${index}`"
        class="borrowed-row"
      >
        <div>
          <h2>{{ book.title }}</h2>
          <p class="borrowed-reference">
            {{ book.reference }}
          </p>
          <p class="return-date">
            Expected: {{ book.expectedReturn }}
          </p>
        </div>

        <span class="availability-badge borrowed">
          {{ book.status }}
        </span>
      </article>

      <p
        v-if="borrowedBooks.length === 0"
        class="empty-message"
      >
        No borrowed books or returns to display.
      </p>
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
          :class="{ danger: confirmationAction === 'Reject' }"
        >
          !
        </div>

        <h2>{{ confirmationTitle }}</h2>

        <p class="confirmation-message">
          {{ confirmationMessage }}
        </p>

        <div class="confirmation-actions">
          <button
            type="button"
            class="action-button go-back-button"
            @click="closeConfirmation"
          >
            Go Back
          </button>

          <button
            type="button"
            class="action-button confirm-button"
            :class="{
              'confirm-reject': confirmationAction === 'Reject'
            }"
            @click="confirmRequest"
          >
            {{ confirmationAction }}
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

.request-info {
  min-width: 0;
  flex: 1;
}

.request-id {
  margin: 0 0 4px;
  color: #70595a;
  font-size: 10px;
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
.return-date {
  margin: 0;
  color: #554041;
  font-size: 10px;
}

.request-purpose {
  max-width: 470px;
  margin: 9px 0 0;
  padding: 7px 9px;
  border-radius: 5px;
  background: #e7d0d1;
  color: #44282a;
  font-size: 10px;
}

.request-actions {
  display: flex;
  flex-shrink: 0;
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

.request-status {
  display: inline-block;
  margin-top: 7px;
  font-size: 10px;
  font-weight: 700;
}

.request-status.approved {
  color: #28744b;
}

.request-status.rejected {
  color: #c60000;
}

.catalog-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-box {
  display: flex;
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

  .request-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .request-actions {
    align-self: flex-end;
  }

  .catalog-table-wrap {
    overflow-x: auto;
  }

  .catalog-table {
    min-width: 540px;
  }
}

@media (max-width: 420px) {
  .tab-button {
    padding: 0 12px;
    font-size: 11px;
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
