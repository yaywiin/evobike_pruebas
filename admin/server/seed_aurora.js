require('dotenv').config()
const { Pool } = require('pg')

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const producto = {
  nombre: 'Aurora',
  descripcion: 'Faros LED de alta intensidad... Potencia 850W...',
  precio: 15499.00,
  descuento_porcentaje: 0.00,
  stock: 100,
  categoria: 'BICICLETAS',
  publicado: true,
  foto_principal: 'http://evobikeelite.com/wp-content/uploads/2025/12/Aurora.png',
  galeria: [],
  voltajes: ['60 V', '72 V'],
  admin_usuario_id: null // Se intentará con 1, si no existe se dejará null
}

const colores = [
  {
    nombre: 'Dorado',
    foto: 'http://evobikeelite.com/wp-content/uploads/2025/12/Captura-de-pantalla-2026-01-26-a-las-10.49.48-p.m.png'
  },
  {
    nombre: 'Gris',
    foto: 'http://evobikeelite.com/wp-content/uploads/2025/12/Captura-de-pantalla-2026-01-26-a-las-10.50.00-p.m.png'
  }
]

async function seed() {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // Verificar si el admin_usuario_id=1 existe
    const { rows: adminRows } = await client.query(
      `SELECT id FROM admin_usuarios WHERE id = 1 LIMIT 1`
    )
    const adminId = adminRows.length > 0 ? 1 : null

    // Insertar producto
    const { rows: [p] } = await client.query(
      `INSERT INTO productos
        (nombre, descripcion, precio, descuento_porcentaje, stock, categoria,
         publicado, foto_principal, galeria, voltajes, admin_usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11)
       RETURNING id, nombre`,
      [
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.descuento_porcentaje,
        producto.stock,
        producto.categoria,
        producto.publicado,
        producto.foto_principal,
        JSON.stringify(producto.galeria),
        JSON.stringify(producto.voltajes),
        adminId
      ]
    )
    console.log(`✅ Producto insertado: "${p.nombre}" (ID: ${p.id})`)

    // Insertar colores
    for (const color of colores) {
      await client.query(
        `INSERT INTO productos_colores (producto_id, nombre, foto) VALUES ($1, $2, $3)`,
        [p.id, color.nombre, color.foto]
      )
      console.log(`   🎨 Color: "${color.nombre}"`)
    }

    await client.query('COMMIT')
    console.log('\n🎉 Registro insertado correctamente.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error al insertar:', err.message)
  } finally {
    client.release()
    await db.end()
  }
}

seed()
