require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_VGpZrwP70vJk@ep-shy-lab-amyh5564-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
})

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id          SERIAL PRIMARY KEY,
        nombre      VARCHAR(100) NOT NULL,
        apellido    VARCHAR(100),
        email       VARCHAR(150) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        telefono    VARCHAR(20),
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla clientes creada')

    await client.query(`
      CREATE TABLE IF NOT EXISTS direcciones_clientes (
        id            SERIAL PRIMARY KEY,
        cliente_id    INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        alias         VARCHAR(50) DEFAULT 'Casa',
        calle         TEXT,
        ciudad        VARCHAR(100),
        estado        VARCHAR(100),
        codigo_postal VARCHAR(10),
        pais          VARCHAR(50) DEFAULT 'MX',
        es_default    BOOLEAN DEFAULT false,
        created_at    TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla direcciones_clientes creada')

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_usuarios (
        id          SERIAL PRIMARY KEY,
        nombre      VARCHAR(100) NOT NULL,
        correo      VARCHAR(150) UNIQUE NOT NULL,
        usuario     VARCHAR(80)  UNIQUE NOT NULL,
        rol         VARCHAR(30)  NOT NULL DEFAULT 'Tienda',
        password    VARCHAR(255) NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW(),
        edited_at   TIMESTAMP,
        deleted_at  TIMESTAMP
      )
    `)
    console.log('✅ Tabla admin_usuarios creada')

    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id                   SERIAL PRIMARY KEY,
        nombre               VARCHAR(200) NOT NULL,
        descripcion          TEXT,
        precio               NUMERIC(10,2) NOT NULL,
        descuento_porcentaje NUMERIC(5,2) DEFAULT 0,
        stock                INTEGER DEFAULT 0,
        categoria            VARCHAR(100),
        publicado            BOOLEAN DEFAULT true,
        foto_principal       VARCHAR(500),
        galeria              JSONB DEFAULT '[]',
        voltajes             JSONB DEFAULT '[]',
        admin_usuario_id     INTEGER REFERENCES admin_usuarios(id) ON DELETE SET NULL,
        created_at           TIMESTAMP DEFAULT NOW(),
        edited_at            TIMESTAMP,
        deleted_at           TIMESTAMP
      )
    `)
    console.log('✅ Tabla productos creada')

    await client.query(`
      CREATE TABLE IF NOT EXISTS productos_colores (
        id          SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        nombre      VARCHAR(100) NOT NULL,
        foto        VARCHAR(500),
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla productos_colores creada')

    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes_evobike (
        id            SERIAL PRIMARY KEY,
        nombre        VARCHAR(100) NOT NULL,
        apellido      VARCHAR(100),
        email         VARCHAR(200),
        telefono      VARCHAR(30),
        direccion     VARCHAR(300),
        ciudad        VARCHAR(100),
        estado        VARCHAR(100),
        codigo_postal VARCHAR(10),
        total_pedido  NUMERIC(10,2),
        carrito       JSONB DEFAULT '[]',
        mp_payment_id VARCHAR(100),
        mp_status     VARCHAR(50),
        envio_costo   NUMERIC(10,2) DEFAULT 0,
        created_at    TIMESTAMP DEFAULT NOW(),
        deleted_at    TIMESTAMP
      )
    `)
    console.log('✅ Tabla clientes_evobike creada')

    await client.query('COMMIT')
    console.log('🎉 Migración completa')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Error en migración:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
