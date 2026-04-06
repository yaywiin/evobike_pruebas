<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const isOpen = ref(false)
const userInput = ref('')
const messages = ref([])
const isLoading = ref(false)
const chatContainer = ref(null)
const sessionId = ref('')

// Genera un UUID v4 simple
const generateSessionId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Cargar o crear sessionId y historial
onMounted(() => {
  // Session ID: persiste mientras no se limpie el chat
  const savedSession = localStorage.getItem('evobike_session_id')
  if (savedSession) {
    sessionId.value = savedSession
  } else {
    sessionId.value = generateSessionId()
    localStorage.setItem('evobike_session_id', sessionId.value)
  }

  const savedMessages = localStorage.getItem('evobike_chat_history')
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  } else {
    messages.value.push({
      role: 'bot',
      content: '¡Bienvenido/a a EvoBike! Estamos aquí para ayudarte.'
    })
  }
  scrollToBottom()
})

watch(messages, (newMessages) => {
  localStorage.setItem('evobike_chat_history', JSON.stringify(newMessages))
  scrollToBottom()
}, { deep: true })

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMsg = userInput.value.trim()
  messages.value.push({ role: 'user', content: userMsg })
  userInput.value = ''
  isLoading.value = true

  try {
    const response = await fetch('https://yaywiin.app.n8n.cloud/webhook/agente_evobike', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMsg, sessionId: sessionId.value })
    })

    if (!response.ok) throw new Error('Network response was not ok')

    const data = await response.json()
    
    // n8n response format might vary, assuming a string or { output: string }
    const botResponse = typeof data === 'string' ? data : (data.output || data.message || 'Lo siento, no pude procesar tu solicitud.')
    
    messages.value.push({ role: 'bot', content: botResponse })
  } catch (error) {
    console.error('Error calling n8n:', error)
    messages.value.push({ 
      role: 'bot', 
      content: 'Hubo un error al conectar con el asistente. Por favor, intenta de nuevo más tarde.' 
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const clearHistory = () => {
  // Nueva sesión al limpiar el historial
  sessionId.value = generateSessionId()
  localStorage.setItem('evobike_session_id', sessionId.value)
  localStorage.removeItem('evobike_chat_history')
  messages.value = [{
    role: 'bot',
    content: '¡Bienvenido/a a EvoBike! Estamos aquí para ayudarte.'
  }]
}
</script>

<template>
  <div class="chat-widget" :class="{ 'is-open': isOpen }">
    <!-- Chat Window -->
    <transition name="fade-slide">
      <div v-if="isOpen" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-info">
            <div class="bot-avatar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
                <path d="M8 11.5C8.82843 11.5 9.5 10.8284 9.5 10C9.5 9.17157 8.82843 8.5 8 8.5C7.17157 8.5 6.5 9.17157 6.5 10C6.5 10.8284 7.17157 11.5 8 11.5Z" fill="white"/>
                <path d="M16 11.5C16.8284 11.5 17.5 10.8284 17.5 10C17.5 9.17157 16.8284 8.5 16 8.5C15.1716 8.5 14.5 9.17157 14.5 10C14.5 10.8284 15.1716 11.5 16 11.5Z" fill="white"/>
                <path d="M7 16C7 16 9 18 12 18C15 18 17 16 17 16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="header-text">
              <h3>EvoBot</h3>
              <span class="status">En línea</span>
            </div>
          </div>
          <div class="header-actions">
            <button @click="clearHistory" title="Limpiar historial" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <button @click="toggleChat" class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="messages-container" ref="chatContainer">
          <div v-for="(msg, index) in messages" :key="index" :class="['message-wrapper', msg.role]">
            <div class="message-bubble">
              <p>{{ msg.content }}</p>
            </div>
          </div>
          <div v-if="isLoading" class="message-wrapper bot">
            <div class="message-bubble loading">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <form @submit.prevent="sendMessage" class="input-area">
          <input 
            v-model="userInput" 
            placeholder="Escribe tu mensaje..." 
            type="text"
            :disabled="isLoading"
          />
          <button type="submit" :disabled="!userInput.trim() || isLoading" class="send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </transition>

    <!-- Floating Bubble -->
    <button @click="toggleChat" class="chat-bubble" :aria-label="isOpen ? 'Cerrar chat' : 'Abrir chat'">
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-widget {
  position: fixed;
  left: 1.5rem;
  bottom: 2.5rem;
  z-index: 1000;
  font-family: 'Poppins', sans-serif;
}

/* ─── Chat Bubble ─────────────────────────────────────────────────── */
.chat-bubble {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #09AC22 0%, #25D366 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(9, 172, 34, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-bubble:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(9, 172, 34, 0.5);
}

.chat-bubble:active {
  transform: scale(0.95);
}

/* ─── Chat Window ────────────────────────────────────────────────── */
.chat-window {
  position: absolute;
  bottom: 80px;
  left: 0;
  width: 380px;
  height: 550px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Header */
.chat-header {
  padding: 1.2rem;
  background: linear-gradient(135deg, #09AC22 0%, #25D366 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.bot-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.status {
  font-size: 0.75rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Messages Area */
.messages-container {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-wrapper.user {
  align-items: flex-end;
}

.message-wrapper.bot {
  align-items: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 0.8rem 1rem;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user .message-bubble {
  background: #09AC22;
  color: white;
  border-bottom-right-radius: 4px;
}

.bot .message-bubble {
  background: white;
  color: #334155;
  border-bottom-left-radius: 4px;
}

/* Loading dots */
.loading {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

/* Input Area */
.input-area {
  padding: 1.2rem;
  background: white;
  display: flex;
  gap: 0.8rem;
  border-top: 1px solid #e2e8f0;
}

.input-area input {
  flex: 1;
  border: 1px solid #e2e8f0;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.input-area input:focus {
  border-color: #09AC22;
}

.send-btn {
  background: #09AC22;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #08961d;
  transform: translateY(-2px);
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* Responsive */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 2rem);
    height: 70vh;
    left: 0;
    bottom: 70px;
  }
  
  .chat-widget {
    left: 1rem;
    bottom: 1.5rem;
  }
}
</style>
