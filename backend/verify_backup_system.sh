#!/bin/bash
# ============================================================================
# Script de Verificación: Sistema de Backup Automático de MySQL
# ============================================================================
# Valida que el sistema de backup esté correctamente instalado e integrado.
# Uso: bash verify_backup_system.sh

set -e

echo "🔍 Verificando Sistema de Backup Automático..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Estructura del proyecto esperada
echo "📁 Verificando estructura de archivos..."

FILES_TO_CHECK=(
  "src/infrastructure/database/MySQLBackupService.ts"
  "src/infrastructure/http/middlewares/autoBackupMiddleware.ts"
  "src/infrastructure/http/routes/adminChatbot.routes.ts"
  "src/infrastructure/http/controllers/AdminChatbotController.ts"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file (NO ENCONTRADO)"
    exit 1
  fi
done

echo ""
echo "📚 Verificando documentación..."

if [ -f "BACKUP_SYSTEM.md" ]; then
  echo -e "${GREEN}✓${NC} BACKUP_SYSTEM.md"
else
  echo -e "${YELLOW}⚠${NC} BACKUP_SYSTEM.md (Documento de referencia no encontrado)"
fi

echo ""
echo "🔧 Verificando dependencias de MySQL..."

# Validar que mysqldump está instalado
if command -v mysqldump &> /dev/null; then
  MYSQLDUMP_PATH=$(which mysqldump)
  MYSQLDUMP_VERSION=$(mysqldump --version)
  echo -e "${GREEN}✓${NC} mysqldump encontrado"
  echo "  Ruta: $MYSQLDUMP_PATH"
  echo "  Versión: $MYSQLDUMP_VERSION"
else
  echo -e "${RED}✗${NC} mysqldump NO ESTÁ INSTALADO"
  echo ""
  echo "  Para instalar:"
  echo "  • macOS: brew install mysql@8.0"
  echo "  • Linux (Debian/Ubuntu): sudo apt-get install mysql-client"
  echo "  • Windows: https://dev.mysql.com/downloads/mysql/"
  exit 1
fi

echo ""
echo "📝 Verificando configuración de variables de entorno..."

# Validar que .env exista
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠${NC} Archivo .env no encontrado"
  echo "  Se usarán valores por defecto de conexión a BD"
else
  echo -e "${GREEN}✓${NC} Archivo .env encontrado"
  
  # Verificar variables críticas
  source .env || true
  
  if [ -n "$DB_HOST" ]; then
    echo -e "${GREEN}✓${NC} DB_HOST configurado"
  fi
  
  if [ -n "$DB_USER" ]; then
    echo -e "${GREEN}✓${NC} DB_USER configurado"
  fi
  
  if [ -n "$DB_NAME" ]; then
    echo -e "${GREEN}✓${NC} DB_NAME configurado"
  fi
fi

echo ""
echo "📂 Creando directorio de backups (si no existe)..."

if [ ! -d "backups" ]; then
  mkdir -p backups
  chmod 700 backups
  echo -e "${GREEN}✓${NC} Directorio 'backups' creado con permisos 700"
else
  echo -e "${GREEN}✓${NC} Directorio 'backups' ya existe"
  
  # Contar backups existentes
  BACKUP_COUNT=$(ls backups/*.sql 2>/dev/null | wc -l)
  echo "  Backups existentes: $BACKUP_COUNT"
  
  if [ $BACKUP_COUNT -gt 0 ]; then
    echo "  Últimos backups:"
    ls -lht backups/*.sql 2>/dev/null | head -3 | awk '{print "    " $9 " (" $5 ")"}'
  fi
fi

echo ""
echo "🔐 Verificando seguridad..."

# Validar .gitignore
if grep -q "backups/" .gitignore 2>/dev/null; then
  echo -e "${GREEN}✓${NC} 'backups/' está en .gitignore"
else
  echo -e "${YELLOW}⚠${NC} 'backups/' NO está en .gitignore"
  echo "  Recomendación: Agregar 'backups/' a .gitignore"
fi

echo ""
echo "🧪 Verificando integraciones en código..."

# Validar que autoBackupMiddleware se usa en routes
if grep -q "autoBackupMiddleware" "src/infrastructure/http/routes/adminChatbot.routes.ts"; then
  echo -e "${GREEN}✓${NC} Middleware de backup integrado en rutas admin"
else
  echo -e "${RED}✗${NC} Middleware NO está integrado en rutas"
  exit 1
fi

# Validar que getBackups existe en controller
if grep -q "getBackups" "src/infrastructure/http/controllers/AdminChatbotController.ts"; then
  echo -e "${GREEN}✓${NC} Endpoint GET /admin/backups implementado"
else
  echo -e "${YELLOW}⚠${NC} Endpoint GET /admin/backups NO encontrado"
fi

echo ""
echo "✅ Verificación completada exitosamente!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Próximos pasos:"
echo "  1. Iniciar servidor: npm run dev"
echo "  2. Probar backup manual:"
echo "     POST /admin/knowledge-base/heroes"
echo "     • Con datos de prueba"
echo "     • Verificar que se crea backup en carpeta 'backups/'"
echo "  3. Ver backups: GET /admin/backups"
echo "  4. Revisar logs en consola para [BACKUP] y [AUTO-BACKUP]"
echo ""
echo "📖 Documentación completa en: BACKUP_SYSTEM.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
