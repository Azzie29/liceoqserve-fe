import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import Dashboard from './views/registrar/Dashboard.vue'
import Queue from './views/registrar/Queue.vue'
import Appointments from './views/registrar/Appointments.vue'
import Requests from './views/registrar/Requests.vue'
import Students from './views/registrar/Students.vue'
import Notification from './views/registrar/Notifications.vue'
import History from './views/registrar/History.vue'
import Profile from './views/registrar/Profile.vue'

const routes = [
  { path: '/', redirect: '/registrar/dashboard' },
  { path: '/registrar', redirect: '/registrar/dashboard' },
  { path: '/registrar/dashboard', component: Dashboard },
  { path: '/registrar/queue', component: Queue },
  { path: '/registrar/appointments', component: Appointments },
  { path: '/registrar/requests', component: Requests },
  { path: '/registrar/students', component: Students },
  { path: '/registrar/notifications', component: Notification },
  { path: '/registrar/history', component: History },
  { path: '/registrar/profile', component: Profile },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App)
  .use(router)
  .mount('#app')
