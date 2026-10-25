
<template>
  <div class="notifications-page">
    <div class="page-heading">
      <div>
        <h1>Notifications</h1>
        <p>Select an update to open the related transaction.</p>
      </div>

      <button
        class="mark-all"
        :disabled="unreadCount === 0"
        @click="markAllAsRead"
      >
        Mark all as read
      </button>
    </div>

    <div class="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-card"
        :class="{ unread: !notification.read }"
      >
        <span
          class="notification-dot"
          :class="{ 'is-read': notification.read }"
        ></span>

        <div class="notification-content">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.subtitle }}</p>
        </div>

        <button
          class="open-button"
          @click="openNotification(notification)"
        >
          Open
        </button>
      </div>
    </div>

    <div
      v-if="selectedNotification"
      class="modal-overlay"
      @click.self="selectedNotification = null"
    >
      <div class="notification-modal">
        <button
          class="close-button"
          @click="selectedNotification = null"
        >
          ×
        </button>

        <span class="modal-label">NOTIFICATION DETAILS</span>
        <h2>{{ selectedNotification.title }}</h2>
        <p class="modal-subtitle">
          {{ selectedNotification.subtitle }}
        </p>

        <div class="detail-box">
          <span>Reference</span>
          <strong>{{ selectedNotification.reference }}</strong>
        </div>

        <div class="detail-box">
          <span>Date and time</span>
          <strong>{{ selectedNotification.date }}</strong>
        </div>

        <div class="detail-box">
          <span>Status</span>
          <strong>{{ selectedNotification.read ? 'Read' : 'Unread' }}</strong>
        </div>

        <p class="description">
          {{ selectedNotification.description }}
        </p>

        <button
          class="primary-button"
          @click="selectedNotification = null"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const notifications = ref([
  {
    id: 1,
    title: 'New library request submitted',
    subtitle: 'REQ-2026-00125',
    reference: 'REQ-2026-00125',
    date: 'October 25, 2026',
    read: false,
    description: 'A new library request has been submitted. Review the Requests page for details.'
  },
  {
    id: 2,
    title: 'Appointment requires confirmation',
    subtitle: 'Today · 10:00 AM',
    reference: 'APT-2026-00042',
    date: 'October 25, 2026 · 10:00 AM',
    read: false,
    description: 'An appointment is waiting for confirmation. Review the Appointments page.'
  },
  {
    id: 3,
    title: 'Student record requires review',
    subtitle: 'Chloe Monteza',
    reference: 'STU-REVIEW-003',
    date: 'October 2, 2026',
    read: true,
    description: 'A student record requires review. Check the Students page.'
  },
  {
    id: 4,
    title: 'Transaction status was updated',
    subtitle: 'Oct. 2, 2026 · 2:35 PM',
    reference: 'TRX-2026-00018',
    date: 'October 2, 2026 · 2:35 PM',
    read: true,
    description: 'A library transaction status was updated.'
  }
])

const selectedNotification = ref(null)

const unreadCount = computed(() =>
  notifications.value.filter(item => !item.read).length
)

function markAllAsRead() {
  notifications.value.forEach(item => {
    item.read = true
  })
}

function openNotification(notification) {
  notification.read = true
  selectedNotification.value = notification
}
</script>

<style scoped>
.notifications-page {
  min-height: 100%;
  padding: 20px 29px 35px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #3c090c;
  font-family: Arial, Helvetica, sans-serif;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 0 0 4px;
  color: #39070a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 27px;
  font-weight: 600;
}

.page-heading p {
  margin: 0;
  font-size: 12px;
}

.mark-all {
  padding: 5px 0;
  border: none;
  background: transparent;
  color: #51090e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.mark-all:disabled {
  color: #a98585;
  cursor: default;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 12px 23px 12px 13px;
  border: 1px solid #c9a6a8;
  border-radius: 13px;
  background: #f7eeee;
}

.notification-card.unread {
  border-color: #a86d71;
}

.notification-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 7px;
  border-radius: 50%;
  background: #600b12;
}

.notification-dot.is-read {
  background: #b18587;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h3 {
  margin: 0 0 7px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}

.notification-content p {
  margin: 0;
  color: #997a7c;
  font-size: 10px;
}

.notification-card:not(.unread) .notification-content h3 {
  color: #987b7c;
}

.open-button {
  flex-shrink: 0;
  padding: 8px 0 8px 12px;
  border: none;
  background: transparent;
  color: #bd1018;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.open-button:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
  background: rgba(25, 5, 6, 0.55);
}

.notification-modal {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 30px;
  box-sizing: border-box;
  border: 1px solid #c7a2a4;
  border-radius: 15px;
  background: #f7eeee;
  box-shadow: 0 12px 40px rgba(35, 0, 0, 0.2);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: transparent;
  color: #51090e;
  font-size: 25px;
  cursor: pointer;
}

.modal-label {
  color: #98686b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.notification-modal h2 {
  margin: 12px 20px 8px 0;
  color: #42090d;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 23px;
}

.modal-subtitle {
  margin-bottom: 20px;
  color: #8e6d6f;
  font-size: 12px;
}

.detail-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid #e3cdce;
  font-size: 12px;
}

.detail-box span {
  color: #98787a;
}

.detail-box strong {
  color: #48090e;
  overflow-wrap: anywhere;
}

.description {
  margin: 18px 0;
  color: #68494b;
  font-size: 12px;
  line-height: 1.6;
}

.primary-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #51090e;
  border-radius: 7px;
  background: #51090e;
  color: #fff4f1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.primary-button:hover {
  background: #6d1118;
}

@media (max-width: 600px) {
  .notifications-page {
    padding: 20px 14px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-heading h1 {
    font-size: 24px;
  }

  .mark-all {
    align-self: flex-end;
  }

  .notification-card {
    padding: 12px;
    gap: 8px;
  }

  .notification-content h3 {
    font-size: 13px;
  }

  .open-button {
    padding-left: 5px;
  }

  .notification-modal {
    padding: 24px 20px;
  }
}
</style>
