<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Connexion</h1>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse mail</label>
          <input
            v-model="email"
            type="email"
            placeholder="Entrez votre adresse mail"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            placeholder="Entrez votre mot de passe"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Code à usage unique</label>
          <input
            v-model="otp"
            type="text"
            placeholder="Entrez le code à usage unique"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <button
        @click="handleLogin"
        class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Envoyer
      </button>

      <p class="text-center text-sm mt-4">
        Vous n’avez pas encore de compte ?
        <router-link to="/register" class="text-blue-600 font-medium hover:underline">S’inscrire</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const otp = ref('')
const router = useRouter()

const handleLogin = async () => {
  if (!email.value || !password.value || !otp.value) {
    alert("Tous les champs sont requis.")
    return
  }

  try {
    const loginRes = await axios.post('https://<TON_OPENFAAS>/function/verify-login', {
      email: email.value,
      password: password.value,
    })

    if (!loginRes.data.success) {
      alert("Identifiants incorrects.")
      return
    }

    const otpRes = await axios.post('https://<TON_OPENFAAS>/function/verify-otp', {
      email: email.value,
      otp: otp.value,
    })

    if (otpRes.data.success) {
      localStorage.setItem('email', email.value)
      router.push('/success')
    } else {
      alert("Code OTP invalide.")
    }
  } catch (error) {
    alert("Erreur lors de la connexion : " + (error.response?.data || error.message))
    console.error(error)
  }
}
</script>
