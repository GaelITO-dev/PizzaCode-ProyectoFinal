# Despliegue de Pizza Code en el VPS

Servidor: Ubuntu 26.04 · Java 21 · MySQL 8.4 · usuario de administración `deploy` (con sudo).

| Pieza | Dónde | Detalle |
|---|---|---|
| Backend (#36) | `/opt/pizzacode/pizza-code.jar` | Servicio `pizzacode` de systemd en `127.0.0.1:8090` |
| Configuración | `/opt/pizzacode/application.properties` | Solo en el VPS (permisos 600). Plantilla: `application.properties.produccion.example` |
| Base de datos | MySQL, base `pizzeria` | Usuario propio con permisos solo sobre esa base. Las tablas las crea Flyway |
| Frontend (#37) | `/var/www/pizzacode` | Build de React servido por Nginx; `/api/` se reenvía al 8090 |

## Backend con systemd (#36)

### 1. Base de datos y usuario
```sql
CREATE DATABASE pizzeria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pizzacode_app'@'localhost' IDENTIFIED BY '<contraseña>';
GRANT ALL PRIVILEGES ON pizzeria.* TO 'pizzacode_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Usuario del servicio y carpeta
```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin pizzacode
sudo mkdir -p /opt/pizzacode
```

### 3. JAR y configuración
```powershell
# En la compu, desde backend/
.\mvnw clean package -DskipTests
scp target\pizza-code-0.0.1-SNAPSHOT.jar deploy@<IP>:/tmp/pizza-code.jar
```
```bash
# En el VPS
sudo mv /tmp/pizza-code.jar /opt/pizzacode/pizza-code.jar
sudo nano /opt/pizzacode/application.properties   # basado en application.properties.produccion.example
sudo chown -R pizzacode:pizzacode /opt/pizzacode
sudo chmod 600 /opt/pizzacode/application.properties
```

### 4. Servicio
```bash
sudo cp pizzacode.service /etc/systemd/system/pizzacode.service   # archivo de deploy/systemd/
sudo systemctl daemon-reload
sudo systemctl enable --now pizzacode
```

### 5. Comprobar
```bash
systemctl status pizzacode
sudo journalctl -u pizzacode -f
curl http://127.0.0.1:8090/api/productos
```

## Actualizar el backend
Desde la raíz del proyecto, en la compu:
```powershell
.\deploy\actualizar-backend.ps1
```
Compila, sube el JAR, guarda el anterior como `pizza-code.jar.anterior` y reinicia el servicio.

Para regresar a la versión anterior:
```bash
sudo cp /opt/pizzacode/pizza-code.jar.anterior /opt/pizzacode/pizza-code.jar
sudo systemctl restart pizzacode
```

## Comandos útiles
| Qué | Comando |
|---|---|
| Estado | `systemctl status pizzacode` |
| Log en vivo | `sudo journalctl -u pizzacode -f` |
| Reiniciar | `sudo systemctl restart pizzacode` |
| Detener | `sudo systemctl stop pizzacode` |
| Editar configuración | `sudo nano /opt/pizzacode/application.properties` y luego reiniciar |



## Frontend con Nginx (#37)

Nginx sirve el build de React desde `/var/www/pizzacode` y reenvía `/api/` al backend en `127.0.0.1:8090`
(proxy inverso: el front y la API salen del mismo sitio, sin CORS, y el 8090 no se abre en el firewall).

### 1. Subir el build
```powershell
# En la compu, desde frontend/
npm run build
scp -r dist deploy@<IP>:/tmp/pizzacode-dist
```
```bash
# En el VPS
sudo mkdir -p /var/www/pizzacode
sudo cp -r /tmp/pizzacode-dist/. /var/www/pizzacode/
sudo chmod -R a+rX /var/www/pizzacode   # al subir desde Windows las carpetas pueden quedar en 700
rm -rf /tmp/pizzacode-dist
```

### 2. Configurar el sitio
```bash
sudo cp pizzacode.conf /etc/nginx/sites-available/pizzacode   # archivo de deploy/nginx/
sudo ln -s /etc/nginx/sites-available/pizzacode /etc/nginx/sites-enabled/pizzacode
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Comprobar
- `http://<IP>` muestra el login de Pizza Code.
- Al recargar una ruta interna (por ejemplo `/cliente/carrito`) no da 404, gracias a `try_files`.
- `curl http://127.0.0.1/api/productos` desde el VPS regresa JSON.

## Actualizar el frontend
Desde la raíz del proyecto, en la compu:
```powershell
.\deploy\actualizar-frontend.ps1
```