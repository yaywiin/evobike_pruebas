require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

const WC_URL = process.env.VITE_WC_URL || "https://tu-tienda.com";
const WC_KEY = process.env.VITE_WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.VITE_WC_CONSUMER_SECRET || "";

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
    const paymentData = req.body;
    
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

    res.json({
      status: result.status,
      status_detail: result.status_detail,
      id: result.id
    });

  } catch (error) {
    console.error("Error processing MP payment:", error);
    res.status(500).json({ error: "No se pudo procesar el pago" });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`Evobike API Proxy running locally on port ${PORT}`)
  );
}

module.exports = app;
