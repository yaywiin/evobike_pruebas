<template>
  <AdminLayout>
    <div>
      <!-- Header / Opciones de Retorno -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ modoEdicion ? 'Editar Producto' : 'Agregar Nuevo Producto' }}
        </h2>
        <router-link
          to="/admin/productos"
          class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 transition dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Inventario
        </router-link>
      </div>

      <form @submit.prevent="guardarProducto">
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          <!-- Columna Izquierda (Principal) -->
          <div class="xl:col-span-2 space-y-6">
            
            <!-- Caja: Información General -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="mb-5 font-medium text-gray-800 dark:text-white/90 text-lg">Información General</h3>
              <div class="space-y-5">
                <!-- Nombre -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Nombre del Producto <span class="text-error-500">*</span></label>
                  <input
                    v-model="formulario.nombre"
                    type="text"
                    placeholder="Ej. Bicicleta Eléctrica Alpha"
                    required
                    class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <!-- Descripción -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Descripción (Detalles, talla, motor, specs) </label>
                  <textarea
                    v-model="formulario.descripcion"
                    rows="5"
                    placeholder="Describe los detalles del producto de EVO Bike..."
                    class="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Caja: Precios e Inventario -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="mb-5 font-medium text-gray-800 dark:text-white/90 text-lg">Precios e Inventario</h3>
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <!-- Precio -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Precio Base <span class="text-error-500">*</span></label>
                  <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-2.5 text-gray-500 font-medium dark:border-gray-800 dark:text-gray-400">$</span>
                    <input
                      v-model="formulario.precio"
                      type="number"
                      placeholder="Ej. 14500"
                      step="0.01"
                      required
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[48px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
                <!-- Descuento -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Descuento (%)</label>
                  <div class="relative">
                    <input
                      v-model="formulario.descuento_porcentaje"
                      type="number"
                      placeholder="Ej. 15"
                      min="0"
                      max="100"
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-4 pr-[48px] text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                    <span class="absolute right-0 top-1/2 -translate-y-1/2 border-l border-gray-200 px-3.5 py-2.5 text-gray-500 font-medium dark:border-gray-800 dark:text-gray-400">%</span>
                  </div>
                </div>
                <!-- Stock -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Stock Disponible</label>
                  <input
                    v-model="formulario.stock"
                    type="number"
                    placeholder="Ej. 50"
                    min="0"
                    class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            </div>

            <!-- Caja: Variaciones (Voltaje y Color) -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="mb-5 font-medium text-gray-800 dark:text-white/90 text-lg">Voltaje y Colores</h3>
              
              <!-- Voltajes -->
              <div class="mb-8">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Variantes de Voltaje </label>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span v-for="(voltaje, idx) in formulario.voltajes" :key="idx" class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-brand-50 text-brand-700 text-sm font-medium dark:bg-brand-500/10 dark:text-brand-400">
                    {{ voltaje }}
                    <button type="button" @click="eliminarVoltaje(idx)" class="text-brand-500 hover:text-brand-900 dark:hover:text-brand-200">
                      &times;
                    </button>
                  </span>
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="nuevoVoltaje"
                    type="text"
                    placeholder="Ej. 36V, 48V..."
                    @keyup.enter.prevent="agregarVoltaje"
                    class="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                  <button type="button" @click="agregarVoltaje" class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Agregar</button>
                </div>
              </div>

              <!-- Colores con Imágenes (Subida de Archivo Local) -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Variantes de Color (Nombre + Foto) </label>
                <div class="space-y-3 mb-3">
                  <div v-for="(color, idx) in formulario.colores" :key="idx" class="flex flex-col sm:flex-row gap-3 items-center p-3 border border-gray-100 rounded-lg dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <!-- Preview Foto Variante -->
                    <div class="h-12 w-12 rounded border border-gray-200 overflow-hidden bg-white shrink-0 dark:border-gray-700 relative group cursor-pointer">
                      <img v-if="color.foto" :src="getObjectUrl(color.foto)" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></div>
                      
                      <!-- Overlay Upload -->
                      <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="(e) => handleColorImageUpload(e, idx)" />
                    </div>
                    
                    <input v-model="color.nombre" type="text" placeholder="Ej. Rojo Pasión" class="flex-1 dark:bg-dark-900 h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-white/90" />
                    
                    <button type="button" @click="eliminarColor(idx)" class="p-2 text-gray-400 hover:text-error-500 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <button type="button" @click="agregarColor" class="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:text-gray-400 w-full justify-center transition">
                  + Agregar Variante de Color
                </button>
              </div>
            </div>
            
          </div>

          <!-- Columna Derecha -->
          <div class="space-y-6">

            <!-- Submit Principal -->
            <div class="space-y-3">
              <div v-if="errorServidor" class="rounded-lg bg-error-50 border border-error-100 px-4 py-3 text-sm text-error-700 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-400">
                {{ errorServidor }}
              </div>
              <button type="submit" :disabled="guardando" class="w-full flex justify-center rounded-lg bg-brand-500 px-8 py-3.5 font-medium text-white hover:bg-brand-600 transition shadow-theme-sm text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Producto' : 'Publicar Producto') }}
              </button>
            </div>

            <!-- Estado y Categoría -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="mb-5 font-medium text-gray-800 dark:text-white/90 text-lg">Organización</h3>
              
              <!-- Switch de Estado Público/Privado -->
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-800 dark:text-white/90"> Estado del Producto </label>
                  <p class="text-xs text-gray-500 mt-0.5">{{ formulario.publicado ? 'Público (Visible en tienda)' : 'Privado (Borrador)' }}</p>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" v-model="formulario.publicado" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-500/20 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                </label>
              </div>

              <!-- Categoría -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"> Categoría </label>
                <div class="relative z-20 bg-transparent">
                  <select v-model="formulario.categoria" class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90">
                    <option value="" disabled>Selecciona una categoría</option>
                    <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                  <span class="absolute z-10 right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <!-- Imagen Principal -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="mb-4 font-medium text-gray-800 dark:text-white/90 text-lg">Imagen Principal</h3>
              
              <div class="relative aspect-square w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" @change="handleMainImageUpload" />
                
                <!-- Vista Previa Activa -->
                <img v-if="formulario.foto_principal" :src="getObjectUrl(formulario.foto_principal)" class="absolute inset-0 w-full h-full object-contain p-2 z-0" />
                
                <!-- Placeholder Vacio -->
                <div v-else class="text-center p-5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span class="text-sm font-medium">Click o Arrastrar Foto</span>
                  <p class="text-xs mt-1 opacity-70">PNG, JPG o WEBP (Máx. 5MB)</p>
                </div>

                <!-- Overlay para Cambiar cuando ya hay foto -->
                <div v-if="formulario.foto_principal" class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity z-20 pointer-events-none">
                  <span class="text-white font-medium text-sm bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">Cambiar Imagen</span>
                </div>
              </div>
            </div>

            <!-- Galería de Imágenes (Multiples) -->
            <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="mb-4 font-medium text-gray-800 dark:text-white/90 text-lg">Galería (Extras)</h3>
              
              <!-- Zona de Dropzone Multiple File -->
              <div class="relative w-full p-4 border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-xl mb-4 text-center cursor-pointer transition dark:border-gray-700 dark:bg-gray-800/50">
                <input type="file" multiple accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" @change="handleGalleryUpload" />
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span class="text-sm font-medium text-gray-500">Agregar más fotos</span>
              </div>

              <!-- Grid de Miniaturas de la Galería -->
              <div v-if="formulario.galeria.length > 0" class="grid grid-cols-3 gap-3">
                <div v-for="(file, idx) in formulario.galeria" :key="idx" class="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
                  <img :src="getObjectUrl(file)" class="w-full h-full object-cover" />
                  <button type="button" @click="removerImagenGaleria(idx)" class="absolute top-1 right-1 bg-white/90 text-error-500 hover:text-error-600 rounded p-1 opacity-0 group-hover:opacity-100 transition shadow-sm dark:bg-gray-800/90">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '../../components/layout/AdminLayout.vue'
import imageCompression from 'browser-image-compression'

const router = useRouter()
const route = useRoute()
const modoEdicion = computed(() => !!route.params.id)
import { fetchWithAuth } from '../../services/api'

const categoriasDisponibles = [
  'BICICLETAS ELÉCTRICAS',
  'BICIMOTOS',
  'TRICICLOS',
  'SCOOTERS',
  'CARGA',
  'PARA NIÑOS'
]

interface ColorVariant {
  id?: number
  nombre: string
  foto: File | string | null
}

const formulario = ref({
  publicado: true,
  nombre: '',
  descripcion: '',
  precio: null as number | null,
  descuento_porcentaje: null as number | null,
  stock: 0,
  categoria: '',
  foto_principal: null as File | string | null,
  galeria: [] as (File | string)[],
  voltajes: [] as string[],
  colores: [] as ColorVariant[]
})

// === Carga Inicial en Modo Edición ===
onMounted(async () => {
  if (!modoEdicion.value) return
  try {
    const res = await fetchWithAuth(`/api/admin/productos/${route.params.id}`)
    if (!res.ok) throw new Error('Producto no encontrado')
    const data = await res.json()
    
    formulario.value.publicado = data.publicado
    formulario.value.nombre = data.nombre
    formulario.value.descripcion = data.descripcion || ''
    formulario.value.precio = Number(data.precio)
    formulario.value.descuento_porcentaje = Number(data.descuento_porcentaje)
    formulario.value.stock = data.stock
    formulario.value.categoria = data.categoria || ''
    formulario.value.foto_principal = data.foto_principal || null
    formulario.value.galeria = data.galeria || []
    formulario.value.voltajes = data.voltajes || []
    formulario.value.colores = data.colores || []
  } catch {
    errorServidor.value = 'Error al cargar los datos del producto'
  }
})

// === Manejo de Subida de Archivos Frontend (Previo a Cloudinary) ===

const getObjectUrl = (file: File | string | null) => {
  if (!file) return ''
  if (typeof file === 'string') return file
  return URL.createObjectURL(file)
}

const handleMainImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formulario.value.foto_principal = target.files[0]
  }
}

const handleGalleryUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formulario.value.galeria.push(...Array.from(target.files))
  }
  target.value = '' // Reset input para poder subir la misma foto si se borró
}

const removerImagenGaleria = (idx: number) => {
  formulario.value.galeria.splice(idx, 1)
}

const handleColorImageUpload = (event: Event, colorIdx: number) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formulario.value.colores[colorIdx].foto = target.files[0]
  }
}

// === Funciones Variaciones ===
const nuevoVoltaje = ref('')
const agregarVoltaje = () => {
  const v = nuevoVoltaje.value.trim()
  if (v && !formulario.value.voltajes.includes(v)) {
    formulario.value.voltajes.push(v)
  }
  nuevoVoltaje.value = ''
}
const eliminarVoltaje = (idx: number) => {
  formulario.value.voltajes.splice(idx, 1)
}

const agregarColor = () => {
  formulario.value.colores.push({ nombre: '', foto: null })
}
const eliminarColor = (idx: number) => {
  formulario.value.colores.splice(idx, 1)
}

// === Sumit con API real + Cloudinary ===
const guardando = ref(false)
const errorServidor = ref('')

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.8, // 800 KB máximo
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  }
  try {
    return await imageCompression(file, options)
  } catch (error) {
    console.error('Error comprimiendo imagen', error)
    return file
  }
}

const guardarProducto = async () => {
  guardando.value = true
  errorServidor.value = ''
  try {
    const fd = new FormData()
    fd.append('nombre', formulario.value.nombre)
    fd.append('descripcion', formulario.value.descripcion)
    fd.append('precio', String(formulario.value.precio ?? ''))
    fd.append('descuento_porcentaje', String(formulario.value.descuento_porcentaje ?? 0))
    fd.append('stock', String(formulario.value.stock ?? 0))
    fd.append('categoria', formulario.value.categoria)
    fd.append('publicado', String(formulario.value.publicado))
    fd.append('voltajes', JSON.stringify(formulario.value.voltajes))

    // Imagen principal
    if (formulario.value.foto_principal instanceof File) {
      const compressedMain = await compressImage(formulario.value.foto_principal)
      fd.append('foto_principal', compressedMain)
    } else if (formulario.value.foto_principal) {
      fd.append('foto_principal', formulario.value.foto_principal)
    }

    // Ignoramos galerías ya subidas (string) y agregamos nuevas (File)
    for (const foto of formulario.value.galeria) {
      if (foto instanceof File) {
        const compressedGal = await compressImage(foto)
        fd.append('galeria', compressedGal)
      }
    }

    // Colores
    const nombresColores = formulario.value.colores.map(c => c.nombre)
    fd.append('colores_nombres', JSON.stringify(nombresColores))
    
    for (const color of formulario.value.colores) {
      if (color.foto instanceof File) {
        const compressedCol = await compressImage(color.foto)
        fd.append('colores_fotos', compressedCol)
      } else {
        // ...
      }
    }

    const res = await fetchWithAuth(modoEdicion.value ? `/api/admin/productos/${route.params.id}` : '/api/admin/productos', {
      method: modoEdicion.value ? 'PUT' : 'POST',
      body: fd
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al guardar')
    router.push('/admin/productos')
  } catch (err: unknown) {
    errorServidor.value = err instanceof Error ? err.message : 'Error inesperado'
  } finally {
    guardando.value = false
  }
}

</script>
