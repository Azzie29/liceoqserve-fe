
<template>
  <div class="history-page">
    <header class="page-heading">
      <h1>History</h1>
      <p>Select a concise history item to view its complete audit details.</p>
    </header>

    <section class="history-list">
      <article
        v-for="item in historyItems"
        :key="item.id"
        class="history-row"
      >
        <div class="history-info">
          <strong>{{ item.title }}</strong>
          <small>{{ item.date }} · {{ item.time }}</small>
        </div>

        <button class="view-button" @click="viewDetails(item)">
          View details
        </button>
      </article>
    </section>

    <!-- HISTORY DETAILS MODAL -->
    <div
      v-if="selectedItem"
      class="modal-overlay"
      @click.self="selectedItem = null"
      @keydown.esc="selectedItem = null"
    >
      <section
        class="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <div class="modal-top">
          <span>HISTORY DETAILS</span>
          <button class="close-button" @click="selectedItem = null">
            Close
          </button>
        </div>

        <h2 id="details-title">{{ selectedItem.title }}</h2>
        <p class="modal-date">
          {{ selectedItem.date }} · {{ selectedItem.time }}
        </p>

        <div class="details-grid">
          <div>
            <label>What Happened</label>
            <strong>{{ selectedItem.title }}</strong>
          </div>

          <div>
            <label>Student</label>
            <strong>{{ selectedItem.student }}</strong>
          </div>

          <div>
            <label>Transaction ID</label>
            <strong>{{ selectedItem.transactionId }}</strong>
          </div>

          <div>
            <label>Previous Status</label>
            <strong>{{ selectedItem.previousStatus }}</strong>
          </div>

          <div>
            <label>Updated Status</label>
            <strong>{{ selectedItem.status }}</strong>
          </div>

          <div>
            <label>Performed By</label>
            <strong>{{ selectedItem.performedBy }}</strong>
          </div>
        </div>

        <div class="notes-box">
          <strong>Notes / instructions:</strong>
          {{ selectedItem.notes }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedItem = ref(null)

const historyItems = ref([
  {
    id: 1,
    title: 'Book Returned - Database Systems',
    date: 'Oct. 2, 2026',
    time: '4:17 PM',
    student: 'Rainier Amparo',
    transactionId: 'BRT-2026-0101',
    previousStatus: 'Borrowed',
    status: 'Returned',
    performedBy: 'Library Staff',
    notes: 'Book returned successfully and recorded by the library staff.'
  },
  {
    id: 2,
    title: 'Appointment Completed - Research Consultation',
    date: 'Oct. 1, 2026',
    time: '3:42 PM',
    student: 'Chloe Monteza',
    transactionId: 'APT-2026-0081',
    previousStatus: 'Confirmed',
    status: 'Completed',
    performedBy: 'Library Staff',
    notes: 'Appointment completed by assigned staff.'
  },
  {
    id: 3,
    title: 'Request Updated - Information Consultancy',
    date: 'Sept. 30, 2026',
    time: '2:35 PM',
    student: 'John Michael Reyes',
    transactionId: 'REQ-2026-0045',
    previousStatus: 'Pending',
    status: 'Approved',
    performedBy: 'Library Staff',
    notes: 'The information consultancy request was reviewed and approved.'
  }
])

function viewDetails(item) {
  selectedItem.value = item
}
</script>

<style scoped>
.history-page {
  min-height: calc(100vh - 100px);
  padding: 24px;
  background: #efdfdf;
  color: #350909;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.page-heading {
  margin-bottom: 24px;
}

.page-heading h1 {
  margin: 0 0 4px;
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  font-size: 13px;
  color: #3f2929;
}

.history-list {
  overflow: hidden;
  border: 1px solid #b99595;
  border-radius: 18px;
  background: #f8eeee;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  padding: 14px 20px;
  border-bottom: 1px solid #ead7d7;
  box-sizing: border-box;
}

.history-row:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.history-info strong {
  font-size: 14px;
  font-weight: 600;
}

.history-info small {
  color: #806868;
  font-size: 11px;
}

.view-button {
  flex-shrink: 0;
  padding: 8px 0 8px 12px;
  border: none;
  background: transparent;
  color: #600b13;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.view-button:hover,
.close-button:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.42);
  box-sizing: border-box;
}

.details-modal {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 22px;
  border-radius: 14px;
  background: #fff8f8;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-top span {
  color: #927a7a;
  font-size: 10px;
  letter-spacing: 0.5px;
}

.close-button {
  border: none;
  background: transparent;
  color: #806868;
  font-size: 11px;
  cursor: pointer;
}

.details-modal h2 {
  margin: 0 0 6px;
  color: #350909;
  font-size: 20px;
  line-height: 1.3;
}

.modal-date {
  margin: 0 0 22px;
  color: #806868;
  font-size: 11px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 16px;
}

.details-grid > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.details-grid label {
  color: #927a7a;
  font-size: 11px;
}

.details-grid strong {
  overflow-wrap: anywhere;
  color: #350909;
  font-size: 12px;
  font-weight: 600;
}

.notes-box {
  margin-top: 22px;
  padding: 14px;
  border-radius: 8px;
  background: #efdada;
  color: #482828;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .history-page {
    padding: 16px;
  }

  .history-row {
    padding: 12px;
  }

  .history-info strong {
    font-size: 12px;
  }

  .view-button {
    font-size: 11px;
  }

  .details-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px 10px;
  }
}
</style>
