-- =====================================================
-- V3__datos_prueba.sql  (Flyway)
-- Datos de prueba: categorías, productos, usuarios, promociones,
-- pedidos y comentarios. Los ids se obtienen por subconsulta.
-- Contraseña de los clientes nuevos: la misma que cliente@pizzacode.mx (BCrypt).
-- =====================================================

-- -----------------------------------------------------
-- categorias (7)
-- -----------------------------------------------------
INSERT INTO categorias (nombre) VALUES
  ('Rebanadas'),
  ('Sencillas'),
  ('Especialidades'),
  ('Complementos'),
  ('Bebidas'),
  ('Postres'),
  ('Paquetes');

-- -----------------------------------------------------
-- productos (15)
-- -----------------------------------------------------
INSERT INTO productos (nombre, descripcion, precio, imagen, disponible, id_categoria) VALUES
  ('Rebanada de pepperoni', 'Rebanada individual de pepperoni', 35.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Rebanadas')),
  ('Rebanada hawaiana', 'Rebanada individual de jamón y piña', 38.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Rebanadas')),
  ('Pepperoni mediana', 'Pizza mediana de pepperoni', 159.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Sencillas')),
  ('Pepperoni grande', 'Pizza grande de pepperoni', 199.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Sencillas')),
  ('Pepperoni familiar', 'Pizza familiar de pepperoni', 259.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Sencillas')),
  ('Hawaiana grande', 'Pizza grande de jamón y piña', 219.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Sencillas')),
  ('Queso grande', 'Pizza grande de queso mozzarella', 179.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Sencillas')),
  ('Mexicana grande', 'Chorizo, jalapeño, cebolla y frijol', 249.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Especialidades')),
  ('Al pastor grande', 'Carne al pastor, piña, cebolla y cilantro', 269.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Especialidades')),
  ('Carnes frías grande', 'Pepperoni, jamón, salami y tocino', 259.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Especialidades')),
  ('Alitas BBQ (10 piezas)', 'Alitas bañadas en salsa BBQ', 149.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Complementos')),
  ('Papas gajo', 'Papas gajo sazonadas', 79.00, NULL, 0,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Complementos')),
  ('Refresco 2 L', 'Refresco de cola de 2 litros', 45.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Bebidas')),
  ('Churros con cajeta (5 piezas)', 'Churros con azúcar y cajeta', 59.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Postres')),
  ('Paquete pepperoni grande + refresco 2 L', 'Pizza grande de pepperoni con refresco de 2 litros', 229.00, NULL, 1,
   (SELECT id_categoria FROM categorias WHERE nombre = 'Paquetes'));

-- -----------------------------------------------------
-- usuarios (15 clientes nuevos; 2 bloqueados)
-- Mismo hash BCrypt que cliente@pizzacode.mx (V2)
-- -----------------------------------------------------
SET @hash_cliente = '$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK';
SET @rol_cliente = (SELECT id_rol FROM roles WHERE nombre = 'CLIENTE');

INSERT INTO usuarios (nombre, apellido_pat, apellido_mat, correo, telefono, contrasena, id_rol, estado, motivo_bloqueo) VALUES
  ('María',     'López',     'García',   'maria.lopez@example.com',       '9511234501', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Juan',      'Torres',    'Morales',  'juan.torres@example.com',       '9511234502', @hash_cliente, @rol_cliente, 'BLOQUEADO', 'Pedidos no recogidos en 3 ocasiones'),
  ('Luisa',     'García',    'Ortiz',    'luisa.garcia@example.com',      '9511234503', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Carlos',    'Díaz',      'Romero',   'carlos.diaz@example.com',       '9511234504', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Ana',       'Pérez',     'Castillo', 'ana.perez@example.com',         '9511234505', @hash_cliente, @rol_cliente, 'BLOQUEADO', 'Lenguaje ofensivo en comentarios'),
  ('José',      'Flores',    'Reyes',    'jose.flores@example.com',       '9511234506', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Guadalupe', 'Sánchez',   'Vargas',   'guadalupe.sanchez@example.com', '9511234507', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Alejandro', 'Rivera',    'Mendoza',  'alejandro.rivera@example.com',  '9511234508', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Valeria',   'Hernández', 'Jiménez',  'valeria.hernandez@example.com', '9511234509', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Manuel',    'Mendoza',   'Aguilar',  'manuel.mendoza@example.com',    '9511234510', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Claudia',   'Martínez',  'Rojas',    'claudia.martinez@example.com',  '9511234511', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Fernando',  'Cruz',      'Gutiérrez','fernando.cruz@example.com',     '9511234512', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Ricardo',   'Vázquez',   'Navarro',  'ricardo.vazquez@example.com',   '9511234513', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Daniela',   'Ramírez',   'Santiago', 'daniela.ramirez@example.com',   '9511234514', @hash_cliente, @rol_cliente, 'ACTIVO', NULL),
  ('Sofía',     'Gómez',     'Ruiz',     'sofia.gomez@example.com',       '9511234515', @hash_cliente, @rol_cliente, 'ACTIVO', NULL);

-- -----------------------------------------------------
-- promociones (10: 2 activas y 8 vencidas)
-- descuento = porcentaje. El 2x1 se guarda como 50%.
-- -----------------------------------------------------
INSERT INTO promociones (nombre, descuento, fecha_inicio, fecha_fin) VALUES
  ('Martes 2x1 en pizzas grandes',   50.00, CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 180 DAY),
  ('Jueves 15% en todas las pizzas', 15.00, CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 180 DAY),
  ('Buen Fin 2025',          20.00, '2025-11-14', '2025-11-17'),
  ('Día del Niño 2026',      15.00, '2026-04-27', '2026-04-30'),
  ('Día de las Madres 2026', 20.00, '2026-05-08', '2026-05-10'),
  ('Día del Padre 2026',     15.00, '2026-06-19', '2026-06-21'),
  ('Guelaguetza 2026',       25.00, '2026-07-20', '2026-07-27'),
  ('Regreso a clases 2026',  10.00, '2026-08-17', '2026-08-28'),
  ('Fiestas Patrias 2026',   15.00, '2026-09-14', '2026-09-16'),
  ('Día de Muertos 2026',    20.00, '2026-10-31', '2026-11-02');

-- -----------------------------------------------------
-- promocion_producto
-- -----------------------------------------------------
-- Martes 2x1: pizzas grandes (Sencillas y Especialidades)
INSERT INTO promocion_producto (id_promocion, id_producto)
SELECT (SELECT id_promocion FROM promociones WHERE nombre = 'Martes 2x1 en pizzas grandes'), p.id_producto
FROM productos p
WHERE p.nombre LIKE '%grande'
  AND p.id_categoria IN (SELECT id_categoria FROM categorias WHERE nombre IN ('Sencillas', 'Especialidades'));

-- Jueves 15%: todas las pizzas (Sencillas y Especialidades)
INSERT INTO promocion_producto (id_promocion, id_producto)
SELECT (SELECT id_promocion FROM promociones WHERE nombre = 'Jueves 15% en todas las pizzas'), p.id_producto
FROM productos p
WHERE p.id_categoria IN (SELECT id_categoria FROM categorias WHERE nombre IN ('Sencillas', 'Especialidades'));

-- Vencidas
INSERT INTO promocion_producto (id_promocion, id_producto)
SELECT pr.id_promocion, p.id_producto
FROM promociones pr
JOIN productos p ON (pr.nombre, p.nombre) IN (
  ('Buen Fin 2025',          'Pepperoni familiar'),
  ('Buen Fin 2025',          'Carnes frías grande'),
  ('Día del Niño 2026',      'Pepperoni mediana'),
  ('Día del Niño 2026',      'Churros con cajeta (5 piezas)'),
  ('Día de las Madres 2026', 'Hawaiana grande'),
  ('Día del Padre 2026',     'Carnes frías grande'),
  ('Día del Padre 2026',     'Alitas BBQ (10 piezas)'),
  ('Guelaguetza 2026',       'Al pastor grande'),
  ('Guelaguetza 2026',       'Mexicana grande'),
  ('Regreso a clases 2026',  'Rebanada de pepperoni'),
  ('Regreso a clases 2026',  'Rebanada hawaiana'),
  ('Fiestas Patrias 2026',   'Mexicana grande'),
  ('Día de Muertos 2026',    'Churros con cajeta (5 piezas)'),
  ('Día de Muertos 2026',    'Paquete pepperoni grande + refresco 2 L')
);

-- -----------------------------------------------------
-- pedidos (10) + pedido_producto
-- EN_LINEA: con cliente, sin cajero. SUCURSAL: con cajero.
-- total = suma de cantidad * precio_unitario de sus renglones.
-- -----------------------------------------------------
SET @cajero = (SELECT id_usuario FROM usuarios WHERE correo = 'cajero@pizzacode.mx');

-- 1) Hoy, en línea, RECIBIDO: 2 x 199 + 219 = 617
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'luisa.garcia@example.com'), NULL, NULL, NULL,
        'EN_LINEA', 'TARJETA', 'RECIBIDO', NULL, 617.00, NOW() - INTERVAL 1 HOUR);
SET @p1 = LAST_INSERT_ID();

-- 2) Hoy, en línea, EN_PREPARACION: 159 + 149 = 308
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'carlos.diaz@example.com'), NULL, NULL, NULL,
        'EN_LINEA', 'EFECTIVO', 'EN_PREPARACION', NULL, 308.00, NOW() - INTERVAL 2 HOUR);
SET @p2 = LAST_INSERT_ID();

-- 3) Ayer, sucursal con cuenta, LISTO: 249 + 259 = 508
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'guadalupe.sanchez@example.com'), @cajero, NULL, NULL,
        'SUCURSAL', 'TARJETA', 'LISTO', NULL, 508.00, NOW() - INTERVAL 1 DAY);
SET @p3 = LAST_INSERT_ID();

-- 4) Hace 2 días, sucursal con cuenta, ENTREGADO: 219 + 179 = 398
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'alejandro.rivera@example.com'), @cajero, NULL, NULL,
        'SUCURSAL', 'EFECTIVO', 'ENTREGADO', NULL, 398.00, NOW() - INTERVAL 2 DAY);
SET @p4 = LAST_INSERT_ID();

-- 5) Hace 5 días, sucursal SIN cuenta, ENTREGADO: 35 + 45 = 80
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES (NULL, @cajero, 'Ana María Ortega', '9517654301',
        'SUCURSAL', 'EFECTIVO', 'ENTREGADO', NULL, 80.00, NOW() - INTERVAL 5 DAY);
SET @p5 = LAST_INSERT_ID();

-- 6) Hace 2 días, sucursal con la cuenta demo, ENTREGADO: 199 + 219 = 418
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'cliente@pizzacode.mx'), @cajero, NULL, NULL,
        'SUCURSAL', 'EFECTIVO', 'ENTREGADO', NULL, 418.00, NOW() - INTERVAL 2 DAY);
SET @p6 = LAST_INSERT_ID();

-- 7) Hace 6 días, en línea, ENTREGADO: 269
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'valeria.hernandez@example.com'), NULL, NULL, NULL,
        'EN_LINEA', 'TARJETA', 'ENTREGADO', NULL, 269.00, NOW() - INTERVAL 6 DAY);
SET @p7 = LAST_INSERT_ID();

-- 8) Ayer, sucursal SIN cuenta, CANCELADO: 179
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES (NULL, @cajero, 'Roberto Salinas', '9517654302',
        'SUCURSAL', 'EFECTIVO', 'CANCELADO', 'El cliente cambió de opinión antes de prepararlo', 179.00, NOW() - INTERVAL 1 DAY);
SET @p8 = LAST_INSERT_ID();

-- 9) Hace 4 días, en línea, ENTREGADO: 2 x 159 + 219 = 537
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'ricardo.vazquez@example.com'), NULL, NULL, NULL,
        'EN_LINEA', 'EFECTIVO', 'ENTREGADO', NULL, 537.00, NOW() - INTERVAL 4 DAY);
SET @p9 = LAST_INSERT_ID();

-- 10) Martes más reciente, en línea, ENTREGADO, promo 2x1: 2 x 99.50 = 199
INSERT INTO pedidos (id_cliente, id_cajero, nombre_cliente, telefono_cliente, origen, metodo_pago, estado, motivo_cancelacion, total, fecha)
VALUES ((SELECT id_usuario FROM usuarios WHERE correo = 'daniela.ramirez@example.com'), NULL, NULL, NULL,
        'EN_LINEA', 'TARJETA', 'ENTREGADO', NULL, 199.00,
        CURDATE() - INTERVAL ((WEEKDAY(CURDATE()) - 1 + 7) % 7) DAY + INTERVAL 14 HOUR);
SET @p10 = LAST_INSERT_ID();

INSERT INTO pedido_producto (id_pedido, id_producto, cantidad, precio_unitario) VALUES
  (@p1,  (SELECT id_producto FROM productos WHERE nombre = 'Pepperoni grande'),        2, 199.00),
  (@p1,  (SELECT id_producto FROM productos WHERE nombre = 'Hawaiana grande'),         1, 219.00),
  (@p2,  (SELECT id_producto FROM productos WHERE nombre = 'Pepperoni mediana'),       1, 159.00),
  (@p2,  (SELECT id_producto FROM productos WHERE nombre = 'Alitas BBQ (10 piezas)'),  1, 149.00),
  (@p3,  (SELECT id_producto FROM productos WHERE nombre = 'Mexicana grande'),         1, 249.00),
  (@p3,  (SELECT id_producto FROM productos WHERE nombre = 'Carnes frías grande'),     1, 259.00),
  (@p4,  (SELECT id_producto FROM productos WHERE nombre = 'Hawaiana grande'),         1, 219.00),
  (@p4,  (SELECT id_producto FROM productos WHERE nombre = 'Queso grande'),            1, 179.00),
  (@p5,  (SELECT id_producto FROM productos WHERE nombre = 'Rebanada de pepperoni'),   1,  35.00),
  (@p5,  (SELECT id_producto FROM productos WHERE nombre = 'Refresco 2 L'),            1,  45.00),
  (@p6,  (SELECT id_producto FROM productos WHERE nombre = 'Pepperoni grande'),        1, 199.00),
  (@p6,  (SELECT id_producto FROM productos WHERE nombre = 'Hawaiana grande'),         1, 219.00),
  (@p7,  (SELECT id_producto FROM productos WHERE nombre = 'Al pastor grande'),        1, 269.00),
  (@p8,  (SELECT id_producto FROM productos WHERE nombre = 'Queso grande'),            1, 179.00),
  (@p9,  (SELECT id_producto FROM productos WHERE nombre = 'Pepperoni mediana'),       2, 159.00),
  (@p9,  (SELECT id_producto FROM productos WHERE nombre = 'Hawaiana grande'),         1, 219.00),
  (@p10, (SELECT id_producto FROM productos WHERE nombre = 'Pepperoni grande'),        2,  99.50);

-- -----------------------------------------------------
-- comentarios (11; 2 ocultos para mostrar la moderación)
-- -----------------------------------------------------
INSERT INTO comentarios (id_usuario, tipo, texto, visible, fecha) VALUES
  ((SELECT id_usuario FROM usuarios WHERE correo = 'maria.lopez@example.com'),       'COMENTARIO', 'Muy ricas pizzas, le gustaron a mi novia', 1, NOW() - INTERVAL 1 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'luisa.garcia@example.com'),      'SUGERENCIA', 'Ojalá vendieran pizza de tacos', 1, NOW() - INTERVAL 2 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'carlos.diaz@example.com'),       'SUGERENCIA', 'Hagan más promociones', 1, NOW() - INTERVAL 2 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'jose.flores@example.com'),       'SUGERENCIA', 'Para cuándo peperoni con piña', 1, NOW() - INTERVAL 3 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'guadalupe.sanchez@example.com'), 'SUGERENCIA', 'Hagan una con chapulines', 1, NOW() - INTERVAL 4 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'alejandro.rivera@example.com'),  'SUGERENCIA', 'Pónganle suadero a una pizza, con gusto pago el doble', 1, NOW() - INTERVAL 5 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'valeria.hernandez@example.com'), 'SUGERENCIA', 'Más grandes las rebanadas', 1, NOW() - INTERVAL 6 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'manuel.mendoza@example.com'),    'COMENTARIO', 'Excelente servicio', 1, NOW() - INTERVAL 7 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'claudia.martinez@example.com'),  'COMENTARIO', '5 estrellas Michelin', 0, NOW() - INTERVAL 8 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'fernando.cruz@example.com'),     'COMENTARIO', '¿Contratan mesero?', 0, NOW() - INTERVAL 9 DAY),
  ((SELECT id_usuario FROM usuarios WHERE correo = 'ricardo.vazquez@example.com'),   'COMENTARIO', '¿Entregan en el Tec?', 1, NOW() - INTERVAL 10 DAY);

-- tokens_invalidados: sin datos (se llena con el logout).