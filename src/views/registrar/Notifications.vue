
<template>
  <main class="main-content">
    <!-- PAGE HEADING -->
    <div class="page-heading">
      <h2>Notifications</h2>
      <p>
        Review student updates and open their related transactions.
      </p>
    </div>

    <!-- FILTERS -->
    <div class="filter-row">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        class="filter-button"
        :class="{ selected: activeFilter === filter }"
        @click="setFilter(filter)"
      >
        {{ filter }}

        <span
          v-if="filter === 'Unread' && unreadCount > 0"
          class="filter-count"
        >
          {{ unreadCount }}
        </span>
      </button>
    </div>

    <!-- NOTIFICATIONS PANEL -->
    <section class="notifications-panel">
      <div class="panel-heading">
        <div>
          <h3>Notifications</h3>
          <p>{{ filteredNotifications.length }} notifications</p>
        </div>

        <button
          v-if="unreadCount > 0"
          type="button"
          class="text-button"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>

      <!-- EMPTY STATE -->
      <div
        v-if="filteredNotifications.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">✓</div>
        <h4>No notifications found</h4>
        <p>You're all caught up.</p>
      </div>

      <!-- NOTIFICATION ITEMS -->
      <button
        v-for="notification in filteredNotifications"
        :key="notification.id"
        type="button"
        class="notification-item"
        :class="{
          'notification-unread': !notification.read
        }"
        @click="openNotification(notification)"
      >
        <div
          class="notification-icon"
          :class="notification.type"
        >
          <span v-if="notification.type === 'request'">R</span>
          <span v-else-if="notification.type === 'appointment'">A</span>
          <span v-else-if="notification.type === 'status'">S</span>
          <span v-else>i</span>
        </div>

        <div class="notification-content">
          <div class="notification-top">
            <h4>{{ notification.title }}</h4>

            <span
              v-if="!notification.read"
              class="unread-dot"
              aria-label="Unread"
            ></span>
          </div>

          <p class="notification-message">
            {{ notification.message }}
          </p>

          <div class="notification-meta">
            <span>{{ notification.student }}</span>
            <span class="meta-separator">·</span>
            <span>{{ notification.time }}</span>
          </div>

          <span
            class="notification-category"
            :class="notification.type"
          >
            {{ notification.category }}
          </span>
        </div>

        <span class="item-arrow" aria-hidden="true">›</span>
      </button>
    </section>

    <!-- NOTIFICATION DETAILS MODAL -->
    <div
      v-if="selectedNotification"
      class="modal-overlay"
      @click.self="selectedNotification = null"
    >
      <section
        class="notification-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-dialog-title"
      >
        <div class="dialog-header">
          <div>
            <span class="details-eyebrow">
              NOTIFICATION DETAILS
            </span>

            <h3 id="notification-dialog-title">
              {{ selectedNotification.title }}
            </h3>

            <p>{{ selectedNotification.time }}</p>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close notification details"
            @click="selectedNotification = null"
          >
            ×
          </button>
        </div>

        <div class="dialog-content">
          <div class="detail-banner">
            <div
              class="notification-icon large"
              :class="selectedNotification.type"
            >
              <span v-if="selectedNotification.type === 'request'">R</span>
              <span
                v-else-if="selectedNotification.type === 'appointment'"
              >
                A
              </span>
              <span v-else-if="selectedNotification.type === 'status'">
                S
              </span>
              <span v-else>i</span>
            </div>

            <div>
              <span
                class="notification-category"
                :class="selectedNotification.type"
              >
                {{ selectedNotification.category }}
              </span>

              <p class="banner-message">
                {{ selectedNotification.message }}
              </p>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-group">
              <label>Student name</label>
              <p>{{ selectedNotification.student }}</p>
            </div>

            <div class="detail-group">
              <label>Notification date</label>
              <p>{{ selectedNotification.time }}</p>
            </div>

            <div class="detail-group">
              <label>Related transaction</label>
              <p>{{ selectedNotification.transactionType }}</p>
            </div>

            <div class="detail-group">
              <label>Transaction number</label>
              <p>{{ selectedNotification.reference }}</p>
            </div>

            <div class="detail-group full-width">
              <label>Notification details</label>
              <p class="description">
                {{ selectedNotification.description }}
              </p>
            </div>

            <div class="detail-group">
              <label>Transaction status</label>
              <p>{{ selectedNotification.transactionStatus }}</p>
            </div>

            <div class="detail-group">
              <label>Notification status</label>
              <span
                class="read-status"
                :class="{ unread: !selectedNotification.read }"
              >
                {{ selectedNotification.read ? 'Read' : 'Unread' }}
              </span>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button
            type="button"
            class="cancel-button"
            @click="selectedNotification = null"
          >
            Close
          </button>

          <button
            v-if="!selectedNotification.read"
            type="button"
            class="secondary-button"
            @click="markAsRead(selectedNotification)"
          >
            Mark as read
          </button>

          <button
            type="button"
            class="primary-button"
            @click="openRelatedTransaction(selectedNotification)"
          >
            Open Transaction
          </button>
        </div>
      </section>
    </div>

    <!-- RELATED TRANSACTION MODAL -->
    <div
      v-if="showTransactionModal"
      class="modal-overlay"
      @click.self="showTransactionModal = false"
    >
      <section
        class="transaction-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-dialog-title"
      >
        <div class="dialog-header">
          <div>
            <span class="details-eyebrow">RELATED TRANSACTION</span>
            <h3 id="transaction-dialog-title">
              {{ activeTransaction?.reference }}
            </h3>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close transaction"
            @click="showTransactionModal = false"
          >
            ×
          </button>
        </div>

        <div v-if="activeTransaction" class="dialog-content">
          <div class="details-grid">
            <div class="detail-group">
              <label>Student</label>
              <p>{{ activeTransaction.student }}</p>
            </div>

            <div class="detail-group">
              <label>Transaction type</label>
              <p>{{ activeTransaction.transactionType }}</p>
            </div>

            <div class="detail-group">
              <label>Reference number</label>
              <p>{{ activeTransaction.reference }}</p>
            </div>

            <div class="detail-group">
              <label>Current status</label>
              <p>{{ activeTransaction.transactionStatus }}</p>
            </div>

            <div class="detail-group full-width">
              <label>Related information</label>
              <p class="description">
                {{ activeTransaction.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button
            type="button"
            class="primary-button"
            @click="showTransactionModal = false"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

const filters = ['All', 'Unread', 'Read']

const activeFilter = ref('All')
const selectedNotification = ref(null)
const showTransactionModal = ref(false)
const activeTransaction = ref(null)

const notifications = ref([
  {
    id: 1,
    title: 'New Registrar request submitted',
    message: 'Maria Santos submitted a new document request.',
    student: 'Maria Santos',
    time: 'Oct. 2, 2026 · 2:35 PM',
    category: 'Request',
    type: 'request',
    read: false,
    transactionType: 'Good Moral Certificate',
    reference: 'REQ-2026-00126',
    transactionStatus: 'Ready for Pickup',
    description:
      'A new request was submitted by Maria Santos for a Good Moral Certificate. Review the request details and update the student if further action is needed.',
  },
  {
    id: 2,
    title: 'Appointment requires confirmation',
    message: 'An appointment is waiting for registrar confirmation.',
    student: 'Maria Santos',
    time: 'Today · 10:30 AM',
    category: 'Appointment',
    type: 'appointment',
    read: false,
    transactionType: 'Registrar Appointment',
    reference: 'APT-2026-00126',
    transactionStatus: 'Pending',
    description:
      'This appointment requires confirmation. Open the related transaction to review the appointment details and confirm or reschedule it.',
  },
  {
    id: 3,
    title: 'Request status updated',
    message: 'The request status was updated to Processing.',
    student: 'Juan Dela Cruz',
    time: 'Oct. 2, 2026 · 1:15 PM',
    category: 'Status Update',
    type: 'status',
    read: true,
    transactionType: 'Form 137',
    reference: 'REQ-2026-00125',
    transactionStatus: 'Processing',
    description:
      'The status of Juan Dela Cruz’s Form 137 request was updated. Review the related transaction for additional information.',
  },
  {
    id: 4,
    title: 'Appointment reminder',
    message: 'An upcoming registrar appointment needs attention.',
    student: 'Carlo Mendoza',
    time: 'Oct. 3, 2026 · 9:00 AM',
    category: 'Appointment',
    type: 'appointment',
    read: true,
    transactionType: 'Transcript of Records',
    reference: 'APT-2026-0041',
    transactionStatus: 'Pending',
    description:
      'An upcoming appointment requires attention from the registrar. Open the related transaction to review its schedule and details.',
  },
  {
    id: 5,
    title: 'Request ready for pickup',
    message: 'A student document is ready for claiming.',
    student: 'Maria Santos',
    time: 'Oct. 5, 2026 · 8:00 AM',
    category: 'Status Update',
    type: 'status',
    read: true,
    transactionType: 'Good Moral Certificate',
    reference: 'REQ-2026-00126',
    transactionStatus: 'Ready for Pickup',
    description:
      'The requested document is marked as ready for pickup. Ensure the student follows the registrar’s claiming instructions.',
  },
])

const unreadCount = computed(() =>
  notifications.value.filter((item) => !item.read).length
)

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'Unread') {
    return notifications.value.filter((item) => !item.read)
  }

  if (activeFilter.value === 'Read') {
    return notifications.value.filter((item) => item.read)
  }

  return notifications.value
})

function setFilter(filter) {
  activeFilter.value = filter
}

function openNotification(notification) {
  notification.read = true
  selectedNotification.value = notification
}

function markAsRead(notification) {
  notification.read = true
}

function markAllAsRead() {
  notifications.value.forEach((notification) => {
    notification.read = true
  })
}

function openRelatedTransaction(notification) {
  activeTransaction.value = notification
  selectedNotification.value = null
  showTransactionModal.value = true
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.main-content {
  --maroon: #650b18;
  --pink-background: #f9f0f0;
  --text-color: #4c2026;

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
  margin-bottom: 22px;
}

.page-heading h2 {
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

/* FILTERS */

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.filter-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 16px;
  border: 1px solid #dfbfc2;
  border-radius: 24px;
  background: #f7eeee;
  color: #4c2026;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.filter-button:hover {
  background: #ead6d7;
}

.filter-button.selected {
  border-color: var(--maroon);
  background: var(--maroon);
  color: #fff;
  font-weight: 700;
}

.filter-count {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 50%;
  background: white;
  color: var(--maroon);
  font-size: 10px;
}

/* NOTIFICATIONS PANEL */

.notifications-panel {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e6cdd0;
  border-radius: 17px;
  background: var(--pink-background);
  box-shadow: 0 2px 5px rgb(75 29 32 / 8%);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #e6cdd0;
}

.panel-heading h3 {
  margin: 0 0 5px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
}

.panel-heading p {
  margin: 0;
  color: #887477;
  font-size: 13px;
}

.text-button {
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: #650b18;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.text-button:hover {
  text-decoration: underline;
}

/* NOTIFICATION ROWS */

.notification-item {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 14px;
  padding: 19px 20px;
  border: 0;
  border-bottom: 1px solid #e6cdd0;
  background: transparent;
  color: var(--text-color);
  font-family: Arial, Helvetica, sans-serif;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notification-item:last-child {
  border-bottom: 0;
}

.notification-item:hover {
  background: #f2e5e6;
}

.notification-item.notification-unread {
  background: #f5e9e9;
}

.notification-item.notification-unread:hover {
  background: #efdfdf;
}

.notification-icon {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ead5d6;
  color: #68171d;
  font-size: 14px;
  font-weight: 700;
}

.notification-icon.request {
  background: #ead5d6;
  color: #68171d;
}

.notification-icon.appointment {
  background: #f3e6bd;
  color: #81651a;
}

.notification-icon.status {
  background: #cde5d2;
  color: #3e704b;
}

.notification-icon.general {
  background: #ded9ed;
  color: #62518c;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.notification-top h4 {
  margin: 0 0 7px;
  color: #351819;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.unread-dot {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  margin-top: 5px;
  border-radius: 50%;
  background: #7c111a;
}

.notification-message {
  margin: 0 0 9px;
  color: #80696b;
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.notification-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  color: #947d7e;
  font-size: 11px;
}

.meta-separator {
  color: #c4a8aa;
}

.notification-category {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 9px;
  border-radius: 15px;
  background: #ead5d6;
  color: #7b3036;
  font-size: 10px;
  font-weight: 600;
}

.notification-category.appointment {
  background: #f3e6bd;
  color: #81651a;
}

.notification-category.status {
  background: #cde5d2;
  color: #3e704b;
}

.notification-category.general {
  background: #ded9ed;
  color: #62518c;
}

.item-arrow {
  flex-shrink: 0;
  align-self: center;
  color: #9c7477;
  font-size: 27px;
  line-height: 1;
}

/* EMPTY STATE */

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

.empty-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #d9eadc;
  color: #3f754b;
  font-size: 20px;
}

.empty-state h4 {
  margin: 5px 0 0;
  color: #432224;
  font-size: 14px;
}

.empty-state p {
  margin: 0;
  color: #998182;
  font-size: 12px;
}

/* MODALS */

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

.notification-dialog,
.transaction-dialog {
  width: min(100%, 540px);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #dfc4c6;
  border-radius: 12px;
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
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.dialog-header h3 {
  margin: 8px 0 6px;
  color: #50070e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-header p {
  margin: 0;
  color: #967d7f;
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
  cursor: pointer;
}

.close-button:hover {
  background: #f0dddd;
}

.dialog-content {
  padding: 20px;
}

.detail-banner {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 15px;
  border: 1px solid #e3ccce;
  border-radius: 9px;
  background: #f4e5e6;
}

.notification-icon.large {
  width: 42px;
  height: 42px;
}

.banner-message {
  margin: 9px 0 0;
  color: #593638;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;
  margin-top: 20px;
}

.detail-group {
  min-width: 0;
}

.detail-group.full-width {
  grid-column: 1 / -1;
}

.detail-group label {
  display: block;
  margin-bottom: 7px;
  color: #887477;
  font-size: 11px;
}

.detail-group p {
  margin: 0;
  overflow-wrap: anywhere;
  color: #4c2026;
  font-size: 13px;
  line-height: 1.6;
}

.detail-group p.description {
  padding: 12px;
  border: 1px solid #e3ccce;
  border-radius: 7px;
  background: #fff;
}

.read-status {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 15px;
  background: #cde5d2;
  color: #3e704b;
  font-size: 11px;
}

.read-status.unread {
  background: #f3e6bd;
  color: #81651a;
}

/* MODAL BUTTONS */

.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 9px;
  padding: 15px 20px;
  border-top: 1px solid #e2cacc;
}

.cancel-button,
.secondary-button,
.primary-button {
  min-height: 36px;
  padding: 9px 14px;
  border-radius: 5px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button,
.secondary-button {
  border: 1px solid #d8bfc1;
  background: #fff8f8;
  color: #57252a;
}

.cancel-button:hover,
.secondary-button:hover {
  background: #efdfdf;
}

.primary-button {
  border: 1px solid var(--maroon);
  background: var(--maroon);
  color: #fff;
}

.primary-button:hover {
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
    font-size: 14px;
  }

  .filter-row {
    gap: 7px;
  }

  .filter-button {
    min-height: 34px;
    padding: 0 11px;
    font-size: 12px;
  }

  .panel-heading {
    align-items: flex-start;
    padding: 15px 12px;
  }

  .panel-heading h3 {
    font-size: 18px;
  }

  .text-button {
    max-width: 110px;
    text-align: right;
    line-height: 1.5;
  }

  .notification-item {
    gap: 10px;
    padding: 15px 11px;
  }

  .notification-icon {
    width: 34px;
    height: 34px;
  }

  .notification-top h4 {
    font-size: 12px;
  }

  .notification-message {
    font-size: 12px;
  }

  .notification-meta {
    font-size: 10px;
  }

  .item-arrow {
    font-size: 22px;
  }

  .dialog-header,
  .dialog-content {
    padding: 15px;
  }

  .dialog-header h3 {
    font-size: 18px;
  }

  .details-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .detail-group.full-width {
    grid-column: auto;
  }

  .dialog-actions {
    padding: 12px 15px;
  }

  .dialog-actions button {
    flex: 1;
  }
}
</style>
