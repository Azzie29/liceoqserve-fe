
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['open'])

const notifications = ref([
  {
    id: 1,
    title: 'Review reschedule session',
    date: 'Oct. 4, 2026 · 9:45 AM',
    read: false,
    action: 'Reschedule'
  },
  {
    id: 2,
    title: 'Appointment requires confirmation',
    date: 'Today · 10:00 AM',
    read: false,
    action: 'Appointments'
  },
  {
    id: 3,
    title: 'Student Session needs Review',
    date: 'Oct. 5, 2026 · 1:53 PM',
    read: true,
    action: 'Guidance Sessions'
  }
])

function markAllAsRead() {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

function openNotification(notification) {
  notification.read = true
  emit('open', notification)
}
</script>

<template>
  <section class="notifications-page">
    <div class="page-heading">
      <h1>Notifications</h1>
      <p>Select an update to open the related transaction.</p>
    </div>

    <div class="notification-toolbar">
      <button
        class="mark-read-button"
        @click="markAllAsRead"
      >
        Mark all as read
      </button>
    </div>

    <div class="notification-list">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-card"
        :class="{ read: notification.read }"
      >
        <span class="notification-dot" aria-hidden="true">•</span>

        <div class="notification-content">
          <h2>{{ notification.title }}</h2>
          <p>{{ notification.date }}</p>
        </div>

        <button
          class="open-button"
          @click="openNotification(notification)"
        >
          Open
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.notifications-page {
  width: 100%;
  min-width: 0;
}

.page-heading {
  margin: 0;
}

.page-heading h1 {
  margin: 0;
  color: #39090c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.25;
}

.page-heading p {
  margin: 0;
  color: #39090c;
  font-size: 14px;
}

.notification-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 7px 0 3px;
}

.mark-read-button {
  padding: 3px 6px;
  color: #51090e;
  background: transparent;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.mark-read-button:hover,
.open-button:hover {
  text-decoration: underline;
}

.notification-list {
  display: grid;
  gap: 15px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  min-height: 75px;
  padding: 16px 14px;
  color: #26090b;
  background: #f8eeee;
  border: 1px solid #a8797d;
  border-radius: 15px;
}

.notification-dot {
  flex-shrink: 0;
  margin-top: -2px;
  color: #650f18;
  font-size: 23px;
  line-height: 1;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h2 {
  margin: 0 0 7px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.notification-content p {
  margin: 0;
  color: #513536;
  font-size: 11px;
}

.open-button {
  flex-shrink: 0;
  align-self: center;
  padding: 4px 8px;
  color: #a00008;
  background: transparent;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.notification-card.read {
  background: #f6eded;
  border-color: #c6a7a9;
}

.notification-card.read .notification-dot,
.notification-card.read .notification-content h2,
.notification-card.read .notification-content p,
.notification-card.read .open-button {
  color: #a38283;
}

@media (max-width: 600px) {
  .page-heading h1 {
    font-size: 26px;
  }

  .page-heading p {
    font-size: 12px;
  }

  .notification-card {
    gap: 7px;
    padding: 13px 10px;
  }

  .notification-content h2 {
    font-size: 14px;
  }

  .open-button {
    font-size: 12px;
  }
}
</style>
