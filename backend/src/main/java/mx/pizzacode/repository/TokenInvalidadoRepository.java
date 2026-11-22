package mx.pizzacode.repository;

import mx.pizzacode.entity.TokenInvalidado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface TokenInvalidadoRepository extends JpaRepository<TokenInvalidado, Integer> {

    boolean existsByToken(String token);

    @Modifying
    @Query("DELETE FROM TokenInvalidado t WHERE t.fechaExpiracion < :ahora")
    int borrarExpirados(@Param("ahora") LocalDateTime ahora);
}