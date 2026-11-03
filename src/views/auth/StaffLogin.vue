
<template>
  <div class="login-page">
    <div class="login-container">

      <!-- LEFT BRANDING PANEL -->
      <section class="branding-panel">
        <div class="circle circle-top"></div>
        <div class="circle circle-bottom"></div>

        <div class="brand-content">
          <div class="brand-logo">LiceoQServe</div>

          <p class="portal-label">STAFF PORTAL</p>

          <h1>Campus services without<br />the unnecessary wait.</h1>

          <p class="brand-description">
            Manage queues, appointments, requests, and campus service
            updates in one place.
          </p>
        </div>

        <div class="brand-footer">
          QUEUE. SCHEDULE. SERVE
        </div>
      </section>

      <!-- RIGHT LOGIN PANEL -->
      <section class="login-panel">
        <div class="login-content">

          <div class="welcome-text">
            <p class="eyebrow">WELCOME BACK</p>
            <h2>Sign in to your account.</h2>
            <p>Enter your service/office account details to continue.</p>
          </div>

          <form class="login-form" @submit.prevent="login">

            <div class="form-group">
              <label for="email">University Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="servicestaff@liceo.edu.ph"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>

              <div class="password-wrapper">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="enter at least 8 characters"
                  required
                />

                <button
                  type="button"
                  class="show-password"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="remember-option">
                <input type="checkbox" v-model="keepSignedIn" />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                class="forgot-password"
                @click="showForgotMessage"
              >
                Forgot Password?
              </button>
            </div>

            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>

            <p v-if="successMessage" class="success-message">
              {{ successMessage }}
            </p>

            <button
              type="submit"
              class="sign-in-button"
              :disabled="loading"
            >
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

          </form>

          <p class="policy-text">
            By continuing, you acknowledge the university's
            acceptable use and data privacy policies.
          </p>

        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepSignedIn = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function showForgotMessage() {
  errorMessage.value = ''
  successMessage.value =
    'Please contact your office administrator to reset your password.'
}

async function login() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) throw error

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, office_id, is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      throw new Error(
        'Staff profile not found. Please contact the administrator.'
      )
    }

    if (!['staff', 'admin'].includes(profile.role) || !profile.is_active) {
      await supabase.auth.signOut()
      throw new Error(
        'Your account is not authorized to access the staff portal.'
      )
    }

    await router.push('/registrar/dashboard')

  } catch (error) {
    errorMessage.value = error.message || 'Unable to sign in.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
  background: #f0e2e2;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  width: 100%;
  max-width: none;
  min-height: 100vh;
  overflow: hidden;
  background: #f0e2e2;
}

/* LEFT PANEL */

.branding-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 55px 45px 40px;
  color: white;
  background: #56090f;
}

.brand-content {
  position: relative;
  z-index: 2;
  margin-top: 90px;
}

.brand-logo {
  display: inline-block;
  padding: 9px 12px;
  margin-bottom: 38px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.08);
  color: #d6b6b8;
  font-family: Georgia, serif;
  font-size: 15px;
  font-weight: bold;
}

.portal-label {
  margin-bottom: 17px;
  color: #c99a9d;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 3px;
}

.brand-content h1 {
  margin: 0 0 20px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 3vw, 43px);
  font-weight: normal;
  line-height: 1.2;
}

.brand-description {
  max-width: 390px;
  color: #d7b8ba;
  font-size: 13px;
  line-height: 1.7;
}

.brand-footer {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #d5b2b5;
  font-family: Georgia, serif;
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* GOLD CIRCULAR ACCENTS */

.circle {
  position: absolute;
  width: 410px;
  height: 410px;
  border: 1px solid #a78a13;
  border-radius: 50%;
  pointer-events: none;
}

.circle-top {
  top: -200px;
  right: -145px;
}

.circle-bottom {
  bottom: -205px;
  left: -120px;
}

/* RIGHT PANEL */

.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 55px;
  background: #f0e2e2;
}

.login-content {
  width: 100%;
  max-width: 480px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #3b292c;
  font-size: 11px;
  letter-spacing: 3px;
}

.welcome-text h2 {
  margin: 0 0 8px;
  color: #35080c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(27px, 3vw, 38px);
  font-weight: normal;
}

.welcome-text > p:last-child {
  margin: 0 0 45px;
  color: #594548;
  font-size: 12px;
}

/* LOGIN FORM */

.login-form {
  padding: 28px 25px;
  border: 1px solid #650b18;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 4px 5px rgba(50, 10, 15, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}

.form-group label {
  color: #3b292c;
  font-size: 12px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #b99b9e;
  border-radius: 6px;
  outline: none;
  color: #3b292c;
  background: white;
  font-size: 12px;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #650b18;
  box-shadow: 0 0 0 2px rgba(101, 11, 24, 0.08);
}

.form-group input::placeholder {
  color: #a18b8e;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 55px;
}

.show-password {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  color: #9b2633;
  background: transparent;
  font-size: 11px;
  cursor: pointer;
}

/* FORM OPTIONS */

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: -8px;
  margin-bottom: 27px;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #554346;
  font-size: 11px;
}

.remember-option input {
  accent-color: #650b18;
}

.forgot-password {
  padding: 0;
  border: none;
  color: #9b2633;
  background: transparent;
  font-size: 11px;
  cursor: pointer;
}

/* SIGN IN BUTTON */

.sign-in-button {
  width: 100%;
  height: 43px;
  border: none;
  border-radius: 20px;
  color: white;
  background: #650b18;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s;
  cursor: pointer;
}

.sign-in-button:hover {
  background: #4c0711;
}

.sign-in-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error-message,
.success-message {
  margin: 0 0 15px;
  font-size: 12px;
  line-height: 1.5;
}

.error-message {
  color: #b42318;
}

.success-message {
  color: #286b43;
}

.policy-text {
  margin: 25px 0 0;
  color: #786366;
  text-align: center;
  font-size: 10px;
  line-height: 1.6;
}

/* RESPONSIVE */

@media (max-width: 800px) {
  .login-page {
    padding: 0;
  }

  .login-container {
    grid-template-columns: 1fr;
    max-width: 100%;
    min-height: 100vh;
  }

  .branding-panel {
    min-height: 260px;
    padding: 30px;
  }

  .brand-content {
    margin-top: 15px;
  }

  .brand-logo {
    margin-bottom: 20px;
  }

  .brand-content h1 {
    font-size: 29px;
  }

  .brand-footer {
    margin-top: 30px;
    font-size: 13px;
  }

  .login-panel {
    padding: 40px 25px;
  }

  .welcome-text > p:last-child {
    margin-bottom: 28px;
  }
}

@media (max-width: 420px) {
  .login-page {
    padding: 0;
  }

  .login-container {
    min-height: 100vh;
  }

  .login-panel {
    padding: 35px 18px;
  }

  .login-form {
    padding: 23px 17px;
  }
}
</style>
