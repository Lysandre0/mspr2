<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center px-4">
      <div class="bg-white shadow-xl rounded-xl w-full max-w-md p-8 text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Connexion réussie ✅</h1>
        <p class="text-gray-600 mb-6">
          Vous êtes maintenant connecté(e) à votre compte.
        </p>

        <button
          @click="logout"
          class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  </template>

  <script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('email')
    router.push('/login')
  }
  </script>
  