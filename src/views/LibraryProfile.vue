
<template>
  <div class="profile-page">
    <header class="page-heading">
      <h1>Librarian’s Profile</h1>
      <p>Staff information is managed by the university and is read only.</p>
    </header>

    <section class="profile-card">
      <div class="profile-banner">
        <div class="avatar">DJ</div>
        <h2>Mr. Dhan Jee</h2>
        <p>Library · Employee ID: LDCU-0185</p>
      </div>

      <div class="profile-information">
        <div>
          <label>University Email</label>
          <strong>library@liceo.edu.ph</strong>
        </div>

        <div>
          <label>Role</label>
          <strong>Authorized Staff</strong>
        </div>

        <div>
          <label>Assigned Office</label>
          <strong>Library</strong>
        </div>

        <div>
          <label>Account Status</label>
          <strong>Active</strong>
        </div>

        <button
          class="change-button"
          @click="showPasswordForm = !showPasswordForm"
        >
          {{ showPasswordForm ? 'Hide Form' : 'Change Password' }}
        </button>
      </div>
    </section>

    <section v-if="showPasswordForm" class="password-card">
      <h3>Change Password</h3>

      <form @submit.prevent="updatePassword">
        <label for="currentPassword">Current password</label>
        <input
          id="currentPassword"
          v-model="currentPassword"
          type="password"
          placeholder="Enter current password"
          required
        />

        <label for="newPassword">New password</label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          minlength="8"
          placeholder="Enter new password"
          required
        />

        <label for="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          minlength="8"
          placeholder="Confirm new password"
          required
        />

        <p v-if="passwordMessage" class="form-message">
          {{ passwordMessage }}
        </p>

        <div class="form-actions">
          <button class="primary-button" type="submit">
            Update password
          </button>

          <button
            class="cancel-button"
            type="button"
            @click="cancelPassword"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showPasswordForm = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordMessage = ref('')

function updatePassword() {
  passwordMessage.value = ''

  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = 'New passwords do not match.'
    return
  }

  if (currentPassword.value === newPassword.value) {
    passwordMessage.value = 'Choose a different new password.'
    return
  }

  passwordMessage.value =
    'Validation successful. Connect authentication to save your password.'
}

function cancelPassword() {
  showPasswordForm.value = false
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordMessage.value = ''
}
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

/* Larger profile card */
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

/* Four information fields in one horizontal row */
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

/* Change password form */
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
  margin: 0 0 20px;
  font-size: 19px;
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

.password-card input {
  width: 100%;
  min-height: 44px;
  margin-bottom: 8px;
  padding: 12px 14px;
  border: 1px solid #d7bebe;
  border-radius: 8px;
  background: #fff8f8;
  color: #350909;
  box-sizing: border-box;
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

.form-message {
  margin: 12px 0;
  color: #600b13;
  font-size: 13px;
  line-height: 1.5;
}

/* Tablet layout */
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

/* Mobile layout */
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
