
<template>
  <div class="profile-page">
    <header class="page-heading">
      <h1>Librarian’s Profile</h1>
      <p>Staff information is managed by the university and is read only.</p>
    </header>

    <p v-if="loadingProfile" class="form-message">
      Loading profile information...
    </p>

    <p v-else-if="profileError" class="form-message error-message">
      {{ profileError }}
    </p>

    <section v-else class="profile-card">
      <div class="profile-banner">
        <div class="avatar">{{ initials }}</div>
        <h2>{{ profile.full_name || 'Library Staff' }}</h2>
        <p>
          Library · Employee ID:
          {{ profile.student_id || 'Not available' }}
        </p>
      </div>

      <div class="profile-information">
        <div>
          <label>University Email</label>
          <strong>{{ profile.university_email || userEmail || 'Not available' }}</strong>
        </div>

        <div>
          <label>Role</label>
          <strong>{{ formattedRole }}</strong>
        </div>

        <div>
          <label>Assigned Office</label>
          <strong>{{ assignedOffice }}</strong>
        </div>

        <div>
          <label>Account Status</label>
          <strong>{{ profile.is_active ? 'Active' : 'Inactive' }}</strong>
        </div>

        <button
          class="change-button"
          @click="togglePasswordForm"
        >
          {{ showPasswordForm ? 'Hide Form' : 'Change Password' }}
        </button>
      </div>
    </section>

    <!-- CHANGE PASSWORD -->
    <section v-if="showPasswordForm" class="password-card">
      <h3>Change Password</h3>

      <p class="password-description">
        Enter your current password and choose a new password for your account.
      </p>

      <form @submit.prevent="updatePassword">

        <!-- CURRENT PASSWORD -->
        <label for="currentPassword">Current password</label>

        <div class="password-input-wrapper">
          <input
            id="currentPassword"
            v-model="currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter current password"
            required
            :disabled="updatingPassword"
          />

          <button
            type="button"
            class="eye-button"
            @click="showCurrentPassword = !showCurrentPassword"
            :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="!showCurrentPassword"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.8" />
              <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
            </svg>
          </button>
        </div>

        <!-- NEW PASSWORD -->
        <label for="newPassword">New password</label>

        <div class="password-input-wrapper">
          <input
            id="newPassword"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            placeholder="Enter new password"
            required
            :disabled="updatingPassword"
          />

          <button
            type="button"
            class="eye-button"
            @click="showNewPassword = !showNewPassword"
            :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="!showNewPassword"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.8" />
              <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
            </svg>
          </button>
        </div>

        <!-- CONFIRM PASSWORD -->
        <label for="confirmPassword">Confirm new password</label>

        <div class="password-input-wrapper">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            placeholder="Confirm new password"
            required
            :disabled="updatingPassword"
          />

          <button
            type="button"
            class="eye-button"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
          >
            <svg
              v-if="!showConfirmPassword"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.8" />
              <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6" />
            </svg>
          </button>
        </div>

        <p
          v-if="passwordMessage"
          class="form-message"
          :class="{
            'error-message': passwordMessageType === 'error',
            'success-message': passwordMessageType === 'success'
          }"
        >
          {{ passwordMessage }}
        </p>

        <div class="form-actions">
          <button
            class="primary-button"
            type="submit"
            :disabled="updatingPassword"
          >
            {{ updatingPassword ? 'Updating...' : 'Update Password' }}
          </button>

          <button
            class="cancel-button"
            type="button"
            @click="cancelPassword"
            :disabled="updatingPassword"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

const LIBRARY_OFFICE_ID = '68828efd-4e49-4312-b4c5-3945793b0e10'

const showPasswordForm = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Password visibility
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordMessage = ref('')
const passwordMessageType = ref('')

const loadingProfile = ref(true)
const updatingPassword = ref(false)
const profileError = ref('')

const userEmail = ref('')

const profile = ref({
  full_name: '',
  student_id: '',
  university_email: '',
  role: '',
  is_active: false,
  office_id: null
})

const initials = computed(() => {
  const name = profile.value.full_name?.trim()

  if (!name) return 'LS'

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
})

const formattedRole = computed(() => {
  if (!profile.value.role) return 'Not available'

  return profile.value.role
    .replace(/\_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
})

const assignedOffice = computed(() => {
  return profile.value.office_id === LIBRARY_OFFICE_ID
    ? 'Library'
    : 'Not available'
})

// FETCH LOGGED-IN STAFF PROFILE
async function fetchProfile() {
  loadingProfile.value = true
  profileError.value = ''

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    const user = authData?.user

    if (!user) {
      throw new Error('No authenticated user found. Please log in again.')
    }

    userEmail.value = user.email || ''

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        full_name,
        student_id,
        university_email,
        role,
        is_active,
        office_id
      `)
      .eq('id', user.id)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      throw new Error('Your staff profile could not be found.')
    }

    profile.value = data

  } catch (error) {
    console.error('Profile fetch error:', error)
    profileError.value =
      error.message || 'Unable to load profile information.'
  } finally {
    loadingProfile.value = false
  }
}

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value

  if (!showPasswordForm.value) {
    clearPasswordFields()
  }
}

function clearPasswordFields() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''

  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false

  passwordMessage.value = ''
  passwordMessageType.value = ''
}

// CHANGE PASSWORD USING SUPABASE AUTH
async function updatePassword() {
  passwordMessage.value = ''
  passwordMessageType.value = ''

  if (
    !currentPassword.value ||
    !newPassword.value ||
    !confirmPassword.value
  ) {
    passwordMessage.value = 'Please complete all password fields.'
    passwordMessageType.value = 'error'
    return
  }

  if (newPassword.value.length < 8) {
    passwordMessage.value =
      'New password must contain at least 8 characters.'
    passwordMessageType.value = 'error'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = 'New passwords do not match.'
    passwordMessageType.value = 'error'
    return
  }

  if (currentPassword.value === newPassword.value) {
    passwordMessage.value =
      'Choose a different new password.'
    passwordMessageType.value = 'error'
    return
  }

  updatingPassword.value = true

  try {
    // Get currently logged-in user
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    const user = authData?.user

    if (!user?.email) {
      throw new Error('Unable to identify your account email.')
    }

    // Verify current password
    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword.value
      })

    if (verifyError) {
      throw new Error('Your current password is incorrect.')
    }

    // Save new password to Supabase Auth
    const { error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword.value
      })

    if (updateError) throw updateError

    passwordMessage.value =
      'Password successfully updated! Your new password will be used the next time you log in.'

    passwordMessageType.value = 'success'

    // Clear password inputs after successful update
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false

  } catch (error) {
    console.error('Password update error:', error)

    passwordMessage.value =
      error.message || 'Unable to update your password.'

    passwordMessageType.value = 'error'

  } finally {
    updatingPassword.value = false
  }
}

function cancelPassword() {
  showPasswordForm.value = false
  clearPasswordFields()
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: calc(100vh - 100px);
  padding: 30px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #350909;
  font-family: Arial, sans-serif;
}

.page-heading {
  margin-bottom: 28px;
}

.page-heading h1 {
  margin: 0 0 6px;
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  color: #634646;
  font-size: 14px;
  line-height: 1.6;
}

.profile-card {
  width: 100%;
  max-width: 1400px;
  min-height: 440px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 18px;
  background: #f8eeee;
  box-shadow: 0 5px 18px rgba(53, 9, 9, 0.08);
}

.profile-banner {
  min-height: 210px;
  padding: 36px 42px;
  box-sizing: border-box;
  background: #600b13;
  color: #fff5f5;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: #87343b;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: bold;
}

.profile-banner h2 {
  margin: 0 0 8px;
  font-family: Georgia, serif;
  font-size: 27px;
}

.profile-banner p {
  margin: 0;
  color: #e5c9c9;
  font-size: 13px;
  line-height: 1.5;
}

.profile-information {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
  gap: 32px;
  padding: 48px 42px 38px;
}

.profile-information > div {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 60px;
}

.profile-information label {
  color: #806868;
  font-size: 14px;
}

.profile-information strong {
  font-size: 15px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.change-button,
.cancel-button {
  justify-self: start;
  align-self: start;
  padding: 13px 20px;
  border: 1px solid #c9aaaa;
  border-radius: 8px;
  background: transparent;
  color: #600b13;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.change-button {
  grid-column: 1 / -1;
}

.change-button:hover,
.cancel-button:hover {
  background: #f0dddd;
}

.password-card {
  width: 100%;
  max-width: 1400px;
  margin-top: 20px;
  padding: 28px;
  box-sizing: border-box;
  border: 1px solid #d7bebe;
  border-radius: 18px;
  background: #f8eeee;
  box-shadow: 0 5px 18px rgba(53, 9, 9, 0.06);
}

.password-card h3 {
  margin: 0 0 10px;
  font-size: 19px;
}

.password-description {
  margin: 0 0 20px;
  color: #806868;
  font-size: 13px;
}

.password-card form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.password-card label {
  font-size: 13px;
  font-weight: bold;
}

/* PASSWORD INPUT AND EYE ICON */
.password-input-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 8px;
}

.password-card .password-input-wrapper input {
  width: 100%;
  min-height: 44px;
  margin-bottom: 0;
  padding: 12px 45px 12px 14px;
  border: 1px solid #d7bebe;
  border-radius: 8px;
  background: #fff8f8;
  color: #350909;
  box-sizing: border-box;
}

.password-card input:focus {
  outline: none;
  border-color: #600b13;
  box-shadow: 0 0 0 2px rgba(96, 11, 19, 0.08);
}

.password-card input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.eye-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 5px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #806868;
  cursor: pointer;
  z-index: 2;
}

.eye-button:hover {
  background: #f0dddd;
  color: #600b13;
}

.eye-button svg {
  width: 19px;
  height: 19px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.primary-button {
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  background: #600b13;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.primary-button:hover {
  background: #7a1720;
}

.primary-button:disabled,
.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  padding: 12px 18px;
}

.form-message {
  margin: 12px 0;
  font-size: 13px;
  line-height: 1.5;
}

.error-message {
  color: #a01818;
}

.success-message {
  color: #216b2a;
}

@media (max-width: 1000px) {
  .profile-page {
    padding: 24px;
  }

  .profile-information {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px;
    padding: 32px;
  }

  .change-button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .profile-page {
    padding: 16px;
  }

  .page-heading {
    margin-bottom: 22px;
  }

  .page-heading h1 {
    font-size: 25px;
  }

  .profile-banner {
    min-height: 170px;
    padding: 24px;
  }

  .profile-information {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px;
  }

  .password-card {
    padding: 22px;
  }
}
</style>
