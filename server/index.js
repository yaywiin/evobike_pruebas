require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
// Configurar CORS para permitir peticiones desde cualquier origen (especialmente el admin)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const WC_URL = process.env.VITE_WC_URL || "https://tu-tienda.com";
const WC_KEY = process.env.VITE_WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.VITE_WC_CONSUMER_SECRET || "";
const JWT_SECRET = process.env.JWT_SECRET || "evobike_secret_2024";

// Endpoint Proxy de Imágenes para evitar bloqueos por CORS o SSL de Plesk
app.get("/api/image-proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send("URL required");
    
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    res.set("Content-Type", response.headers["content-type"]);
    res.set("Cache-Control", "public, max-age=86400");
    response.data.pipe(res);
  } catch (error) {
    console.error("Image proxy error:", error.message);
    res.status(500).send("Proxy error");
  }
});

// Conexión a Neon PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_VGpZrwP70vJk@ep-shy-lab-amyh5564-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Middleware para verificar JWT Clientes
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.cliente = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar JWT Admin
const adminAuthMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Acceso denegado' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    if (!decoded.id || !decoded.rol) throw new Error();
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Sesión administrativa inválida' });
  }
};

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "TEST" });

// Helper para mapear producto de DB al formato que espera el frontend
const mapProductForClient = (p) => {
  const currentPriceNum = parseFloat(p.precio) * (1 - (parseFloat(p.descuento_porcentaje) || 0) / 100);
  const regularPriceNum = parseFloat(p.precio);
  
  return {
    id: p.id,
    name: p.nombre,
    permalink: `/producto/${p.id}`,
    price: currentPriceNum,
    priceFormatted: `$${currentPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
    compareAtPriceFormatted: regularPriceNum > currentPriceNum ? `$${regularPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : null,
    image: p.foto_principal, // Ya es URL de Cloudinary
    imageOriginal: p.foto_principal,
    badge: p.descuento_porcentaje > 0 ? "Oferta" : "",
    categories: p.categoria ? [{ id: p.categoria, name: p.categoria }] : [],
    attributes: []
  };
};

app.get("/api/products/bestsellers", async (req, res) => {
  try {
    // Tomamos 4 al azar o los más recientes como simulados "bestsellers"
    const { rows } = await db.query(`SELECT * FROM productos WHERE publicado = true AND deleted_at IS NULL ORDER BY id DESC LIMIT 4`);
    res.json(rows.map(mapProductForClient));
  } catch (error) {
    console.error("Error fetching bestsellers:", error.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

app.get("/api/products/random", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const { rows } = await db.query(
      `SELECT * FROM productos WHERE publicado = true AND deleted_at IS NULL ORDER BY RANDOM() LIMIT $1`,
      [limit]
    );
    res.json(rows.map(mapProductForClient));
  } catch (error) {
    console.error("Error fetching random products:", error.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT categoria AS name, MAX(categoria) AS id, COUNT(*) AS count 
      FROM productos 
      WHERE publicado = true AND deleted_at IS NULL AND categoria IS NOT NULL
      GROUP BY categoria
    `);
    res.json(rows.map(r => ({ ...r, count: parseInt(r.count) })));
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, search, attribute_term } = req.query;
    
    let query = `SELECT * FROM productos WHERE publicado = true AND deleted_at IS NULL`;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND categoria = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`;
    }

    if (attribute_term) {
      // Filtrar por color en subquery
      params.push(attribute_term);
      query += ` AND id IN (SELECT producto_id FROM productos_colores WHERE nombre = $${params.length})`;
    }
    
    query += ` ORDER BY id DESC`;

    const { rows } = await db.query(query, params);
    res.json(rows.map(mapProductForClient));
  } catch (error) {
    console.error("Error fetching all products:", error.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

app.get("/api/attributes/colors", async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT DISTINCT nombre FROM productos_colores`);
    const terms = rows.map((r, i) => ({ id: i, term_id: r.nombre, name: r.nombre }));
    res.json({ terms });
  } catch(error) {
    console.error("Error fetching colors:", error.message);
    res.json({ terms: [] });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Si viene como string 'random', lo ignoramos aquí por si choca
    if (id === 'random') return res.status(404).json({ error: "Not found" });
    
    const { rows } = await db.query(`SELECT * FROM productos WHERE id = $1 AND publicado = true AND deleted_at IS NULL`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    
    const p = rows[0];
    
    const { rows: colores } = await db.query(`SELECT * FROM productos_colores WHERE producto_id = $1`, [p.id]);
    
    const mappedProduct = mapProductForClient(p);
    mappedProduct.description = p.descripcion ? p.descripcion.replace(/(<([^>]+)>)/gi, "") : 'Sin descripción';
    mappedProduct.shortDescription = p.descripcion ? p.descripcion.substring(0, 100) + '...' : '';
    
    // Preparar imágenes de galería (galeria general + foto de cada color + principal)
    let images = [];
    if (p.foto_principal) images.push({ id: 'main', src: p.foto_principal, alt: p.nombre });
    if (p.galeria && Array.isArray(p.galeria)) {
      p.galeria.forEach((g, i) => images.push({ id: `gal_${i}`, src: g, alt: 'Extra' }));
    }
    colores.forEach(c => { if(c.foto) images.push({ id: `col_${c.id}`, src: c.foto, alt: c.nombre }); });
    mappedProduct.images = images;
    
    // Preparar Atributos (opciones elegibles)
    mappedProduct.attributes = [];
    if (p.voltajes && Array.isArray(p.voltajes) && p.voltajes.length > 0) {
      mappedProduct.attributes.push({ id: 'voltaje', name: 'Voltaje', options: p.voltajes });
    }
    if (colores.length > 0) {
      mappedProduct.attributes.push({ id: 'color', name: 'Color', options: colores.map(c => c.nombre) });
    }
    
    // Variaciones para el cambio de imagen
    mappedProduct.variations = colores.map(c => ({
      id: c.id,
      image: c.foto,
      attributes: [{ name: 'Color', option: c.nombre }]
    }));

    res.json(mappedProduct);
  } catch (error) {
    console.error("Error fetching single product:", error.message);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

// Ruta para procesar el pago directamente con Payment Brick
app.post("/api/process_payment", async (req, res) => {
  const clientDB = await db.connect();
  try {
    const { paymentData, customerInfo, cartItems, totalPedido, envioCosto } = req.body;
    
    // Iniciar el procesado del pago
    const payment = new Payment(client);
    const result = await payment.create({
      body: {
        transaction_amount: paymentData.transaction_amount,
        token: paymentData.token,
        description: paymentData.description,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id,
        payer: {
          email: paymentData.payer.email,
          identification: paymentData.payer.identification
        }
      }
    });

    const mpStatus = result.status; // 'approved', 'in_process', 'rejected', etc.
    let orderId = null;

    try {
      await clientDB.query('BEGIN');
      
      // SIEMPRE insertamos el pedido/cliente local, ya sea exitoso o fallido
      const { rows: [clienteNuevo] } = await clientDB.query(
        `INSERT INTO clientes_evobike
          (nombre, apellido, email, telefono, direccion, ciudad, estado,
           codigo_postal, total_pedido, carrito, mp_payment_id, mp_status, envio_costo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13)
         RETURNING id`,
        [
          customerInfo.firstName || '',
          customerInfo.lastName || '',
          customerInfo.email || '',
          customerInfo.phone || '',
          customerInfo.address || '',
          customerInfo.city || '',
          customerInfo.state || '',
          customerInfo.postcode || '',
          parseFloat(totalPedido) || paymentData.transaction_amount || 0,
          JSON.stringify(cartItems || []),
          result.id || null,
          mpStatus,
          parseFloat(envioCosto) || 0
        ]
      );
      
      orderId = clienteNuevo.id;

      // Si el pago es exitoso o en proceso, reducimos el stock
      if (mpStatus === 'approved' || mpStatus === 'in_process') {
        for (const item of cartItems) {
           await clientDB.query(
             `UPDATE productos SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
             [item.quantity, item.id]
           );
        }
      }
      
      await clientDB.query('COMMIT');
      console.log(`Orden ${orderId} creada en DB local con estado ${mpStatus}`);
    } catch (dbError) {
      await clientDB.query('ROLLBACK');
      console.error("Error guardando orden en BD:", dbError.message);
      // Ojo, el pago de MP se hizo, pero la db local falló.
    }

    res.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      order_id: orderId // El ID local, servirá de "Número de orden"
    });

  } catch (error) {
    console.error("Error processing MP payment:", error);
    res.status(500).json({ error: "No se pudo procesar el pago" });
  } finally {
    clientDB.release();
  }
});

// ─────────────────────────────────────────────
// MÓDULO DE CLIENTES
// ─────────────────────────────────────────────

// POST /api/admin/login — Login administrativo (con correo)
app.post('/api/admin/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  try {
    const { rows } = await db.query(
      "SELECT * FROM admin_usuarios WHERE correo = $1 AND deleted_at IS NULL",
      [correo.toLowerCase()]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });
    const token = jwt.sign({ id: user.id, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol } });
  } catch (err) {
    console.error('Admin Login Error:', err.message);
    res.status(500).json({ error: "Error en el servidor durante el login" });
  }
});

// A partir de aquí, todas las rutas /api/admin requieren autenticación
app.use('/api/admin', adminAuthMiddleware);

// POST /api/clientes/registro
app.post("/api/clientes/registro", async (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });

  try {
    const existe = await db.query("SELECT id FROM clientes WHERE email = $1", [email.toLowerCase()]);
    if (existe.rows.length > 0) return res.status(409).json({ error: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO clientes (nombre, apellido, email, password, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, apellido, email, telefono, created_at",
      [nombre, apellido || null, email.toLowerCase(), hash, telefono || null]
    );
    const cliente = result.rows[0];
    const token = jwt.sign({ id: cliente.id, email: cliente.email }, JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, cliente });
  } catch (err) {
    console.error("Error en registro:", err.message);
    res.status(500).json({ error: "Error al registrar cliente" });
  }
});

// POST /api/clientes/login
app.post("/api/clientes/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email y contraseña son requeridos" });

  try {
    const result = await db.query("SELECT * FROM clientes WHERE email = $1", [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Credenciales incorrectas" });

    const cliente = result.rows[0];
    const valido = await bcrypt.compare(password, cliente.password);
    if (!valido) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = jwt.sign({ id: cliente.id, email: cliente.email }, JWT_SECRET, { expiresIn: "30d" });
    const { password: _, ...clienteSinPassword } = cliente;
    res.json({ token, cliente: clienteSinPassword });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// GET /api/clientes/perfil (protegido)
app.get("/api/clientes/perfil", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nombre, apellido, email, telefono, created_at FROM clientes WHERE id = $1",
      [req.cliente.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en perfil:", err.message);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

// PUT /api/clientes/perfil (protegido)
app.put("/api/clientes/perfil", authMiddleware, async (req, res) => {
  const { nombre, apellido, telefono } = req.body;
  try {
    const result = await db.query(
      "UPDATE clientes SET nombre=$1, apellido=$2, telefono=$3, updated_at=NOW() WHERE id=$4 RETURNING id, nombre, apellido, email, telefono",
      [nombre, apellido || null, telefono || null, req.cliente.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando perfil:", err.message);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

// GET /api/clientes/direcciones (protegido) — obtiene las últimas 3 direcciones únicas usadas en WooCommerce
app.get("/api/clientes/direcciones", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT email, telefono, nombre, apellido FROM clientes WHERE id = $1", [req.cliente.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });

    const clienteDB = result.rows[0];
    const email = clienteDB.email;

    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
      params: {
        billing_email: email,
        per_page: 50, // Buscar suficientes para encontrar hasta 3 únicas
        orderby: "date",
        order: "desc",
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
      },
    });

    if (!Array.isArray(response.data) || response.data.length === 0) {
      return res.json([]);
    }

    const direcciones = [];
    const signatures = new Set(); // Para asegurar unicidad

    for (const order of response.data) {
      const source = (order.shipping && order.shipping.address_1) ? order.shipping : order.billing;
      if (!source || !source.address_1) continue;

      const firstName = source.first_name || order.billing.first_name || clienteDB.nombre || '';
      const lastName = source.last_name || order.billing.last_name || clienteDB.apellido || '';
      const address = source.address_1;
      const city = source.city || '';
      const state = source.state || '';
      const postcode = source.postcode || '';
      const phone = order.billing.phone || clienteDB.telefono || '';
      
      const signature = `${firstName}|${lastName}|${address}|${city}|${state}|${postcode}`.toLowerCase().trim();

      if (!signatures.has(signature)) {
        signatures.add(signature);
        direcciones.push({
          firstName,
          lastName,
          email, 
          phone,
          address,
          city,
          state,
          postcode
        });

        if (direcciones.length === 3) break;
      }
    }

    res.json(direcciones);
  } catch (err) {
    console.error("Error obteniendo direcciones:", err.message);
    res.json([]);
  }
});

// GET /api/clientes/pedidos (protegido) — consulta WooCommerce por email
app.get("/api/clientes/pedidos", authMiddleware, async (req, res) => {
  try {
    // Obtener email del cliente desde Postgres
    const result = await db.query("SELECT email FROM clientes WHERE id = $1", [req.cliente.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });

    const email = result.rows[0].email;

    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/orders`, {
      params: {
        billing_email: email,
        per_page: 20,
        orderby: "date",
        order: "desc",
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
      },
    });

    if (!Array.isArray(response.data)) return res.json([]);

    const pedidos = response.data.map(p => ({
      id: p.id,
      numero: p.number,
      fecha: p.date_created,
      estado: p.status,
      total: `$ ${parseFloat(p.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      envio: `$ ${parseFloat(p.shipping_total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      direccion_envio: p.shipping && p.shipping.address_1 
        ? `${p.shipping.address_1}, ${p.shipping.city}, ${p.shipping.state}`
        : (p.billing && p.billing.address_1 ? `${p.billing.address_1}, ${p.billing.city}, ${p.billing.state}` : 'No especificada'),
      productos: p.line_items.map(i => ({ 
        nombre: i.name, 
        cantidad: i.quantity, 
        subtotal: `$ ${parseFloat(i.subtotal || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` 
      })),
    }));

    res.json(pedidos);
  } catch (err) {
    console.error("Error obteniendo pedidos:", err.message);
    // Si WooCommerce falla, devolvemos vacío (no queremos romper el dashboard)
    res.json([]);
  }
});


// =============================================
// ADMIN — Productos
// =============================================

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// Helper: Subir buffer a Cloudinary y devolver URL segura
const uploadToCloudinary = (buffer, folder = 'evobike/productos') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// GET /api/admin/productos?page=1&limit=10
app.get('/api/admin/productos', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;
  try {
    const [{ rows: [{ total }] }, { rows: productos }] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM productos WHERE deleted_at IS NULL`),
      db.query(
        `SELECT p.id, p.nombre, p.precio, p.descuento_porcentaje, p.stock,
                p.categoria, p.publicado, p.foto_principal,
                TO_CHAR(p.created_at, 'DD/MM/YYYY') AS created_at,
                u.usuario AS autor
         FROM productos p
         LEFT JOIN admin_usuarios u ON u.id = p.admin_usuario_id
         WHERE p.deleted_at IS NULL
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      )
    ]);
    res.json({ data: productos, total: parseInt(total), page, limit });
  } catch (err) {
    console.error('GET /api/admin/productos:', err.message);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/admin/productos — Crear producto con imágenes a Cloudinary
const productoFields = upload.fields([
  { name: 'foto_principal', maxCount: 1 },
  { name: 'galeria', maxCount: 20 },
  { name: 'colores_fotos', maxCount: 20 },
]);

app.post('/api/admin/productos', productoFields, async (req, res) => {
  const {
    nombre, descripcion, precio, descuento_porcentaje,
    stock, categoria, publicado, voltajes, colores_nombres
  } = req.body;

  if (!nombre || !precio)
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Subir imagen principal a Cloudinary
    let fotoPrincipalUrl = null;
    if (req.files?.foto_principal?.[0]) {
      fotoPrincipalUrl = await uploadToCloudinary(req.files.foto_principal[0].buffer);
    }

    // Subir galería
    const galeriaUrls = [];
    if (req.files?.galeria) {
      for (const file of req.files.galeria) {
        galeriaUrls.push(await uploadToCloudinary(file.buffer, 'evobike/galeria'));
      }
    }

    // Parsear arrays
    const voltajesArr = voltajes ? JSON.parse(voltajes) : [];
    const coloresNombresArr = colores_nombres ? JSON.parse(colores_nombres) : [];

    // Insertar producto
    const { rows: [producto] } = await client.query(
      `INSERT INTO productos
        (nombre, descripcion, precio, descuento_porcentaje, stock, categoria,
         publicado, foto_principal, galeria, voltajes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb)
       RETURNING id`,
      [
        nombre, descripcion, parseFloat(precio),
        parseFloat(descuento_porcentaje) || 0,
        parseInt(stock) || 0,
        categoria,
        publicado === 'true',
        fotoPrincipalUrl,
        JSON.stringify(galeriaUrls),
        JSON.stringify(voltajesArr)
      ]
    );

    // Insertar variaciones de color
    if (coloresNombresArr.length > 0) {
      const coloresFotos = req.files?.colores_fotos || [];
      for (let i = 0; i < coloresNombresArr.length; i++) {
        let fotoColorUrl = null;
        if (coloresFotos[i]) {
          fotoColorUrl = await uploadToCloudinary(coloresFotos[i].buffer, 'evobike/colores');
        }
        await client.query(
          `INSERT INTO productos_colores (producto_id, nombre, foto) VALUES ($1, $2, $3)`,
          [producto.id, coloresNombresArr[i], fotoColorUrl]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id: producto.id, message: 'Producto creado correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/admin/productos:', err.message);
    res.status(500).json({ error: err.message || 'Error al crear producto' });
  } finally {
    client.release();
  }
});

// GET /api/admin/productos/:id — Obtener producto + colores para editar
app.get('/api/admin/productos/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM productos WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Obtener colores
    const { rows: colores } = await db.query(
      `SELECT id, nombre, foto FROM productos_colores WHERE producto_id = $1 ORDER BY id ASC`,
      [req.params.id]
    );
    
    const producto = rows[0];
    producto.colores = colores;
    res.json(producto);
  } catch (err) {
    console.error('GET /api/admin/productos/:id error:', err.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// PUT /api/admin/productos/:id — Editar producto (versión simplificada que actualiza los datos base)
app.put('/api/admin/productos/:id', productoFields, async (req, res) => {
  const { id } = req.params;
  const {
    nombre, descripcion, precio, descuento_porcentaje,
    stock, categoria, publicado, voltajes, colores_nombres, colores_ids_to_keep
  } = req.body;

  if (!nombre || !precio)
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Construcción dinámica de la query para evitar errores de índices ($1, $2...)
    const fields = [
      'nombre', 'descripcion', 'precio', 'descuento_porcentaje',
      'stock', 'categoria', 'publicado', 'voltajes'
    ];
    const values = [
      nombre, descripcion, parseFloat(precio), parseFloat(descuento_porcentaje) || 0,
      parseInt(stock) || 0, categoria, publicado === 'true', voltajes || '[]'
    ];

    // Manejar imagen principal nueva
    if (req.files?.foto_principal?.[0]) {
      const url = await uploadToCloudinary(req.files.foto_principal[0].buffer);
      fields.push('foto_principal');
      values.push(url);
    }

    const setQuery = fields.map((f, i) => {
      if (f === 'voltajes') return `${f} = $${i + 1}::jsonb`;
      return `${f} = $${i + 1}`;
    }).join(', ');
    
    // El ID es el último parámetro
    values.push(id);
    const query = `UPDATE productos SET ${setQuery}, edited_at = NOW() WHERE id = $${values.length} AND deleted_at IS NULL RETURNING id`;

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Manejar galería nueva
    if (req.files?.galeria) {
      // Obtener galería actual para no pisarla (o el front enviará luego que borrar)
      const { rows: [pActual] } = await client.query('SELECT galeria FROM productos WHERE id = $1', [id]);
      let galeriaArr = pActual?.galeria || [];
      for (const file of req.files.galeria) {
        const url = await uploadToCloudinary(file.buffer, 'evobike/galeria');
        galeriaArr.push(url);
      }
      // Actualizar columna galeria
      await client.query('UPDATE productos SET galeria = $1::jsonb WHERE id = $2', [JSON.stringify(galeriaArr), id]);
    }

    // Manejar colores (Simplificado para el caso de Tigre y otros)
    if (colores_nombres) {
      const nombresArr = JSON.parse(colores_nombres);
      const fotosNuevas = req.files?.colores_fotos || [];
      
      // Borramos colores viejos para este producto e insertamos la nueva lista
      // (Nota: Esto es destructivo para fotos viejas si no se re-envían, 
      // pero soluciona el problema de Tigre que no tenía fotos iniciales)
      await client.query('DELETE FROM productos_colores WHERE producto_id = $1', [id]);
      
      let fotoIdx = 0;
      for (let i = 0; i < nombresArr.length; i++) {
        let fotoUrl = null;
        // Si hay una foto nueva en el array de archivos de Multer
        if (fotosNuevas[fotoIdx]) {
          fotoUrl = await uploadToCloudinary(fotosNuevas[fotoIdx].buffer, 'evobike/colores');
          fotoIdx++;
        }
        await client.query(
          'INSERT INTO productos_colores (producto_id, nombre, foto) VALUES ($1, $2, $3)',
          [id, nombresArr[i], fotoUrl]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PUT /api/admin/productos error:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar producto' });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/productos/:id — Soft delete
app.delete('/api/admin/productos/:id', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE productos SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('DELETE /api/admin/productos:', err.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});




// =============================================
// CLIENTES — Checkout (tienda pública)
// =============================================

// POST /api/clientes — Llamado desde el checkout del client al procesar pago exitoso
app.post('/api/clientes', async (req, res) => {
  const {
    firstName, lastName, email, phone,
    address, city, state, postcode,
    cartItems, totalPedido, envioCosto,
    mpPaymentId, mpStatus
  } = req.body;

  if (!firstName) return res.status(400).json({ error: 'Nombre requerido' });

  try {
    const { rows: [cliente] } = await db.query(
      `INSERT INTO clientes_evobike
        (nombre, apellido, email, telefono, direccion, ciudad, estado,
         codigo_postal, total_pedido, carrito, mp_payment_id, mp_status, envio_costo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13)
       RETURNING id`,
      [
        firstName,
        lastName || '',
        email || '',
        phone || '',
        address || '',
        city || '',
        state || '',
        postcode || '',
        parseFloat(totalPedido) || 0,
        JSON.stringify(cartItems || []),
        mpPaymentId || null,
        mpStatus || null,
        parseFloat(envioCosto) || 0
      ]
    );
    res.status(201).json({ id: cliente.id });
  } catch (err) {
    console.error('POST /api/clientes:', err.message);
    res.status(500).json({ error: 'Error al guardar cliente' });
  }
});

// GET /api/admin/clientes?page=1&limit=10
app.get('/api/admin/clientes', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;
  try {
    const [{ rows: [{ total }] }, { rows: clientes }] = await Promise.all([
      db.query(`SELECT COUNT(DISTINCT email) AS total FROM clientes_evobike WHERE deleted_at IS NULL`),
      db.query(
        `SELECT id, nombre, apellido, email, telefono, ciudad, estado,
                total_pedido, mp_status,
                TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at
         FROM (
           SELECT DISTINCT ON (email) *
           FROM clientes_evobike
           WHERE deleted_at IS NULL
           ORDER BY email, created_at DESC
         ) AS sub
         ORDER BY id DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      )
    ]);
    res.json({ data: clientes, total: parseInt(total), page, limit });
  } catch (err) {
    console.error('GET /api/admin/clientes:', err.message);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/admin/pedidos?page=1&limit=10 — Lista TODOS los pedidos (sin agrupar)
app.get('/api/admin/pedidos', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const offset = (page - 1) * limit;
  try {
    const [{ rows: [{ total }] }, { rows: pedidos }] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM clientes_evobike WHERE deleted_at IS NULL`),
      db.query(
        `SELECT id, nombre, apellido, email, telefono, ciudad, estado,
                total_pedido, mp_status,
                TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at
         FROM clientes_evobike
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      )
    ]);
    res.json({ data: pedidos, total: parseInt(total), page, limit });
  } catch (err) {
    console.error('GET /api/admin/pedidos error:', err.message);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// GET /api/admin/clientes/:id — Detalle de un cliente
app.get('/api/admin/clientes/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT *, TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') AS fecha_compra
       FROM clientes_evobike WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// PATCH /api/admin/clientes/:id/status — Actualizar el estado de un pedido
app.patch('/api/admin/clientes/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved', 'completed', 'rejected'
  try {
    const result = await db.query(
      `UPDATE clientes_evobike SET mp_status = $1 WHERE id = $2 RETURNING id, mp_status`,
      [status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /api/admin/clientes status:', err.message);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// GET /api/admin/stats — Estadísticas para el Dashboard
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [{ rows: [{ customers }] }, { rows: [{ orders }] }, { rows: [{ products }] }] = await Promise.all([
      db.query(`SELECT COUNT(DISTINCT email) AS customers FROM clientes_evobike WHERE deleted_at IS NULL`),
      db.query(`SELECT COUNT(*) AS orders FROM clientes_evobike WHERE deleted_at IS NULL`),
      db.query(`SELECT COUNT(*) AS products FROM productos WHERE deleted_at IS NULL`)
    ]);
    res.json({
      customers: parseInt(customers),
      orders: parseInt(orders),
      products: parseInt(products)
    });
  } catch (err) {
    console.error('GET /api/admin/stats error:', err.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// GET /api/admin/usuarios — Lista todos los usuarios (sin eliminados)

app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, usuario, correo, rol,
              TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at
       FROM admin_usuarios
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/admin/usuarios error:', err.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /api/admin/usuarios/:id — Un usuario para editar
app.get('/api/admin/usuarios/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, nombre, usuario, correo, rol FROM admin_usuarios WHERE id = $1 AND deleted_at IS NULL`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
})

// POST /api/admin/usuarios — Crear nuevo usuario

app.post('/api/admin/usuarios', async (req, res) => {
  const { nombre, correo, usuario, rol, password } = req.body;
  if (!nombre || !correo || !usuario || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO admin_usuarios (nombre, correo, usuario, rol, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, usuario, correo, rol,
                 TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at`,
      [nombre, correo, usuario, rol || 'Tienda', hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El correo o usuario ya existe' });
    }
    console.error('POST /api/admin/usuarios error:', err.message);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT /api/admin/usuarios/:id — Editar usuario
app.put('/api/admin/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, usuario, rol } = req.body;
  try {
    const result = await db.query(
      `UPDATE admin_usuarios
       SET nombre = COALESCE($1, nombre),
           correo = COALESCE($2, correo),
           usuario = COALESCE($3, usuario),
           rol    = COALESCE($4, rol),
           edited_at = NOW()
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING id, nombre, usuario, correo, rol,
                 TO_CHAR(created_at, 'DD/MM/YYYY') AS created_at`,
      [nombre, correo, usuario, rol, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/admin/usuarios error:', err.message);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/admin/usuarios/:id — Soft delete
app.delete('/api/admin/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `UPDATE admin_usuarios SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('DELETE /api/admin/usuarios error:', err.message);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`Evobike API Proxy running locally on port ${PORT}`)
  );
}

module.exports = app;

