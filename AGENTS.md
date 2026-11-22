# AGENTS.md

Spring Boot 4.2.0 backend under `backend/` (Maven, Java 21 target). Entry point: `mx.pizzacode.PizzaCodeApplication`. No controllers/services/repositories yet — the app just starts the context.

## Commands (from repo root)

- Build: `mvn -f backend/pom.xml package`
- Run: `mvn -f backend/pom.xml spring-boot:run` (or the jar in `backend/target/`)
- Test: `mvn -f backend/pom.xml test` — the only test is `PizzaCodeApplicationTests.contextLoads`.

Maven 3.9.15 is installed system-wide; there is no `mvnw`/`.mvn` wrapper in this repo.

## Environment gotchas

- `backend/src/main/resources/application.properties` is gitignored — copy `backend/src/main/resources/application.properties.example` and fill in values. Local defaults point to MySQL `localhost:3306/pizzeria` (user `pizza_app`).
- Create the MySQL database before running: Flyway applies `db/migration/V1__crear_tablas.sql` and `V2__usuarios_iniciales.sql` (seeds sample users ADMIN, CAJERO, CLIENTE). JPA runs with `spring.jpa.hibernate.ddl-auto=validate` — schema changes go through new Flyway migrations (V1, V2, ...), not JPA DDL.
- Don't invent migration version numbers; the next one continues the sequence.

## Layout

- `mx.pizzacode.entity`: JPA entities and enums (`Usuario`, `Rol`, `EstadoUsuario`, `EstadoPedido`, `Categoria`, `Producto`, `Pedido`, `PedidoProducto`, `OrigenPedido`, `MetodoPago`).
- `mx.pizzacode.dto`: validation DTOs (Bean Validation, Spanish messages; `UsuarioActualizacionDTO` cross-checks bloqueo+motivo with `@AssertTrue`).
- Empty scaffolding: `frontend/`, `database/`, `docs/`, `bruno/` (`.gitkeep` only).
