-- =====================================================
-- V1__crear_tablas.sql  (Flyway)
-- Base de datos: MySQL 8 | Esquema: pizzeria
-- Crea la BD antes (una sola vez, fuera de Flyway):
--   CREATE DATABASE pizzeria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- =====================================================

-- -----------------------------------------------------
-- roles
-- -----------------------------------------------------
CREATE TABLE roles (
  id_rol INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(20) NOT NULL,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uk_roles_nombre (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- usuarios
-- -----------------------------------------------------
CREATE TABLE usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellido_pat VARCHAR(50) NOT NULL,
  apellido_mat VARCHAR(50) NULL,
  correo VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  contrasena VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt (60 caracteres)',
  id_rol INT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' COMMENT 'ACTIVO | BLOQUEADO',
  motivo_bloqueo VARCHAR(255) NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uk_usuarios_correo (correo),
  KEY idx_usuarios_rol (id_rol),
  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- categorias
-- -----------------------------------------------------
CREATE TABLE categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uk_categorias_nombre (nombre)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- productos
-- -----------------------------------------------------
CREATE TABLE productos (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(255) NULL,
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  id_categoria INT NOT NULL,
  PRIMARY KEY (id_producto),
  KEY idx_productos_categoria (id_categoria),
  KEY idx_productos_nombre (nombre),
  CONSTRAINT fk_productos_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- pedidos
-- id_cliente: cliente con cuenta (opcional)
-- id_cajero: cajero que lo registró en sucursal (opcional)
-- -----------------------------------------------------
CREATE TABLE pedidos (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_cliente INT NULL,
  id_cajero INT NULL,
  nombre_cliente VARCHAR(100) NULL,
  telefono_cliente VARCHAR(15) NULL,
  origen VARCHAR(20) NOT NULL COMMENT 'EN_LINEA | SUCURSAL',
  metodo_pago VARCHAR(20) NOT NULL COMMENT 'EFECTIVO | TARJETA',
  estado VARCHAR(20) NOT NULL DEFAULT 'RECIBIDO'
    COMMENT 'RECIBIDO | EN_PREPARACION | LISTO | ENTREGADO | CANCELADO',
  motivo_cancelacion VARCHAR(255) NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pedido),
  KEY idx_pedidos_cliente (id_cliente),
  KEY idx_pedidos_cajero (id_cajero),
  KEY idx_pedidos_fecha (fecha),
  KEY idx_pedidos_estado (estado),
  CONSTRAINT fk_pedidos_cliente
    FOREIGN KEY (id_cliente) REFERENCES usuarios (id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_cajero
    FOREIGN KEY (id_cajero) REFERENCES usuarios (id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- pedido_producto  (N:M pedidos <-> productos)
-- -----------------------------------------------------
CREATE TABLE pedido_producto (
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL COMMENT 'Precio al momento de la compra',
  PRIMARY KEY (id_pedido, id_producto),
  KEY idx_pp_producto (id_producto),
  CONSTRAINT fk_pp_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pp_producto
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- promociones
-- descuento: porcentaje (ej. 15.00 = 15%)
-- -----------------------------------------------------
CREATE TABLE promociones (
  id_promocion INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descuento DECIMAL(5,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  PRIMARY KEY (id_promocion),
  KEY idx_promociones_fechas (fecha_inicio, fecha_fin)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- promocion_producto  (N:M promociones <-> productos)
-- -----------------------------------------------------
CREATE TABLE promocion_producto (
  id_promocion INT NOT NULL,
  id_producto INT NOT NULL,
  PRIMARY KEY (id_promocion, id_producto),
  KEY idx_prp_producto (id_producto),
  CONSTRAINT fk_prp_promocion
    FOREIGN KEY (id_promocion) REFERENCES promociones (id_promocion)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_prp_producto
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- comentarios
-- -----------------------------------------------------
CREATE TABLE comentarios (
  id_comentario INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'COMENTARIO' COMMENT 'COMENTARIO | SUGERENCIA',
  texto VARCHAR(500) NOT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_comentario),
  KEY idx_comentarios_usuario (id_usuario),
  KEY idx_comentarios_fecha (fecha),
  CONSTRAINT fk_comentarios_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- tokens_invalidados (lista negra para el logout con JWT)
-- -----------------------------------------------------
CREATE TABLE tokens_invalidados (
  id_token INT NOT NULL AUTO_INCREMENT,
  token VARCHAR(512) NOT NULL,
  fecha_expiracion DATETIME NOT NULL,
  PRIMARY KEY (id_token),
  UNIQUE KEY uk_tokens_token (token),
  KEY idx_tokens_expiracion (fecha_expiracion)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Datos fijos: roles (los nombres deben coincidir con Spring Security)
-- -----------------------------------------------------
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CLIENTE'), ('CAJERO');
