<template>
  <section class="notifications-page">
    <div class="page-heading">
      <h1>NOTIFICATIONS</h1>
      <p>Select a notification to open its related transaction.</p>
    </div>

    <div class="notification-list">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-card"
      >
        <div class="notification-dot"></div>

        <div class="notification-content">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.subtitle }}</p>
        </div>

        <button
          type="button"
          class="open-button"
          @click="openNotification(notification)"
        >
          Open
        </button>
      </article>
    </div>
  </section>
</template>

<script setup>
const emit = defineEmits(['navigate'])

const notifications = [
  {
    id: 'OSA-015',
    title: 'New OSA request submitted',
    subtitle: 'REQ-2026-0015',
    targetPage: 'Request'
  },
  {
    id: 'OSA-016',
    title: 'Appointment requires confirmation',
    subtitle: 'Today · 10:30 AM',
    targetPage: 'Appointments'
  },
  {
    id: 'OSA-017',
    title: 'Students record requires review',
    subtitle: 'Juan Dela Cruz',
    targetPage: 'Students'
  },
  {
    id: 'OSA-018',
    title: 'Transaction status was updated',
    subtitle: 'Oct. 2, 2026 · 2:35 PM',
    targetPage: 'History'
  }
]

function openNotification(notification) {
  emit('navigate', notification.targetPage)
}
</script>

<style scoped>
.notifications-page {
  min-height: 100%;
  padding: 24px 22px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #350609;
  font-family: Georgia, "Times New Roman", serif;
}

.page-heading {
  margin-bottom: 26px;
}

.page-heading h1 {
  margin: 0 0 5px;
  color: #5b090f;
  font-size: 22px;
  font-weight: 700;
}

.page-heading p {
  margin: 0;
  color: #927a7b;
  font-family: Arial, sans-serif;
  font-size: 12px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 73px;
  padding: 12px 16px;
  border: 1px solid #c59a9d;
  border-radius: 15px;
  background: #f8eeee;
  box-sizing: border-box;
  transition: background 0.2s ease;
}

.notification-card:hover {
  background: #f5e7e7;
}

.notification-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #350609;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h3 {
  margin: 0 0 5px;
  color: #350609;
  font-family: Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.notification-content p {
  margin: 0;
  color: #927a7b;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.open-button {
  flex-shrink: 0;
  padding: 8px 4px 8px 12px;
  border: none;
  background: transparent;
  color: #59080e;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.open-button:hover {
  text-decoration: underline;
}

.open-button:focus-visible {
  outline: 2px solid #9c555c;
  outline-offset: 3px;
  border-radius: 3px;
}

@media (max-width: 600px) {
  .notifications-page {
    padding: 22px 15px;
  }

  .page-heading h1 {
    font-size: 19px;
  }

  .notification-card {
    padding: 12px 10px;
  }
}
</style>
