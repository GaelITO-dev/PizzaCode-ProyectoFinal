# PizzaCode — Proyecto Final

Sistema de gestión para pizzería construido con **Spring Boot 4** (Java 21) en el backend y frontend estático. Expone una API REST protegida con **Spring Security + JWT**, con login, registro y autorización por rol.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Backend | Spring Boot 4.2.0, Java 21, Spring MVC, Spring Security 7, Spring Data JPA |
| Seguridad | JWT (jjwt 0.12.6), contraseñas BCrypt, autorización por roles |
| Base de datos | MySQL 8, Flyway (migraciones versionadas), `ddl-auto=validate` |
| Validación | Bean Validation (`jakarta.validation`) + `@RestControllerAdvice` |
| Pruebas manuales | Colección Bruno incluida en `bruno/` |
| Despliegue | JAR ejecutable + systemd, frontend estático, HTTPS con Certbot |

## Requisitos previos

- JDK 21 o superior (el proyecto compila con `--release 21`)
- MySQL 8 con una base de datos llamada `pizzeria`
- Maven Wrapper incluido (`./mvnw` / `mvnw.cmd`)
- [Bruno](https://www.usebruno.com/) para las peticiones de ejemplo (opcional)

## Configuración

1. Copia la plantilla de configuración:

   ```bash
   cp backend/src/main/resources/application.properties.example \
      backend/src/main/resources/application.properties
   ```

2. Edita `backend/src/main/resources/application.properties` con tus valores reales:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/pizzeria?serverTimezone=America/Mexico_City
   spring.datasource.username=TU_USUARIO
   spring.datasource.password=TU_CONTRASENA

   jwt.secret=UNA_CLAVE_SECRETA_DE_AL_MENOS_32_CARACTERES
   jwt.expiration-ms=86400000
   ```

   > `application.properties` está ignorado por Git. **Nunca subas secretos reales.** La plantilla `application.properties.example` sí se versiona con valores `CAMBIAR`.

3. Flyway crea/valida el esquema al arrancar. Las migraciones están en `backend/src/main/resources/db/migration/`:
   - `V1__crear_tablas.sql` — estructura de tablas.
   - `V2__usuarios_iniciales.sql` — roles y usuarios de prueba con contraseñas BCrypt.

## Ejecutar el backend

```bash
cd backend
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

Para generar el JAR de producción:

```bash
./mvnw clean package -DskipTests
java -jar target/pizza-code-0.0.1-SNAPSHOT.jar
```

## Credenciales de prueba

El seed inicial crea un usuario por rol:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| `ADMIN` | `admin@pizzacode.mx` | `Admin#2026` |
| `CAJERO` | `cajero@pizzacode.mx` | (ver migración V2) |
| `CLIENTE` | `cliente@pizzacode.mx` | (ver migración V2) |

> Cambia estas contraseñas en un entorno desplegado.

## Autenticación

### `POST /api/auth/login`

Identificador de acceso: **correo electrónico**.

```json
{
  "correo": "admin@pizzacode.mx",
  "contrasena": "Admin#2026"
}
```

Respuesta `200 OK`:

```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tipo": "Bearer",
  "idUsuario": 1,
  "nombre": "Admin",
  "correo": "admin@pizzacode.mx",
  "rol": "ADMIN"
}
```

### `POST /api/auth/registro`

```json
{
  "nombre": "Ana",
  "apellidoPat": "López",
  "apellidoMat": "Ruiz",
  "correo": "nuevo.cliente@pizzacode.mx",
  "telefono": "9511234567",
  "contrasena": "Cliente123!"
}
```

El registro público siempre crea el usuario con rol `CLIENTE`. No es posible elegir `ADMIN` ni `CAJERO` desde este endpoint; esos roles se asignan solo desde procesos internos o un futuro endpoint administrativo.

La contraseña debe tener **mínimo 8 caracteres, una mayúscula, un número y un carácter especial**. Se valida en el backend con Bean Validation y debe replicarse en el frontend bajo el input.

Respuesta `201 Created` con los datos del usuario creado (**nunca** la contraseña).

### Uso del token

Envía el token en el header `Authorization` de las peticiones protegidas:

```http
Authorization: Bearer <token>
```

- Sin token o con un token inválido → `401 Unauthorized`.
- Con un token válido pero sin el rol requerido → `403 Forbidden`.
- Los roles se exponen como autoridades `ROLE_ADMIN`, `ROLE_CLIENTE`, `ROLE_CAJERO`.

Están públicos: `/api/auth/**`, `GET /api/productos/**` y `GET /api/categorias/**`. El resto de endpoints requiere autenticación.

### Seguridad por método (`@EnableMethodSecurity`)

`SecurityConfig` activa `@EnableMethodSecurity` y define la jerarquía:

```text
ROLE_ADMIN > ROLE_CAJERO > ROLE_CLIENTE
```

Eso permite anotar métodos con `@PreAuthorize`:

```java
@PreAuthorize("hasRole('ADMIN')")
public void metodoSoloAdmin() {
    // ...
}
```

- `hasRole('ADMIN')` equivale a `hasAuthority('ROLE_ADMIN')`.
- Por la jerarquía, `ADMIN` también cumple `hasRole('CAJERO')` y `hasRole('CLIENTE')`; `CAJERO` cumple `hasRole('CLIENTE')`.
- Las reglas de URL siguen en `SecurityFilterChain`; la anotación protege el método aunque se llame desde otro bean.

Endpoints de verificación:

| Endpoint | Rol requerido | ADMIN | CAJERO | CLIENTE |
| --- | --- | --- | --- | --- |
| `GET /api/roles/admin` | `ROLE_ADMIN` | 200 | 403 | 403 |
| `GET /api/roles/cajero` | `ROLE_CAJERO` | 200 | 200 | 403 |
| `GET /api/roles/cliente` | `ROLE_CLIENTE` | 200 | 200 | 200 |

Sin token → `401`. Con token válido pero sin rol → `403`.

## Manejo de errores

Todas las respuestas de error usan el mismo formato JSON:

```json
{
  "status": 400,
  "message": "Datos de entrada inválidos",
  "errors": {
    "contrasena": "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial"
  }
}
```

| Código | Situación |
| --- | --- |
| 400 | Validación de entrada fallida |
| 401 | Credenciales incorrectas o token ausente/inválido |
| 403 | Rol sin permisos para el recurso |
| 404 | Recurso no encontrado |
| 409 | Correo ya registrado |
| 422 | Error de procesamiento de la solicitud |
| 500 | Error interno no esperado |

## Colección Bruno

La carpeta `bruno/` contiene una colección lista para importar:

1. Abre Bruno → **Import Collection** → selecciona `bruno/`.
2. Selecciona el entorno **Local** (`baseUrl=http://localhost:8080`).
3. Ejecuta **Login ADMIN**: guarda automáticamente el token en la variable `token` del entorno.
4. Ejecuta el resto de peticiones (registro, errores 400/401/409, endpoint protegido con/sin token y `/api/roles/*`).

> El endpoint protegido de ejemplo apunta a `/api/pedidos`; responde `404` hasta que se implemente ese módulo, pero **no** `401`, lo que confirma que el JWT fue aceptado.

## Estructura del proyecto

```text
backend/src/main/java/mx/pizzacode/
├── controller/   AuthController, RolesController (REST)
├── dto/          DTOs de entrada/salida (sin entidades JPA expuestas)
├── entity/       Usuario, Rol, Producto, Pedido, ... y enums
├── exception/    ApiError y @RestControllerAdvice
├── mapper/       UsuarioMapper
├── repository/   6 repositorios JPA
├── security/     SecurityConfig (@EnableWebSecurity + @EnableMethodSecurity), JwtService, JwtAuthenticationFilter, UsuarioDetailsService
└── service/      AuthService
bruno/            Colección de peticiones (auth, errores y roles)
database/         Scripts SQL adicionales
docs/             Documentación
frontend/         Cliente estático
```

## Despliegue (VPS)

1. Instalar Java 21 y MySQL 8 en el servidor.
2. Copiar el JAR y el `application.properties` de producción (fuera del repo).
3. Crear `/etc/systemd/system/pizzacode.service`:

   ```ini
   [Unit]
   Description=PizzaCode Backend
   After=network.target mysql.service

   [Service]
   User=pizzacode
   WorkingDirectory=/opt/pizzacode
   ExecStart=/usr/bin/java -jar /opt/pizzacode/pizza-code.jar
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. Habilitar el servicio: `sudo systemctl enable --now pizzacode`.
5. Servir `frontend/` con Nginx como archivos estáticos y proxy de `/api` hacia el backend.
6. Obtener HTTPS con Certbot: `sudo certbot --nginx -d tu-dominio.com`.


-----------------------------------------------------------------------------------------------------------------------
## README SOBRE EL CODIGO
# Pizza Code — Proyecto Final Full Stack

Sistema web para una pizzería con **pedidos en línea** y **punto de venta**, tiene tres roles: el **cliente** pide desde la web, el **cajero** registra y atiende los pedidos en sucursal, y el **administrador** gestiona el menú, las promociones y los usuarios, y consulta las ganancias.

| | |
| --- | --- |
|  **Aplicación** | https://pizzacode.tech |
|  **URL base de la API** | https://pizzacode.tech/api |
|  **Diseño en Figma** | https://www.figma.com/design/zQUOLYZy7JPA4qXyzJDMOY/Sistema-Mockup?node-id=0-1&t=JnqoZZLaOQvplcKG-1 |
|  **Tablero de GitHub Projects** | https://github.com/users/GaelITO-dev/projects/1 |
|  **Equipo** | Gael (Persona A) · Oliver (Persona B) |

---

## Contenido

1. [Funcionalidades por rol](#funcionalidades-por-rol)
2. [Modelo relacional](#modelo-relacional)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Credenciales de prueba](#credenciales-de-prueba)
5. [API REST](#api-rest)
10. [Pruebas con Bruno](#pruebas-con-bruno)

---

## Funcionalidades por rol

| Rol | Qué puede hacer |
| --- | --- |
| **Cliente** | Registrarse e iniciar sesión · ver el menú con búsqueda, filtro por categoría y paginación · elegir tamaño · ver promociones vigentes · armar un carrito · pagar (tarjeta simulada o al recoger) · seguir su pedido en tiempo real · ver e imprimir su ticket · consultar su historial con filtros · proponer pizzas, dar likes y mandar sugerencias · editar su perfil y el canal del ticket |
| **Cajero** | Registrar pedidos en sucursal (cliente con cuenta o de mostrador) · ver los pedidos del día y avanzarlos de estado · cancelar con motivo · imprimir el ticket de cocina · consultar el historial del día con totales por forma de pago |
| **Administrador** | Panel de ganancias por periodo con comparativo · ver todos los pedidos con filtros · CRUD de productos y categorías · CRUD de promociones · gestión de usuarios (crear empleados, editar, bloquear y desbloquear) · moderar comentarios y leer sugerencias |

Notificaciones: cuando el cajero marca un pedido como **LISTO**, el cliente recibe un **SMS** (Twilio).

---

## Modelo relacional


<img width="1165" height="1631" alt="sprinPizzeria_page-0001" src="https://github.com/user-attachments/assets/d254b2b7-02e0-4c8d-8e91-f9b1d154e7cc" />


> Diagrama original con el que se comenzó el proyecto

### Tablas

| Tabla | Descripción | Relaciones |
| --- | --- | --- |
| `roles` | ADMIN, CAJERO y CLIENTE | 1:N con `usuarios` |
| `usuarios` | Datos del usuario, contraseña BCrypt, estado (ACTIVO / BLOQUEADO) y canal del ticket | N:1 `roles` |
| `categorias` | Rebanadas, Sencillas, Especialidades, Complementos, Bebidas, Postres… | 1:N con `productos` |
| `productos` | Nombre, descripción, precio, imagen y disponibilidad | N:1 `categorias` |
| `pedidos` | Origen (EN_LINEA / SUCURSAL), método de pago, estado, total y motivo de cancelación | N:1 `usuarios` (cliente) y N:1 `usuarios` (cajero), ambas opcionales |
| `pedido_producto` | Renglones del pedido con cantidad y precio unitario congelado | Tabla intermedia **N:M** `pedidos` ↔ `productos` (llave compuesta) |
| `promociones` | Nombre, % de descuento y vigencia | — |
| `promocion_producto` | Productos incluidos en cada promoción | Tabla intermedia **N:M** `promociones` ↔ `productos` |
| `comentarios` | Propuestas públicas (COMENTARIO) y sugerencias privadas (SUGERENCIA) | N:1 `usuarios` |
| `comentario_likes` | Likes de los usuarios a los comentarios | Tabla intermedia **N:M** `usuarios` ↔ `comentarios` |
| `tokens_invalidados` | Huella SHA-256 de los tokens cerrados con logout | — |

### Migraciones (Flyway)

Están en `backend/src/main/resources/db/migration/` y se aplican solas al arrancar el backend.

| Versión | Contenido |
| --- | --- |
| `V1__crear_tablas.sql` | Estructura de las tablas |
| `V2__usuarios_iniciales.sql` | Roles y un usuario por rol (BCrypt) |
| `V3__datos_prueba.sql` | 10 a 15 registros de prueba por tabla |
| `V4__likes.sql` | Tabla `comentario_likes` |
| `V5__canal_ticket_usuarios.sql` | Columna `usuarios.canal_ticket` |
| `V6__promociones_solo_porcentaje.sql` | Promociones de prueba solo con porcentaje |

El respaldo completo (esquema + datos) está en `database/respaldo_pizzeria.sql`.

---

## Estructura del proyecto

```text
PizzaCode-ProyectoFinal/
├── backend/                       Spring Boot (Maven Wrapper)
│   └── src/main/java/mx/pizzacode/
│       ├── config/                Paginación y tareas programadas
│       ├── controller/            Endpoints REST
│       ├── dto/                   Entrada (con Bean Validation) y salida
│       ├── entity/                Entidades JPA y enums
│       ├── exception/             ApiError y GlobalExceptionHandler
│       ├── mapper/                Conversión entidad → DTO
│       ├── repository/            Repositorios Spring Data JPA
│       ├── security/              SecurityConfig, JwtService, JwtAuthenticationFilter, UsuarioDetailsService
│       └── service/               Lógica de negocio
├── frontend/                      React + Vite
│   └── src/
│       ├── api/                   Cliente Axios y funciones por recurso
│       ├── auth/                  Sesión, rutas protegidas por rol
│       ├── carrito/               Carrito y descuentos del cliente
│       ├── components/            Componentes reutilizables (ui, layout, ticket)
│       ├── pages/                 auth, cliente, cajero, admin, perfil
│       └── utils/                 Validaciones, fechas, moneda, impresión
├── bruno/                         Colección de pruebas de la API
├── database/                      Respaldo .sql
├── deploy/                        Nginx, systemd y scripts de actualización
└── docs/                          Acuerdos del equipo y modelo relacional
```


---

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@pizzacode.mx` | `Admin#2026` |
| Cajero | `cajero@pizzacode.mx` | `Cajero#2026` |
| Cliente | `cliente@pizzacode.mx` | `Cliente#2026` |

---

## API REST

URL base: **`https://pizzacode.tech/api`** (local: `http://localhost:8080/api`).

Los listados están paginados con `page` (empieza en 0), `size` y `sort` (`sort=nombre,asc`) y responden así:

```json
{
  "content": [ ... ],
  "page": { "size": 10, "number": 0, "totalElements": 25, "totalPages": 3 }
}
```

| Método y ruta | Acceso | Descripción |
| --- | --- | --- |
| `POST /auth/registro` | público | Registro (siempre crea CLIENTE) |
| `POST /auth/login` | público | Devuelve el token JWT |
| `POST /auth/logout` | con sesión | Invalida el token |
| `GET /usuarios/me` · `PATCH /usuarios/me` | con sesión | Ver y editar el propio perfil |
| `PUT /usuarios/me/contrasena` | con sesión | Cambiar contraseña |
| `GET /productos` · `GET /productos/{id}` | público | Menú con filtros `nombre`, `idCategoria`, `todos` |
| `GET /categorias` | público | Categorías |
| `GET /productos/gestion` | ADMIN | Productos con filtro de disponibilidad |
| `POST` · `PUT /productos/{id}` · `PATCH /productos/{id}/disponible` · `DELETE /productos/{id}` | ADMIN | CRUD de productos |
| `POST` · `PUT` · `DELETE /categorias/{id}` | ADMIN | CRUD de categorías |
| `GET /promociones` · `GET /promociones/{id}` | con sesión | Filtros `nombre`, `estado`, `vigentes` |
| `POST` · `PUT` · `DELETE /promociones/{id}` | ADMIN | CRUD de promociones |
| `POST /pedidos` | CLIENTE | Pedido en línea |
| `GET /pedidos/mis-pedidos` · `GET /pedidos/mis-pedidos/{id}` | CLIENTE | Historial (`filtro`, `buscar`) y detalle |
| `GET /pedidos` · `GET /pedidos/{id}` | CAJERO | Pedidos con filtros `estado`, `desde`, `hasta`, `origen`, `metodoPago`, `busqueda` |
| `POST /pedidos/sucursal` | CAJERO | Pedido en sucursal |
| `PATCH /pedidos/{id}/estado` · `PATCH /pedidos/{id}/cancelar` | CAJERO | Avanzar estado (envía SMS al quedar LISTO) y cancelar con motivo |
| `GET /clientes` | CAJERO | Buscar clientes por nombre, correo o teléfono |
| `GET /comentarios/publicos` · `POST` · `DELETE /comentarios/{id}/like` | con sesión | Propuestas y likes |
| `POST /comentarios` · `GET /comentarios/mis-comentarios` | CLIENTE | Crear propuesta o sugerencia |
| `GET /comentarios` · `PATCH /comentarios/{id}/visible` · `DELETE /comentarios/{id}` | ADMIN | Moderación |
| `GET /usuarios` · `GET /usuarios/resumen` · `GET /usuarios/{id}` | ADMIN | Gestión de usuarios |
| `POST /usuarios/empleados` · `PATCH /usuarios/{id}` | ADMIN | Crear empleado y editar |
| `PATCH /usuarios/{id}/bloqueo` · `PATCH /usuarios/{id}/desbloqueo` | ADMIN | Bloquear (con motivo) y desbloquear |
| `GET /reportes/ganancias?desde=&hasta=` | ADMIN | Reporte de ganancias |
| `POST /correo/prueba` | ADMIN | Correo de prueba |

> Por la jerarquía de roles, el ADMIN también puede usar los endpoints de CAJERO y CLIENTE.

---

## Autenticación con JWT

1. `POST /api/auth/login` con `{ "correo", "contrasena" }` devuelve:

   ```json
   {
     "token": "eyJhbGciOi...",
     "tipo": "Bearer",
     "idUsuario": 1,
     "nombre": "Admin",
     "apellidoPat": "Evaluación",
     "correo": "admin@pizzacode.mx",
     "rol": "ADMIN"
   }
   ```

2. El frontend guarda el token en `localStorage` y el interceptor de Axios lo manda en cada petición:

   ```http
   Authorization: Bearer <token>
   ```

3. En el backend, `JwtAuthenticationFilter` verifica la firma y la expiración (24 h), revisa que el token no se haya cerrado y que el usuario no esté bloqueado, y carga el rol para `@PreAuthorize`.
4. `POST /api/auth/logout` guarda la huella SHA-256 del token en `tokens_invalidados`; desde ese momento el token ya no sirve. Una tarea programada borra cada hora los que ya expiraron.

| Caso | Respuesta |
| --- | --- |
| Sin token, token vencido, alterado o cerrado | `401` |
| Token válido sin el rol requerido | `403` |

---

## Manejo de errores

Todas las respuestas de error tienen el mismo formato:

```json
{
  "status": 400,
  "message": "Datos de entrada inválidos",
  "errors": { "telefono": "El teléfono debe contener entre 10 y 15 dígitos" }
}
```

| Código | Situación |
| --- | --- |
| 400 | Validación de datos fallida (`errors` trae un mensaje por campo) |
| 401 | Credenciales incorrectas, cuenta bloqueada o token ausente/inválido |
| 403 | El rol no tiene permiso |
| 404 | Recurso no encontrado |
| 409 | Correo ya registrado |
| 422 | Regla de negocio (producto agotado, estado inválido, promoción con fechas incorrectas…) |
| 500 | Error interno |

---

## Pruebas con Bruno

La colección está en `bruno/` y tiene dos entornos:

| Entorno | `baseUrl` |
| --- | --- |
| **Local** | `http://localhost:8080/api` |
| **VPS** | `https://pizzacode.tech/api` |

### Cómo usarla

1. Abrir Bruno → **Open Collection** → seleccionar la carpeta `bruno/`.
2. Elegir el entorno **Local** o **VPS** (arriba a la derecha).
3. Ejecutar primero un **Login** de la carpeta que se quiera probar. Su script guarda el token en la variable `{{token}}`, y las demás peticiones lo usan con **Auth → Bearer**.
4. Ejecutar las peticiones de la carpeta en orden (o con **Run** para toda la carpeta).

### Carpetas

| Carpeta | Qué prueba |
| --- | --- |
| `auth` | Login, registro, logout, uso del token tras el logout, errores 400/401/409 |
| `roles` | Jerarquía de roles y errores 401/403 |
| `perfil` | Ver y editar perfil, cambio de contraseña |
| `productos` | Menú, gestión, errores 400/404/422 |
| `promociones` | Listado, vigentes y CRUD |
| `pedido` | Pedido en línea y en sucursal, mis pedidos, errores 404/422, prueba de SMS |
| `pedidos-hoy` | Flujo completo de estados y cancelación |
| `pedidos-admin` | Filtros combinados, búsqueda por folio, origen y método de pago |
| `clientes-cajero` | Búsqueda de clientes y permisos del cajero |
| `comentarios` | Crear, listar y moderar |
| `usuarios-admin` · `usuarios-gestion` | Gestión de usuarios, bloqueo y desbloqueo |
| `reportes-admin` | Reporte de ganancias |
| `correo` | Correo de prueba |

---

## Despliegue en el VPS

| Componente | Configuración |
| --- | --- |
| Servidor | VPS con Ubuntu |
| Dominio | `pizzacode.tech` con HTTPS (Certbot) |
| Backend | JAR en `/opt/pizzacode`, servicio `pizzacode.service` (systemd) en `127.0.0.1:8090` |
| Frontend | Build de Vite en `/var/www/pizzacode` |
| Nginx | Sirve el frontend y reenvía `/api/` al backend (`deploy/nginx/pizzacode.conf`) |
| Base de datos | MySQL 8 con un usuario exclusivo para la aplicación |
| Correo | Postfix en modo solo envío, con SPF, DKIM y DMARC |

Los archivos de configuración y los scripts de actualización (`actualizar-backend.ps1`, `actualizar-frontend.ps1`) están en `deploy/`. Ver `deploy/README.md` para el paso a paso.

> El `application.properties` de producción vive solo en el servidor (permisos `600`) y nunca se sube al repositorio.
