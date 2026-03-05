<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const menuItems = [
  {
    label: 'Bicicletas Eléctricas',
    children: [
      { label: 'Aguila Pro', href: 'https://evobikeelite.com/producto/aguila-pro/' },
      { label: 'Aurora', href: 'https://evobikeelite.com/producto/aurora/' },
      { label: 'Galaxy Plus', href: 'https://evobikeelite.com/producto/galaxy-plus/' },
      { label: 'Jaguar', href: 'https://evobikeelite.com/producto/jaguar/' },
      { label: 'Moped', href: 'https://evobikeelite.com/producto/moped/' },
      { label: 'Rayo Pro', href: 'https://evobikeelite.com/producto/rayo-pro/' },
      { label: 'Sol', href: 'https://evobikeelite.com/producto/sol/' },
      { label: 'Tigre', href: 'https://evobikeelite.com/producto/tigre/' },
    ]
  },
  {
    label: 'Bicimotos',
    children: [
      { label: 'Polar', href: 'https://evobikeelite.com/producto/polar/' },
      { label: 'Urbex', href: 'https://evobikeelite.com/producto/urbex/' },
      { label: 'Zeus', href: 'https://evobikeelite.com/producto/zeus/' },
    ]
  },
  {
    label: 'Triciclos',
    children: [
      { label: 'Beetle', href: 'https://evobikeelite.com/producto/beetle/' },
      { label: 'Family Q', href: 'https://evobikeelite.com/producto/family-q/' },
      { label: 'Family Q Plus', href: 'https://evobikeelite.com/producto/family-q-plus/' },
      { label: 'Golf', href: 'https://evobikeelite.com/producto/golf/' },
      { label: 'Golf Plus', href: 'https://evobikeelite.com/producto/golf-plus/' },
    ]
  },
  {
    label: 'Scooters',
    children: [
      { label: 'M1', href: 'https://evobikeelite.com/producto/m1/' },
      { label: 'M4', href: 'https://evobikeelite.com/producto/m4/' },
      { label: 'M5', href: 'https://evobikeelite.com/producto/m5/' },
    ]
  },
  {
    label: 'Carga',
    children: [
      { label: 'Cargo', href: 'https://evobikeelite.com/producto/cargo/' },
      { label: 'Evotank 160 cm', href: 'https://evobikeelite.com/producto/evotank-160-cm/' },
    ]
  },
  {
    label: 'Para Niños',
    children: [
      { label: 'Ricochet', href: 'https://evobikeelite.com/producto/ricochet/' },
      { label: 'Python', href: 'https://evobikeelite.com/producto/python/' },
      { label: 'Evokid', href: 'https://evobikeelite.com/producto/evokid/' },
    ]
  },
]

// Desktop hover dropdown
const openMenu = ref(null)
function setOpen(label) { openMenu.value = label }
function closeMenu() { openMenu.value = null }

// Mobile drawer
const mobileOpen = ref(false)
const mobileExpanded = ref(null)

function toggleMobile() { mobileOpen.value = !mobileOpen.value }
function toggleMobileCategory(label) {
  mobileExpanded.value = mobileExpanded.value === label ? null : label
}
function closeMobileMenu() {
  mobileOpen.value = false
  mobileExpanded.value = null
}
</script>

<template>
  <header class="site-header">

    <!-- ── Franja superior ─────────────────────────────────────────── -->
    <div class="top-bar-wrapper">
      <div class="top-bar container">
        <div class="top-col-left">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="hide-mobile">V. de Mendoza #114, Jardinadas. Zamora, Mich.</span>
        </div>
        <div class="top-col-center">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
          <span>¡Envíos gratuitos a todo México!</span>
        </div>
        <div class="top-col-right">
          <a href="#" class="social-link" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" class="social-link" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
          </a>
        </div>
      </div>
    </div>

    <!-- ── Logo + Nav (Desktop) ────────────────────────────────────── -->
    <nav class="main-nav-wrapper" @mouseleave="closeMenu">
      <div class="main-nav-bar container">
        <!-- Logo -->
        <div class="logo">
          <RouterLink to="/" @click="closeMobileMenu">
            <img src="/logo.png" alt="Evobike Logo" class="logo-img" />
          </RouterLink>
        </div>

        <!-- Categorías desktop -->
        <ul class="primary-menu desktop-menu">
          <li
            v-for="item in menuItems"
            :key="item.label"
            class="menu-item"
            :class="{ 'is-open': openMenu === item.label }"
            @mouseenter="setOpen(item.label)"
          >
            <button class="menu-trigger">
              {{ item.label }}
              <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <ul class="sub-menu">
              <li v-for="child in item.children" :key="child.label">
                <a :href="child.href" target="_blank" rel="noopener noreferrer">{{ child.label }}</a>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Hamburger (solo móvil) -->
        <button class="hamburger" :class="{ 'is-active': mobileOpen }" @click="toggleMobile" aria-label="Abrir menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <!-- ── Overlay oscuro ─────────────────────────────────────────── -->
    <div class="mobile-overlay" :class="{ 'is-visible': mobileOpen }" @click="closeMobileMenu"></div>

    <!-- ── Drawer móvil ────────────────────────────────────────────── -->
    <aside class="mobile-drawer" :class="{ 'is-open': mobileOpen }">
      <div class="drawer-header">
        <RouterLink to="/" @click="closeMobileMenu">
          <img src="/logo.png" alt="Evobike Logo" class="drawer-logo" />
        </RouterLink>
        <button class="drawer-close" @click="closeMobileMenu" aria-label="Cerrar menú">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <ul class="mobile-menu-list">
        <li v-for="item in menuItems" :key="item.label" class="mobile-menu-item">
          <button
            class="mobile-category-btn"
            :class="{ 'is-expanded': mobileExpanded === item.label }"
            @click="toggleMobileCategory(item.label)"
          >
            {{ item.label }}
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <ul v-if="mobileExpanded === item.label" class="mobile-sub-list">
            <li v-for="child in item.children" :key="child.label">
              <a :href="child.href" target="_blank" rel="noopener noreferrer" @click="closeMobileMenu">{{ child.label }}</a>
            </li>
          </ul>
        </li>
      </ul>

      <!-- Redes en el drawer -->
      <div class="drawer-socials">
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
    </aside>

  </header>
</template>

<style scoped>
.site-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ── Franja superior ─────────────────────────────────────────────── */
.top-bar-wrapper {
  background-image: linear-gradient(180deg, #10A325 0%, #15C532 100%);
  width: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 500;
}

.top-col-left,
.top-col-center,
.top-col-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.top-col-center {
  flex: 1;
  justify-content: center;
  font-weight: 600;
}

.top-col-right { gap: 1rem; }

.social-link {
  color: #ffffff;
  display: flex;
  align-items: center;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.social-link:hover {
  opacity: 0.8;
  transform: scale(1.15);
}

/* ── Logo + Nav bar ──────────────────────────────────────────────── */
.main-nav-wrapper {
  background-color: #ffffff;
  border-bottom: 2px solid #15C532;
  width: 100%;
  box-shadow: 0 4px 8px -2px rgba(0,0,0,0.06);
}

.main-nav-bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
}

/* Logo */
.logo { display: flex; align-items: center; flex-shrink: 0; }
.logo a { display: flex; align-items: center; text-decoration: none; }
.logo-img { height: 48px; width: auto; display: block; transition: opacity 0.2s; }
.logo-img:hover { opacity: 0.85; }

/* ── Primary menu (desktop) ──────────────────────────────────────── */
.primary-menu {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0 0 0 auto;
  padding: 0;
  gap: 0;
}

.menu-item { position: relative; }

.menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #1a1a1a;
  white-space: nowrap;
  transition: color 0.2s;
}

.menu-trigger:hover,
.menu-item.is-open .menu-trigger { color: #09AC22; }

.chevron { transition: transform 0.25s ease; flex-shrink: 0; }
.menu-item.is-open .chevron { transform: rotate(180deg); }

/* Dropdown */
.sub-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border-top: 3px solid #09AC22;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 24px -4px rgba(0,0,0,0.14);
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  min-width: 190px;
  z-index: 200;
}

.menu-item.is-open .sub-menu {
  display: block;
  animation: fadeDown 0.2s ease;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.sub-menu li a {
  display: block;
  padding: 0.55rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  transition: color 0.15s, background-color 0.15s;
}

.sub-menu li a:hover {
  color: #09AC22;
  background-color: #f4fdf5;
}

/* ── Hamburger ───────────────────────────────────────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background-color: #1a1a1a;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.is-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.is-active span:nth-child(2) { opacity: 0; }
.hamburger.is-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Overlay ─────────────────────────────────────────────────────── */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 300;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-overlay.is-visible {
  opacity: 1;
}

/* ── Drawer ──────────────────────────────────────────────────────── */
.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100dvh;
  width: 300px;
  max-width: 85vw;
  background: #ffffff;
  z-index: 400;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.mobile-drawer.is-open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #15C532;
}

.drawer-logo { height: 40px; width: auto; }

.drawer-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.drawer-close:hover { color: #09AC22; }

/* Mobile menu list */
.mobile-menu-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem 0;
  flex: 1;
}

.mobile-menu-item { border-bottom: 1px solid #f0f0f0; }

.mobile-category-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.9rem 1.25rem;
  background: none;
  border: none;
  font-family: 'Poppins', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #1a1a1a;
  cursor: pointer;
  transition: color 0.2s;
}

.mobile-category-btn.is-expanded,
.mobile-category-btn:hover { color: #09AC22; }

.mobile-category-btn.is-expanded .chevron { transform: rotate(180deg); }

.mobile-sub-list {
  list-style: none;
  margin: 0;
  padding: 0 0 0.5rem 0;
  background: #f9fdf9;
}

.mobile-sub-list li a {
  display: block;
  padding: 0.6rem 2rem;
  font-size: 0.88rem;
  font-weight: 400;
  color: #444;
  text-decoration: none;
  transition: color 0.15s;
}

.mobile-sub-list li a:hover { color: #09AC22; }

/* Redes en drawer */
.drawer-socials {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border-top: 1px solid #ebebeb;
}

.drawer-socials a {
  color: #555;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.drawer-socials a:hover { color: #09AC22; }

/* ── Responsive breakpoints ──────────────────────────────────────── */
@media (max-width: 768px) {
  /* Top bar: ocultar dirección */
  .hide-mobile { display: none; }

  .top-bar {
    height: 36px;
    font-size: 0.72rem;
  }

  .top-col-left svg { display: none; } /* si el texto está oculto el ícono también */

  /* Ocultar menú desktop, mostrar hamburger */
  .desktop-menu { display: none; }
  .hamburger { display: flex; }

  /* Overlay visible */
  .mobile-overlay { display: block; }
}
</style>
