
<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">LQ</div>
      <div class="brand-text">
        <strong>LiceoQServe</strong>
        <span>Registrar Portal</span>
      </div>
    </div>

    <nav class="navigation">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        active-class="active"
      >
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-bottom">
      <div class="office-status">
        <strong>Office status</strong>
        <small>Open · 8:00 AM–5:00 PM</small>
      </div>

      <button class="logout-button" @click="openLogoutModal">
        LOG OUT
      </button>
    </div>

    <!-- CUSTOM LOGOUT MODAL -->
    <Teleport to="body">
      <div
        v-if="showLogoutModal"
        class="modal-overlay"
        @click.self="closeLogoutModal"
        @keydown.esc="closeLogoutModal"
      >
        <section
          class="logout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div class="modal-icon">!</div>

          <h2 id="logout-title">Log out of QueueLess?</h2>
          <p>You will return to the role selection screen.</p>

          <div class="modal-actions">
            <button
              class="cancel-button"
              @click="closeLogoutModal"
            >
              Go Back
            </button>

            <button
              class="confirm-button"
              @click="confirmLogout"
            >
              Yes, log out
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLogoutModal = ref(false)

const menuItems = [
  { label: 'HOME', path: '/registrar/dashboard' },
  { label: 'QUEUE', path: '/registrar/queue' },
  { label: 'APPOINTMENTS', path: '/registrar/appointments' },
  { label: 'REQUESTS', path: '/registrar/requests' },
  { label: 'NOTIFICATION', path: '/registrar/notifications' },
  { label: 'STUDENTS', path: '/registrar/students' },
  { label: 'HISTORY', path: '/registrar/history' },
  { label: 'PROFILE', path: '/registrar/profile' },
]

function openLogoutModal() {
  showLogoutModal.value = true
}

function closeLogoutModal() {
  showLogoutModal.value = false
}

function confirmLogout() {
  showLogoutModal.value = false
  router.push('/')
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex: 0 0 210px;
  flex-direction: column;
  width: 210px;
  height: 100vh;
  min-height: 500px;
  padding: 0 8px 12px;
  background: #f7eeee;
  border-right: 1px solid #650b18;
}

.brand {
  display: none;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 14px;
}

.nav-link {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 10px 17px;
  color: #350e12;
  border-radius: 6px;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
}

.nav-link:hover {
  background: #ead7d9;
}

.nav-link.active {
  color: white;
  background: #50070e;
}

.sidebar-bottom {
  margin-top: auto;
}

.office-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 12px 0 9px;
  padding: 10px;
  border-radius: 7px;
  background: #ead7d9;
}

.office-status strong {
  color: #4c2026;
  font-size: 10px;
}

.office-status small {
  color: #80696c;
  font-size: 9px;
}

.logout-button {
  width: 100%;
  padding: 10px;
  color: #350e12;
  border: 1px solid #350e12;
  border-radius: 6px;
  background: transparent;
  font-size: 11px;
  font-weight: 700;
}

.logout-button:hover {
  background: #ead7d9;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 0 0 / 38%);
}

.logout-modal {
  width: 100%;
  max-width: 390px;
  padding: 12px 16px 16px;
  border: 1px solid #e6cdd0;
  border-radius: 10px;
  background: #f8eeee;
  box-shadow: 0 12px 40px rgb(0 0 0 / 15%);
}

.modal-icon {
  display: flex;
  width: 45px;
  height: 45px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border-radius: 9px;
  background: #a9767d;
  color: #50070e;
  font-size: 25px;
  font-weight: 800;
}

.logout-modal h2 {
  margin: 0 0 5px;
  color: #350e12;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 500;
}

.logout-modal p {
  margin: 0;
  color: #350e12;
  font-size: 12px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 16px;
}

.cancel-button,
.confirm-button {
  padding: 9px 14px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
}

.cancel-button {
  color: #50070e;
  border: 1px solid #8e6b70;
  background: transparent;
}

.confirm-button {
  color: white;
  border: 1px solid #50070e;
  background: #50070e;
}

.confirm-button:hover {
  background: #650b18;
}

@media (max-width: 760px) {
  .sidebar {
    flex-basis: 66px;
    width: 66px;
    min-height: 100vh;
    padding: 0 5px 10px;
  }

  .navigation {
    gap: 6px;
  }

  .nav-link {
    justify-content: center;
    padding: 10px 3px;
    font-size: 8px;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .office-status {
    display: none;
  }

  .logout-button {
    padding: 10px 2px;
    font-size: 8px;
  }

  .logout-modal {
    max-width: 340px;
  }
}
</style>
