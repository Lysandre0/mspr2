<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Authentification OTP</h1>

      <div v-if="qrError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ qrError }}
      </div>

      <p v-if="otpUri" class="text-center text-gray-600 mb-4">
        Scannez ce QR Code avec votre application
      </p>

      <div v-if="isLoading" class="flex justify-center mb-6">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="otpUri" class="flex justify-center mb-6">
        <qrcode-vue :value="otpUri" :size="180" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Code à usage unique</label>
        <input
          v-model="otpCode"
          type="text"
          placeholder="Entrez le code à usage unique"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :disabled="isLoading"
        />
      </div>

      <button
        @click="verifyCode"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Chargement...' : 'Envoyer' }}
      </button>

      <p class="text-center text-sm mt-4">
        <router-link to="/login" class="text-blue-600 font-medium hover:underline">Retour</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const otpUri = ref('')
const otpCode = ref('')
const qrError = ref('')
const isLoading = ref(false)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.16.150.40:8080'

// Récupération et vérification des données
const getStoredData = () => {
  const email = localStorage.getItem('email')
  const password = localStorage.getItem('password')
  
  console.log('Données récupérées:', { email, hasPassword: !!password })
  
  if (!email || !password) {
    console.error('Données manquantes dans le localStorage')
    return null
  }
  
  return { email, password }
}

const storedData = getStoredData()
const email = storedData?.email
const password = storedData?.password

onMounted(async () => {
  if (!email || !password) {
    qrError.value = "Données d'inscription manquantes. Veuillez recommencer l'inscription."
    console.error('Données manquantes:', { email, hasPassword: !!password })
    return
  }

  try {
    isLoading.value = true
    console.log('Envoi de la requête QR code pour:', email)
    
    const response = await axios.post(
      `${API_BASE_URL}/function/qr-code-gen`,
      {
        username: email,
        issuer: 'COFRAP'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    console.log('Réponse QR code:', response.data)

    if (response.data && response.data.otpauth_url) {
      otpUri.value = response.data.otpauth_url
    } else {
      throw new Error('Format de réponse invalide')
    }
  } catch (error) {
    console.error("QR code error:", error)
    if (error.code === 'ECONNABORTED') {
      qrError.value = "Le serveur met trop de temps à répondre. Veuillez réessayer."
    } else if (error.response) {
      qrError.value = `Erreur serveur: ${error.response.data || error.response.statusText}`
    } else if (error.request) {
      qrError.value = "Impossible de contacter le serveur. Veuillez vérifier votre connexion."
    } else {
      qrError.value = "Une erreur est survenue lors de la génération du QR Code."
    }
  } finally {
    isLoading.value = false
  }
})

const verifyCode = async () => {
  if (!otpCode.value) {
    qrError.value = "Veuillez entrer le code OTP."
    return
  }

  if (!email || !password) {
    qrError.value = "Données d'inscription manquantes. Veuillez recommencer l'inscription."
    return
  }

  try {
    isLoading.value = true
    console.log('Envoi de la requête de création de compte pour:', email)
    
    const res = await axios.post(
      `${API_BASE_URL}/function/create-user`,
      {
        email,
        password,
        otp: otpCode.value
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    console.log('Réponse création de compte:', res.data)

    if (res.data.success) {
      localStorage.removeItem('password')
      router.push('/success')
    } else {
      qrError.value = "Code OTP invalide ou création du compte échouée."
    }
  } catch (error) {
    console.error("OTP verification error:", error)
    if (error.code === 'ECONNABORTED') {
      qrError.value = "Le serveur met trop de temps à répondre. Veuillez réessayer."
    } else if (error.response) {
      qrError.value = `Erreur serveur: ${error.response.data || error.response.statusText}`
    } else if (error.request) {
      qrError.value = "Impossible de contacter le serveur. Veuillez vérifier votre connexion."
    } else {
      qrError.value = "Une erreur est survenue lors de la vérification du code."
    }
  } finally {
    isLoading.value = false
  }
}
</script>
