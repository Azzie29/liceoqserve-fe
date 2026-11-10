
<template>
  <div class="login-page">
    <!-- LEFT PANEL -->
    <section class="login-left">
      <div class="circle circle-top"></div>
      <div class="circle circle-bottom"></div>

      <div class="brand">
        <span>LiceoQServe</span>
      </div>

      <div class="left-content">
        <p class="eyebrow">STAFF PORTAL</p>

        <h1>
          Campus services without
          the unnecessary wait.
        </h1>

        <p class="description">
          Manage queues, appointments, requests, and campus service
          updates in one place.
        </p>
      </div>

      <div class="left-footer">
        QUEUE. SCHEDULE. SERVE
      </div>
    </section>

    <!-- RIGHT PANEL -->
    <section class="login-right">
      <div class="login-container">
        <header class="login-heading">
          <p class="welcome">WELCOME BACK</p>
          <h2>Sign in to your account.</h2>
          <p class="subtitle">
            Enter your service/office account details to continue.
          </p>
        </header>

        <form class="login-form" @submit.prevent="handleLogin">
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
                minlength="8"
                required
              />

              <button
                type="button"
                class="show-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember">
              <input v-model="rememberMe" type="checkbox" />
              <span>Keep me signed in</span>
            </label>

            <a href="#" @click.prevent="forgotPassword">
              Forgot Password?
            </a>
          </div>

          <button class="sign-in-button" type="submit">
            Sign In
          </button>
        </form>

        <p class="privacy-note">
          By continuing, you acknowledge the university's acceptable use
          and data privacy policies.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(true);

const emit = defineEmits(["login", "forgot-password"]);

function handleLogin() {
  emit("login", {
    email: email.value,
    password: password.value,
    rememberMe: rememberMe.value,
  });
}

function forgotPassword() {
  emit("forgot-password");
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 47.5% 52.5%;
  font-family: Arial, Helvetica, sans-serif;
}

/* LEFT PANEL */

.login-left {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #5b0710;
  color: #ffffff;
  padding: 12% 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand {
  position: absolute;
  top: 20%;
  left: 5%;
}

.brand span {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  font-family: Georgia, serif;
  font-size: 17px;
  font-weight: bold;
  color: #e8c6c8;
}

.left-content {
  position: relative;
  z-index: 2;
  max-width: 580px;
  margin-top: 45px;
}

.eyebrow {
  letter-spacing: 4px;
  font-weight: bold;
  font-size: 14px;
  color: #e0b8bb;
  margin-bottom: 24px;
}

.left-content h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(35px, 3vw, 52px);
  line-height: 1.2;
  font-weight: normal;
  margin: 0 0 25px;
}

.description {
  max-width: 450px;
  font-size: 15px;
  line-height: 1.8;
  color: #e6c7c9;
}

.left-footer {
  position: absolute;
  bottom: 9%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: Georgia, serif;
  font-size: 19px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #e8c6c8;
}

/* DECORATIVE CIRCLES */

.circle {
  position: absolute;
  width: 300px;
  height: 300px;
  border: 1px solid #a58a00;
  border-radius: 50%;
  pointer-events: none;
}

.circle-top {
  top: -155px;
  right: -140px;
}

.circle-bottom {
  bottom: -155px;
  left: -140px;
}

/* RIGHT PANEL */

.login-right {
  min-height: 100vh;
  background: #f2e5e4;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
}

.login-container {
  width: 100%;
  max-width: 555px;
}

.login-heading {
  margin-bottom: 50px;
}

.welcome {
  font-size: 13px;
  letter-spacing: 4px;
  color: #5b0710;
  margin-bottom: 10px;
}

.login-heading h2 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(30px, 3vw, 43px);
  font-weight: normal;
  color: #30070b;
  margin: 0 0 10px;
}

.subtitle {
  font-size: 14px;
  color: #684c4e;
}

/* LOGIN FORM */

.login-form {
  background: #ffffff;
  border: 1px solid #781c27;
  border-radius: 11px;
  padding: 32px 29px;
  box-shadow: 0 5px 9px rgba(0, 0, 0, 0.12);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #241315;
  font-size: 14px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  height: 49px;
  border: 1px solid #c8a9ac;
  border-radius: 7px;
  padding: 0 15px;
  font-size: 14px;
  outline: none;
  color: #301014;
}

.form-group input:focus {
  border-color: #790d1b;
  box-shadow: 0 0 0 2px rgba(121, 13, 27, 0.08);
}

.form-group input::placeholder {
  color: #b58f93;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 65px;
}

.show-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #8b1020;
  cursor: pointer;
  font-size: 13px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: -5px 0 35px;
  font-size: 13px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #4a3436;
}

.remember input {
  accent-color: #710b19;
  width: 15px;
  height: 15px;
}

.form-options a {
  color: #8b1020;
  text-decoration: none;
}

.form-options a:hover {
  text-decoration: underline;
}

.sign-in-button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 30px;
  background: #710b19;
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.sign-in-button:hover {
  background: #520710;
}

.privacy-note {
  margin-top: 30px;
  text-align: center;
  font-size: 12px;
  line-height: 1.7;
  color: #806467;
}

/* RESPONSIVE */

@media (max-width: 850px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    min-height: 350px;
    padding: 60px 30px;
  }

  .brand {
    top: 25px;
    left: 30px;
  }

  .left-content {
    margin-top: 65px;
  }

  .left-footer {
    display: none;
  }

  .login-right {
    min-height: 600px;
    padding: 45px 25px;
  }
}

@media (max-width: 480px) {
  .login-form {
    padding: 25px 20px;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
