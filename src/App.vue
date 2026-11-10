
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from './lib/Supabase.js'

import LibraryHeader from './components/LibraryHeader.vue'
import LibrarySidebar from './components/LibrarySidebar.vue'

import LoginView from './views/LoginView.vue'
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

// LOGIN STATE
const isLoggedIn = ref(false)
const loading = ref(true)
const loginError = ref('')
const currentUser = ref(null)
const currentProfile = ref(null)

// CURRENT PAGE
const activePage = ref('DASHBOARD')

// LOGOUT MODAL
const showLogoutModal = ref(false)

// AUTH SUBSCRIPTION
let authSubscription = null

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

// LOAD AUTHENTICATED USER PROFILE
async function loadUserProfile(user) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('PROFILE ERROR:', error.message)
    throw new Error('Unable to load your staff profile.')
  }

  if (!profile) {
    throw new Error('No staff profile found for this account.')
  }

  if (profile.role !== 'staff') {
    throw new Error('This account is not authorized for the staff portal.')
  }

  // LIBRARY OFFICE ID
  const LIBRARY_OFFICE_ID = '68828efd-4e49-4312-b4c5-3945793b0e10'

  if (profile.office_id !== LIBRARY_OFFICE_ID) {
    throw new Error('This account does not belong to the Library office.')
  }

  if (profile.is_active === false) {
    throw new Error('This staff account is inactive.')
  }

  currentUser.value = user
  currentProfile.value = profile

  console.log('AUTH USER:', user.id)
  console.log('AUTH EMAIL:', user.email)
  console.log('AUTH PROFILE:', profile.full_name)
  console.log('AUTH OFFICE:', profile.office_id)

  isLoggedIn.value = true
  activePage.value = 'DASHBOARD'
}

// CHECK EXISTING SESSION
async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    if (data.session?.user) {
      await loadUserProfile(data.session.user)
    } else {
      isLoggedIn.value = false
      currentUser.value = null
      currentProfile.value = null
    }
  } catch (error) {
    console.error('SESSION ERROR:', error.message)

    isLoggedIn.value = false
    currentUser.value = null
    currentProfile.value = null
  } finally {
    loading.value = false
  }
}

// REAL SUPABASE LOGIN
async function handleLogin(credentials) {
  loginError.value = ''
  loading.value = true

  try {
    // SIGN OUT PREVIOUS ACCOUNT
    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) throw logoutError

    // SIGN IN USING SUPABASE AUTH
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password
    })

    if (error) throw error

    console.log('NEW LOGIN USER:', data.user.id)
    console.log('NEW LOGIN EMAIL:', data.user.email)

    // LOAD AUTHENTICATED PROFILE
    await loadUserProfile(data.user)

  } catch (error) {
    console.error('LOGIN ERROR:', error.message)

    loginError.value = error.message || 'Login failed.'

    await supabase.auth.signOut()

    isLoggedIn.value = false
    currentUser.value = null
    currentProfile.value = null

  } finally {
    loading.value = false
  }
}

// FORGOT PASSWORD
function handleForgotPassword() {
  alert('Please contact your university administrator for password assistance.')
}

// LOGOUT
async function logout() {
  showLogoutModal.value = false

  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    currentUser.value = null
    currentProfile.value = null
    isLoggedIn.value = false
    activePage.value = 'DASHBOARD'

  } catch (error) {
    console.error('LOGOUT ERROR:', error.message)
    alert('Unable to log out. Please try again.')
  }
}

// INITIALIZE AUTHENTICATION
onMounted(() => {
  checkSession()

  const { data } = supabase.auth.onAuthStateChange((event) => {
    console.log('AUTH EVENT:', event)

    if (event === 'SIGNED_OUT') {
      isLoggedIn.value = false
      currentUser.value = null
      currentProfile.value = null
    }
  })

  authSubscription = data.subscription
})

// CLEANUP
onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
})
</script>

<template>
  <div>
    <!-- LOADING -->
    <div v-if="loading" class="auth-loading">
      <p>Checking account...</p>
    </div>

    <!-- LOGIN PAGE -->
    <LoginView
      v-else-if="!isLoggedIn"
      @login="handleLogin"
      @forgot-password="handleForgotPassword"
    />

    <!-- LIBRARY PORTAL -->
    <div v-else class="portal">

      <!-- DYNAMIC AUTHENTICATED STAFF PROFILE -->
      <LibraryHeader :profile="currentProfile" />

      <div class="layout">

        <LibrarySidebar
          @navigate="activePage = $event"
          @logout="showLogoutModal = true"
        />

        <component
          :is="pageComponents[activePage] || LibraryDashboard"
        />

      </div>

      <!-- LOGOUT CONFIRMATION MODAL -->
      <div
        v-if="showLogoutModal"
        class="modal-overlay"
        @click.self="showLogoutModal = false"
      >
        <div class="logout-modal">

          <div class="logout-icon">!</div>

          <h2>Log Out of LiceoQServe?</h2>

          <p>
            You will return to the authentication login screen.
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
  </div>
</template>

<style scoped>
.portal {
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  background: #eadcda;
}

.auth-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2e5e4;
  color: #5b0710;
  font-family: Arial, sans-serif;
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
