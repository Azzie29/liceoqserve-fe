
<template>
  <main class="main-content">
    <!-- History heading -->
    <section class="history-heading">
      <h1>HISTORY</h1>
      <p>
        Select a concise history item to view its complete audit details.
      </p>
    </section>

    <!-- History records -->
    <section class="history-card">
      <article
        v-for="item in historyItems"
        :key="item.id"
        class="history-row"
      >
        <div class="history-info">
          <h3>{{ item.title }}</h3>
          <span>{{ item.date }}</span>
        </div>

        <button
          type="button"
          class="view-details"
          @click="viewDetails(item)"
        >
          View details
        </button>
      </article>

      <div v-if="historyItems.length === 0" class="empty-state">
        No history records available.
      </div>
    </section>

    <!-- History Details Modal -->
    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="history-overlay"
        @click.self="closeDetails"
      >
        <section
          class="history-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
        >
          <!-- Close is beside History Details -->
          <div class="modal-header">
            <span class="modal-label">History Details</span>

            <button
              type="button"
              class="modal-close"
              @click="closeDetails"
            >
              Close
            </button>
          </div>

          <!-- Selected record title and date -->
          <div class="modal-title-section">
            <h2 id="history-modal-title">
              {{ selectedItem.title }}
            </h2>

            <p class="modal-date">
              {{ selectedItem.date }}
            </p>
          </div>

          <!-- Audit information -->
          <div class="audit-grid">
            <div class="audit-field">
              <span>What happened</span>
              <p>{{ selectedItem.activity }}</p>
            </div>

            <div class="audit-field">
              <span>Student</span>
              <p>{{ selectedItem.student }}</p>
            </div>

            <div class="audit-field">
              <span>Transaction ID</span>
              <p>{{ selectedItem.transactionId }}</p>
            </div>

            <div class="audit-field">
              <span>Previous Status</span>
              <p>{{ selectedItem.previousStatus }}</p>
            </div>

            <div class="audit-field">
              <span>New Status</span>
              <p>{{ selectedItem.newStatus }}</p>
            </div>

            <div class="audit-field">
              <span>Performed by</span>
              <p>{{ selectedItem.performedBy }}</p>
            </div>
          </div>

          <!-- Record-specific notes -->
          <div class="audit-notes">
            <strong>
              Notes/Instructions: {{ selectedItem.notes }}
            </strong>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const selectedItem = ref(null)

const historyItems = ref([
  {
    id: 'HIS-001',
    title: 'Request Completed - Form 137',
    date: 'Oct. 2, 2026 - 4:17 PM',
    activity: 'Request Completed- Form',
    student: 'Juan Dela Cruz',
    transactionId: 'REQ-2026-00125',
    previousStatus: 'Processing',
    newStatus: 'Completed',
    performedBy: 'Office of Student Affairs Staff',
    notes: 'All required information was verified'
  },
  {
    id: 'HIS-002',
    title: 'Appointment Completed - Student Consultation',
    date: 'Oct. 2, 2026 - 3:42 PM',
    activity: 'Appointment Completed- Student Consultation',
    student: 'Juan Dela Cruz',
    transactionId: 'APT-2026-0081',
    previousStatus: 'Confirmed',
    newStatus: 'Completed',
    performedBy: 'Office of Student Affairs Staff',
    notes: 'Appointment completed by assigned staff.'
  },
  {
    id: 'HIS-003',
    title: 'Request Updated - Student Certification',
    date: 'Oct. 2, 2026 - 2:35 PM',
    activity: 'Request Updated - Student Certification',
    student: 'Juan Dela Cruz',
    transactionId: 'REQ-2026-0077',
    previousStatus: 'Pending',
    newStatus: 'Processing',
    performedBy: 'Office of Student Affairs Staff',
    notes: 'Processing instructions were sent to the student.'
  }
])

function viewDetails(item) {
  selectedItem.value = item
}

function closeDetails() {
  selectedItem.value = null
}

function handleKeydown(event) {
  if (event.key === 'Escape' && selectedItem.value) {
    closeDetails()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* HISTORY PAGE */
.main-content {
  flex: 1;
  min-width: 0;
  padding: 20px 22px;
  background: var(--pink-bg, #efdfdf);
  color: #390b0e;
}

.history-heading {
  margin: 0 6px 30px;
  padding-top: 14px;
}

.history-heading h1 {
  margin: 0 0 5px;
  color: #59070d;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  font-weight: 700;
}

.history-heading p {
  margin: 0;
  color: #987e7e;
  font-size: 10px;
  line-height: 1.6;
}

/* HISTORY RECORDS */
.history-card {
  width: 100%;
  overflow: hidden;
  border: 1px solid #b98285;
  border-radius: 15px;
  background: rgba(255, 250, 250, 0.4);
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 49px;
  margin: 0 18px;
  padding: 10px 0;
}

.history-row + .history-row {
  border-top: 1px solid #a99a99;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-info h3 {
  margin: 0 0 4px;
  color: #35090c;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.history-info span {
  color: #8e7979;
  font-size: 10px;
}

.view-details {
  flex-shrink: 0;
  padding: 6px 0 6px 10px;
  border: none;
  background: transparent;
  color: #59070d;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.view-details:hover {
  text-decoration: underline;
}

.empty-state {
  padding: 28px 15px;
  color: #907879;
  font-size: 11px;
  text-align: center;
}

/* MODAL OVERLAY */
.history-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 20px;
  background: rgba(35, 24, 25, 0.40);
}

/* MODAL BOX */
.history-modal {
  position: relative;
  width: 352px;
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 16px 18px 31px;
  border: none;
  border-radius: 12px;
  background: #f8eeee;
  color: #4a1013;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

/* HEADER: History Details LEFT, Close RIGHT */
.history-modal .modal-header {
  position: static;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin: 0 0 9px;
  padding: 0;
  background: transparent;
  border: none;
}

.history-modal .modal-label {
  display: block;
  margin: 0;
  color: #a58d8e;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.7px;
}

.history-modal .modal-close {
  position: static;
  top: auto;
  right: auto;
  flex-shrink: 0;
  display: inline-block;
  margin: 0;
  padding: 2px 0 2px 8px;
  border: none;
  background: transparent;
  color: #a58d8e;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.5px;
  line-height: normal;
  cursor: pointer;
}

.history-modal .modal-close:hover {
  color: #59070d;
}

/* SELECTED RECORD TITLE */
.modal-title-section h2 {
  margin: 0;
  color: #59070d;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.modal-date {
  margin: 3px 0 25px;
  color: #76696a;
  font-size: 12px;
  line-height: 1.4;
}

/* TWO-COLUMN AUDIT INFORMATION */
.audit-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 15px;
  row-gap: 20px;
}

.audit-field {
  min-width: 0;
}

.audit-field > span {
  display: block;
  margin-bottom: 4px;
  color: #7f7273;
  font-size: 12px;
  line-height: 1.3;
}

.audit-field p {
  margin: 0;
  color: #59070d;
  font-size: 12px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

/* NOTES / INSTRUCTIONS */
.audit-notes {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  margin: 21px auto 0;
  padding: 9px 10px;
  border: 1px solid #b98285;
  border-radius: 12px;
  color: #390b0e;
  text-align: center;
}

.audit-notes strong {
  font-size: 9px;
  font-weight: 700;
  line-height: 1.4;
}


/* BOLDER FONTS - HISTORY PAGE */

/* History heading */
.history-heading h1 {
  font-weight: 800;
}

.history-heading p {
  font-weight: 600;
}

/* History records */
.history-info h3 {
  font-weight: 700;
}

.history-info span {
  font-weight: 500;
}

.view-details {
  font-weight: 700;
}

/* Modal heading */
.history-modal .modal-label {
  font-weight: 600;
}

.history-modal .modal-close {
  font-weight: 600;
}

.modal-title-section h2 {
  font-weight: 800;
}

.modal-date {
  font-weight: 500;
}

/* Audit information */
.audit-field > span {
  font-weight: 600;
}

.audit-field p {
  font-weight: 600;
}

/* Notes / Instructions */
.audit-notes strong {
  font-weight: 700;
}

/* Empty state */
.empty-state {
  font-weight: 600;
}

/* ACCESSIBILITY */
.view-details:focus-visible,
.history-modal .modal-close:focus-visible {
  outline: 2px solid #9c555c;
  outline-offset: 3px;
}

/* RESPONSIVE */
@media (max-width: 480px) {
  .main-content {
    padding: 18px 10px;
  }

  .history-heading {
    margin: 0 3px 22px;
  }

  .history-row {
    margin: 0 10px;
    gap: 8px;
  }

  .history-info h3 {
    font-size: 11px;
  }

  .history-info span {
    font-size: 9px;
  }

  .history-modal {
    width: 352px;
    padding: 16px 15px 24px;
  }

  .modal-title-section h2 {
    font-size: 16px;
  }

  .audit-grid {
    column-gap: 12px;
    row-gap: 18px;
  }
}
</style>
