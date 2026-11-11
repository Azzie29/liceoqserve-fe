
<template>
  <div class="notifications-page">
    <div class="page-heading">
      <div>
        <h1>Notifications</h1>
        <p>Select an update to open its notification details.</p>
      </div>

      <button
        class="mark-all"
        @click="markAllAsRead"
        :disabled="unreadCount === 0 || updating"
      >
        {{ updating ? 'Updating...' : 'Mark all as read' }}
      </button>
    </div>

    <div class="filter-tabs">
      <button
        v-for="filter in ['All', 'Unread', 'Read']"
        :key="filter"
        type="button"
        :class="{ active: activeFilter === filter }"
        @click="activeFilter = filter"
      >
        {{ filter }}
        <span v-if="filter === 'Unread'">({{ unreadCount }})</span>
      </button>
    </div>

    <div v-if="notice" class="notice" role="status">
      <span>{{ notice }}</span>
      <button @click="notice = ''" aria-label="Dismiss">×</button>
    </div>

    <div v-if="errorMessage" class="notice error-notice" role="alert">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="empty-state">
      Loading notifications...
    </div>

    <div v-else class="notification-list">
      <div
        v-for="notification in filteredNotifications"
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

      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <h3>No {{ activeFilter.toLowerCase() }} notifications</h3>
        <p>Updates about your library transactions will appear here.</p>
      </div>
    </div>

    <!-- Notification Details Modal -->
    <div
      v-if="selectedNotification"
      class="modal-overlay"
      @click.self="selectedNotification = null"
    >
      <div class="notification-modal">
        <button
          class="close-button"
          @click="selectedNotification = null"
          aria-label="Close"
        >
          &times;
        </button>

        <span class="modal-label">NOTIFICATION DETAILS</span>

        <h2>{{ selectedNotification.title }}</h2>

        <p class="modal-subtitle">
          {{ selectedNotification.subtitle }}
        </p>

        <div class="detail-box">
          <span>Category</span>
          <strong>{{ selectedNotification.category }}</strong>
        </div>

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
          <strong>
            {{ selectedNotification.read ? 'Read' : 'Unread' }}
          </strong>
        </div>

        <p class="modal-description">
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
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const notifications = ref([])
const selectedNotification = ref(null)

const activeFilter = ref('All')
const loading = ref(false)
const updating = ref(false)
const notice = ref('')
const errorMessage = ref('')

const currentUserId = ref(null)

let notificationChannel = null

// UNREAD COUNT
const unreadCount = computed(() =>
  notifications.value.filter(item => !item.read).length
)

// FILTER NOTIFICATIONS
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'Unread') {
    return notifications.value.filter(item => !item.read)
  }

  if (activeFilter.value === 'Read') {
    return notifications.value.filter(item => item.read)
  }

  return notifications.value
})

// FORMAT CATEGORY
function formatCategory(category) {
  if (!category) return 'General'

  const labels = {
    request: 'Request',
    appointment: 'Appointment',
    status: 'Status Update',
    general: 'General',
  }

  return labels[category.toLowerCase()] ||
    category.charAt(0).toUpperCase() + category.slice(1)
}

// FORMAT DATE
function formatDate(date) {
  if (!date) return 'Not available'

  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// FETCH NOTIFICATIONS
async function fetchNotifications() {
  loading.value = true
  errorMessage.value = ''

  try {
    // Get currently logged-in user
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    const user = authData.user

    if (!user) {
      throw new Error('No authenticated user found.')
    }

    currentUserId.value = user.id

    // Fetch only notifications belonging to this user
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        recipient_id,
        title,
        message,
        category,
        related_id,
        is_read,
        created_at
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    notifications.value = (data || []).map(item => ({
      id: item.id,
      title: item.title || 'Notification',
      subtitle: `${formatCategory(item.category)} · ${formatDate(item.created_at)}`,
      reference: item.related_id || 'No linked transaction',
      date: formatDate(item.created_at),
      category: formatCategory(item.category),
      read: item.is_read,
      description: item.message || 'No additional details available.',
      relatedId: item.related_id,
    }))

    // Refresh selected modal data after fetching
    if (selectedNotification.value) {
      const updated = notifications.value.find(
        item => item.id === selectedNotification.value.id
      )

      selectedNotification.value = updated || null
    }
  } catch (error) {
    console.error('Notifications fetch error:', error)
    errorMessage.value =
      error.message || 'Unable to load notifications.'
  } finally {
    loading.value = false
  }
}

// MARK ONE NOTIFICATION AS READ
async function markAsRead(notification) {
  if (notification.read) return true

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id)
      .eq('recipient_id', currentUserId.value)

    if (error) throw error

    notification.read = true
    return true
  } catch (error) {
    console.error('Mark notification as read error:', error)
    errorMessage.value = error.message || 'Unable to update notification.'
    return false
  }
}

// OPEN NOTIFICATION
async function openNotification(notification) {
  const success = await markAsRead(notification)

  if (success) {
    selectedNotification.value = notification
  }
}

// MARK ALL AS READ
async function markAllAsRead() {
  if (!currentUserId.value || unreadCount.value === 0 || updating.value) {
    return
  }

  updating.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', currentUserId.value)
      .eq('is_read', false)

    if (error) throw error

    notifications.value.forEach(item => {
      item.read = true
    })

    notice.value = 'All notifications have been marked as read.'
  } catch (error) {
    console.error('Mark all as read error:', error)
    errorMessage.value = error.message || 'Unable to update notifications.'
  } finally {
    updating.value = false
  }
}

// REALTIME SUBSCRIPTION
function subscribeToNotifications() {
  if (!currentUserId.value) return

  notificationChannel = supabase
    .channel(`library-notifications-${currentUserId.value}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${currentUserId.value}`,
      },
      () => {
        fetchNotifications()
      }
    )
    .subscribe()
}

// INITIALIZE
onMounted(async () => {
  await fetchNotifications()
  subscribeToNotifications()
})

// CLEANUP
onUnmounted(() => {
  if (notificationChannel) {
    supabase.removeChannel(notificationChannel)
    notificationChannel = null
  }
})
</script>

<style scoped>
.notifications-page {
  min-height: 100%;
  padding: 20px 29px 35px;
  background: #efdfdf;
  color: #3c090c;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
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
  color: #351113;
  font-size: 12px;
}

.mark-all {
  border: none;
  background: transparent;
  color: #51090e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 5px 0;
}

.mark-all:hover {
  text-decoration: underline;
}

.mark-all:disabled {
  color: #a98585;
  cursor: default;
}

.filter-tabs {
  display: flex;
  gap: 7px;
  margin-bottom: 18px;
}

.filter-tabs button {
  padding: 8px 15px;
  border: 1px solid #c9a6a8;
  border-radius: 20px;
  background: #f7eeee;
  color: #51090e;
  font-size: 11px;
  cursor: pointer;
}

.filter-tabs button.active {
  border-color: #51090e;
  background: #51090e;
  color: white;
}

.notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 11px 13px;
  border: 1px solid #c9a6a8;
  border-radius: 7px;
  background: #f7eeee;
  font-size: 11px;
}

.notice button {
  border: none;
  background: transparent;
  color: #51090e;
  font-size: 18px;
  cursor: pointer;
}

.error-notice {
  border-color: #b94a48;
  color: #9b2525;
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
  box-sizing: border-box;
  border: 1px solid #c9a6a8;
  border-radius: 13px;
  background: #f7eeee;
  transition: background 0.2s, border-color 0.2s;
}

.notification-card.unread {
  border-color: #a86d71;
  background: #f8eeee;
}

.notification-card:hover {
  border-color: #6b1118;
}

.notification-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  align-self: flex-start;
  margin-top: 7px;
  border-radius: 50%;
  background: #b18587;
}

.notification-dot:not(.is-read) {
  background: #600b12;
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
  overflow-wrap: anywhere;
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
  color: #71070d;
  text-decoration: underline;
}

.empty-state {
  padding: 45px 20px;
  text-align: center;
  border: 1px dashed #c9a6a8;
  border-radius: 13px;
  color: #876567;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 12px;
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
  top: 12px;
  right: 17px;
  border: none;
  background: transparent;
  color: #51090e;
  font-size: 28px;
  cursor: pointer;
}

.modal-label {
  color: #98686b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.notification-modal h2 {
  margin: 12px 25px 8px 0;
  color: #42090d;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 23px;
}

.modal-subtitle {
  margin: 0 0 20px;
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

.modal-description {
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
