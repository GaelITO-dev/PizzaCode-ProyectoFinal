# Acuerdos del equipo

## Formato de error (todas las respuestas 4xx y 5xx)

    { "status": 401, "message": "Texto para el usuario", "errors": {} }

- `errors` trae un mensaje por campo solo en validaciones (400).
  Ejemplo: { "correo": "El correo es obligatorio" }
- Se genera siempre con la clase `ApiError`:
  - en `GlobalExceptionHandler` (@ControllerAdvice), y
  - en `SecurityConfig` (AuthenticationEntryPoint y AccessDeniedHandler) para los 401/403 de la cadena de filtros.
- Nota: el contrato inicial usaba `{ timestamp, status, error, mensaje, ruta }`; se ajustó a lo implementado en #30 (ver #82).

## Respuesta del login (POST /api/auth/login)

    { "token": "...", "tipo": "Bearer", "idUsuario": 1, "nombre": "...", "apellidoPat": "...", "correo": "...", "rol": "ADMIN" }

- Respuesta plana (sin objeto `usuario` anidado).
- `apellidoPat` se agregó en #35 para el avatar con iniciales del navbar.
- El frontend guarda `token` en localStorage (tokenStorage) y el resto en el AuthContext.

## Migraciones

| Versión | Dueño | Tarjeta | Contenido |
|---|---|---|---|
| V4 | Oliver (B) | — | `comentario_likes` (votos de comentarios, N:M) |
| V5 | Gael (A) | #58 | `usuarios.canal_ticket` (WHATSAPP, CORREO, AMBOS; por defecto AMBOS) |

La siguiente versión libre es la V6. Antes de crear una migración, se anota aquí.

## Canal del ticket

- `usuarios.canal_ticket` guarda por dónde quiere el cliente recibir su ticket: WHATSAPP, CORREO o AMBOS.
- Se edita desde el perfil (PATCH /api/usuarios/me).
- Los envíos del pedido (#48 SMS, #49 WhatsApp y el correo de #47) deben leerlo. Los pedidos de sucursal sin cuenta usan `pedidos.telefono_cliente`.

## Paginación

Todos los listados paginados usan el `Page` de Spring Data (igual que `/api/productos`), serializado con `PageSerializationMode.VIA_DTO` (`PaginacionConfig`).

- Parámetros: `page` (empieza en 0), `size` y `sort` (por ejemplo, `sort=nombre,asc`).
- Respuesta:

```json
{
  "content": [ ... ],
  "page": { "size": 8, "number": 0, "totalElements": 12, "totalPages": 2 }
}
```

- Cada controlador define su tamaño por defecto con `@PageableDefault`.