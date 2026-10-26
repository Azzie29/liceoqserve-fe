<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

function login() {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter your university email and password.'
    return
  }

  // Demo login only. Connect this to your authentication backend later.
  sessionStorage.setItem('staffLoggedIn', 'true')
  sessionStorage.setItem('staffEmail', email.value.trim())

  window.location.reload()
}
</script>

<template>
  <main class="login-page">
    <section class="welcome-panel">
      <div class="brand">
        <span class="brand-logo">LQ</span>
        <div>
          <h2>LiceoQServe</h2>
          <p>OSA Portal</p>
        </div>
      </div>

      <div class="welcome-copy">
        <p class="eyebrow">STAFF PORTAL</p>
        <h1>Campus services without the unnecessary wait.</h1>
        <p class="description">
          Manage queues, appointments, requests, and campus service updates in one place.
        </p>
      </div>

      <p class="tagline">QUEUE. SCHEDULE. SERVE.</p>
    </section>

    <section class="form-panel">
      <div class="form-content">
        <p class="eyebrow dark">WELCOME BACK</p>
        <h1>Sign in to your account</h1>
        <p class="subtitle">Enter your service/office account details to continue.</p>

        <form class="login-form" @submit.prevent="login">
          <label for="email">University Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="servicestaff@liceo.edu.ph"
            autocomplete="username"
            required
          />

          <label for="password">Password</label>
          <div class="password-field">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
            <button type="button" class="show-button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <button class="submit-button" type="submit">Sign In</button>
        </form>

        <p class="privacy-note">
          By continuing, you acknowledge the university's acceptable use and data privacy policies.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  width: 100%;
  min-height: 100vh;
  color: #39090c;
  background: #efdfdf;
  font-family: Arial, sans-serif;
}

.welcome-panel {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 40px;
  color: #fff8f8;
  background: #51090e;
}

.welcome-panel::before,
.welcome-panel::after {
  position: absolute;
  width: 340px;
  height: 340px;
  border: 1px solid #a58a26;
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.welcome-panel::before {
  top: -180px;
  right: -145px;
}

.welcome-panel::after {
  bottom: -200px;
  left: -170px;
}

.brand {
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 12px;
  background: #79353b;
  font-family: Georgia, serif;
  font-size: 23px;
  font-weight: bold;
}

.brand h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 25px;
}

.brand p {
  margin: 4px 0 0;
  color: #e0bfc1;
  font-size: 14px;
}

.welcome-copy {
  z-index: 1;
  max-width: 480px;
  margin: auto 0;
}

.eyebrow {
  margin: 0 0 12px;
  color: #d8b6b8;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 3px;
}

.welcome-copy h1,
.form-content h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 3vw, 42px);
  line-height: 1.2;
}

.description {
  max-width: 360px;
  margin-top: 20px;
  color: #e0c7c8;
  font-size: 14px;
  line-height: 1.7;
}

.tagline {
  z-index: 1;
  margin: 0;
  color: #e0bfc1;
  font-family: Georgia, serif;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}

.form-panel {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-content {
  width: 100%;
  max-width: 520px;
}

.eyebrow.dark {
  margin-bottom: 10px;
  color: #79585a;
}

.form-content h1 {
  font-size: clamp(26px, 3vw, 38px);
}

.subtitle {
  margin: 10px 0 30px;
  color: #72595a;
  font-size: 14px;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  padding: 26px;
  border: 1px solid #650f18;
  border-radius: 10px;
  background: #fffafa;
  box-shadow: 0 3px 8px #39090c18;
}

.login-form label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: bold;
}

.login-form input {
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #bda3a4;
  border-radius: 7px;
  outline-color: #650f18;
  background: white;
  font-size: 14px;
}

.login-form > input {
  margin-bottom: 22px;
}

.password-field {
  position: relative;
  margin-bottom: 22px;
}

.password-field input {
  padding-right: 60px;
}

.show-button {
  position: absolute;
  top: 0;
  right: 8px;
  height: 44px;
  border: 0;
  color: #650f18;
  background: transparent;
  cursor: pointer;
}

.submit-button {
  min-height: 46px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: #650f18;
  font-weight: bold;
  cursor: pointer;
}

.submit-button:hover {
  background: #4d080e;
}

.error-message {
  margin: -10px 0 16px;
  color: #a00020;
  font-size: 13px;
}

.privacy-note {
  margin: 22px 0 0;
  color: #72595a;
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
}

@media (max-width: 700px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .welcome-panel {
    min-height: 220px;
    padding: 22px;
  }

  .brand-logo {
    width: 44px;
    height: 44px;
    font-size: 19px;
  }

  .brand h2 {
    font-size: 21px;
  }

  .welcome-copy {
    margin: 28px 0 24px;
  }

  .welcome-copy h1 {
    font-size: 27px;
  }

  .description {
    margin-top: 10px;
    font-size: 12px;
  }

  .tagline {
    text-align: left;
    font-size: 11px;
  }

  .form-panel {
    padding: 28px 20px;
  }

  .login-form {
    padding: 20px;
  }
}
</style>
