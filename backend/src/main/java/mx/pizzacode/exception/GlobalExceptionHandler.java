package mx.pizzacode.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));

        return ResponseEntity.badRequest()
                .body(new ApiError(HttpStatus.BAD_REQUEST.value(), "Datos de entrada inválidos", errores));
    }

    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiError> handleAutenticacion(AuthenticationException ex) {
        String mensaje = ex instanceof DisabledException
                ? "El usuario está bloqueado"
                : "Correo o contraseña incorrectos";

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError(HttpStatus.UNAUTHORIZED.value(), mensaje, Map.of()));
    }

    @ExceptionHandler(CorreoDuplicadoException.class)
    public ResponseEntity<ApiError> handleCorreoDuplicado(CorreoDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(HttpStatus.CONFLICT.value(), ex.getMessage(), Map.of()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiError> handleNoEncontrado(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(HttpStatus.NOT_FOUND.value(), ex.getMessage(), Map.of()));
    }
}
