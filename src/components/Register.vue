<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Créer un compte</h1>

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
            placeholder="Entrez un mot de passe"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer mot de passe</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmez le mot de passe"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <button
        @click="goToQRCode"
        class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Suivant
      </button>

      <p class="text-center text-sm mt-4">
        Vous avez déjà un compte ?
        <router-link to="/login" class="text-blue-600 font-medium hover:underline">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const router = useRouter()

const goToQRCode = () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    alert("Tous les champs sont requis.")
    return
  }

  if (password.value !== confirmPassword.value) {
    alert("Les mots de passe ne correspondent pas.")
    return
  }

  localStorage.setItem('email', email.value)
  localStorage.setItem('password', password.value)

  router.push('/qrcode')
}
</script>
