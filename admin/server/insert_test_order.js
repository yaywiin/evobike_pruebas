const { Pool } = require("pg");

const db = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_VGpZrwP70vJk@ep-shy-lab-amyh5564-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const cartItems = [
      { id: 1, name: "Bicicleta Eléctrica Aguila Pro", quantity: 1, price: 18500 },
      { id: 2, name: "Casco de Seguridad Premium", quantity: 1, price: 1200 }
    ];

    const res = await db.query(
      `INSERT INTO clientes_evobike
        (nombre, apellido, email, telefono, direccion, ciudad, estado, codigo_postal, total_pedido, carrito, mp_status, envio_costo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
       RETURNING id`,
      [
        "Juan", "Pérez Demo", "juan.perez@ejemplo.com", "3399887766",
        "Av. Vallarta 5000", "Guadalajara", "Jalisco", "44100",
        19700.00, JSON.stringify(cartItems), "approved", 0
      ]
    );

    console.log(`Registro insertado con éxito. ID: ${res.rows[0].id}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
