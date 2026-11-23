-- =====================================================
-- V4__likes_comentarios.sql  (Flyway)
-- Likes de usuarios a comentarios.
-- Regla: un usuario solo puede dar 1 like por comentario,
--        y puede quitarlo (borrar la fila).
-- =====================================================

-- -----------------------------------------------------
-- comentario_likes  (N:M usuarios <-> comentarios)
-- La PK compuesta (id_comentario, id_usuario) es la que
-- impide que un mismo usuario dé like dos veces.
-- -----------------------------------------------------
CREATE TABLE comentario_likes (
  id_comentario INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_comentario, id_usuario),
  KEY idx_cl_usuario (id_usuario),
  CONSTRAINT fk_cl_comentario
    FOREIGN KEY (id_comentario) REFERENCES comentarios (id_comentario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cl_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;