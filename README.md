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
