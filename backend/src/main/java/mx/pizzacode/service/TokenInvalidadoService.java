package mx.pizzacode.service;

import mx.pizzacode.entity.TokenInvalidado;
import mx.pizzacode.repository.TokenInvalidadoRepository;
import mx.pizzacode.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class TokenInvalidadoService {

    private static final Logger log = LoggerFactory.getLogger(TokenInvalidadoService.class);
    private final TokenInvalidadoRepository tokenInvalidadoRepository;
    private final JwtService jwtService;

    public TokenInvalidadoService(TokenInvalidadoRepository tokenInvalidadoRepository,
                                  JwtService jwtService) {
        this.tokenInvalidadoRepository = tokenInvalidadoRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public void invalidar(String token) {
        String huella = huella(token);

        if (tokenInvalidadoRepository.existsByToken(huella)) {
            return;
        }

        LocalDateTime expira = LocalDateTime.ofInstant(
                jwtService.extractExpiration(token), ZoneId.systemDefault());

        tokenInvalidadoRepository.save(new TokenInvalidado(huella, expira));
    }

    @Transactional(readOnly = true)
    public boolean estaInvalidado(String token) {
        return tokenInvalidadoRepository.existsByToken(huella(token));
    }

    private String huella(String token) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] resumen = sha256.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resumen);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no está disponible", ex);
        }
    }

    @Scheduled(cron = "${app.tokens.limpieza-cron:0 0 * * * *}")
    @Transactional
    public void limpiarExpirados() {
    int borrados = tokenInvalidadoRepository.borrarExpirados(LocalDateTime.now());
    if (borrados > 0) {
        log.info("Se borraron {} tokens invalidados ya expirados", borrados);
    }
}
}