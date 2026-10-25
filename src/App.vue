
<template>
  <div class="app-shell">
    <RegistrarHeader />

    <div class="app-body">
      <RegistrarSidebar />

      <main class="page-content">
        <router-view />
      </main>
    </div>

    <!-- CUSTOM LOGOUT MODAL -->
    <Teleport to="body">
      <div
        v-if="showLogoutModal"
        class="logout-overlay"
        @click.self="closeLogout"
      >
        <section
          class="logout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div class="warning-icon">
            <span>!</span>
          </div>

          <h2 id="logout-title">Log out of QueueLess?</h2>

          <p>You will return to the role selection screen.</p>

          <div class="modal-actions">
            <button
              type="button"
              class="go-back-button"
              @click="closeLogout"
            >
              Go Back
            </button>

            <button
              type="button"
              class="confirm-button"
              @click="confirmLogout"
            >
              Yes, log out
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import RegistrarHeader from './components/RegistrarHeader.vue'
import RegistrarSidebar from './components/RegistrarSidebar.vue'

const router = useRouter()
const showLogoutModal = ref(false)

function openLogout() {
  showLogoutModal.value = true
}

function closeLogout() {
  showLogoutModal.value = false
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeLogout()
  }
}

function confirmLogout() {
  closeLogout()

  // Remove these only if they are the actual auth keys used by your app.
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.clear()

  // Change '/' if your role selection page uses a different route.
  router.push('/')
}

onMounted(() => {
  window.addEventListener('open-logout-modal', openLogout)
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-logout-modal', openLogout)
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  background: #eee0e0;
  color: #351819;
  font-family: Arial, Helvetica, sans-serif;
}

.app-body {
  display: flex;
  min-height: calc(100vh - 80px);
}

.page-content {
  flex: 1;
  min-width: 0;
  padding: 20px;
  background: #eee0e0;
}

/* LOGOUT OVERLAY */
.logout-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.38);
}

.logout-modal {
  width: 294px;
  max-width: 100%;
  padding: 11px 12px 18px;
  border: 1px solid #e4d1d2;
  border-radius: 10px;
  background: #f8eeee;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  animation: modal-appear 0.15s ease-out;
}

.warning-icon {
  display: flex;
  width: 46px;
  height: 36px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border-radius: 8px;
  background: #a8797d;
}

.warning-icon span {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #51070d;
  color: #f8eeee;
  font-size: 17px;
  font-weight: 800;
}

.logout-modal h2 {
  margin: 0 0 5px 19px;
  color: #35090d;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 17px;
  font-weight: 500;
}

.logout-modal > p {
  margin: 0 0 16px 19px;
  color: #351819;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding-right: 1px;
}

.go-back-button,
.confirm-button {
  min-height: 28px;
  padding: 6px 15px;
  border-radius: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  cursor: pointer;
}

.go-back-button {
  border: 1px solid #8a6265;
  background: transparent;
  color: #35090d;
}

.go-back-button:hover {
  background: #eedfe0;
}

.confirm-button {
  border: 1px solid #51070d;
  background: #51070d;
  color: #fff7f6;
}

.confirm-button:hover {
  background: #6b111a;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(5px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 600px) {
  .page-content {
    padding: 14px;
  }

  .logout-modal {
    width: 294px;
  }
}
</style>
