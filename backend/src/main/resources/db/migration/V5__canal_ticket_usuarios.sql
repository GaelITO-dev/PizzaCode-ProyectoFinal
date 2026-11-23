-- =====================================================
-- V5__canal_ticket_usuarios.sql  (#58)
-- Preferencia del cliente para recibir su ticket.
-- =====================================================

ALTER TABLE usuarios
  ADD COLUMN canal_ticket VARCHAR(20) NOT NULL DEFAULT 'AMBOS'
    COMMENT 'WHATSAPP | CORREO | AMBOS'
    AFTER telefono,
  ADD CONSTRAINT chk_usuarios_canal_ticket
    CHECK (canal_ticket IN ('WHATSAPP', 'CORREO', 'AMBOS'));