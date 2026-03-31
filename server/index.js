require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

const WC_URL = process.env.VITE_WC_URL || "https://tu-tienda.com";
const WC_KEY = process.env.VITE_WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.VITE_WC_CONSUMER_SECRET || "";
const JWT_SECRET = process.env.JWT_SECRET || "evobike_secret_2024";

// Conexión a Neon PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_VGpZrwP70vJk@ep-shy-lab-amyh5564-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Middleware para verificar JWT
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

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "TEST" });

app.get("/api/products/bestsellers", async (req, res) => {
  try {
    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products`, {
      params: {
        orderby: "popularity",
        order: "desc",
        per_page: 4,
        status: "publish",
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
      },
    });

    // Validar que sea un array (si WC devuelve error, viene como objeto)
    if (!Array.isArray(response.data)) {
      console.error("WC bestsellers response is not an array:", JSON.stringify(response.data));
      return res.status(502).json({ error: "Respuesta inesperada de WooCommerce", detail: response.data });
    }

    // Mapeamos solo lo que necesita el frontend para no enviar data innecesaria
    const mappedProducts = response.data.map((product) => {
      // Extraer URLs de imagen principal (si hay)
      let primaryImage = null;
      if (product.images && product.images.length > 0) {
        primaryImage = product.images[0].src;
      }

      // Formatear precios (WC envía precios numéricos como string)
      const currentPriceNum = product.price ? parseFloat(product.price) : 0;
      const regularPriceNum = product.regular_price
        ? parseFloat(product.regular_price)
        : 0;

      const currentPriceFormatted = product.price
        ? `$ ${currentPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
        : "";
      const regularPriceFormatted = product.regular_price
        ? `$ ${regularPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
        : "";

      return {
        id: product.id,
        name: product.name,
        permalink: product.permalink, // Link al producto
        // Para cálculos numéricos en el carrito
        price: currentPriceNum,
        // Para mostrar strings bonitos en la UI
        priceFormatted: currentPriceFormatted,
        compareAtPriceFormatted:
          currentPriceNum !== regularPriceNum && regularPriceNum > 0
            ? regularPriceFormatted
            : null,
        image: primaryImage,
        // Lógica de "badge" (Popular, Oferta, etc.) se puede sacar de etiquetas o estado "on_sale"
        badge: product.on_sale ? "Oferta" : product.featured ? "Destacado" : "",
      };
    });

    res.json(mappedProducts);
  } catch (error) {
    console.error("Error fetching WC products:", error.message);
    res.status(500).json({ error: "Error connecting to WooCommerce store" });
  }
});

app.get("/api/products/random", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    // Pedir más productos para poder mezclarlos y no dar siempre los mismos
    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products`, {
      params: {
        per_page: 20,
        status: "publish",
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
      },
    });

    // Validar que sea un array (si WC devuelve error, viene como objeto)
    if (!Array.isArray(response.data)) {
      console.error("WC random response is not an array:", JSON.stringify(response.data));
      return res.status(502).json({ error: "Respuesta inesperada de WooCommerce", detail: response.data });
    }

    let allProducts = response.data;

    // Sort array randomly
    allProducts.sort(() => 0.5 - Math.random());
    
    // Tomar el límite solicitado
    const selectedProducts = allProducts.slice(0, limit);

    // Mapear
    const mappedProducts = selectedProducts.map((product) => {
      let primaryImage = null;
      if (product.images && product.images.length > 0) {
        primaryImage = product.images[0].src;
      }
      const currentPriceNum = product.price ? parseFloat(product.price) : 0;
      const regularPriceNum = product.regular_price ? parseFloat(product.regular_price) : 0;
      const currentPriceFormatted = product.price ? `$ ${currentPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "";
      const regularPriceFormatted = product.regular_price ? `$ ${regularPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "";

      return {
        id: product.id,
        name: product.name,
        permalink: product.permalink,
        price: currentPriceNum,
        priceFormatted: currentPriceFormatted,
        compareAtPriceFormatted: currentPriceNum !== regularPriceNum && regularPriceNum > 0 ? regularPriceFormatted : null,
        image: primaryImage,
        badge: product.on_sale ? "Oferta" : product.featured ? "Destacado" : "",
      };
    });

    res.json(mappedProducts);
  } catch (error) {
    console.error("Error fetching random WC products:", error.message);
    res.status(500).json({ error: "Error connecting to WooCommerce store" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products/categories`, {
      params: {
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
        per_page: 100,
        hide_empty: true
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: "Error connecting to WooCommerce categories" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, min_price, max_price, attribute, attribute_term, search } = req.query;
    
    let params = {
      per_page: 100,
      status: "publish",
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
    };

    if (category) params.category = category;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;
    if (search) params.search = search;
    if (attribute && attribute_term) {
      params.attribute = attribute;
      params.attribute_term = attribute_term;
    }

    const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products`, { params });

    if (!Array.isArray(response.data)) {
      return res.status(502).json({ error: "Respuesta inesperada", detail: response.data });
    }

    const mappedProducts = response.data.map((product) => {
      let primaryImage = null;
      if (product.images && product.images.length > 0) primaryImage = product.images[0].src;
      const currentPriceNum = product.price ? parseFloat(product.price) : 0;
      const regularPriceNum = product.regular_price ? parseFloat(product.regular_price) : 0;
      const currentPriceFormatted = product.price ? `$ ${currentPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "";
      const regularPriceFormatted = product.regular_price ? `$ ${regularPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "";

      return {
        id: product.id,
        name: product.name,
        permalink: product.permalink,
        price: currentPriceNum,
        priceFormatted: currentPriceFormatted,
        compareAtPriceFormatted: currentPriceNum !== regularPriceNum && regularPriceNum > 0 ? regularPriceFormatted : null,
        image: primaryImage,
        badge: product.on_sale ? "Oferta" : product.featured ? "Destacado" : "",
        categories: product.categories || [],
        attributes: product.attributes || []
      };
    });

    res.json(mappedProducts);
  } catch (error) {
    console.error("Error fetching all products:", error.message);
    res.status(500).json({ error: "Error conectando a WooCommerce" });
  }
});

app.get("/api/attributes/colors", async (req, res) => {
  try {
    const attrsResponse = await axios.get(`${WC_URL}/wp-json/wc/v3/products/attributes`, {
        params: { consumer_key: WC_KEY, consumer_secret: WC_SECRET }
    });
    
    const colorAttr = attrsResponse.data.find(a => a.name.toLowerCase() === 'color' || a.slug === 'pa_color' || a.slug === 'color');
    
    if (colorAttr) {
        const termsResponse = await axios.get(`${WC_URL}/wp-json/wc/v3/products/attributes/${colorAttr.id}/terms`, {
             params: { consumer_key: WC_KEY, consumer_secret: WC_SECRET, per_page: 100 }
        });
        res.json({ attributeId: colorAttr.id, attributeSlug: colorAttr.slug, terms: termsResponse.data });
    } else {
        res.json({ terms: [] });
    }
  } catch(error) {
      console.error("Error fetching colors:", error.message);
      res.json({ terms: [] });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (!isNaN(id)) {
      // Si es un ID numérico
      const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products/${id}`, {
        params: {
          consumer_key: WC_KEY,
          consumer_secret: WC_SECRET,
        },
      });
      product = response.data;
    } else {
      // Si es un slug (string)
      const response = await axios.get(`${WC_URL}/wp-json/wc/v3/products`, {
        params: {
          slug: id,
          consumer_key: WC_KEY,
          consumer_secret: WC_SECRET,
        },
      });
      if (!response.data || response.data.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      product = response.data[0];
    }

    let primaryImage = null;
    let images = [];
    if (product.images && product.images.length > 0) {
      primaryImage = product.images[0].src;
      images = product.images;
    }

    // Fetch variations if the product has them
    let variationDetails = [];
    if (product.type === 'variable' || (product.variations && product.variations.length > 0)) {
      try {
        const varResponse = await axios.get(`${WC_URL}/wp-json/wc/v3/products/${product.id}/variations`, {
          params: {
            consumer_key: WC_KEY,
            consumer_secret: WC_SECRET,
            per_page: 100 // Get all variations (up to 100)
          },
        });
        
        // Map variations to only what we need
        variationDetails = varResponse.data.map(v => ({
          id: v.id,
          attributes: v.attributes, // array of { id, name, option }
          image: v.image ? v.image.src : null,
          price: v.price ? parseFloat(v.price) : 0,
        }));
      } catch (err) {
        console.error("Error fetching variations:", err.message);
      }
    }

    const currentPriceNum = product.price ? parseFloat(product.price) : 0;
    const currentPriceFormatted = product.price
      ? `$ ${currentPriceNum.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
      : "";

    // Retornamos un producto formateado para la vista individual
    res.json({
      id: product.id,
      name: product.name,
      description: product.description ? product.description.replace(/(<([^>]+)>)/gi, "") : 'Sin descripción', // strip basic HTML
      shortDescription: product.short_description ? product.short_description.replace(/(<([^>]+)>)/gi, "") : '',
      price: currentPriceNum,
      priceFormatted: currentPriceFormatted,
      image: primaryImage,
      images: images,
      attributes: product.attributes || [],
      variations: variationDetails,
    });
  } catch (error) {
    console.error("Error fetching single WC product:", error.message);
    res.status(500).json({ error: "Error connecting to WooCommerce store" });
  }
});

// Ruta para procesar el pago directamente con Payment Brick
app.post("/api/process_payment", async (req, res) => {
  try {
    const { paymentData, customerInfo, cartItems } = req.body;
    
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

    let wcOrderId = null;

    // Si el pago es exitoso o está en proceso, creamos la orden en WooCommerce
    if (result.status === 'approved' || result.status === 'in_process') {
      try {
        const orderPayload = {
          payment_method: 'mercadopago',
          payment_method_title: 'Mercado Pago',
          set_paid: true,
          billing: {
            first_name: customerInfo.firstName || '',
            last_name: customerInfo.lastName || '',
            address_1: customerInfo.address || '',
            city: customerInfo.city || '',
            state: customerInfo.state || '',
            postcode: customerInfo.postcode || '',
            country: 'MX',
            email: customerInfo.email || '',
            phone: customerInfo.phone || ''
          },
          shipping: {
            first_name: customerInfo.firstName || '',
            last_name: customerInfo.lastName || '',
            address_1: customerInfo.address || '',
            city: customerInfo.city || '',
            state: customerInfo.state || '',
            postcode: customerInfo.postcode || '',
            country: 'MX'
          },
          line_items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          }))
        };

        const wcResponse = await axios.post(`${WC_URL}/wp-json/wc/v3/orders`, orderPayload, {
          params: {
            consumer_key: WC_KEY,
            consumer_secret: WC_SECRET
          }
        });

        wcOrderId = wcResponse.data.id;
        console.log(`Orden creada en WooCommerce con ID: ${wcOrderId}`);
      } catch (wcError) {
        console.error("Error al crear la orden en WooCommerce:", wcError.response ? wcError.response.data : wcError.message);
        // Aun así devolvemos el éxito del pago, pero logueamos el error de WC
      }
    }

    res.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      wc_order_id: wcOrderId
    });

  } catch (error) {
    console.error("Error processing MP payment:", error);
    res.status(500).json({ error: "No se pudo procesar el pago" });
  }
});

// ─────────────────────────────────────────────
// MÓDULO DE CLIENTES
// ─────────────────────────────────────────────

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

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`Evobike API Proxy running locally on port ${PORT}`)
  );
}

module.exports = app;
