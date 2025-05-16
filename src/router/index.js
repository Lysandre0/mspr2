import { createRouter, createWebHistory } from 'vue-router'
import Register from '../components/Register.vue'
import Login from '../components/Login.vue'
import QRCode from '../components/QRCode.vue'
import Success from '../components/Success.vue'

import '../assets/tailwind.css'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/qrcode', component: QRCode },
  { path: '/success', component: Success },

  // les autres routes à ajouter : /login, /qrcode, /success
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})