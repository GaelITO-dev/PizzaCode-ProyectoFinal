# Actualiza el backend en el VPS: compila el JAR, lo sube, guarda el anterior y reinicia el servicio.
# Uso, desde la raíz del proyecto:
#   .\deploy\actualizar-backend.ps1
#   .\deploy\actualizar-backend.ps1 -Llave "$HOME\.ssh\pizzacode_vps"   (si usas una llave específica)
param(
    [string]$Servidor = "deploy@179.236.236.29",
    [string]$Llave = ""
)

$ErrorActionPreference = "Stop"
$opcionesSsh = @()
if ($Llave) { $opcionesSsh = @("-i", $Llave) }

# 1) Compilar
Write-Host "1/4 Generando el JAR..." -ForegroundColor Cyan
Push-Location backend
try {
    .\mvnw clean package -DskipTests
    if ($LASTEXITCODE -ne 0) { throw "Falló la compilación del backend" }
} finally {
    Pop-Location
}
$jar = Get-ChildItem backend\target\pizza-code-*.jar | Select-Object -First 1

# 2) Subir a /tmp del VPS
Write-Host "2/4 Subiendo $($jar.Name) al VPS..." -ForegroundColor Cyan
scp @opcionesSsh $jar.FullName "${Servidor}:/tmp/pizza-code.jar"
if ($LASTEXITCODE -ne 0) { throw "Falló la subida al VPS" }

# 3) Respaldar el JAR actual, ponerlo en su lugar y reiniciar
#    (-t abre una terminal para que sudo pueda pedir la contraseña)
Write-Host "3/4 Reemplazando el JAR y reiniciando el servicio..." -ForegroundColor Cyan
$comandos = @(
    "sudo cp /opt/pizzacode/pizza-code.jar /opt/pizzacode/pizza-code.jar.anterior",
    "sudo install -o pizzacode -g pizzacode -m 644 /tmp/pizza-code.jar /opt/pizzacode/pizza-code.jar",
    "rm /tmp/pizza-code.jar",
    "sudo systemctl restart pizzacode"
) -join " && "
ssh -t @opcionesSsh $Servidor $comandos
if ($LASTEXITCODE -ne 0) { throw "Falló el reemplazo o el reinicio" }

# 4) Comprobar que arrancó
Write-Host "4/4 Esperando a que arranque (30 s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30
$codigo = ssh @opcionesSsh $Servidor "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8090/api/productos"
if ($codigo -eq "200") {
    Write-Host "Listo: el backend responde (HTTP 200)." -ForegroundColor Green
} else {
    Write-Host "El backend no respondió bien (HTTP $codigo). Revisa el log:" -ForegroundColor Red
    Write-Host "  ssh -t $Servidor `"sudo journalctl -u pizzacode -n 50 --no-pager`""
}