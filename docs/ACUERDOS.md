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

    { "token": "...", "tipo": "Bearer", "idUsuario": 1, "nombre": "...", "correo": "...", "rol": "ADMIN" }

- Respuesta plana (sin objeto `usuario` anidado).
- El frontend guarda `token` en localStorage (tokenStorage) y el resto en el AuthContext.