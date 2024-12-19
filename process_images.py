# Install Python dependencies:
# pip install rembg requests Pillow onnxruntime


import requests
import base64
from rembg import remove
from io import BytesIO

# --- CONFIGURATION ---
# To get your SHOPIFY_ACCESS_TOKEN, go to Shopify admin:
# Settings > Apps and sales channels > Develop apps > Create an app
# Name your app and allow `read_products` and `write_products` permissions, 
# then install the app and copy the generated access token (starts with `shpat_`).

SHOPIFY_STORE_DOMAIN = "your-store.myshopify.com"  # Replace with your store domain
SHOPIFY_ACCESS_TOKEN = "your-shopify-access-token"  # Replace with your Access Token

SHOPIFY_API_VERSION = "2023-07"

HEADERS = {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json"
}

def get_all_products():
    products = []
    url = f"https://{SHOPIFY_STORE_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/products.json?limit=250"
    
    while url:
        r = requests.get(url, headers=HEADERS)
        r.raise_for_status()
        data = r.json()
        products.extend(data.get('products', []))
        
        link_header = r.headers.get('Link')
        if link_header and 'rel="next"' in link_header:
            import re
            match = re.search(r'<([^>]+)>; rel="next"', link_header)
            if match:
                url = match.group(1)
            else:
                url = None
        else:
            url = None
    
    return products

def get_product_images(product_id):
    url = f"https://{SHOPIFY_STORE_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/products/{product_id}/images.json"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json().get('images', [])

def download_image(url):
    r = requests.get(url, stream=True)
    r.raise_for_status()
    return r.content

def remove_bg(image_bytes):
    return remove(image_bytes)  # rembg's remove function returns image bytes with the background removed

def update_product_image(product_id, image_id, image_bytes):
    # Convert the processed image bytes to base64
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    url = f"https://{SHOPIFY_STORE_DOMAIN}/admin/api/{SHOPIFY_API_VERSION}/products/{product_id}/images/{image_id}.json"
    payload = {
        "image": {
            "id": image_id,
            "attachment": base64_image
        }
    }

    r = requests.put(url, json=payload, headers=HEADERS)
    r.raise_for_status()
    return r.json().get('image')

def main():
    print("Fetching all products...")
    products = get_all_products()
    print(f"Found {len(products)} products.")

    for product in products:
        product_id = product['id']
        title = product['title']
        print(f"Processing product: {title} (ID: {product_id})")

        images = get_product_images(product_id)
        for img in images:
            img_url = img['src']
            img_id = img['id']
            print(f" - Removing background from image: {img_url}")
            try:
                original_image_bytes = download_image(img_url)
                processed_bytes = remove_bg(original_image_bytes)
                
                # Update the existing image with the processed one
                update_product_image(product_id, img_id, processed_bytes)
                print(f"   ✓ Updated existing image (transparent) for product {product_id}")
            except Exception as e:
                print(f"   ✗ Failed to process image: {img_url}")
                print("   Error:", e)

    print("Done processing all products and their images.")

if __name__ == "__main__":
    main()
