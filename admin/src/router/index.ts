import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { title: 'Login', public: true },
    },
    {
      path: '/',
      name: 'Dashboard',
      redirect: '/admin/usuarios',
    },
    {
      path: '/admin/usuarios',
      name: 'Usuarios',
      component: () => import('../views/Usuarios/Usuarios.vue'),
      meta: { title: 'Usuarios' },
    },
    {
      path: '/admin/usuarios/nuevo',
      name: 'NuevoUsuario',
      component: () => import('../views/Usuarios/NuevoUsuario.vue'),
      meta: { title: 'Agregar Usuario' },
    },
    {
      path: '/admin/usuarios/editar/:id',
      name: 'EditarUsuario',
      component: () => import('../views/Usuarios/NuevoUsuario.vue'),
      meta: { title: 'Editar Usuario' },
    },
    {
      path: '/admin/productos',
      name: 'Productos',
      component: () => import('../views/Productos/Productos.vue'),
      meta: { title: 'Productos' },
    },
    {
      path: '/admin/productos/nuevo',
      name: 'NuevoProducto',
      component: () => import('../views/Productos/NuevoProducto.vue'),
      meta: { title: 'Agregar Producto' },
    },
    {
      path: '/admin/productos/editar/:id',
      name: 'EditarProducto',
      component: () => import('../views/Productos/NuevoProducto.vue'),
      meta: { title: 'Editar Producto' },
    },
    {
      path: '/admin/clientes',
      name: 'Clientes',
      component: () => import('../views/Clientes/Clientes.vue'),
      meta: { title: 'Clientes' },
    },
    {
      path: '/admin/clientes/:id',
      name: 'ClienteDetalle',
      component: () => import('../views/Clientes/PedidoDetalle.vue'),
      meta: { title: 'Detalle de Cliente' },
    },
    {
      path: '/admin/pedidos',
      name: 'Pedidos',
      component: () => import('../views/Pedidos/Pedidos.vue'),
      meta: { title: 'Pedidos' },
    },
    {
      path: '/admin/pedidos/:id',
      name: 'PedidoDetalle_Real',
      component: () => import('../views/Clientes/PedidoDetalle.vue'),
      meta: { title: 'Detalle de Pedido' },
    },
    // Redirigir cualquier otra ruta no encontrada a /login
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  document.title = `Evobike Admin | ${to.meta.title}`

  if (!to.meta.public && !auth.isAuthenticated) {
    // Si no es pública y no está autenticado, mandamos al login
    next('/login')
  } else if (to.name === 'Login' && auth.isAuthenticated) {
    // Si ya está autenticado e intenta ir al login, mandamos al dashboard
    next('/admin/usuarios')
  } else {
    next()
  }
})

export default router
