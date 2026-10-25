
<script setup>
import { computed, ref } from 'vue'

const staff = {
  name: 'Dr. Lindsay Montejo',
  initials: 'LM',
  title: 'Guidance Counselor',
  employeeId: 'LDCU-0094',
  email: 'guidance@liceo.edu.ph',
  office: 'Guidance Office',
  role: 'Authorized Staff',
  status: 'Active'
}

const showPasswordForm = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')

const canSubmit = computed(() =>
  currentPassword.value.length > 0 &&
  newPassword.value.length > 0 &&
  confirmPassword.value.length > 0
)

function openPasswordForm() {
  showPasswordForm.value = true
  message.value = ''
}

function cancelPasswordForm() {
  showPasswordForm.value = false
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  message.value = ''
  messageType.value = ''
}

function updatePassword() {
  message.value = ''
  messageType.value = ''

  if (
    !currentPassword.value ||
    !newPassword.value ||
    !confirmPassword.value
  ) {
    message.value = 'Please fill in all password fields.'
    messageType.value = 'error'
    return
  }

  if (newPassword.value.length < 8) {
    message.value = 'New password must be at least 8 characters long.'
    messageType.value = 'error'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = 'New password and confirmation do not match.'
    messageType.value = 'error'
    return
  }

  message.value =
    'Form validated. Connect a backend to update your password.'
  messageType.value = 'info'
}
</script>

<template>
  <section class="profile-page">
    <header class="page-heading">
      <h1>Staff Profile</h1>
      <p>
        Staff information is managed by the university and is read-only.
      </p>
    </header>

    <article class="profile-card">
      <div class="profile-banner">
        <div class="avatar">{{ staff.initials }}</div>
        <h2>{{ staff.name }}</h2>
        <p>
          {{ staff.title }} · Employee ID: {{ staff.employeeId }}
        </p>
      </div>

      <div class="profile-details">
        <div class="detail-item">
          <span>University email</span>
          <strong>{{ staff.email }}</strong>
        </div>

        <div class="detail-item">
          <span>Assigned Office</span>
          <strong>{{ staff.office }}</strong>
        </div>

        <div class="detail-item">
          <span>Role</span>
          <strong>{{ staff.role }}</strong>
        </div>

        <div class="detail-item">
          <span>Account Status</span>
          <strong>{{ staff.status }}</strong>
        </div>

        <div class="profile-actions">
          <button
            v-if="!showPasswordForm"
            class="change-password-button"
            type="button"
            @click="openPasswordForm"
          >
            Change Password
          </button>
        </div>
      </div>
    </article>

    <section v-if="showPasswordForm" class="password-panel">
      <h2>Change Password</h2>

      <form @submit.prevent="updatePassword">
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
          minlength="8"
          required
        />

        <label for="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />

        <p
          v-if="message"
          class="form-message"
          :class="messageType"
          role="status"
        >
          {{ message }}
        </p>

        <div class="form-actions">
          <button
            class="update-button"
            type="submit"
            :disabled="!canSubmit"
          >
            Update password
          </button>

          <button
            class="cancel-button"
            type="button"
            @click="cancelPasswordForm"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </section>
</template>

<style scoped>
.profile-page {
  width: 100%;
  min-width: 0;
  color: #39090c;
}

.page-heading {
  margin-bottom: 20px;
}

.page-heading h1 {
  margin: 0;
  color: #39090c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.2;
}

.page-heading p {
  margin: 2px 0 0;
  font-size: 13px;
}

.profile-card {
  width: min(100%, 700px);
  overflow: hidden;
  background: #f8eeee;
  border-radius: 23px;
}

.profile-banner {
  padding: 17px 23px 26px;
  color: #fffafa;
  background: #51090e;
}

.avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 13px;
  color: #fffafa;
  background: #713238;
  border-radius: 16px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 25px;
  font-weight: bold;
}

.profile-banner h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 25px;
  line-height: 1.25;
}

.profile-banner p {
  margin: 5px 0 0;
  color: #d6babc;
  font-size: 12px;
}

.profile-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 28px;
  row-gap: 20px;
  padding: 23px 28px 21px;
}

.detail-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.detail-item span {
  color: #776768;
  font-size: 12px;
}

.detail-item strong {
  overflow-wrap: anywhere;
  color: #39090c;
  font-size: 15px;
  font-weight: 600;
}

.profile-actions {
  grid-column: 1 / -1;
  margin-top: 1px;
}

.change-password-button,
.update-button {
  min-height: 38px;
  padding: 9px 15px;
  color: #fffafa;
  background: #51090e;
  border: 1px solid #51090e;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.change-password-button:hover,
.update-button:not(:disabled):hover {
  background: #6a151c;
}

.password-panel {
  width: min(100%, 700px);
  margin-top: 12px;
  padding: 16px 17px 14px;
  background: #f8eeee;
  border: 1px solid #c9b8b8;
  border-radius: 22px;
}

.password-panel h2 {
  margin: 0 0 9px;
  color: #39090c;
  font-size: 16px;
  font-weight: 700;
}

.password-panel form {
  display: flex;
  flex-direction: column;
}

.password-panel label {
  margin: 0 0 4px;
  font-size: 10px;
  font-weight: 700;
}

.password-panel input {
  width: 100%;
  min-height: 29px;
  margin-bottom: 5px;
  padding: 5px 9px;
  color: #39090c;
  background: #f8eeee;
  border: 1px solid #d4b5b7;
  border-radius: 8px;
  outline-color: #7a3036;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 3px;
}

.update-button {
  min-height: 30px;
  padding: 6px 12px;
  font-size: 11px;
}

.update-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.cancel-button {
  min-height: 30px;
  padding: 6px 12px;
  color: #775f60;
  background: transparent;
  border: 1px solid #d4b5b7;
  border-radius: 7px;
  font-size: 11px;
  cursor: pointer;
}

.cancel-button:hover {
  background: #f1e2e2;
}

.form-message {
  margin: 5px 0 8px;
  font-size: 12px;
}

.form-message.error {
  color: #a0202a;
}

.form-message.info {
  color: #665052;
}

@media (max-width: 600px) {
  .page-heading h1 {
    font-size: 26px;
  }

  .profile-banner {
    padding: 17px;
  }

  .profile-banner h2 {
    font-size: 22px;
  }

  .profile-details {
    grid-template-columns: 1fr;
    row-gap: 15px;
    padding: 20px 17px;
  }

  .profile-actions {
    grid-column: auto;
  }
}
</style>
