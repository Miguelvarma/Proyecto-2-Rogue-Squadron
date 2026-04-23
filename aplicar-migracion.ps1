# ============================================================
# aplicar-migracion.ps1
# Aplica la migracion de inventario de Rogue Squadron a Nexus Battles
#
# USO:
#   powershell -ExecutionPolicy Bypass -File .\aplicar-migracion.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function Write-OK   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "  ... $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "  [!] $msg"  -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  [X] $msg"  -ForegroundColor Red }

Write-Host ""
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "  MIGRACION INVENTARIO - NEXUS BATTLES" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host ""

if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Fail "No se encontraron las carpetas backend y frontend."
    Write-Fail "Ejecuta este script desde la RAIZ del proyecto Nexus-Batles-V-main."
    exit 1
}
Write-OK "Proyecto Nexus detectado"

$zipPath = "nexus-migration.zip"
if (-not (Test-Path $zipPath)) {
    Write-Fail "No se encontro nexus-migration.zip en esta carpeta."
    exit 1
}
Write-OK "ZIP de migracion encontrado"

$tempDir = ".\__migration_temp__"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
Write-Info "Extrayendo archivos..."
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
Write-OK "ZIP extraido"

$src = "$tempDir\nexus-migration"

function Copy-Migrated {
    param([string]$RelativeDest)
    $srcFile  = "$src\$RelativeDest"
    $destFile = ".\$RelativeDest"
    $destDir  = Split-Path $destFile -Parent

    if (-not (Test-Path $srcFile)) {
        Write-Warn "Archivo fuente no encontrado, omitiendo: $RelativeDest"
        return
    }

    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    if (Test-Path $destFile) {
        Copy-Item $destFile "$destFile.bak" -Force
    }

    Copy-Item $srcFile $destFile -Force
    Write-OK $RelativeDest
}

Write-Host ""
Write-Host "-- BACKEND -------------------------------------" -ForegroundColor Yellow

Copy-Migrated "backend\src\domain\entities\Item.ts"
Copy-Migrated "backend\src\domain\repositories\IItemRepository.ts"
Copy-Migrated "backend\src\application\usecases\inventory\GetItem.ts"
Copy-Migrated "backend\src\application\usecases\inventory\GetItemById.ts"
Copy-Migrated "backend\src\application\usecases\inventory\GetUserInventory.ts"
Copy-Migrated "backend\src\application\usecases\inventory\SearchItem.ts"
Copy-Migrated "backend\src\infrastructure\http\controllers\InventoryController.ts"
Copy-Migrated "backend\src\infrastructure\http\routes\inventory.routes.ts"
Copy-Migrated "backend\src\infrastructure\repositories\MySQLItemRepository.ts"

Write-Host ""
Write-Host "-- FRONTEND ------------------------------------" -ForegroundColor Yellow

Copy-Migrated "frontend\src\App.tsx"
Copy-Migrated "frontend\src\api\inventory.ts"
Copy-Migrated "frontend\src\pages\InventoryPage.tsx"
Copy-Migrated "frontend\src\pages\InventoryPage.css"
Copy-Migrated "frontend\src\pages\MyInventoryPage.tsx"
Copy-Migrated "frontend\src\pages\ItemDetailPage.tsx"
Copy-Migrated "frontend\src\pages\ItemDetailPage.css"
Copy-Migrated "frontend\src\pages\CreateItemPage.tsx"

Write-Host ""
Write-Info "Limpiando archivos temporales..."
Remove-Item $tempDir -Recurse -Force
Write-OK "Limpieza completa"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "  MIGRACION COMPLETADA" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Archivos originales guardados como .bak" -ForegroundColor Gray
Write-Host ""
Write-Host "  Proximos pasos:" -ForegroundColor White
Write-Host "    cd backend  -> npm run build -> npm run dev" -ForegroundColor Cyan
Write-Host "    cd frontend -> npm run dev" -ForegroundColor Cyan
Write-Host ""
