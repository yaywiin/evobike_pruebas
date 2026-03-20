<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  { src: '/hero1.jpeg', alt: 'Evobike Hero 1' },
  { src: '/hero2.jpeg', alt: 'Evobike Hero 2' },
]

const current = ref(0)
let timer = null

function next() {
  current.value = (current.value + 1) % slides.length
}

function go(index) {
  current.value = index
  resetTimer()
}

function resetTimer() {
  clearInterval(timer)
  timer = setInterval(next, 5000)
}

onMounted(() => { timer = setInterval(next, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section class="hero">
    <!-- Slides -->
    <div
      v-for="(slide, i) in slides"
      :key="i"
      class="hero-slide"
      :class="{ 'is-active': current === i }"
    >
      <img :src="slide.src" :alt="slide.alt" class="hero-img" />
    </div>

    <!-- Dots -->
    <div class="hero-dots">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        class="dot"
        :class="{ 'is-active': current === i }"
        @click="go(i)"
        :aria-label="`Ir a slide ${i + 1}`"
      ></button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: calc(100dvh - 108px);
  overflow: hidden;
  background: #000;
}

/* ── Slide ── */
.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.9s ease;
}

.hero-slide.is-active {
  opacity: 1;
  z-index: 1;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Desktop: muestra la imagen completa; móvil: centra y recorta */
  object-position: center center;
  display: block;
}

/* ── Dots ── */
.hero-dots {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.6rem;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: transparent;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.3s ease;
  padding: 0;
}

.dot.is-active {
  background: #ffffff;
  transform: scale(1.25);
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .hero {
    /* Permitir que la altura se adapte a la proporción de la imagen */
    height: auto;
    min-height: auto;
    /* La mayoría de fotos landscape son 16/9 o similar. Esto evita recortes a los lados. */
    aspect-ratio: 16 / 9;
  }

  .hero-img {
    object-position: center;
  }
}
</style>
