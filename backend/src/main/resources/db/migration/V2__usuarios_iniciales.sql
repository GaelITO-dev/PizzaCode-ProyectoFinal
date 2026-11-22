-- =====================================================
-- V2__usuarios_iniciales.sql  (Flyway)
-- Un usuario por rol. Contraseñas en BCrypt.
-- =====================================================

INSERT INTO usuarios (nombre, apellido_pat, apellido_mat, correo, telefono, contrasena, id_rol, estado)
VALUES
  ('Admin', 'Evaluación', NULL, 'admin@pizzacode.mx', '9518230291',
   '$2a$10$Pj3kNyt8bhXYimHsjwQLZeY6aHT.DRXO0J8Tf.Sw3vOTiVuEj6Zg2',
   (SELECT id_rol FROM roles WHERE nombre = 'ADMIN'), 'ACTIVO'),

  ('Pedro', 'Gómez', 'Salas', 'cajero@pizzacode.mx', '9518230292',
   '$2a$10$sAF.i6f.nXqmGkz58hO8aekUef/Rn1YLMwbmq84WkJ7lVM5G57IqK',
   (SELECT id_rol FROM roles WHERE nombre = 'CAJERO'), 'ACTIVO'),

  ('Ana', 'López', 'Ruiz', 'cliente@pizzacode.mx', '9518230293',
   '$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',
   (SELECT id_rol FROM roles WHERE nombre = 'CLIENTE'), 'ACTIVO');