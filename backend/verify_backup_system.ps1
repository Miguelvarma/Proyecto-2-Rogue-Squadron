# ============================================================================
# Script de Verificación: Sistema de Backup Automático de MySQL (Windows)
# ============================================================================
# Valida que el sistema de backup esté correctamente instalado e integrado.
# Uso: .\verify_backup_system.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔍 Verificando Sistema de Backup Automático..." -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Verificar estructura de archivos
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "📁 Verificando estructura de archivos..." -ForegroundColor Cyan

$FilesToCheck = @(
    "src\infrastructure\database\MySQLBackupService.ts",
    "src\infrastructure\http\middlewares\autoBackupMiddleware.ts",
    "src\infrastructure\http\routes\adminChatbot.routes.ts",
    "src\infrastructure\http\controllers\AdminChatbotController.ts"
)

$AllFilesExist = $true

foreach ($file in $FilesToCheck) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file (NO ENCONTRADO)" -ForegroundColor Red
        $AllFilesExist = $false
    }
}

if (-not $AllFilesExist) {
    Write-Host ""
    Write-Host "❌ Algunos archivos no fueron encontrados" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📚 Verificando documentación..." -ForegroundColor Cyan

if (Test-Path "BACKUP_SYSTEM.md") {
    Write-Host "✓ BACKUP_SYSTEM.md" -ForegroundColor Green
} else {
    Write-Host "⚠ BACKUP_SYSTEM.md (Documento de referencia no encontrado)" -ForegroundColor Yellow
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Verificar dependencias de MySQL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "🔧 Verificando dependencias de MySQL..." -ForegroundColor Cyan

try {
    $MysqldumpPath = (Get-Command mysqldump -ErrorAction Stop).Source
    Write-Host "✓ mysqldump encontrado" -ForegroundColor Green
    Write-Host "  Ruta: $MysqldumpPath" -ForegroundColor Gray
    
    $MysqldumpVersion = & mysqldump --version 2>&1
    Write-Host "  Versión: $MysqldumpVersion" -ForegroundColor Gray
} catch {
    Write-Host "✗ mysqldump NO ESTÁ INSTALADO" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Para instalar MySQL Client Tools en Windows:" -ForegroundColor White
    Write-Host "  • Opción 1: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Gray
    Write-Host "  • Opción 2: Instalar MySQL Workbench (incluye mysqldump)" -ForegroundColor Gray
    Write-Host "  • Opción 3: Scoop - scoop install mysql" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Verificar .env
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "📝 Verificando configuración de variables de entorno..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "⚠ Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "  Se usarán valores por defecto de conexión a BD" -ForegroundColor Gray
} else {
    Write-Host "✓ Archivo .env encontrado" -ForegroundColor Green
    
    # Leer .env (simple parsing)
    $EnvContent = Get-Content .env -ErrorAction SilentlyContinue
    
    $HasDbHost = $EnvContent -match "DB_HOST"
    $HasDbUser = $EnvContent -match "DB_USER"
    $HasDbName = $EnvContent -match "DB_NAME"
    
    if ($HasDbHost) { Write-Host "✓ DB_HOST configurado" -ForegroundColor Green }
    if ($HasDbUser) { Write-Host "✓ DB_USER configurado" -ForegroundColor Green }
    if ($HasDbName) { Write-Host "✓ DB_NAME configurado" -ForegroundColor Green }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Directorio de backups
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "📂 Creando directorio de backups (si no existe)..." -ForegroundColor Cyan

if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" -Force | Out-Null
    Write-Host "✓ Directorio 'backups' creado" -ForegroundColor Green
} else {
    Write-Host "✓ Directorio 'backups' ya existe" -ForegroundColor Green
    
    $BackupCount = @(Get-ChildItem backups\*.sql -ErrorAction SilentlyContinue).Count
    Write-Host "  Backups existentes: $BackupCount" -ForegroundColor Gray
    
    if ($BackupCount -gt 0) {
        Write-Host "  Últimos backups:" -ForegroundColor Gray
        Get-ChildItem backups\*.sql -ErrorAction SilentlyContinue | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 3 |
            ForEach-Object { Write-Host "    $($_.Name) ($($_.Length / 1KB)KB)" -ForegroundColor Gray }
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Seguridad
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "🔐 Verificando seguridad..." -ForegroundColor Cyan

if (-not (Test-Path ".gitignore")) {
    Write-Host "⚠ Archivo .gitignore no encontrado" -ForegroundColor Yellow
} else {
    $GitIgnoreContent = Get-Content .gitignore -Raw -ErrorAction SilentlyContinue
    if ($GitIgnoreContent -match "backups/") {
        Write-Host "✓ 'backups/' está en .gitignore" -ForegroundColor Green
    } else {
        Write-Host "⚠ 'backups/' NO está en .gitignore" -ForegroundColor Yellow
        Write-Host "  Recomendación: Agregar 'backups/' a .gitignore" -ForegroundColor Gray
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Integraciones en código
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "🧪 Verificando integraciones en código..." -ForegroundColor Cyan

$RoutesContent = Get-Content "src\infrastructure\http\routes\adminChatbot.routes.ts" -Raw -ErrorAction SilentlyContinue
if ($RoutesContent -match "autoBackupMiddleware") {
    Write-Host "✓ Middleware de backup integrado en rutas admin" -ForegroundColor Green
} else {
    Write-Host "✗ Middleware NO está integrado en rutas" -ForegroundColor Red
    exit 1
}

$ControllerContent = Get-Content "src\infrastructure\http\controllers\AdminChatbotController.ts" -Raw -ErrorAction SilentlyContinue
if ($ControllerContent -match "getBackups") {
    Write-Host "✓ Endpoint GET /admin/backups implementado" -ForegroundColor Green
} else {
    Write-Host "⚠ Endpoint GET /admin/backups NO encontrado" -ForegroundColor Yellow
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Resumen
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "✅ Verificación completada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host ("━" * 80)
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Iniciar servidor: npm run dev" -ForegroundColor White
Write-Host "  2. Probar backup manual:" -ForegroundColor White
Write-Host "     POST /admin/knowledge-base/heroes" -ForegroundColor White
Write-Host "     • Con datos de prueba" -ForegroundColor White
Write-Host "     • Verificar que se crea backup en carpeta 'backups/'" -ForegroundColor White
Write-Host "  3. Ver backups: GET /admin/backups" -ForegroundColor White
Write-Host "  4. Revisar logs en consola para [BACKUP] y [AUTO-BACKUP]" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación completa en: BACKUP_SYSTEM.md" -ForegroundColor White
Write-Host ("━" * 80)
