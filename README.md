# Shopify Product Image Background Remover

This Python script retrieves all products and their images from a Shopify store, removes their backgrounds using the [rembg](https://github.com/danielgatis/rembg) library, and updates the existing images on Shopify to have transparent backgrounds. This keeps the same image order and simply updates the original images in place.

## Features
- Fetches all products from a Shopify store.
- For each product, fetches all images.
- Uses `rembg` to remove the background from each image locally (no external API costs).
- Updates the existing Shopify product images with the processed (transparent) versions.
- Maintains the original image order.

## Requirements
- Python 3.7+
- A working [Shopify Custom App Access Token](https://shopify.dev/apps/auth/admin-access).
- `rembg` for background removal.
- `requests` for HTTP requests.
- `Pillow` for image handling if needed.
- `onnxruntime` or `onnxruntime-gpu` for `rembg` execution.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/asadmahmood19/Image_Processing.git
   cd Image_Processing

2. Install Python dependencies:
   pip install rembg requests Pillow onnxruntime

3. Edit process_images.py:
   SHOPIFY_STORE_DOMAIN = "your-store.myshopify.com"  # Replace with your store domain
   SHOPIFY_ACCESS_TOKEN = "your-shopify-access-token"  # Replace with your Access Token

4. Run the script:
   python process_images.py
