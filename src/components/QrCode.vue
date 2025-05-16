<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Authentification OTP</h1>
      <p class="text-center text-gray-600 mb-4">Scannez ce QR Code avec votre application</p>

      <div class="flex justify-center mb-6">
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
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">Annuler</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import { useRouter } from 'vue-router'

const email = localStorage.getItem('email')
const otpUri = ref('')
const otpCode = ref('')
const router = useRouter()

onMounted(async () => {
  try {
    const res = await axios.post('https://<TON_OPENFAAS>/function/generate-otp-secret', {
      email
    })

    otpUri.value = res.data.otpAuthUrl
  } catch (error) {
    alert("Erreur lors de la génération du QR code.")
    console.error(error)
  }
})

const verifyCode = async () => {
  try {
    const res = await axios.post('https://<TON_OPENFAAS>/function/verify-otp', {
      email,
      otp: otpCode.value
    })

    if (res.data.success) {
      router.push('/success')
    } else {
      alert("Code OTP invalide.")
    }
  } catch (error) {
    alert("Erreur lors de la vérification : " + (error.response?.data || error.message))
    console.error(error)
  }
}
</script>
