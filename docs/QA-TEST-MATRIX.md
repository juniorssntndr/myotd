# QA Test Matrix - Myotd MVP

## Objetivo

Validar si Myotd esta listo para salida MVP cubriendo navegacion, links, catalogo, variantes, carrito, checkout, perfil y admin.

## Como usar esta matriz

- Estado sugerido por caso: `No iniciado`, `En progreso`, `OK`, `Bug`, `Bloqueado`
- Severidad sugerida para bugs: `P0`, `P1`, `P2`
- Ejecutar en este orden: `Smoke > Navegacion > Compra > Admin > Responsive > Regresion`

## Ambientes sugeridos

- Desktop: 1440px, 1280px, 1024px
- Mobile: 390px, 375px, 320px
- Navegadores: Chrome primero, luego Safari mobile o emulacion

## Gate De Salida

El MVP puede considerarse listo solo si:

- No hay links rotos en header, mobile nav, perfil, admin y CTAs principales
- Catalogo, PDP, carrito y checkout funcionan end-to-end
- La seleccion de variante respeta talla, color y stock
- Admin permite al menos listar, crear y editar productos
- No hay errores de runtime en rutas principales
- No hay roturas visuales criticas en mobile y desktop

## Riesgos ya detectados para validar primero

- `MobileNav` apunta a `/account`, `/favorites` y `/orders`, pero las rutas reales parecen vivir bajo `/profile`
- El footer expone varias rutas informativas que hoy no existen en `src/app`
- Hay antecedentes recientes de texto con encoding roto; revisar checkout y textos nuevos

---

## 1. Smoke Test De Rutas

| ID | Prioridad | Modulo | Ruta | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| SMK-01 | P0 | Home | `/` | Abrir home | Render completo sin error ni pantalla en blanco | No iniciado |
| SMK-02 | P0 | Catalogo | `/products` | Abrir catalogo | Lista de productos visible, sin error runtime | No iniciado |
| SMK-03 | P0 | PDP | `/products/[id]` | Abrir un producto valido | Producto visible con galeria y selector de variante | No iniciado |
| SMK-04 | P0 | Carrito | `/cart` | Abrir carrito vacio y con items | Ambos estados renderizan correctamente | No iniciado |
| SMK-05 | P0 | Checkout | `/checkout` | Abrir checkout con carrito cargado | Paso 1 visible sin crash | No iniciado |
| SMK-06 | P0 | Login | `/login` | Abrir login | Form visible y CTA correctos | No iniciado |
| SMK-07 | P0 | Register | `/register` | Abrir register | Form visible y CTA correctos | No iniciado |
| SMK-08 | P1 | Perfil | `/profile` | Abrir perfil autenticado | Vista de perfil renderiza sin error | No iniciado |
| SMK-09 | P1 | Pedidos perfil | `/profile/orders` | Abrir pedidos | Listado renderiza sin error | No iniciado |
| SMK-10 | P1 | Favoritos | `/profile/favorites` | Abrir favoritos | Listado renderiza sin error | No iniciado |
| SMK-11 | P1 | Direcciones | `/profile/addresses` | Abrir direcciones | Lista y CTA nueva direccion visibles | No iniciado |
| SMK-12 | P1 | Config perfil | `/profile/settings` | Abrir settings | Pantalla visible y estable | No iniciado |
| SMK-13 | P0 | Admin dashboard | `/admin` | Abrir como admin | Dashboard visible | No iniciado |
| SMK-14 | P0 | Admin productos | `/admin/products` | Abrir listado | Tabla/listado visible | No iniciado |
| SMK-15 | P1 | Admin nuevo producto | `/admin/products/new` | Abrir formulario | Form visible con variantes | No iniciado |
| SMK-16 | P1 | Admin pagos | `/admin/payments` | Abrir pagos | Pantalla visible | No iniciado |
| SMK-17 | P1 | Admin usuarios | `/admin/users` | Abrir usuarios | Pantalla visible | No iniciado |
| SMK-18 | P1 | Admin settings | `/admin/settings` | Abrir settings | Pantalla visible | No iniciado |

---

## 2. Navegacion Y Links

| ID | Prioridad | Modulo | Link/Ubicacion | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| NAV-01 | P0 | Header | Logo Myotd | Click logo | Navega a `/` | No iniciado |
| NAV-02 | P0 | Header | `Catalogo` | Click en CTA | Navega a `/products` | No iniciado |
| NAV-03 | P0 | Header | Icono carrito | Click en icono | Navega a `/cart` | No iniciado |
| NAV-04 | P1 | Header | Ingresar | Click | Navega a `/login` | No iniciado |
| NAV-05 | P1 | Header | Registrarse | Click | Navega a `/register` | No iniciado |
| NAV-06 | P0 | Header auth | Mi Perfil | Login, abrir dropdown | Navega a `/profile` | No iniciado |
| NAV-07 | P0 | Header auth | Mis Pedidos | Login, abrir dropdown | Navega a `/profile/orders` | No iniciado |
| NAV-08 | P1 | Header auth | Configuracion | Login, abrir dropdown | Navega a `/profile/settings` | No iniciado |
| NAV-09 | P1 | Header auth | Panel Admin | Login admin, abrir dropdown | Navega a `/admin` | No iniciado |
| NAV-10 | P0 | MobileNav | Inicio | Abrir menu mobile y click | Navega a `/` | No iniciado |
| NAV-11 | P0 | MobileNav | Catalogo | Abrir menu mobile y click | Navega a `/products` | No iniciado |
| NAV-12 | P0 | MobileNav | Ofertas | Abrir menu mobile y click | Navega y no rompe aunque no haya categoria real | No iniciado |
| NAV-13 | P0 | MobileNav | Mi Cuenta | Abrir menu mobile y click | Debe ir a ruta valida; hoy sospecha de bug si apunta a `/account` | No iniciado |
| NAV-14 | P0 | MobileNav | Favoritos | Abrir menu mobile y click | Debe ir a ruta valida; hoy sospecha de bug si apunta a `/favorites` | No iniciado |
| NAV-15 | P0 | MobileNav | Mis Pedidos | Abrir menu mobile y click | Debe ir a ruta valida; hoy sospecha de bug si apunta a `/orders` | No iniciado |
| NAV-16 | P1 | Footer | Links Moda | Click en Polos/Hoodies/Zapatillas/Accesorios | Navegan a catalogo filtrado | No iniciado |
| NAV-17 | P0 | Footer | Links Empresa/Ayuda/Legal | Click uno por uno | Ningun link debe llevar a 404 visible | No iniciado |
| NAV-18 | P1 | WhatsApp | Boton flotante | Click desde home y PDP | Abre WhatsApp con mensaje preconfigurado | No iniciado |
| NAV-19 | P1 | ProfileSidebar | Todos los links | Click uno por uno | Todas las rutas de perfil responden | No iniciado |
| NAV-20 | P1 | AdminSidebar | Todos los links | Click uno por uno | Todas las rutas admin responden | No iniciado |

---

## 3. Home Y Storefront

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| STF-01 | P1 | Home | Hero visible | Abrir home | Hero carga sin layout roto | No iniciado |
| STF-02 | P1 | Home | Categorias home | Click en cada categoria | Filtra catalogo correctamente | No iniciado |
| STF-03 | P1 | Home | Productos destacados | Click en card destacada | Abre PDP correcto | No iniciado |
| STF-04 | P2 | Home | Seccion marcas | Verificar render | No hay errores visuales ni textos cortados | No iniciado |

---

## 4. Catalogo, Filtros Y Busqueda

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| CAT-01 | P0 | Catalogo | Carga inicial | Abrir `/products` | Productos visibles y contador correcto | No iniciado |
| CAT-02 | P0 | Catalogo | Filtro por categoria | Seleccionar una categoria | Solo muestra productos de esa categoria | No iniciado |
| CAT-03 | P0 | Catalogo | Filtro por marca | Seleccionar una marca | Solo muestra esa marca | No iniciado |
| CAT-04 | P0 | Catalogo | Filtro por talla | Seleccionar una o mas tallas | Solo muestra productos con variantes compatibles | No iniciado |
| CAT-05 | P0 | Catalogo | Filtro por color | Seleccionar uno o mas colores | Solo muestra productos con variantes compatibles | No iniciado |
| CAT-06 | P1 | Catalogo | Filtro por precio | Ajustar rango | Resultados respetan rango | No iniciado |
| CAT-07 | P1 | Catalogo | Multi filtro | Combinar categoria + marca + talla + color | Resultado consistente, sin vaciar incorrectamente | No iniciado |
| CAT-08 | P1 | Catalogo | Ordenar precio asc | Cambiar sort | Orden correcto | No iniciado |
| CAT-09 | P1 | Catalogo | Ordenar precio desc | Cambiar sort | Orden correcto | No iniciado |
| CAT-10 | P1 | Catalogo | Sin resultados | Aplicar filtros extremos | Estado vacio claro y sin crash | No iniciado |
| CAT-11 | P2 | Catalogo | Filtro mobile | Ejecutar filtros desde mobile sheet | Mismo comportamiento que desktop | No iniciado |

---

## 5. PDP Y Variantes

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| PDP-01 | P0 | PDP | Carga producto valido | Abrir PDP desde catalogo | Nombre, precio, galeria y detalle visibles | No iniciado |
| PDP-02 | P1 | PDP | Producto inexistente | Abrir id invalido | Estado "producto no encontrado" correcto | No iniciado |
| PDP-03 | P0 | PDP | Selector color | Elegir color | Se actualizan tallas disponibles | No iniciado |
| PDP-04 | P0 | PDP | Selector talla | Elegir talla valida del color | Se identifica variante correcta | No iniciado |
| PDP-05 | P0 | PDP | Stock por variante | Elegir combinacion con stock | Muestra stock correcto | No iniciado |
| PDP-06 | P0 | PDP | Variante agotada | Elegir combinacion con stock 0 | Boton agregar deshabilitado | No iniciado |
| PDP-07 | P0 | PDP | Sin seleccionar variante | Intentar agregar sin completar seleccion | No deja avanzar o pide seleccion | No iniciado |
| PDP-08 | P0 | PDP | Agregar al carrito | Seleccionar variante y agregar | Item entra al carrito con variantId correcto | No iniciado |
| PDP-09 | P1 | PDP | Productos relacionados | Click en relacionado | Abre otro PDP valido | No iniciado |

---

## 6. Carrito

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| CAR-01 | P0 | Carrito | Estado vacio | Abrir carrito vacio | Mensaje y CTA correctos | No iniciado |
| CAR-02 | P0 | Carrito | Item agregado | Agregar desde PDP | Carrito muestra producto correcto | No iniciado |
| CAR-03 | P0 | Carrito | Variante visible | Agregar item con talla/color | Se ve talla y color correctos | No iniciado |
| CAR-04 | P0 | Carrito | Dos variantes mismo producto | Agregar mismo producto con otra talla/color | Se crean lineas separadas | No iniciado |
| CAR-05 | P0 | Carrito | Cambiar cantidad | Incrementar/decrementar | Cantidad y subtotal actualizan bien | No iniciado |
| CAR-06 | P0 | Carrito | Eliminar item | Click eliminar | Item desaparece sin afectar otros | No iniciado |
| CAR-07 | P1 | Carrito | Persistencia | Recargar pagina | El carrito se conserva | No iniciado |
| CAR-08 | P1 | Carrito | CTA checkout no autenticado | Click checkout sin login | Redirige a login con callback | No iniciado |
| CAR-09 | P1 | Carrito | CTA checkout autenticado | Click checkout con login | Navega a `/checkout` | No iniciado |

---

## 7. Checkout, Pago Y Envio

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| CHK-01 | P0 | Checkout | Paso 1 visible | Abrir checkout con items | Form de envio visible | No iniciado |
| CHK-02 | P0 | Checkout | Validacion envio | Dejar campos incompletos y continuar | Muestra error y no avanza | No iniciado |
| CHK-03 | P0 | Checkout | Cambio a paso 2 | Completar envio y continuar | Paso pago visible | No iniciado |
| CHK-04 | P1 | Checkout | Metodos de pago | Cambiar entre CARD/WALLET/TRANSFER/COD | UI responde sin romperse | No iniciado |
| CHK-05 | P0 | Checkout | Costo de envio por zona | Cambiar distrito | Total cambia segun zona | No iniciado |
| CHK-06 | P0 | Checkout | Envio gratis | Superar S/ 200 | Shipping pasa a 0 o se muestra gratis | No iniciado |
| CHK-07 | P1 | Checkout | Paso confirmar | Ir al paso 3 | Resumen muestra direccion, metodo y totales | No iniciado |
| CHK-08 | P0 | Checkout API | Enviar orden valida | Confirmar checkout | `/api/checkout` responde OK y devuelve `checkoutUrl` | No iniciado |
| CHK-09 | P0 | Checkout API | Sin stock | Forzar variante sin stock | API rechaza la compra | No iniciado |
| CHK-10 | P0 | Pago | Redirect Culqi | Confirmar checkout | Redireccion valida a Culqi | No iniciado |
| CHK-11 | P1 | Pago | Cancelacion | Simular cancel | `/checkout/cancel` carga bien | No iniciado |
| CHK-12 | P1 | Pago | Success | Simular pago aprobado | `/checkout/success` carga bien | No iniciado |
| CHK-13 | P0 | Webhook | Confirmacion webhook | Simular webhook valido | Orden cambia de estado y descuenta stock | No iniciado |
| CHK-14 | P0 | Webhook | Idempotencia | Reenviar mismo webhook | No duplica procesos ni descuenta dos veces | No iniciado |
| CHK-15 | P1 | Webhook | Pago fallido | Simular fallo | No deja orden pagada ni descuenta stock | No iniciado |

---

## 8. Perfil De Usuario

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| PRF-01 | P1 | Perfil | Resumen perfil | Abrir `/profile` | Datos visibles sin error | No iniciado |
| PRF-02 | P1 | Pedidos | Lista pedidos | Abrir `/profile/orders` | Pedidos visibles | No iniciado |
| PRF-03 | P1 | Favoritos | Lista favoritos | Abrir `/profile/favorites` | Productos visibles | No iniciado |
| PRF-04 | P1 | Direcciones | Lista direcciones | Abrir `/profile/addresses` | Direcciones y CTA visibles | No iniciado |
| PRF-05 | P1 | Direcciones | Nueva direccion | Abrir `/profile/addresses/new` | Form visible | No iniciado |
| PRF-06 | P1 | Direcciones | Editar direccion | Abrir `/profile/addresses/[id]/edit` | Form visible con datos | No iniciado |
| PRF-07 | P2 | Settings | Configuracion | Abrir `/profile/settings` | Vista estable | No iniciado |

---

## 9. Admin

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| ADM-01 | P0 | Admin | Dashboard | Abrir `/admin` | KPIs y panel visibles | No iniciado |
| ADM-02 | P0 | Productos | Listado | Abrir `/admin/products` | Lista renderiza | No iniciado |
| ADM-03 | P0 | Productos | Crear producto | Abrir `/admin/products/new` | Form visible y usable | No iniciado |
| ADM-04 | P0 | Productos | Editar producto | Abrir `/admin/products/[id]/edit` | Form carga sin error | No iniciado |
| ADM-05 | P0 | Productos | Variantes en admin | Revisar form de producto | Permite gestionar talla/color/stock | No iniciado |
| ADM-06 | P1 | Pagos | Pantalla pagos | Abrir `/admin/payments` | Tabla/listado visible | No iniciado |
| ADM-07 | P1 | Usuarios | Pantalla usuarios | Abrir `/admin/users` | Tabla/listado visible | No iniciado |
| ADM-08 | P1 | Usuarios | Nuevo usuario | Abrir `/admin/users/new` | Form visible | No iniciado |
| ADM-09 | P1 | Settings | Configuracion admin | Abrir `/admin/settings` | Pantalla visible | No iniciado |

---

## 10. Responsive Y Visual

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| RWD-01 | P0 | Global | Home mobile | Probar 390px y 375px | Sin overflow horizontal | No iniciado |
| RWD-02 | P0 | Global | Catalogo mobile | Abrir filtros mobile | Sidebar/Sheet usable | No iniciado |
| RWD-03 | P0 | Global | PDP mobile | Abrir PDP | Galeria, selectores y CTA visibles | No iniciado |
| RWD-04 | P0 | Global | Carrito mobile | Abrir carrito | Items y resumen legibles | No iniciado |
| RWD-05 | P0 | Global | Checkout mobile | Completar flujo mobile | Sin cortes ni botones inaccesibles | No iniciado |
| RWD-06 | P1 | Global | Header sticky | Scroll en desktop/mobile | No tapa contenido | No iniciado |
| RWD-07 | P1 | Global | Footer | Revisar footer completo | No hay links superpuestos o texto cortado | No iniciado |
| RWD-08 | P1 | Global | Admin tablet | Probar 1024px | Layout usable y navegable | No iniciado |

---

## 11. QA Tecnico Minimo

| ID | Prioridad | Modulo | Caso | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|---|---|
| TEC-01 | P0 | TS | Typecheck | Ejecutar `tsc --noEmit` | Sin errores | No iniciado |
| TEC-02 | P0 | Runtime | Consola browser | Navegar rutas P0 | Sin errores rojos en consola | No iniciado |
| TEC-03 | P0 | Network | Requests API | Ejecutar flujos P0 | Sin 500 inesperados | No iniciado |
| TEC-04 | P1 | Encoding | Textos | Revisar checkout y textos nuevos | Sin caracteres rotos | No iniciado |
| TEC-05 | P1 | Auth | Rutas protegidas | Probar sin login y con login | Redirecciones correctas | No iniciado |
| TEC-06 | P1 | API productos | `/api/products` | Probar filtros query string | Respuesta consistente | No iniciado |
| TEC-07 | P1 | API producto | `/api/products/[id]` | Probar id valido e invalido | 200 y 404 correctos | No iniciado |
| TEC-08 | P1 | API ordenes | `/api/orders` y `/api/orders/[id]` | Probar usuario autenticado | Respuestas correctas | No iniciado |

---

## 12. Resumen De Bloqueantes

Marcar como `P0` si aparece cualquiera de estos:

- Link principal que lleva a 404 o ruta inexistente
- Checkout sin `checkoutUrl`
- Compra sin variante seleccionada
- Compra de variante sin stock
- Carrito mezclando variantes distintas
- Error runtime en home, catalogo, PDP, carrito, checkout o admin productos
- Pantalla rota en mobile que impida comprar

## 13. Plantilla De Reporte De Bug

```txt
ID:
Titulo:
Severidad: P0 | P1 | P2
Ruta:
Precondicion:
Pasos:
Resultado actual:
Resultado esperado:
Evidencia:
```
