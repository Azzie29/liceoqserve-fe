
<script setup>
defineProps({
  activePage: {
    type: String,
    default: 'Dashboard'
  }
})

const emit = defineEmits(['navigate', 'logout'])

const menuItems = [
  'Dashboard',
  'Appointments',
  'Guidance Sessions',
  'Students',
  'Notifications',
  'Schedule',
  'History',
  'Profile'
]
</script>

<template>
  <aside class="sidebar">
    <nav class="navigation">
      <button
        v-for="item in menuItems"
        :key="item"
        :class="{ selected: activePage === item }"
        @click="emit('navigate', item)"
      >
        {{ item }}
      </button>
    </nav>

    <div class="sidebar-bottom">
      <div class="office-status">
        <strong>Office status</strong>
        <small>Open · 8:00 AM–5:00 PM</small>
      </div>

      <button class="logout-button" @click="emit('logout')">
        LOG OUT
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: calc(100vh - 84px);
  padding: 18px 12px 12px;
  background: #f8eeee;
  border-right: 1px solid #c9b8b8;
}

.navigation {
  display: grid;
  gap: 5px;
}

.navigation button {
  width: 100%;
  min-height: 39px;
  padding: 10px 16px;
  color: #39090c;
  text-align: left;
  text-transform: uppercase;
  background: transparent;
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
}

.navigation button:hover,
.navigation button.selected {
  color: #fffafa;
  background: #51090e;
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 24px;
}

.office-status {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  margin-bottom: 9px;
  background: #ead6d7;
  border-radius: 7px;
  font-size: 11px;
}

.office-status strong {
  font-weight: normal;
}

.office-status small {
  color: #775f60;
  font-size: 10px;
}

.logout-button {
  width: 100%;
  min-height: 44px;
  padding: 10px;
  color: #39090c;
  background: transparent;
  border: 1px solid #51090e;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
}

.logout-button:hover {
  color: white;
  background: #51090e;
}

@media (max-width: 700px) {
  .sidebar {
    min-height: auto;
    padding: 10px;
  }

  .navigation {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sidebar-bottom {
    padding-top: 12px;
  }
}
</style>
