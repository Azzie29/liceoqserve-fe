
<script setup>
import { ref } from 'vue'

const emit = defineEmits(['navigate', 'logout'])

const activeMenu = ref('DASHBOARD')

const menuItems = [
  'DASHBOARD',
  'APPOINTMENTS',
  'ROOM RESERVATION',
  'BOOKS',
  'REQUESTS',
  'CLEARANCE',
  'NOTIFICATIONS',
  'STUDENTS',
  'SCHEDULE',
  'HISTORY',
  'PROFILE',
]

function navigateTo(item) {
  activeMenu.value = item
  emit('navigate', item)
}

function logout() {
  emit('logout')
}
</script>

<template>
  <aside class="sidebar">
    <!-- Navigation Menu -->
    <nav class="menu">
      <button
        v-for="item in menuItems"
        :key="item"
        type="button"
        class="menu-item"
        :class="{ active: activeMenu === item }"
        :aria-current="activeMenu === item ? 'page' : undefined"
        @click="navigateTo(item)"
      >
        {{ item }}
      </button>
    </nav>

    <!-- Sidebar Bottom -->
    <div class="sidebar-bottom">
      <div class="office-status">
        <span class="office-label">Office status</span>
        <small>Open · 8:00 AM–5:00 PM</small>
      </div>

      <button
        type="button"
        class="logout-button"
        @click="logout"
      >
        LOG OUT
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 12px 8px;
  background: #f6eded;
  border: 1px solid #390607;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  width: 100%;
  min-height: 38px;
  padding: 10px 19px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #310708;
  text-align: left;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item:hover {
  background: #ead6d6;
}

.menu-item.active {
  background: #56090d;
  color: #ffffff;
}

.menu-item:focus-visible,
.logout-button:focus-visible {
  outline: 2px solid #1685e5;
  outline-offset: 2px;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
  padding: 0 2px;
}

.office-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background: #ead6d6;
  color: #390607;
  font-size: 11px;
}

.office-label {
  font-weight: 500;
}

.office-status small {
  color: #785d5e;
  font-size: 10px;
}

.logout-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #390607;
  border-radius: 7px;
  background: transparent;
  color: #390607;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.logout-button:hover {
  background: #56090d;
  color: #ffffff;
}

@media (max-width: 700px) {
  .sidebar {
    min-height: auto;
  }

  .menu {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .menu-item {
    padding: 10px;
    font-size: 12px;
  }

  .sidebar-bottom {
    margin-top: 12px;
  }
}
</style>
