
<script setup>
import { ref } from 'vue'

import LibraryHeader from './components/LibraryHeader.vue'
import LibrarySidebar from './components/LibrarySidebar.vue'

import LibraryDashboard from './views/LibraryDashboard.vue'
import LibraryAppointments from './views/LibraryAppointments.vue'
import LibraryRoomReservation from './views/LibraryRoomReservation.vue'
import LibraryBooks from './views/LibraryBooks.vue'
import LibraryRequests from './views/LibraryRequests.vue'
import LibraryClearance from './views/LibraryClearance.vue'
import LibraryNotifications from './views/LibraryNotifications.vue'
import LibraryStudents from './views/LibraryStudents.vue'
import LibrarySchedule from './views/LibrarySchedule.vue'
import LibraryHistory from './views/LibraryHistory.vue'
import LibraryProfile from './views/LibraryProfile.vue'

const activePage = ref('DASHBOARD')
const showLogoutModal = ref(false)

const pageComponents = {
  DASHBOARD: LibraryDashboard,
  APPOINTMENTS: LibraryAppointments,
  'ROOM RESERVATION': LibraryRoomReservation,
  BOOKS: LibraryBooks,
  REQUESTS: LibraryRequests,
  CLEARANCE: LibraryClearance,
  NOTIFICATIONS: LibraryNotifications,
  STUDENTS: LibraryStudents,
  SCHEDULE: LibrarySchedule,
  HISTORY: LibraryHistory,
  PROFILE: LibraryProfile,
}

function logout() {
  showLogoutModal.value = false
  activePage.value = 'DASHBOARD'
}
</script>

<template>
  <div class="portal">
    <LibraryHeader />

    <div class="layout">
      <LibrarySidebar
        @navigate="activePage = $event"
        @logout="showLogoutModal = true"
      />

      <component
        :is="pageComponents[activePage] || LibraryDashboard"
      />
    </div>

    <!-- Logout Confirmation Modal -->
    <div
      v-if="showLogoutModal"
      class="modal-overlay"
      @click.self="showLogoutModal = false"
    >
      <div class="logout-modal">
        <div class="logout-icon">!</div>

        <h2>Log Out of LiceoQServe?</h2>

        <p>
          You will return to authentication login/register screen.
        </p>

        <div class="modal-actions">
          <button
            class="back-button"
            @click="showLogoutModal = false"
          >
            Go Back
          </button>

          <button
            class="logout-button"
            @click="logout"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal {
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  background: #eadcda;
}

.layout {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: calc(100vh - 104px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(30, 15, 15, 0.55);
}

.logout-modal {
  width: 100%;
  max-width: 430px;
  padding: 35px 30px;
  border-radius: 16px;
  background: #fffaf5;
  text-align: center;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
}

.logout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: #f1dedd;
  color: #7b252b;
  font-size: 30px;
  font-weight: bold;
}

.logout-modal h2 {
  margin: 0 0 12px;
  color: #512126;
  font-size: 23px;
}

.logout-modal p {
  margin: 0 0 28px;
  color: #776568;
  font-size: 14px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-actions button {
  min-width: 125px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.back-button {
  background: #eadcda;
  color: #512126;
}

.back-button:hover {
  background: #dfcecb;
}

.logout-button {
  background: #78272d;
  color: white;
}

.logout-button:hover {
  background: #5e1d23;
}

@media (max-width: 700px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .logout-modal {
    padding: 28px 20px;
  }

  .modal-actions button {
    min-width: 0;
    flex: 1;
  }
}
</style>
