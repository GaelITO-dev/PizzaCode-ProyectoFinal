-- V6 (Oliver, #106): las promociones vigentes del seed se expresan solo como % de descuento.
-- El sistema aplica el % todos los días (no maneja días de la semana ni "2x1"),
-- así que se renombran para que el cliente no se confunda, y se evita que una pizza esté en dos promociones.

UPDATE promociones
SET nombre = 'Pizzas grandes 25% de descuento', descuento = 25.00
WHERE nombre = 'Martes 2x1 en pizzas grandes';

UPDATE promociones
SET nombre = 'Pizzas medianas y familiares 15% de descuento'
WHERE nombre = 'Jueves 15% en todas las pizzas';

-- Las grandes ya tienen su propia promoción (25%)
DELETE pp FROM promocion_producto pp
JOIN promociones pr ON pr.id_promocion = pp.id_promocion
JOIN productos p ON p.id_producto = pp.id_producto
WHERE pr.nombre = 'Pizzas medianas y familiares 15% de descuento'
  AND p.nombre LIKE '%grande';
