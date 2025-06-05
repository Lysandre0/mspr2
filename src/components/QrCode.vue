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
        <qrcode-vue :value="otpUri" :size="180" level="H" />
      </div>

      <form @submit.prevent="verifyCode" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Code à usage unique</label>
          <input
            v-model="otpCode"
            type="text"
            placeholder="Entrez le code à usage unique"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :class="{ 'border-red-500': otpError }"
            :disabled="isLoading"
            @input="validateOtpField"
          />
          <p v-if="otpError" class="mt-1 text-sm text-red-600">{{ otpError }}</p>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !otpUri"
        >
          {{ isLoading ? 'Chargement...' : 'Envoyer' }}
        </button>
      </form>

      <p class="text-center text-sm mt-4">
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">Retour à l'inscription</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const otpUri = ref('')
const otpCode = ref('')
const qrError = ref('')
const otpError = ref('')
const isLoading = ref(false)
const retryCount = ref(0)
const maxRetries = 3
let retryTimeout = null

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.16.150.40:8080'

const validateOtpField = () => {
  if (!otpCode.value) {
    otpError.value = "Le code OTP est requis"
  } else if (!/^\d{6}$/.test(otpCode.value)) {
    otpError.value = "Le code OTP doit contenir 6 chiffres"
  } else {
    otpError.value = ''
  }
}

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

const generateQRCode = async () => {
  const storedData = getStoredData()
  if (!storedData) {
    qrError.value = "Données d'inscription manquantes. Veuillez recommencer l'inscription."
    return
  }

  try {
    isLoading.value = true
    console.log('Envoi de la requête QR code pour:', storedData.email)
    
    const response = await axios.post(
      `${API_BASE_URL}/function/qr-code-gen`,
      {
        username: storedData.email,
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
      qrError.value = ''
      retryCount.value = 0
    } else {
      throw new Error('Format de réponse invalide')
    }
  } catch (error) {
    console.error("QR code error:", error)
    if (error.code === 'ECONNABORTED') {
      qrError.value = "Le serveur met trop de temps à répondre. Veuillez réessayer."
    } else if (error.response) {
      qrError.value = `Erreur serveur: ${error.response.data?.message || error.response.data || error.response.statusText}`
    } else if (error.request) {
      qrError.value = "Impossible de contacter le serveur. Veuillez vérifier votre connexion."
    } else {
      qrError.value = "Une erreur est survenue lors de la génération du QR Code."
    }

    // Tentative de reconnexion
    if (retryCount.value < maxRetries) {
      retryCount.value++
      retryTimeout = setTimeout(generateQRCode, 2000 * retryCount.value)
    }
  } finally {
    isLoading.value = false
  }
}

const verifyCode = async () => {
  if (!otpCode.value) {
    otpError.value = "Veuillez entrer le code à usage unique"
    return
  }

  if (!/^\d{6}$/.test(otpCode.value)) {
    otpError.value = "Le code doit contenir exactement 6 chiffres"
    return
  }

  try {
    isLoading.value = true
    otpError.value = ''

    const storedData = getStoredData()
    if (!storedData) {
      otpError.value = "Données d'inscription manquantes"
      return
    }

    console.log('Données stockées récupérées:', {
      email: storedData.email,
      password: '***'
    })

    const requestData = {
      username: storedData.email.trim(),
      password: storedData.password,
      otp: otpCode.value.trim()
    }

    console.log('Données envoyées à l\'API:', {
      ...requestData,
      password: '***'
    })

    const response = await axios.post(
      `${API_BASE_URL}/function/create-user`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500
        }
      }
    )

    console.log('Réponse API:', response.data)

    // Si l'utilisateur est créé avec succès (même si l'API renvoie une erreur)
    if (response.status === 200 || response.status === 201 || response.status === 409) {
      // Nettoyage des données sensibles
      localStorage.removeItem('email')
      localStorage.removeItem('password')
      
      // Redirection vers la page de succès
      router.push('/success')
    } else {
      // Gestion des erreurs spécifiques
      if (response.status === 400) {
        otpError.value = response.data.message || response.data.error || "Format de données invalide"
      } else if (response.status === 401) {
        otpError.value = "Code OTP invalide"
      } else if (response.status === 409) {
        otpError.value = "Un compte existe déjà avec cet email"
      } else {
        otpError.value = response.data.message || response.data.error || `Erreur serveur (${response.status})`
      }
    }
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error)
    if (error.code === 'ECONNABORTED') {
      otpError.value = "Le serveur met trop de temps à répondre. Veuillez réessayer."
    } else if (error.response) {
      const status = error.response.status
      const data = error.response.data

      if (status === 400) {
        otpError.value = data.message || data.error || "Format de données invalide"
      } else if (status === 401) {
        otpError.value = "Code OTP invalide"
      } else if (status === 409) {
        // Si l'utilisateur existe déjà, on considère que c'est un succès
        localStorage.removeItem('email')
        localStorage.removeItem('password')
        router.push('/success')
      } else {
        otpError.value = data.message || data.error || `Erreur serveur (${status})`
      }
    } else if (error.request) {
      otpError.value = "Impossible de contacter le serveur. Veuillez vérifier votre connexion."
    } else {
      otpError.value = "Une erreur est survenue lors de la création du compte."
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  generateQRCode()
})

onBeforeUnmount(() => {
  if (retryTimeout) {
    clearTimeout(retryTimeout)
  }
})
</script>
