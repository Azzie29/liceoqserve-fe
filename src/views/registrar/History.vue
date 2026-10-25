
<template>
  <main class="main-content">
    <!-- PAGE HEADING -->
    <div class="page-heading">
      <h2>History</h2>
      <p>
        Select a concise history item to view its complete audit details.
      </p>
    </div>

    <!-- HISTORY LIST -->
    <section class="history-list" aria-label="Activity history">
      <article
        v-for="record in historyRecords"
        :key="record.id"
        class="history-item"
      >
        <div class="history-item-content">
          <h3>{{ record.title }}</h3>
          <p class="history-date">
            {{ record.date }} <span aria-hidden="true">•</span>
            {{ record.time }}
          </p>
        </div>

        <button
          type="button"
          class="view-details-button"
          @click="viewDetails(record)"
        >
          View details
        </button>
      </article>

      <!-- EMPTY STATE -->
      <div v-if="historyRecords.length === 0" class="empty-state">
        <div class="empty-icon">↻</div>
        <h3>No history records yet</h3>
        <p>
          Previous activities will appear here when records are available.
        </p>
      </div>
    </section>

    <!-- HISTORY DETAILS MODAL -->
    <div
      v-if="selectedRecord"
      class="modal-overlay"
      @click.self="selectedRecord = null"
    >
      <section
        class="history-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-dialog-title"
      >
        <div class="dialog-header">
          <div>
            <span class="details-eyebrow">HISTORY DETAILS</span>

            <h3 id="history-dialog-title">
              {{ selectedRecord.title }}
            </h3>

            <p>
              {{ selectedRecord.date }} · {{ selectedRecord.time }}
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close history details"
            @click="selectedRecord = null"
          >
            ×
          </button>
        </div>

        <div class="dialog-content">
          <div class="detail-group">
            <label>Activity</label>
            <p>{{ selectedRecord.title }}</p>
          </div>

          <div class="detail-group">
            <label>Date and time</label>
            <p>
              {{ selectedRecord.date }} · {{ selectedRecord.time }}
            </p>
          </div>

          <div class="audit-note">
            <span class="note-icon">i</span>
            <p>
              Additional audit information can be displayed here when
              the complete history records are connected to the system.
            </p>
          </div>
        </div>

        <div class="dialog-actions">
          <button
            type="button"
            class="close-dialog-button"
            @click="selectedRecord = null"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

// Sample history items based on the LiceoQServe PDF UI reference.
// Connect these records to the actual backend when available.
const historyRecords = ref([
  {
    id: 1,
    title: 'Request Completed — Form 137',
    date: 'Oct 2, 2026',
    time: '4:17 PM',
  },
  {
    id: 2,
    title: 'Appointment Completed — Student Consultation',
    date: 'Oct 2, 2026',
    time: '3:42 PM',
  },
  {
    id: 3,
    title: 'Request Updated — Student Certification',
    date: 'Oct 2, 2026',
    time: '2:35 PM',
  },
])

const selectedRecord = ref(null)

function viewDetails(record) {
  selectedRecord.value = record
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.main-content {
  --maroon: #650b18;
  --dark-maroon: #50070e;
  --text-color: #281719;
  --muted-color: #8c7477;
  --page-background: #eee0e1;
  --card-background: #f8eeee;
  --border-color: #d3babb;

  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 3px 2px 24px;
  background: transparent;
  color: var(--text-color);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

/* PAGE HEADING */

.page-heading {
  margin-bottom: 16px;
}

.page-heading h2 {
  margin: 0 0 5px;
  color: var(--dark-maroon);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.25;
}

.page-heading p {
  margin: 0;
  color: #4c3538;
  font-size: 13px;
  line-height: 1.5;
}

/* HISTORY LIST */

.history-list {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 63px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 33px;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--card-background);
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.history-item:hover {
  border-color: #b99599;
  background: #f5e8e9;
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-content h3 {
  margin: 0 0 5px;
  color: #251719;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.history-date {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--muted-color);
  font-size: 11px;
  line-height: 1.4;
}

.view-details-button {
  flex-shrink: 0;
  padding: 7px 0 7px 10px;
  border: 0;
  background: transparent;
  color: var(--maroon);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s ease;
}

.view-details-button:hover {
  color: #8c1725;
  text-decoration: underline;
}

.view-details-button:focus-visible,
.close-button:focus-visible,
.close-dialog-button:focus-visible {
  outline: 2px solid var(--maroon);
  outline-offset: 3px;
}

/* EMPTY STATE */

.empty-state {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 9px;
  padding: 25px;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--card-background);
  text-align: center;
}

.empty-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ead5d6;
  color: var(--maroon);
  font-size: 23px;
}

.empty-state h3 {
  margin: 4px 0 0;
  color: var(--dark-maroon);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  color: var(--muted-color);
  font-size: 12px;
  line-height: 1.5;
}

/* DETAILS MODAL */

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  background: rgb(30 8 10 / 50%);
}

.history-dialog {
  width: min(100%, 500px);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 13px;
  background: #fff7f7;
  box-shadow: 0 12px 40px rgb(0 0 0 / 15%);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 20px;
  border-bottom: 1px solid #e5ced0;
}

.details-eyebrow {
  color: #997a7c;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.dialog-header h3 {
  margin: 8px 0 6px;
  color: var(--dark-maroon);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-header p {
  margin: 0;
  color: var(--muted-color);
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
  color: var(--dark-maroon);
  font-size: 22px;
  cursor: pointer;
}

.close-button:hover {
  background: #f0dddd;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.detail-group label {
  display: block;
  margin-bottom: 7px;
  color: var(--muted-color);
  font-size: 11px;
}

.detail-group p {
  margin: 0;
  color: var(--text-color);
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.audit-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px;
  border: 1px solid #e3ccce;
  border-radius: 8px;
  background: #f4e5e6;
}

.note-icon {
  display: flex;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ead5d6;
  color: var(--maroon);
  font-size: 12px;
  font-weight: 700;
}

.audit-note p {
  margin: 0;
  color: #593638;
  font-size: 12px;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #e2cacc;
}

.close-dialog-button {
  min-height: 36px;
  padding: 9px 18px;
  border: 1px solid var(--maroon);
  border-radius: 5px;
  background: var(--maroon);
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.close-dialog-button:hover {
  background: #710d16;
}

/* RESPONSIVE */

@media (max-width: 600px) {
  .main-content {
    padding: 3px 2px 24px;
  }

  .page-heading h2 {
    font-size: 25px;
  }

  .page-heading p {
    font-size: 12px;
  }

  .history-list {
    gap: 11px;
  }

  .history-item {
    min-height: 62px;
    gap: 12px;
    padding: 14px 15px;
    border-radius: 13px;
  }

  .history-item-content h3 {
    font-size: 12px;
  }

  .history-date {
    font-size: 10px;
  }

  .view-details-button {
    padding-left: 0;
    font-size: 11px;
  }

  .dialog-header,
  .dialog-content {
    padding: 15px;
  }

  .dialog-header h3 {
    font-size: 18px;
  }

  .dialog-actions {
    padding: 12px 15px;
  }
}
</style>