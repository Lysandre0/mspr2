<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
    <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Créer un compte</h1>

      <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <form @submit.prevent="goToQRCode" class="space-y-4">
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
            placeholder="Entrez un mot de passe"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :class="{ 'border-red-500': passwordError }"
            @input="validatePasswordField"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer mot de passe</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmez le mot de passe"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :class="{ 'border-red-500': confirmPasswordError }"
            @input="validateConfirmPasswordField"
          />
          <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
        </div>

        <button
          type="submit"
          class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Chargement...' : 'Suivant' }}
        </button>
      </form>

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

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)

// Erreurs de validation
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePassword = (password) => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return re.test(password)
}

const validateEmailField = () => {
  if (!email.value) {
    emailError.value = "L'adresse email est requise"
  } else if (!validateEmail(email.value)) {
    emailError.value = "Veuillez entrer une adresse email valide"
  } else {
    emailError.value = ''
  }
}

const validatePasswordField = () => {
  if (!password.value) {
    passwordError.value = "Le mot de passe est requis"
  } else if (!validatePassword(password.value)) {
    passwordError.value = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
  } else {
    passwordError.value = ''
  }
  // Valider aussi la confirmation si elle existe
  if (confirmPassword.value) {
    validateConfirmPasswordField()
  }
}

const validateConfirmPasswordField = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = "La confirmation du mot de passe est requise"
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = "Les mots de passe ne correspondent pas"
  } else {
    confirmPasswordError.value = ''
  }
}

const clearLocalStorage = () => {
  localStorage.removeItem('email')
  localStorage.removeItem('password')
}

const goToQRCode = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // Validation des champs
    validateEmailField()
    validatePasswordField()
    validateConfirmPasswordField()

    if (emailError.value || passwordError.value || confirmPasswordError.value) {
      throw new Error('Veuillez corriger les erreurs dans le formulaire')
    }

    // Nettoyage des anciennes données
    clearLocalStorage()

    // Stockage des nouvelles données
    localStorage.setItem('email', email.value)
    localStorage.setItem('password', password.value)
    
    // Vérification du stockage
    const storedEmail = localStorage.getItem('email')
    const storedPassword = localStorage.getItem('password')
    
    if (!storedEmail || !storedPassword) {
      throw new Error('Erreur lors du stockage des données')
    }
    
    console.log('Données stockées avec succès:', { email: storedEmail })
    
    // Navigation vers la page QR code
    await router.push('/qrcode')
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err)
    error.value = err.message || "Une erreur est survenue lors de l'enregistrement des données. Veuillez réessayer."
  } finally {
    isLoading.value = false
  }
}
</script>
