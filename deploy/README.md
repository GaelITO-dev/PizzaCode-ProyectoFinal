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

## HTTPS con Certbot (#38)

El sitio usa un certificado gratuito de Let's Encrypt para `pizzacode.tech` y `www.pizzacode.tech`.

Instalación (una sola vez, en el VPS):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pizzacode.tech -d www.pizzacode.tech
```

Requisitos:
- El dominio (y `www`) deben apuntar a la IP del VPS.
- Puertos 80 y 443 abiertos en **ufw** y en el **firewall del panel de Hostinger** (son independientes).
- En `server_name` deben estar los dos nombres; si falta uno, Certbot duplica el bloque `server`.

Después de Certbot, la configuración quedó en `deploy/nginx/pizzacode.conf`:
- Un bloque en el **443** (HTTPS) que sirve el frontend y manda `/api/` al backend.
- Un bloque en el **80** que redirige todo a HTTPS (301).

Renovación: es automática con `certbot.timer` (revisa dos veces al día y renueva cuando faltan menos de 30 días). Para probarla:

```bash
sudo certbot renew --dry-run
systemctl list-timers | grep certbot
```

## Correo saliente con Postfix (#45)

Postfix envía los correos de la app (recuperación de contraseña, tickets). Está en modo **solo envío**: escucha únicamente en `127.0.0.1:25`, así que solo el backend del mismo VPS puede usarlo y no se abre ningún puerto en el firewall.

Instalación (en el VPS):

```bash
sudo apt install -y postfix mailutils   # tipo: "Internet Site", nombre: pizzacode.tech
sudo postconf -e "myhostname = pizzacode.tech"
sudo postconf -e "mydomain = pizzacode.tech"
sudo postconf -e 'myorigin = $mydomain'
sudo postconf -e "inet_interfaces = loopback-only"
sudo postconf -e "inet_protocols = ipv4"
sudo postconf -e 'mydestination = $myhostname, localhost'
sudo postconf -e "smtp_tls_security_level = may"
echo "no-responder: /dev/null" | sudo tee -a /etc/aliases
sudo newaliases
sudo systemctl restart postfix
```

| Ajuste | Por qué |
|---|---|
| `inet_interfaces = loopback-only` | Nadie desde internet puede usarlo para mandar spam |
| `inet_protocols = ipv4` | El DNS inverso (PTR) solo está configurado para la IPv4 |
| `no-responder: /dev/null` | Los avisos de rebote al remitente se descartan en vez de acumularse en la cola |

Requisitos: puerto 25 de salida abierto (Hostinger no lo bloquea) y DNS inverso de la IP = `pizzacode.tech`.

Comprobar:

```bash
sudo ss -tlnp | grep ':25 '        # debe ser solo 127.0.0.1:25
mailq                               # cola vacía
sudo tail -n 20 /var/log/mail.log   # resultado de cada envío
```

Sin SPF/DKIM, Gmail rechaza los correos con `550 5.7.26` (se resuelve en #46).

## SPF, DKIM y DMARC (#46)

Sin estos registros Gmail rechaza los correos con `550 5.7.26`.

### DKIM en el VPS (OpenDKIM)

```bash
sudo apt install -y opendkim opendkim-tools
sudo mkdir -p /etc/opendkim/keys/pizzacode.tech
sudo opendkim-genkey -b 2048 -d pizzacode.tech -D /etc/opendkim/keys/pizzacode.tech -s mail -v
sudo chown -R opendkim:opendkim /etc/opendkim
sudo chmod 600 /etc/opendkim/keys/pizzacode.tech/mail.private
```

Al final de `/etc/opendkim.conf` (y comentar cualquier otra línea `Socket`):

```ini
Domain                  pizzacode.tech
Selector                mail
KeyFile                 /etc/opendkim/keys/pizzacode.tech/mail.private
Canonicalization        relaxed/simple
Mode                    s
OversignHeaders         From
Socket                  inet:8891@localhost
```

Conectar Postfix:

```bash
sudo postconf -e "milter_default_action = accept"
sudo postconf -e "milter_protocol = 6"
sudo postconf -e "smtpd_milters = inet:localhost:8891"
sudo postconf -e "non_smtpd_milters = inet:localhost:8891"
sudo systemctl restart opendkim postfix
```

`mail.private` es la llave privada: **nunca** sale del VPS ni se sube al repo.

### Registros DNS (hPanel de Hostinger, tipo TXT)

| Nombre | Valor |
|---|---|
| `@` | `v=spf1 ip4:179.236.236.29 ~all` |
| `mail._domainkey` | contenido de `mail.txt` unido en una línea (`v=DKIM1; h=sha256; k=rsa; p=...`) |
| `_dmarc` | `v=DMARC1; p=none` |

Solo puede haber **un** registro SPF por dominio.

### Comprobar

```bash
dig TXT mail._domainkey.pizzacode.tech +short
sudo opendkim-testkey -d pizzacode.tech -s mail -vvv    # "key OK"
echo "Prueba" | mail -s "Prueba" -a "From: Pizza Code <no-responder@pizzacode.tech>" tu@gmail.com
sudo tail -n 10 /var/log/mail.log   # "DKIM-Signature field added" y "status=sent (250 ...)"
```

En Gmail, "Mostrar original" debe indicar SPF, DKIM y DMARC en PASS.

## Correo desde el backend (#47)

`CorreoService` envía los correos (prueba, recuperación de contraseña) con `JavaMailSender` al Postfix local.

Propiedades en `/opt/pizzacode/application.properties` (el archivo de configuración del servidor, fuera del JAR):

```properties
spring.mail.host=localhost
spring.mail.port=25
app.url-frontend=https://pizzacode.tech
```

Opcionales (tienen default): `app.correo.remitente` (`no-responder@pizzacode.tech`) y `app.correo.nombre` (`Pizza Code`).

Después: `sudo systemctl restart pizzacode`.

- Sin `spring.mail.host` (por ejemplo en desarrollo) la app arranca igual y los correos solo se escriben en el log.
- Si un correo falla, la operación que lo pidió no falla: queda un `ERROR` en el log (`journalctl -u pizzacode`).
- Prueba: `POST /api/correo/prueba?para=<correo>` con un token de ADMIN.