<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/cuenta')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="/logo.png" alt="Evobike" />
      </div>
      <h1 class="auth-title">Iniciar sesión</h1>
      <p class="auth-subtitle">Bienvenido de nuevo a Evobike Elite</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="email" type="email" placeholder="correo@ejemplo.com" required />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" placeholder="Tu contraseña" required />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="auth-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <p class="auth-switch">
        ¿No tienes cuenta? <RouterLink to="/registro">Regístrate gratis</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f9fafb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.auth-logo { text-align: center; margin-bottom: 2rem; }
.auth-logo img { height: 50px; width: auto; }

.auth-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a1a;
  text-align: center;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 2rem 0;
}

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }

.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.4rem; 
  min-width: 0; 
}

.form-group label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  outline: none;
  font-family: 'Poppins', sans-serif;
}

.form-group input:focus { border-color: var(--color-brand, #0a6837); }

.auth-error {
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  margin: 0;
}

.auth-btn {
  background-color: var(--color-brand, #0a6837);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
}

.auth-btn:hover:not(:disabled) {
  background-color: #08502b;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(10, 104, 55, 0.25);
}

.auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.auth-switch a {
  color: var(--color-brand, #0a6837);
  font-weight: 600;
  text-decoration: none;
}
</style>
