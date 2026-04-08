<script setup>
import AboutUs from '../components/AboutUs.vue'
</script>

<template>
  <div class="nosotros-page">
    <!-- Primera fila, re-usando AboutUs con hideLink activo -->
    <AboutUs hideLink />

    <!-- Segunda fila: Misión y Visión -->
    <section class="mision-vision-section">
      <div class="container">
        <div class="about-grid reverse-layout">
          
          <!-- Columna de Texto -->
          <div class="about-text-col">
            <div class="section-titles">
              <h2 class="title">Misión y Visión</h2>
            </div>
            
            <div class="about-content">
              <p>
                Desde nuestro inicio, hemos establecido una sólida infraestructura en México, 
                con instalaciones de I+D y producción que reflejan nuestro compromiso con la excelencia. 
                Cada uno de nuestros productos es fruto de un proceso riguroso que combina tecnología 
                avanzada con la pasión por crear soluciones de movilidad que mejoren la vida de las personas.
              </p>
              <p>
                A pesar de ser una empresa joven, EVOBIKE ya está marcando la diferencia en el mercado local 
                e internacional, exportando nuestros productos a múltiples países y obteniendo un reconocimiento 
                creciente por nuestra innovación y calidad. Con un equipo de expertos comprometidos y una 
                visión clara hacia el futuro, estamos listos para liderar la próxima era de la movilidad eléctrica.
              </p>
            </div>
          </div>

          <!-- Columna de Imagen -->
          <div class="about-image-col">
            <div class="image-wrapper">
              <img src="/us-2.jpg" alt="Misión y Visión Evobike Elite" class="about-img" />
              <!-- Elemento decorativo detrás de la imagen -->
              <div class="image-backdrop"></div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nosotros-page {
  display: flex;
  flex-direction: column;
}

.mision-vision-section {
  padding: 6rem 0;
  background-color: #ffffff; /* Alterna con el fondo de AboutUs para mejor ritmo visual */
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.reverse-layout {
  /* No necesitamos invertir las columnas en CSS porque en el DOM ya pusimos el texto antes que la imagen */
}

/* ── Imagen ── */
.about-image-col {
  position: relative;
}

.image-wrapper {
  position: relative;
  z-index: 2;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.about-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 4/5;
  transition: transform 0.5s ease;
}

.image-wrapper:hover .about-img {
  transform: scale(1.03);
}

.image-backdrop {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100%;
  height: 100%;
  background-color: var(--color-brand, #0a6837);
  border-radius: 16px;
  z-index: 1;
  opacity: 0.1;
}

/* ── Texto ── */
.about-text-col {
  display: flex;
  flex-direction: column;
}

.section-titles {
  margin-bottom: 2rem;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.1;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.about-content p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .about-image-col {
    order: 2; /* En móvil/tablet, el texto va primero. La imagen va después. */
    max-width: 600px;
    margin: 0 auto;
  }
  
  .about-text-col {
    order: 1;
    text-align: center;
  }
  
  .about-content p {
    text-align: center;
  }

  .image-backdrop {
    top: -15px;
    right: -15px;
  }
}

@media (max-width: 768px) {
  .mision-vision-section {
    padding: 4rem 0;
  }
  
  .title {
    font-size: 2rem;
  }
}
</style>
