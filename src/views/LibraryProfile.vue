
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
          <label>University email</label>
          <strong>library@liceo.edu.ph</strong>
        </div>
        <div>
          <label>Assigned Office</label>
          <strong>Library</strong>
        </div>
        <div>
          <label>Role</label>
          <strong>Authorized Staff</strong>
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
          <button class="cancel-button" type="button" @click="cancelPassword">
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
  padding: 24px;
  box-sizing: border-box;
  background: #efdfdf;
  color: #350909;
  font-family: Arial, sans-serif;
}

.page-heading {
  margin-bottom: 20px;
}

.page-heading h1 {
  margin: 0 0 4px;
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: 500;
}

.page-heading p {
  margin: 0;
  color: #634646;
  font-size: 14px;
}

.profile-card,
.password-card {
  width: 100%;
  max-width: 760px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 18px;
  background: #f8eeee;
}

.profile-banner {
  min-height: 140px;
  padding: 24px;
  box-sizing: border-box;
  background: #600b13;
  color: #fff5f5;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: #87343b;
  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: bold;
}

.profile-banner h2 {
  margin: 0 0 5px;
  font-family: Georgia, serif;
  font-size: 22px;
}

.profile-banner p {
  margin: 0;
  color: #e5c9c9;
  font-size: 11px;
}

.profile-information {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 26px 30px;
}

.profile-information > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.profile-information label {
  color: #806868;
  font-size: 12px;
}

.profile-information strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.change-button,
.cancel-button {
  justify-self: start;
  padding: 10px 14px;
  border: 1px solid #c9aaaa;
  border-radius: 7px;
  background: transparent;
  color: #600b13;
  font-size: 12px;
  cursor: pointer;
}

.password-card {
  margin-top: 14px;
  padding: 20px;
  border: 1px solid #d7bebe;
  overflow: visible;
}

.password-card h3 {
  margin: 0 0 14px;
  font-size: 16px;
}

.password-card form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-card label {
  font-size: 11px;
  font-weight: bold;
}

.password-card input {
  width: 100%;
  min-height: 38px;
  padding: 10px 12px;
  border: 1px solid #d7bebe;
  border-radius: 7px;
  background: #fff8f8;
  color: #350909;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 8px;
}

.primary-button {
  padding: 10px 14px;
  border: none;
  border-radius: 7px;
  background: #600b13;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.form-message {
  margin-top: 12px;
  color: #600b13;
  font-size: 12px;
}

@media (max-width: 600px) {
  .profile-page {
    padding: 16px;
  }

  .profile-card,
  .password-card {
    max-width: 100%;
  }

  .profile-information {
    gap: 18px 12px;
    padding: 18px;
  }

  .profile-banner {
    padding: 20px;
  }

  .page-heading h1 {
    font-size: 25px;
  }
}
</style>
