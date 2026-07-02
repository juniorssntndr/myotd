# Local Uploads

Product images are uploaded through the admin panel and stored on the application server.

## Coolify / VPS configuration

Set this environment variable for the application:

```env
UPLOAD_DIR=/app/uploads
```

Then add persistent storage in Coolify mounted at:

```txt
/app/uploads
```

This is required. If uploads are stored only inside the container filesystem, product images can disappear after a redeploy or container rebuild.

## Runtime behavior

- Accepted product image formats: JPG, PNG, WebP.
- Upload limit: 5 MB per image.
- Images are converted to optimized WebP files and stored under `products/` inside `UPLOAD_DIR`.
- Public product image URLs use `/uploads/products/<file>.webp`.
