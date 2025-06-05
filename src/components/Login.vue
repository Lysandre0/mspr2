<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Connexion</h1>

      <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail</label>
          <input
            v-model="email"
            type="email"
            placeholder="Entrez votre adresse mail"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :class="{ 'border-red-500': emailError }"
            @input="validateEmailField"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            placeholder="Entrez votre mot de passe"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :class="{ 'border-red-500': passwordError }"
            @input="validatePasswordField"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Code à usage unique</label>
          <input
            v-model="otp"
            type="text"
            placeholder="Entrez le code à usage unique"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :class="{ 'border-red-500': otpError }"
            @input="validateOtpField"
          />
          <p v-if="otpError" class="mt-1 text-sm text-red-600">{{ otpError }}</p>
        </div>

        <button
          type="submit"
          class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Chargement...' : 'Envoyer' }}
        </button>
      </form>

      <p class="text-center text-sm mt-4">
        Vous n'avez pas encore de compte ?
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">S'inscrire</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import CryptoJS from 'crypto-js'

const email = ref('')
const password = ref('')
const otp = ref('')
const router = useRouter()
const error = ref('')
const isLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const otpError = ref('')

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.16.150.40:8080'

const validateEmailField = () => {
  if (!email.value) {
    emailError.value = "L'adresse email est requise"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = "Veuillez entrer une adresse email valide"
  } else {
    emailError.value = ''
  }
}

const validatePasswordField = () => {
  if (!password.value) {
    passwordError.value = "Le mot de passe est requis"
  } else {
    passwordError.value = ''
  }
}

const validateOtpField = () => {
  if (!otp.value) {
    otpError.value = "Le code OTP est requis"
  } else if (!/^\d{6}$/.test(otp.value)) {
    otpError.value = "Le code OTP doit contenir 6 chiffres"
  } else {
    otpError.value = ''
  }
}

const encryptPassword = (password) => {
  // Utilisation de SHA-256 pour le hachage du mot de passe
  return CryptoJS.SHA256(password).toString()
}

const handleLogin = async () => {
  // Validation des champs
  validateEmailField()
  validatePasswordField()
  validateOtpField()

  if (emailError.value || passwordError.value || otpError.value) {
    return
  }

  try {
    isLoading.value = true

    // Récupération des données utilisateur
    const userRes = await axios.post(
      `${API_BASE_URL}/function/pg-list-user`,
      email.value,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    )

    console.log('Réponse API:', userRes.data)

    if (!userRes.data || !Array.isArray(userRes.data) || userRes.data.length === 0) {
      error.value = "Utilisateur non trouvé."
      return
    }

    const user = userRes.data[0]
    // Vérification du mot de passe (sans chiffrement car déjà en clair dans la base)
    if (user[2] !== password.value) {
      error.value = "Mot de passe incorrect."
      return
    }

    // Vérification du code OTP
    const otpRes = await axios.post(
      `${API_BASE_URL}/function/verify-otp`,
      {
        username: email.value,
        otp: otp.value
      }
    )

    if (otpRes.data.success) {
      localStorage.setItem('email', email.value)
      router.push('/success')
    } else {
      error.value = "Code OTP invalide."
    }
  } catch (error) {
    console.error("Login error:", error)
    if (error.code === 'ECONNABORTED') {
      error.value = "Le serveur met trop de temps à répondre. Veuillez réessayer."
    } else if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 400) {
        error.value = data.message || data.error || "Format de données invalide."
      } else if (status === 401) {
        error.value = "Identifiants incorrects."
      } else if (status === 403) {
        error.value = "Code OTP invalide."
      } else {
        error.value = data.message || data.error || `Erreur serveur (${status})`
      }
    } else if (error.request) {
      error.value = "Impossible de contacter le serveur. Veuillez vérifier votre connexion."
    } else {
      error.value = "Une erreur est survenue lors de la connexion."
    }
  } finally {
    isLoading.value = false
  }
}
</script>
