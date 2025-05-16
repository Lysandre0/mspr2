<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Authentification OTP</h1>

      <p v-if="qrError" class="text-center text-red-500 mb-4">{{ qrError }}</p>

      <p v-if="otpUri" class="text-center text-gray-600 mb-4">
        Scannez ce QR Code avec votre application
      </p>

      <div v-if="otpUri" class="flex justify-center mb-6">
        <qrcode-vue :value="otpUri" :size="180" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Code à usage unique</label>
        <input
          v-model="otpCode"
          type="text"
          placeholder="Entrez le code à usage unique"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <button
        @click="verifyCode"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Envoyer
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

const email = localStorage.getItem('email')
const password = localStorage.getItem('password')

onMounted(async () => {
  if (!email) {
    qrError.value = "Aucun email trouvé. Veuillez recommencer l'inscription."
    return
  }

  try {
    const response = await axios.post(
      'http://172.16.150.40:8080/function/qr-code-gen',
      {
        username: email,
        issuer: 'COFRAP'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    otpUri.value = response.data.otpauth_url
  } catch (error) {
    qrError.value = "Erreur lors de la génération du QR Code : " +
      (error.response?.data || error.message)
    console.error("QR code error:", error)
  }
})

const verifyCode = async () => {
  if (!otpCode.value) {
    alert("Veuillez entrer le code OTP.")
    return
  }

  try {
    const res = await axios.post(
      'http://172.16.150.40:8080/function/create-user',
      {
        email,
        password,
        otp: otpCode.value
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (res.data.success) {
      localStorage.removeItem('password')
      router.push('/success')
    } else {
      alert("Code OTP invalide ou création du compte échouée.")
    }
  } catch (error) {
    alert("Erreur lors de la vérification : " + (error.response?.data || error.message))
    console.error("OTP verification error:", error)
  }
}
</script>
