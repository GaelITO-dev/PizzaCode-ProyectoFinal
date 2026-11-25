-- =====================================================
-- V7__recuperacion_contrasena.sql  (#43)
-- Enlaces de un solo uso para restablecer la contraseña.
-- Se guarda el hash SHA-256 del token, nunca el token.
-- fecha_uso: cuándo se usó o se invalidó (por uno más nuevo); NULL = vigente.
-- =====================================================

CREATE TABLE recuperaciones_contrasena (
  id_recuperacion INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_expiracion DATETIME NOT NULL,
  fecha_uso DATETIME NULL,
  PRIMARY KEY (id_recuperacion),
  UNIQUE KEY uk_recuperaciones_token (token_hash),
  KEY idx_recuperaciones_usuario (id_usuario, fecha_creacion),
  CONSTRAINT fk_recuperaciones_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
