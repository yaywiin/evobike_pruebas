<script setup>
// Componente About Us
</script>

<template>
  <section class="about-section">
    <div class="container">
      <div class="about-grid">
        
        <!-- Columna de Imagen -->
        <div class="about-image-col">
          <div class="image-wrapper">
            <img src="/about.jpeg" alt="Acerca de Evobike Elite" class="about-img" />
            <!-- Elemento decorativo detrás de la imagen -->
            <div class="image-backdrop"></div>
          </div>
        </div>
        
        <!-- Columna de Texto -->
        <div class="about-text-col">
          <div class="section-titles">
            <h2 class="subtitle">¿Quiénes somos?</h2>
            <h3 class="title">Acerca de Evobike Elite</h3>
          </div>
          
          <div class="quote-box">
            <p>"Más de 200,000 clientes satisfechos son testigo de la revolución eléctrica"</p>
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
          
          <div class="about-actions">
            <!-- Texto discreto en lugar de botón -->
            <a href="/about" class="btn-text">Conoce más de nosotros <span class="arrow">&rarr;</span></a>
          </div>
        </div>
        
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  padding: 6rem 0;
  background-color: #f9fafb; /* Fondo ligeramente gris para separar de la tienda */
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
  left: -20px;
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

.subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-brand, #0a6837);
  letter-spacing: 0.1em;
  margin: 0 0 0.5rem 0;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.1;
}

.quote-box {
  border-left: 4px solid var(--color-brand, #0a6837);
  padding-left: 1.5rem;
  margin-bottom: 2rem;
}

.quote-box p {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
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

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: 'Poppins', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-brand, #0a6837);
  text-decoration: none;
  transition: color 0.2s ease;
}

.btn-text:hover {
  color: var(--color-brand-dark, #028016);
}

.btn-text .arrow {
  transition: transform 0.2s ease;
}

.btn-text:hover .arrow {
  transform: translateX(4px);
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .about-image-col {
    order: 2; /* En móvil/tablet, el texto va primero */
    max-width: 600px;
    margin: 0 auto;
  }
  
  .about-text-col {
    order: 1;
    text-align: center;
  }
  
  .quote-box {
    border-left: none;
    padding-left: 0;
    text-align: center;
    position: relative;
  }
  
  .quote-box::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: var(--color-brand, #0a6837);
    border-radius: 2px;
  }
  
  .about-content p {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .about-section {
    padding: 4rem 0;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .quote-box p {
    font-size: 1.1rem;
  }
}
</style>
