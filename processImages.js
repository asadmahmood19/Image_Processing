const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs').promises; // only needed if you plan to debug by saving files locally

// --- CONFIGURATION ---
const SHOPIFY_STORE_DOMAIN = "your-store.myshopify.com"; // replace with your store domain
const SHOPIFY_ACCESS_TOKEN = "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"; // replace with your token
const REMOVEBG_API_KEY = "YOUR_REMOVE_BG_API_KEY"; // replace with your remove.bg API key

// Shopify API versions update over time, use the latest stable version:
const SHOPIFY_API_VERSION = "2023-07";

// --- FUNCTIONS ---

// Get all products from Shopify (this might require pagination if you have many products)
async function getAllProducts() {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;
  const headers = {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json"
  };

  let products = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await axios.get(nextUrl, { headers });
    products = products.concat(response.data.products);
    // Check if there is a "Link" header for pagination
    const linkHeader = response.headers['link'];
    if (linkHeader && linkHeader.includes('rel="next"')) {
      const match = linkHeader.match(/<(.*?)>; rel="next"/);
      nextUrl = match ? match[1] : null;
    } else {
      nextUrl = null;
    }
  }

  return products;
}

// Get product images for a given product ID
async function getProductImages(productId) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/images.json`;
  const headers = {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json"
  };
  const response = await axios.get(url, { headers });
  return response.data.images || [];
}

// Use remove.bg API to remove background from an image URL
async function removeBackgroundFromImage(imageUrl) {
  const formData = new FormData();
  formData.append('image_url', imageUrl);
  formData.append('size', 'auto'); // optional, adjust as needed

  const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
    headers: {
      'X-Api-Key': REMOVEBG_API_KEY,
      ...formData.getHeaders()
    },
    responseType: 'arraybuffer' // because remove.bg returns binary data
  });

  return response.data; // binary image data
}

// Upload the processed image to Shopify as a new product image
async function createProductImage(productId, imageBuffer) {
  // Convert binary to base64
  const base64Image = imageBuffer.toString('base64');

  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/images.json`;
  const headers = {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json"
  };
  const payload = {
    image: {
      attachment: base64Image
      // Optionally you can provide a filename or position
    }
  };

  const response = await axios.post(url, payload, { headers });
  return response.data.image;
}

// MAIN FUNCTION
(async () => {
  try {
    console.log("Fetching all products...");
    const products = await getAllProducts();
    console.log(`Found ${products.length} products.`);

    for (const product of products) {
      console.log(`Processing product: ${product.title} (ID: ${product.id})`);
      const images = await getProductImages(product.id);

      for (const img of images) {
        console.log(` - Processing image: ${img.src}`);
        try {
          const processedImageData = await removeBackgroundFromImage(img.src);
          await createProductImage(product.id, processedImageData);
          console.log(`   ✓ Added processed image without background`);
          // If you want to remove the old image after adding new one, you could:
          // await deleteProductImage(product.id, img.id);
        } catch (error) {
          console.error(`   ✗ Failed to process image: ${img.src}`, error.response ? error.response.data : error);
        }
      }
    }

    console.log("Done processing all products and their images.");
  } catch (err) {
    console.error("Error running script:", err.response ? err.response.data : err.message);
  }
})();
