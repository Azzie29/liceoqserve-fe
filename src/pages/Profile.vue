
<script setup>
import { ref } from 'vue'

const showPasswordForm = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordMessage = ref('')

function updatePassword() {
  passwordMessage.value = ''

  if (
    !currentPassword.value ||
    !newPassword.value ||
    !confirmNewPassword.value
  ) {
    passwordMessage.value = 'Please fill in all password fields.'
    return
  }

  if (newPassword.value !== confirmNewPassword.value) {
    passwordMessage.value = 'New passwords do not match.'
    return
  }

  passwordMessage.value =
    'Password form validated. Connect this to your authentication backend to save the new password.'

  currentPassword.value = ''
  newPassword.value = ''
  confirmNewPassword.value = ''
}

function cancelPasswordChange() {
  showPasswordForm.value = false
  passwordMessage.value = ''
  currentPassword.value = ''
  newPassword.value = ''
  confirmNewPassword.value = ''
}
</script>

<template>
  <section class="profile-page">
    <div class="profile-content">
      <header class="profile-heading">
        <h1>STAFF PROFILE</h1>
        <p>
          Staff information is managed by the university and is read-only.
        </p>
      </header>

      <article class="profile-card">
        <div class="profile-card-header">
          <div class="profile-avatar">JA</div>

          <h2>Mr. Jerome Aquino</h2>
          <p>Office of Student Affairs · Employee ID: LDCU-1048</p>
        </div>

        <div class="profile-card-body">
          <div class="profile-details">
            <div class="detail-item">
              <span>University email</span>
              <strong>guidance@liceo.edu.ph</strong>
            </div>

            <div class="detail-item">
              <span>Assigned Office</span>
              <strong>Guidance Office</strong>
            </div>

            <div class="detail-item">
              <span>Role</span>
              <strong>Authorized Staff</strong>
            </div>

            <div class="detail-item">
              <span>Account Status</span>
              <strong>Active</strong>
            </div>
          </div>

          <button
            v-if="!showPasswordForm"
            class="password-toggle"
            type="button"
            @click="showPasswordForm = true"
          >
            Change Password
          </button>

          <form
            v-else
            class="password-form"
            @submit.prevent="updatePassword"
          >
            <h3>Change Password</h3>

            <label for="current-password">Current password</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              required
            />

            <label for="new-password">New password</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              required
            />

            <label for="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              v-model="confirmNewPassword"
              type="password"
              autocomplete="new-password"
              required
            />

            <p v-if="passwordMessage" class="password-message">
              {{ passwordMessage }}
            </p>

            <div class="password-actions">
              <button class="password-toggle" type="submit">
                Update password
              </button>

              <button
                class="cancel-button"
                type="button"
                @click="cancelPasswordChange"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.profile-page {
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding: 12px 16px;
  box-sizing: border-box;
  color: #39090c;
}

.profile-content {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* Heading and card share the same left and right edges */
.profile-heading {
  width: 100%;
  margin: 0 0 14px;
  padding: 0;
  box-sizing: border-box;
  text-align: left;
}

.profile-heading h1 {
  margin: 0;
  color: #650f18;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: bold;
  line-height: 1.5;
  text-align: left;
}

.profile-heading p {
  margin: 6px 0 0;
  color: #987d7e;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  font-weight: 500;
}

.profile-card {
  width: 100%;
  margin: 0;
  overflow: hidden;
  background: #f8eeee;
  border: 1px solid #ead5d6;
  border-radius: 18px;
  box-sizing: border-box;
}

.profile-card-header {
  padding: 16px 20px;
  color: #fffafa;
  background: #51090e;
}

.profile-avatar {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  margin: 0 0 10px;
  color: #fffafa;
  background: #79353b;
  border-radius: 12px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: bold;
}

.profile-card-header h2 {
  margin: 0;
  color: #fffafa;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 23px;
  font-weight: bold;
  line-height: 1.25;
}

.profile-card-header p {
  margin: 6px 0 0;
  color: #f3dfe0;
  font-size: 11px;
  line-height: 1.5;
}

.profile-card-body {
  padding: 18px 20px;
}

.profile-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
  row-gap: 14px;
  margin-bottom: 18px;
}

.detail-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.detail-item span {
  color: #987d7e;
  font-size: 12px;
}

.detail-item strong {
  color: #25090b;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.password-toggle,
.cancel-button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #dfb9bb;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.password-toggle {
  color: #650f18;
  background: #f8eeee;
}

.password-toggle:hover {
  background: #efdddd;
}

.password-form {
  display: flex;
  width: 100%;
  max-width: 420px;
  flex-direction: column;
  gap: 6px;
}

.password-form h3 {
  margin: 0 0 4px;
  color: #39090c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
}

.password-form label {
  margin-top: 4px;
  color: #39090c;
  font-size: 12px;
  font-weight: 600;
}

.password-form input {
  width: 100%;
  min-height: 34px;
  padding: 7px 10px;
  box-sizing: border-box;
  color: #39090c;
  background: #fffafa;
  border: 1px solid #d8babb;
  border-radius: 8px;
  outline-color: #650f18;
  font-size: 13px;
}

.password-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.cancel-button {
  color: #650f18;
  background: transparent;
}

.password-message {
  margin: 5px 0 0;
  color: #650f18;
  font-size: 12px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .profile-page {
    padding: 10px;
  }

  .profile-content {
    max-width: 100%;
  }

  .profile-heading {
    margin-bottom: 12px;
  }

  .profile-heading h1 {
    font-size: 20px;
  }

  .profile-heading p {
    font-size: 12px;
  }

  .profile-card {
    border-radius: 14px;
  }

  .profile-card-header {
    padding: 14px 16px;
  }

  .profile-avatar {
    width: 42px;
    height: 42px;
    margin-bottom: 8px;
    border-radius: 10px;
    font-size: 21px;
  }

  .profile-card-header h2 {
    font-size: 20px;
  }

  .profile-card-header p {
    font-size: 10px;
  }

  .profile-card-body {
    padding: 15px 16px;
  }

  .profile-details {
    column-gap: 12px;
    row-gap: 12px;
    margin-bottom: 14px;
  }

  .detail-item span {
    font-size: 11px;
  }

  .detail-item strong {
    font-size: 12px;
  }

  .password-form {
    max-width: 100%;
  }
}
</style>
