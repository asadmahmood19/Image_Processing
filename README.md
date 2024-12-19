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

   git clone https://github.com/asadmahmood19/Image_Processing.git
   cd Image_Processing

2. Install Python dependencies:

   pip install rembg requests Pillow onnxruntime

3. Retrieve your Shopify Access Token:

   In your Shopify Admin, go to Settings > Apps and sales channels > Develop apps > Create an app.
   Name your app and configure the required permissions (e.g., read_products and write_products).
   Install the app and copy the access token. It should start with shpat_.

4. Edit process_images.py:

    Replace the placeholders with your actual store domain and access token:
    SHOPIFY_STORE_DOMAIN = "your-store.myshopify.com"
    SHOPIFY_ACCESS_TOKEN = "shpat_xxx_your_token_here"

5. Run the script:
  
   python process_images.py


Notes

If you have many products/images, this can take some time.
If your store theme has a white background, transparent images might look similar to the original images, but you can verify transparency by checking the images in an image viewer that shows a checkerboard pattern for transparency.