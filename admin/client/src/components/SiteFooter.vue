<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="site-footer">
    <!-- ── Tres columnas principales ── -->
    <div class="footer-top">
      <div class="container footer-grid">
        
        <!-- Horarios -->
        <div class="footer-col">
          <h4 class="footer-title">Horarios</h4>
          <ul class="footer-list">
            <li>Lunes a sábado de 10:00 a 20:00 hrs</li>
            <li>Domingo de 10:00 a 16:00 hrs</li>
          </ul>
        </div>
        
        <!-- Contacto -->
        <div class="footer-col">
          <h4 class="footer-title">Contacto</h4>
          <ul class="footer-list">
            <li><strong>Ventas:</strong> (55) 8044 0098</li>
            <li><a href="mailto:ventas@evobikeelite.com">ventas@evobikeelite.com</a></li>
          </ul>
        </div>
        
        <!-- Avisos -->
        <div class="footer-col">
          <h4 class="footer-title">Avisos</h4>
          <ul class="footer-list">
            <li><RouterLink to="/privacidad">Aviso de Privacidad</RouterLink></li>
            <li><RouterLink to="/terminos">Términos y Condiciones</RouterLink></li>
          </ul>
        </div>

      </div>
    </div>

    <!-- ── Footer Bottom (Centrado) ── -->
    <div class="footer-bottom">
      <div class="container bottom-content">
        
        <!-- Logo pequeño centrado -->
        <div class="footer-logo">
          <RouterLink to="/">
            <img src="/logo.png" alt="Evobike Logo" class="footer-logo-img" />
          </RouterLink>
        </div>
        
        <!-- Redes sociales -->
        <div class="footer-socials">
          <a href="#" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
          </a>
        </div>

        <!-- Leyenda final -->
        <p class="footer-legal">
          Conoce nuestro <RouterLink to="/privacidad">Aviso de Privacidad</RouterLink> y nuestros <RouterLink to="/terminos">Términos y Condiciones</RouterLink>.
        </p>
        
        <p class="footer-copy">
          &copy; {{ new Date().getFullYear() }} Evobike Elite. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: #ffffff;  /* Fondo blanco */
  color: #4b5563;             /* Texto general gris oscuro */
  font-family: 'Poppins', sans-serif;
  margin-top: auto; 
  border-top: 1px solid #ebebeb; /* Sutil borde superior para separar */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── Footer Top (Columnas) ── */
.footer-top {
  padding: 4rem 0 3rem 0;
  border-bottom: 1px solid #ebebeb; /* Borde inferior sutil */
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  text-align: center; /* <<< Textos centrados */
}

.footer-col {
  display: flex;
  flex-direction: column;
  align-items: center; /* <<< alinea el contenido de flex al centro */
}

.footer-title {
  color: #111827; /* Títulos casi negros */
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 1.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-list li {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #4b5563; /* Texto gris */
}

.footer-list a {
  color: #4b5563;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-list a:hover {
  color: var(--color-brand, #0a6837);
  text-decoration: underline;
}

/* ── Footer Bottom (Centrado) ── */
.footer-bottom {
  padding: 3rem 0 4rem 0;
}

.bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.footer-logo-img {
  height: 38px; 
  width: auto;
  display: block;
  opacity: 0.9;
  transition: opacity 0.2s;
  /* Eliminado el filtro invert para que se vea el logo original sobre fondo blanco */
}

.footer-logo-img:hover {
  opacity: 1;
}

.footer-socials {
  display: flex;
  gap: 1.5rem;
}

.footer-socials a {
  color: #374151; /* Iconos en gris oscuro */
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-socials a:hover {
  color: var(--color-brand, #0a6837);
  transform: translateY(-2px);
}

.footer-email {
  margin: 0;
}

.footer-email a {
  color: #111827; /* Correo casi negro */
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-email a:hover {
  color: var(--color-brand, #0a6837);
}

.footer-legal,
.footer-copy {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.footer-legal a {
  color: #9ca3af;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: var(--color-brand, #0a6837);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
  
  .footer-top {
    padding: 3rem 0 2rem 0;
  }
}
</style>
