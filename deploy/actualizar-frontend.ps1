# Actualiza el frontend en el VPS: genera el build de React, lo sube y lo publica en /var/www/pizzacode.
# Uso, desde la raíz del proyecto:
#   .\deploy\actualizar-frontend.ps1
#   .\deploy\actualizar-frontend.ps1 -Llave "$HOME\.ssh\pizzacode_vps"   (si usas una llave específica)
param(
    [string]$Servidor = "deploy@179.236.236.29",
    [string]$Llave = ""
)

$ErrorActionPreference = "Stop"
$opcionesSsh = @()
if ($Llave) { $opcionesSsh = @("-i", $Llave) }

# 1) Generar el build
Write-Host "1/3 Generando el build de React..." -ForegroundColor Cyan
Push-Location frontend
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Falló el build del frontend" }
} finally {
    Pop-Location
}

# 2) Subir a /tmp del VPS (se borra antes para que no quede una carpeta dentro de otra)
Write-Host "2/3 Subiendo el build al VPS..." -ForegroundColor Cyan
ssh @opcionesSsh $Servidor "rm -rf /tmp/pizzacode-dist"
scp @opcionesSsh -r frontend\dist "${Servidor}:/tmp/pizzacode-dist"
if ($LASTEXITCODE -ne 0) { throw "Falló la subida al VPS" }

# 3) Reemplazar el sitio y dar permisos de lectura a Nginx (al subir desde Windows pueden quedar en 700)
Write-Host "3/3 Publicando en /var/www/pizzacode..." -ForegroundColor Cyan
$comandos = @(
    "sudo rm -rf /var/www/pizzacode/*",
    "sudo cp -r /tmp/pizzacode-dist/. /var/www/pizzacode/",
    "sudo chmod -R a+rX /var/www/pizzacode",
    "rm -rf /tmp/pizzacode-dist"
) -join " && "
ssh -t @opcionesSsh $Servidor $comandos
if ($LASTEXITCODE -ne 0) { throw "Falló la publicación" }

Write-Host "Listo. Abre https://pizzacode.tech y recarga con Ctrl+F5." -ForegroundColor Green