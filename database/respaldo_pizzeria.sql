-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: pizzeria
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `pizzeria`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `pizzeria` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `pizzeria`;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uk_categorias_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (5,'Bebidas'),(4,'Complementos'),(3,'Especialidades'),(7,'Paquetes'),(6,'Postres'),(1,'Rebanadas'),(2,'Sencillas');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario_likes`
--

DROP TABLE IF EXISTS `comentario_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario_likes` (
  `id_comentario` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_comentario`,`id_usuario`),
  KEY `idx_cl_usuario` (`id_usuario`),
  CONSTRAINT `fk_cl_comentario` FOREIGN KEY (`id_comentario`) REFERENCES `comentarios` (`id_comentario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cl_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario_likes`
--

LOCK TABLES `comentario_likes` WRITE;
/*!40000 ALTER TABLE `comentario_likes` DISABLE KEYS */;
INSERT INTO `comentario_likes` VALUES (8,1,'2026-11-23 01:42:30'),(8,3,'2026-11-23 17:04:56'),(12,1,'2026-11-23 21:22:30');
/*!40000 ALTER TABLE `comentario_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios` (
  `id_comentario` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMENTARIO' COMMENT 'COMENTARIO | SUGERENCIA',
  `texto` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_comentario`),
  KEY `idx_comentarios_usuario` (`id_usuario`),
  KEY `idx_comentarios_fecha` (`fecha`),
  CONSTRAINT `fk_comentarios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (1,4,'COMENTARIO','Muy ricas pizzas, le gustaron a mi novia',0,'2026-11-21 03:03:53'),(2,6,'SUGERENCIA','Ojalá vendieran pizza de tacos',1,'2026-11-20 03:03:53'),(3,7,'SUGERENCIA','Hagan más promociones',1,'2026-11-20 03:03:53'),(4,9,'SUGERENCIA','Para cuándo peperoni con piña',1,'2026-11-19 03:03:53'),(5,10,'SUGERENCIA','Hagan una con chapulines',1,'2026-11-18 03:03:53'),(6,11,'SUGERENCIA','Pónganle suadero a una pizza, con gusto pago el doble',1,'2026-11-17 03:03:53'),(7,12,'SUGERENCIA','Más grandes las rebanadas',1,'2026-11-16 03:03:53'),(8,13,'COMENTARIO','Excelente servicio',1,'2026-11-15 03:03:53'),(9,14,'COMENTARIO','5 estrellas Michelin',0,'2026-11-14 03:03:53'),(10,15,'COMENTARIO','¿Contratan mesero?',0,'2026-11-13 03:03:53'),(11,16,'COMENTARIO','¿Entregan en el Tec?',1,'2026-11-12 03:03:53'),(12,3,'COMENTARIO','Hey deberían sacar una pizza de tamal',1,'2026-11-23 16:38:49');
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','crear tablas','SQL','V1__crear_tablas.sql',924342421,'pizza_app','2026-11-21 21:30:10',382,1),(2,'2','usuarios iniciales','SQL','V2__usuarios_iniciales.sql',960987334,'pizza_app','2026-11-22 00:24:48',44,1),(3,'3','datos prueba','SQL','V3__datos_prueba.sql',-786356565,'pizza_app','2026-11-22 09:03:53',180,1),(4,'4','likes','SQL','V4__likes.sql',-171177575,'pizza_app','2026-11-23 01:41:41',80,1),(5,'5','canal ticket usuarios','SQL','V5__canal_ticket_usuarios.sql',1939065459,'pizza_app','2026-11-23 06:23:23',161,1),(6,'6','promociones solo porcentaje','SQL','V6__promociones_solo_porcentaje.sql',-2142535514,'pizza_app','2026-11-24 01:06:21',46,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_producto`
--

DROP TABLE IF EXISTS `pedido_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_producto` (
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL COMMENT 'Precio al momento de la compra',
  PRIMARY KEY (`id_pedido`,`id_producto`),
  KEY `idx_pp_producto` (`id_producto`),
  CONSTRAINT `fk_pp_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pp_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_producto`
--

LOCK TABLES `pedido_producto` WRITE;
/*!40000 ALTER TABLE `pedido_producto` DISABLE KEYS */;
INSERT INTO `pedido_producto` VALUES (1,4,2,199.00),(1,6,1,219.00),(2,3,1,159.00),(2,11,1,149.00),(3,8,1,249.00),(3,10,1,259.00),(4,6,1,219.00),(4,7,1,179.00),(5,1,1,35.00),(5,13,1,45.00),(6,4,1,199.00),(6,6,1,219.00),(7,9,1,269.00),(8,7,1,179.00),(9,3,2,159.00),(9,6,1,219.00),(10,4,2,99.50),(11,4,2,199.00),(12,4,2,199.00),(13,9,1,269.00),(13,15,2,229.00),(14,9,2,269.00),(14,14,2,59.00),(15,13,2,45.00),(16,2,10,38.00),(17,6,1,219.00),(17,7,1,179.00),(17,9,1,269.00),(18,9,1,201.75),(19,4,2,149.25),(20,4,2,149.25),(21,4,2,149.25),(22,4,2,149.25),(23,4,2,149.25),(24,4,2,149.25),(25,4,2,149.25),(26,4,2,149.25),(27,14,1,59.00),(28,14,1,59.00),(29,10,1,194.25);
/*!40000 ALTER TABLE `pedido_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int DEFAULT NULL,
  `id_cajero` int DEFAULT NULL,
  `nombre_cliente` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono_cliente` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `origen` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'EN_LINEA | SUCURSAL',
  `metodo_pago` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'EFECTIVO | TARJETA',
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RECIBIDO' COMMENT 'RECIBIDO | EN_PREPARACION | LISTO | ENTREGADO | CANCELADO',
  `motivo_cancelacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pedido`),
  KEY `idx_pedidos_cliente` (`id_cliente`),
  KEY `idx_pedidos_cajero` (`id_cajero`),
  KEY `idx_pedidos_fecha` (`fecha`),
  KEY `idx_pedidos_estado` (`estado`),
  CONSTRAINT `fk_pedidos_cajero` FOREIGN KEY (`id_cajero`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,6,NULL,NULL,NULL,'EN_LINEA','TARJETA','RECIBIDO',NULL,617.00,'2026-11-22 02:03:53'),(2,7,NULL,NULL,NULL,'EN_LINEA','EFECTIVO','EN_PREPARACION',NULL,308.00,'2026-11-22 01:03:53'),(3,10,2,NULL,NULL,'SUCURSAL','TARJETA','LISTO',NULL,508.00,'2026-11-21 03:03:53'),(4,11,2,NULL,NULL,'SUCURSAL','EFECTIVO','ENTREGADO',NULL,398.00,'2026-11-20 03:03:53'),(5,NULL,2,'Ana María Ortega','9517654301','SUCURSAL','EFECTIVO','ENTREGADO',NULL,80.00,'2026-11-17 03:03:53'),(6,3,2,NULL,NULL,'SUCURSAL','EFECTIVO','ENTREGADO',NULL,418.00,'2026-11-20 03:03:53'),(7,12,NULL,NULL,NULL,'EN_LINEA','TARJETA','ENTREGADO',NULL,269.00,'2026-11-16 03:03:53'),(8,NULL,2,'Roberto Salinas','9517654302','SUCURSAL','EFECTIVO','CANCELADO','El cliente cambió de opinión antes de prepararlo',179.00,'2026-11-21 03:03:53'),(9,16,NULL,NULL,NULL,'EN_LINEA','EFECTIVO','ENTREGADO',NULL,537.00,'2026-11-18 03:03:53'),(10,17,NULL,NULL,NULL,'EN_LINEA','TARJETA','ENTREGADO',NULL,199.00,'2026-11-17 14:00:00'),(11,NULL,1,'Juan Pérez','9511112233','SUCURSAL','EFECTIVO','RECIBIDO',NULL,398.00,'2026-11-22 13:36:56'),(12,NULL,1,'Juan Pérez','9511112233','SUCURSAL','EFECTIVO','RECIBIDO',NULL,398.00,'2026-11-22 13:59:12'),(13,3,NULL,NULL,NULL,'EN_LINEA','TARJETA','CANCELADO','El cliente lo canceló',727.00,'2026-11-23 17:08:35'),(14,NULL,2,'Ana','9518230293','SUCURSAL','EFECTIVO','CANCELADO','se fue corriendo sin pagar',656.00,'2026-11-23 17:13:26'),(15,3,2,NULL,NULL,'SUCURSAL','EFECTIVO','CANCELADO','tembló',90.00,'2026-11-23 17:14:21'),(16,20,2,NULL,NULL,'SUCURSAL','EFECTIVO','ENTREGADO',NULL,380.00,'2026-11-23 17:17:05'),(17,3,NULL,NULL,NULL,'EN_LINEA','EFECTIVO','RECIBIDO',NULL,667.00,'2026-11-23 17:41:37'),(18,NULL,2,'Oliver','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,201.75,'2026-11-23 19:44:19'),(19,NULL,2,'Juan Pérez','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,298.50,'2026-11-23 19:50:51'),(20,NULL,2,'Juan Pérez','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,298.50,'2026-11-23 20:11:34'),(21,NULL,2,'Juan Pérez2','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,298.50,'2026-11-23 20:18:59'),(22,NULL,2,'Juan Pérez2','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,298.50,'2026-11-23 20:30:26'),(23,NULL,2,'Juan Pérez2','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,298.50,'2026-11-23 20:39:37'),(24,NULL,2,'Juan Pérez','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,298.50,'2026-11-23 20:48:01'),(25,NULL,2,'Juan Pérez','9518760211','SUCURSAL','EFECTIVO','CANCELADO','ya no quiso',298.50,'2026-11-23 20:49:42'),(26,NULL,2,'Juan Pérez','9518760211','SUCURSAL','EFECTIVO','CANCELADO','asaltaron la tienda',298.50,'2026-11-23 20:53:04'),(27,NULL,2,'juan','9518760211','SUCURSAL','EFECTIVO','ENTREGADO',NULL,59.00,'2026-11-23 21:08:59'),(28,20,2,NULL,NULL,'SUCURSAL','EFECTIVO','LISTO',NULL,59.00,'2026-11-23 21:11:55'),(29,20,2,NULL,NULL,'SUCURSAL','EFECTIVO','LISTO',NULL,194.25,'2026-11-23 21:13:30');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT '1',
  `id_categoria` int NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `idx_productos_categoria` (`id_categoria`),
  KEY `idx_productos_nombre` (`nombre`),
  CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Rebanada de pepperoni','Rebanada individual de pepperoni',35.00,NULL,1,1),(2,'Rebanada hawaiana','Rebanada individual de jamón y piña',38.00,NULL,1,1),(3,'Pepperoni mediana','Pizza mediana de pepperoni',159.00,NULL,1,2),(4,'Pepperoni grande','Pizza grande de pepperoni',199.00,NULL,1,2),(5,'Pepperoni familiar','Pizza familiar de pepperoni',259.00,NULL,1,2),(6,'Hawaiana grande','Pizza grande de jamón y piña',219.00,NULL,1,2),(7,'Queso grande','Pizza grande de queso mozzarella',179.00,NULL,1,2),(8,'Mexicana grande','Chorizo, jalapeño, cebolla y frijol',249.00,NULL,1,3),(9,'Al pastor grande','Carne al pastor, piña, cebolla y cilantro',269.00,NULL,1,3),(10,'Carnes frías grande','Pepperoni, jamón, salami y tocino',259.00,NULL,1,3),(11,'Alitas BBQ (10 piezas)','Alitas bañadas en salsa BBQ',149.00,NULL,1,4),(12,'Papas gajo','Papas gajo sazonadas',79.00,NULL,1,4),(13,'Refresco 2 L','Refresco de cola de 2 litros',45.00,NULL,1,5),(14,'Churros con cajeta (5 piezas)','Churros con azúcar y cajeta',59.00,NULL,1,6),(15,'Paquete pepperoni grande + refresco 2 L','Pizza grande de pepperoni con refresco de 2 litros',229.00,NULL,1,7);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promocion_producto`
--

DROP TABLE IF EXISTS `promocion_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocion_producto` (
  `id_promocion` int NOT NULL,
  `id_producto` int NOT NULL,
  PRIMARY KEY (`id_promocion`,`id_producto`),
  KEY `idx_prp_producto` (`id_producto`),
  CONSTRAINT `fk_prp_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prp_promocion` FOREIGN KEY (`id_promocion`) REFERENCES `promociones` (`id_promocion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocion_producto`
--

LOCK TABLES `promocion_producto` WRITE;
/*!40000 ALTER TABLE `promocion_producto` DISABLE KEYS */;
INSERT INTO `promocion_producto` VALUES (8,1),(8,2),(2,3),(4,3),(1,4),(2,5),(3,5),(1,6),(5,6),(1,7),(1,8),(9,8),(1,9),(11,9),(1,10),(3,10),(6,10),(11,10),(6,11),(4,14),(10,14),(10,15);
/*!40000 ALTER TABLE `promocion_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promociones`
--

DROP TABLE IF EXISTS `promociones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promociones` (
  `id_promocion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descuento` decimal(5,2) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  PRIMARY KEY (`id_promocion`),
  KEY `idx_promociones_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promociones`
--

LOCK TABLES `promociones` WRITE;
/*!40000 ALTER TABLE `promociones` DISABLE KEYS */;
INSERT INTO `promociones` VALUES (1,'Pizzas grandes 25% de descuento',25.00,'2026-10-23','2027-05-21'),(2,'Pizzas medianas y familiares 15% de descuento',15.00,'2026-10-23','2027-05-21'),(3,'Buen Fin 2025',20.00,'2025-11-14','2025-11-17'),(4,'Día del Niño 2026',15.00,'2026-04-27','2026-04-30'),(5,'Día de las Madres 2026',20.00,'2026-05-08','2026-05-10'),(6,'Día del Padre 2026',15.00,'2026-06-19','2026-06-21'),(8,'Regreso a clases 2026',10.00,'2026-08-17','2026-08-28'),(9,'Fiestas Patrias 2026',15.00,'2026-09-14','2026-09-16'),(10,'Día de Muertos 2026',20.00,'2026-10-31','2026-11-02'),(11,'Miercoles de oferta',15.00,'2026-11-16','2026-11-22');
/*!40000 ALTER TABLE `promociones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uk_roles_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(3,'CAJERO'),(2,'CLIENTE');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_invalidados`
--

DROP TABLE IF EXISTS `tokens_invalidados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_invalidados` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `uk_tokens_token` (`token`),
  KEY `idx_tokens_expiracion` (`fecha_expiracion`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_invalidados`
--

LOCK TABLES `tokens_invalidados` WRITE;
/*!40000 ALTER TABLE `tokens_invalidados` DISABLE KEYS */;
INSERT INTO `tokens_invalidados` VALUES (2,'bec4deae0d3dc84426d5bdd15b5bdaaca8c18d9fe1d9bcb1b9370e4ae40c083b','2026-11-24 00:32:41'),(3,'9a33f4347397516414ace72d8706369690c78280e962140f7e8bd0b7bcd1f1e3','2026-11-24 01:26:31'),(4,'35533dfba405ef68cd56ecd847084db49d9ba0a5a7bb7b229767ebb9092902b1','2026-11-24 02:56:30'),(5,'bc9d78fac37f62f936aebb98ef6cd2c2a25d23cef5a69a864cac0c393521087d','2026-11-24 02:59:52'),(6,'74c23930c5552a3c82c8078005e78fa939f0b9530c1e80bb9504f611cc326636','2026-11-24 16:37:57'),(7,'a9ee1e031cd2604bf49ebe9f1fd3b1af2e1dea63a630512c6ec35e371a7ae83e','2026-11-24 17:04:28'),(8,'876c1c2f215b2ef6d4a2e086606c1b59c882dd70dded948c385d06090fd648ae','2026-11-24 17:10:44'),(9,'82d0964a017baf6b2f343848f3e6c1aab18d5c19ddb6de8552990b5035e1223f','2026-11-24 17:19:08'),(10,'0b84777b63fd6bf66bf90f5882fe560335658cd3f9f34b8cb21411da3b933530','2026-11-24 17:32:17'),(11,'ff3a4031aa622e522a3b687c7d098cd4a055ee147db197364e22327a47665d67','2026-11-24 17:40:57'),(12,'39841d2374b96595c9736041cf71e2fa8e14620097270e8112fb8a1e18596ad4','2026-11-24 19:06:46'),(13,'745df9809df2dc64d17e0fdc974fe32393b10df4437c35cf0b64f73279132daa','2026-11-24 19:43:32'),(14,'07de45eea274dfe2b56d875b161d42d6bea6c769e10b924a09b081333580b6f9','2026-11-24 21:08:32'),(15,'5a0e771e3a19e84535b92df97939dd933bf4721f5bb9f113c770b9deb18c83dd','2026-11-24 21:21:05'),(16,'08d6cda9a042aab8dd5af5299f04016a9fd857d84a7970f802044b739afb1362','2026-11-24 21:21:39');
/*!40000 ALTER TABLE `tokens_invalidados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_pat` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_mat` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `canal_ticket` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AMBOS' COMMENT 'WHATSAPP | CORREO | AMBOS',
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash BCrypt (60 caracteres)',
  `id_rol` int NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO' COMMENT 'ACTIVO | BLOQUEADO',
  `motivo_bloqueo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuarios_correo` (`correo`),
  KEY `idx_usuarios_rol` (`id_rol`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_usuarios_canal_ticket` CHECK ((`canal_ticket` in (_utf8mb4'WHATSAPP',_utf8mb4'CORREO',_utf8mb4'AMBOS')))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Admin','Evaluación',NULL,'admin@pizzacode.mx','9518230291','AMBOS','$2a$10$Pj3kNyt8bhXYimHsjwQLZeY6aHT.DRXO0J8Tf.Sw3vOTiVuEj6Zg2',1,'ACTIVO',NULL),(2,'Pedro','Gómez','Salas','cajero@pizzacode.mx','9518230292','AMBOS','$2a$10$sAF.i6f.nXqmGkz58hO8aekUef/Rn1YLMwbmq84WkJ7lVM5G57IqK',3,'ACTIVO',NULL),(3,'Ana','López','Ruiz','cliente@pizzacode.mx','9518230293','CORREO','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(4,'María','López','García','maria.lopez@example.com','9511234501','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(5,'Juan','Torres','Morales','juan.torres@example.com','9511234502','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'BLOQUEADO','Pedidos no recogidos en 3 ocasiones'),(6,'Luisa','García','Ortiz','luisa.garcia@example.com','9511234503','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(7,'Carlos','Díaz','Romero','carlos.diaz@example.com','9511234504','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(8,'Ana','Pérez','Castillo','ana.perez@example.com','9511234505','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'BLOQUEADO','Lenguaje ofensivo en comentarios'),(9,'José','Flores','Reyes','jose.flores@example.com','9511234506','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(10,'Guadalupe','Sánchez','Vargas','guadalupe.sanchez@example.com','9511234507','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(11,'Alejandro','Rivera','Mendoza','alejandro.rivera@example.com','9511234508','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(12,'Valeria','Hernández','Jiménez','valeria.hernandez@example.com','9511234509','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(13,'Manuel','Mendoza','Aguilar','manuel.mendoza@example.com','9511234510','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(14,'Claudia','Martínez','Rojas','claudia.martinez@example.com','9511234511','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(15,'Fernando','Cruz','Gutiérrez','fernando.cruz@example.com','9511234512','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(16,'Ricardo','Vázquez','Navarro','ricardo.vazquez@example.com','9511234513','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(17,'Daniela','Ramírez','Santiago','daniela.ramirez@example.com','9511234514','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(18,'Sofía','Gómez','Ruiz','sofia.gomez@example.com','9511234515','AMBOS','$2a$10$.23RN80KYshazWdVx9FQ6excXiONrXWgO5WqQF3AKPpT8Y62qEXQK',2,'ACTIVO',NULL),(19,'Ana','López','Ruiz','nuevo2.cliente@pizzacode.mx','9511234567','AMBOS','$2a$10$5r.L5WtyGHqL9R0udzC8lusEUadIgLu7AJOCMX6KQqCFpQLBOb/bq',2,'ACTIVO',NULL),(20,'Gael','Martinez','Cruz','gaelmartinezcruz3812@gmail.com','9511690278','AMBOS','$2a$10$nEvD7sd7S8Vc0uJhP1Etd.djXkr8AnZ6NgB66hiYtUx.rvcR8D56G',2,'ACTIVO',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'pizzeria'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-24 14:59:05
