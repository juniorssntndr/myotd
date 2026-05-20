# Pruebas en local — Myotd

Guía para levantar el proyecto con **Docker Desktop** y ejecutar el checklist mínimo antes de revalidar con Culqi.

Matriz completa: [QA-TEST-MATRIX.md](./QA-TEST-MATRIX.md)

---

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20.19+ o 22.12+ (ver `package.json` → `engines`) |
| Docker Desktop | En ejecución (ícono verde en la bandeja) |
| npm | Incluido con Node |

> Si `docker` no se reconoce en PowerShell, **cierra y vuelve a abrir la terminal** (o Cursor) después de instalar Docker Desktop.

---

## 1. Arranque rápido (primera vez)

```powershell
cd d:\antigravity\ECOMMERCE

# Dependencias
npm install

# Variables de entorno
copy .env.example .env
# Editar AUTH_SECRET en .env (cualquier string largo en local)

# Base de datos
docker compose up -d

# Esperar ~10 s y aplicar migraciones
npx prisma migrate deploy
npx prisma generate

# Datos de prueba (productos, admin, cliente)
npm run db:seed

# App
npm run dev
```

Abrir: **http://localhost:3000**

### Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@myotd.pe` | `admin123` |
| Cliente | `cliente@myotd.pe` | `admin123` |

---

## 2. Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `docker compose up -d` | Inicia Postgres (`localhost:6040`) |
| `docker compose down` | Detiene contenedor (conserva datos en volumen) |
| `docker compose logs -f postgres` | Ver logs de la BD |
| `npm run dev` | Servidor Next.js en `:3000` |
| `npm run db:seed` | Reinicia datos demo (borra pedidos previos) |
| `npm run db:studio` | Prisma Studio en http://localhost:5555 |
| `npx prisma migrate deploy` | Aplica migraciones pendientes |

---

## 3. Checklist local (orden recomendado)

Marca cada ítem: `OK` | `Bug` | `N/A`

### Fase A — Infraestructura (5 min)

| # | Verificación | Cómo comprobarlo | OK |
|---|--------------|------------------|-----|
| A1 | Docker corre | `docker compose ps` → `myotd-db` healthy | ☐ |
| A2 | BD responde | `npm run db:studio` abre sin error | ☐ |
| A3 | App arranca | `npm run dev` → http://localhost:3000 carga | ☐ |
| A4 | Sin error de `DATABASE_URL` | Consola del servidor sin "DATABASE_URL no está configurada" | ☐ |
| A5 | Seed aplicado | `/products` muestra productos | ☐ |

### Fase B — Smoke (matriz SMK-01 a SMK-18)

Rutas que deben abrir **sin pantalla en blanco ni error 500**:

| ID | Ruta | Notas |
|----|------|-------|
| SMK-01 | http://localhost:3000/ | Home |
| SMK-02 | http://localhost:3000/products | Catálogo |
| SMK-03 | http://localhost:3000/products/[slug] | Abrir cualquier producto del listado |
| SMK-04 | http://localhost:3000/cart | Vacío y con items |
| SMK-05 | http://localhost:3000/checkout | Requiere carrito + login |
| SMK-06 | http://localhost:3000/login | |
| SMK-07 | http://localhost:3000/register | |
| SMK-08 | http://localhost:3000/profile | Login como `cliente@myotd.pe` |
| SMK-13 | http://localhost:3000/admin | Login como `admin@myotd.pe` |
| SMK-15 | http://localhost:3000/admin/products/new | Formulario crear producto |

### Fase C — Flujo de compra (prioridad Culqi)

| ID | Caso | Pasos | Esperado | OK |
|----|------|-------|----------|-----|
| C1 | Agregar al carrito | PDP → elegir talla/color → Agregar | Item en `/cart` con variante correcta | ☐ |
| C2 | Checkout sin login | Carrito → CTA | Redirige a `/login?callbackUrl=/checkout` | ☐ |
| C3 | Checkout con login | Login cliente → carrito → checkout | Paso 1 envío visible | ☐ |
| C4 | Validación envío | Paso 1 incompleto → Continuar | Mensaje de error | ☐ |
| C5 | Costo de envío | Cambiar distrito en paso 1 | Total actualiza en resumen | ☐ |
| C6 | Confirmar pago | Paso 3 → "Confirmar y pagar" | Network: `POST /api/checkout` → 200 + `checkoutUrl` | ☐ |
| C7 | Redirect Culqi | Con `CULQI_*` en `.env` | Redirección a `checkout.culqi.com` | ☐ |
| C7b | Sin Culqi | Sin keys en `.env` | Redirige a `/checkout/success?fallback=manual` (solo dev) | ☐ |

**DevTools:** F12 → Network → filtrar `checkout` al confirmar pedido.

### Fase D — Admin productos (bug reportado)

| ID | Caso | Pasos | Esperado | OK |
|----|------|-------|----------|-----|
| D1 | Listar | `/admin/products` | Tabla con productos del seed | ☐ |
| D2 | Crear | `/admin/products/new` → completar todo → Guardar | Toast éxito + redirección a listado | ☐ |
| D3 | Error visible | Si falla, revisar Network `POST /api/products` | Ver status y `{ "error": "..." }` en respuesta | ☐ |

**Campos obligatorios al crear:** nombre, slug, descripción, precio, **categoría**, **marca**, al menos 1 variante (talla + color + stock), al menos 1 imagen.

### Fase E — Observaciones Culqi (revisar en local)

| Tema | Qué validar en local | Rutas |
|------|----------------------|-------|
| Botón pagar | Carrito: `Pagar S/ X.XX`; checkout paso 3: `Pagar S/ total` | `/cart`, `/checkout` |
| Info legal | Footer + enlaces en carrito/checkout | `/terminos-y-condiciones`, `/politica-de-privacidad`, `/politica-de-cambios-y-devoluciones` |
| Libro reclamaciones | Footer | Enlace externo presente |

Documento Culqi: [Guía observaciones (Drive)](https://drive.google.com/file/u/1/d/1KSVYzVmtkeEqGesuFgi4q4FyGNovoK0O/view?usp=sharing)

### Fase F — Navegación (riesgos conocidos)

| ID | Caso | Esperado |
|----|------|----------|
| NAV-13 | MobileNav "Mi Cuenta" | Debe ir a `/profile` (no `/account`) |
| NAV-17 | Footer links Legal | Hoy apuntan a login/registro — anotar si 404 en políticas |

---

## 4. URLs locales de referencia

| Área | URL |
|------|-----|
| Tienda | http://localhost:3000 |
| Catálogo | http://localhost:3000/products |
| Carrito | http://localhost:3000/cart |
| Checkout | http://localhost:3000/checkout |
| Login | http://localhost:3000/login |
| Admin | http://localhost:3000/admin |
| Nuevo producto | http://localhost:3000/admin/products/new |
| API productos | http://localhost:3000/api/products |
| Prisma Studio | http://localhost:5555 |

---

## 5. Problemas frecuentes

### `docker` no se reconoce
- Abrir Docker Desktop y esperar a que inicie.
- Cerrar y reabrir la terminal de Cursor.

### Error `DATABASE_URL no está configurada`
- Verificar que existe `.env` en la raíz del proyecto.
- `DATABASE_URL` debe apuntar al puerto **6040** (no 5432).

### `npm run dev` → "next no se reconoce"
- Ejecutar `npm install` en la raíz del proyecto.

### Crear producto falla (toast genérico)
1. F12 → Network → `POST /api/products`
2. Revisar status: `401` sesión, `400` validación, `500` BD
3. Confirmar que elegiste **categoría** y **marca** en los selects

### Puerto 6040 ocupado
- Cambiar en `docker-compose.yml` el mapeo `6040:5432` y actualizar `DATABASE_URL`.

---

## 6. Gate mínimo antes de pedir re-revisión Culqi

- [ ] Flujo compra completo en local (carrito → checkout → respuesta API OK)
- [ ] Con keys Culqi de prueba, redirect real a Culqi checkout
- [ ] Páginas legales publicadas y enlazadas en footer
- [ ] Admin: crear producto sin error
- [ ] Sin errores rojos en consola en rutas P0

---

## 7. Plantilla de registro rápido

```txt
Fecha:
Tester:
Entorno: local Docker + npm run dev

A1-A5 Infra: 
B Smoke (fallos): 
C Compra (C1-C7): 
D Admin (D1-D3): 
E Culqi legal/pago: 
Notas / screenshots:
```
