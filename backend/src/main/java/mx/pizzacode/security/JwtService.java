package mx.pizzacode.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Authentication authentication) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(Objects::nonNull)
                .toList());

        Instant ahora = Instant.now();

        return Jwts.builder()
                .claims(claims)
                .subject(authentication.getName())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return parsear(token).getSubject();
    }

    public List<String> extractRoles(String token) {
        Object roles = parsear(token).get("roles");
        if (roles instanceof List<?> lista) {
            return lista.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    public boolean isTokenValid(String token, String correo) {
        try {
            Claims claims = parsear(token);
            return correo.equals(claims.getSubject())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims parsear(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
