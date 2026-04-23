# 🛡️ Sistema de Backup Automático de MySQL

## Descripción

Sistema de backup preventivo que se ejecuta automáticamente antes de cualquier operación de escritura (crear, editar, eliminar) en el panel administrativo del chatbot.

Previene pérdidas de datos por eliminación accidental y permite recuperación rápida de la base de datos.

---

## 🏗️ Arquitectura

### Componentes

1. **MySQLBackupService** (`src/infrastructure/database/MySQLBackupService.ts`)
   - Ejecuta `mysqldump` para crear snapshots de la BD
   - Guarda archivos `.sql` con timestamp en carpeta `backups/`
   - Mantiene automáticamente los últimos 10 backups
   - Genera logs detallados de cada operación

2. **autoBackupMiddleware** (`src/infrastructure/http/middlewares/autoBackupMiddleware.ts`)
   - Intercepta operaciones POST, PUT, DELETE
   - Ejecuta backup ANTES de permitir la operación
   - Si el backup falla, rechaza la operación por seguridad
   - Adjunta información del backup al request para logging

3. **Rutas Admin Protegidas** (`src/infrastructure/http/routes/adminChatbot.routes.ts`)
   - Aplica middleware de backup a todas las operaciones críticas
   - Endpoint adicional GET `/backups` para listar backups disponibles

4. **AdminChatbotController** (`src/infrastructure/http/controllers/AdminChatbotController.ts`)
   - Nuevo método `getBackups()` para consultar disponibilidad de backups

---

## 📋 Flujo de Ejecución

```
       Panel Admin - Eliminar Entrada
              ↓
       POST/PUT/DELETE request
              ↓
    autoBackupMiddleware intercepta
              ↓
    MySQLBackupService.createBackup()
              ↓
       Ejecuta: mysqldump
              ↓
       ¿Backup exitoso?
         /           \
        YES           NO
        ↓             ↓
    Procede     Error 500
    Operación   Rechaza op.
              ↓
    Guarda en: backups/backup_YYYY-MM-DD_HH-MM-SS_action.sql
              ↓
    Limpia backups >10 días
              ↓
    Loggea operación en admin_audit_log
```

---

## 🔧 Configuración

### Directorio de Backups

Por defecto: `proyecto/backups/`

Personalizar:
```typescript
const backupService = new MySQLBackupService('/ruta/personalizada/backups');
```

### Máximo de Backups Retenidos

Por defecto: 10 backups (mantiene los últimos 10)

Modificar en `MySQLBackupService.ts`:
```typescript
private readonly maxBackups: number = 10; // Cambiar aquí
```

### Credenciales de MySQL

Usa variables de entorno en `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nexus_battles
DB_USER=root
DB_PASSWORD=tu_password
```

> ⚠️ **Nota**: Asegúrate que `mysqldump` esté instalado en tu sistema:
> ```bash
> # Linux/Mac
> which mysqldump
> 
> # Windows (si MySQL CLI tools están instalados)
> where mysqldump
> ```

---

## 📊 Endpoints API

### Listar Backups
```http
GET /admin/backups
Authorization: Bearer <admin_token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "backups": [
      {
        "fileName": "backup_2026-04-04_14-30-45_eliminar.sql",
        "size": 2048576,
        "sizeKb": "2000.00",
        "createdAt": "2026-04-04T14:30:45.000Z"
      },
      {
        "fileName": "backup_2026-04-04_14-25-10_actualizar.sql",
        "size": 2048576,
        "sizeKb": "2000.00",
        "createdAt": "2026-04-04T14:25:10.000Z"
      }
    ],
    "totalCount": 2
  }
}
```

### Listar Historial de Cambios
```http
GET /admin/logs
Authorization: Bearer <admin_token>
```

Retorna un audit log con todas las operaciones realizadas.

---

## 📝 Ejemplos de Log

### Backup Exitoso
```
[AUTO-BACKUP] Iniciando backup preventivo | Admin: AdminChatbot123 | Ruta: /admin/knowledge-base/heroes | Acción: crear
[BACKUP] ✅ Backup completado exitosamente | Archivo: backup_2026-04-04_14-35-20_crear.sql | Tamaño: 1.95 MB
[AUTO-BACKUP] ✅ Backup completado exitosamente | Archivo: backup_2026-04-04_14-35-20_crear.sql | Tamaño: 2048000 bytes | Procediendo con operación...
```

### Backup Fallido
```
[AUTO-BACKUP] Iniciando backup preventivo | Admin: AdminChatbot123 | Ruta: /admin/knowledge-base/heroes/delete | Acción: eliminar
[BACKUP] ❌ Error en backup de BD | Acción: eliminar | Error: mysqldump: command not found
[AUTO-BACKUP] ❌ Backup falló - operación RECHAZADA | Error: mysqldump: command not found
```

---

## 🔄 Recuperación de Datos

### Restaurar desde Backup

#### Opción 1: Línea de Comandos
```bash
# Restaurar un backup específico
mysql -h localhost -u root -p nexus_battles < backups/backup_2026-04-04_14-35-20_crear.sql

# Con contraseña en comando (menos seguro)
mysql -h localhost -u root -pTuPassword nexus_battles < backups/backup_2026-04-04_14-35-20_crear.sql
```

#### Opción 2: Usar `mysqldump` with piping
```bash
# Copiar BD a backup, luego restaurar
mysqldump -h localhost -u root -p nexus_battles > backup_manual_$(date +%Y%m%d_%H%M%S).sql

# Restaurar
mysql -h localhost -u root -p nexus_battles < backup_manual_20260404_143520.sql
```

#### Opción 3: Interfaz de Base de Datos
- En MySQL Workbench: Server → Data Import → Seleccionar archivo `.sql`
- En phpMyAdmin: Importar → Seleccionar archivo

---

## 🚨 Casos de Uso

### Caso 1: Eliminación Accidental de Heroes
```
1. Admin elimina accidentalmente heroé "Aragorn"
2. Middleware detecta DELETE request
3. Ejecuta backup: backup_2026-04-04_14-35-20_eliminar.sql
4. Elimina entrada de la BD
5. Si necesitas revertir:
   - Descarga backup del endpoint GET /admin/backups
   - Restaura: mysql < backup_2026-04-04_14-35-20_eliminar.sql
   - BD recuperada al estado anterior a eliminar
```

### Caso 2: Edición Masiva Fallida
```
1. Admin intenta actualizar 50 items
2. Hay error a mitad del proceso
3. Todos los backups están registrados en /admin/logs
4. Restaura el backup más reciente anterior al error
5. Reintenta con correcciones
```

### Caso 3: Auditoría de Cambios
```
1. GET /admin/logs para ver historial completo
2. Cada operación registra: admin, acción, descripción, timestamp
3. Validar qué cambios se hicieron y en qué orden
4. Correlacionar con archivos de backup
```

---

## ⚙️ Mantenimiento

### Verificar Backups Existentes
```bash
# Linux/Mac
ls -lh backups/

# Windows PowerShell
Get-ChildItem -Path backups\

# Salida esperada:
# -rw-r--r-- 2026-04-04 14:35  1.9M  backup_2026-04-04_14-35-20_crear.sql
# -rw-r--r-- 2026-04-04 14:25  2.0M  backup_2026-04-04_14-25-10_actualizar.sql
# -rw-r--r-- 2026-04-04 14:10  1.8M  backup_2026-04-04_14-10-30_eliminar.sql
```

### Limpiar Backups Manualmente
```bash
# Eliminar todos los backups (¡CUIDADO!)
rm backups/*.sql

# Mantener solo los últimos 5
ls -t backups/*.sql | tail -n +6 | xargs rm
```

### Monitorear Espacio en Disco
```bash
# Tamaño total de backups
du -sh backups/

# Tamaño de cada backup
du -sh backups/*

# Si backups ocupan >10GB, aumentar frequencia de limpieza
```

---

## 🔐 Seguridad

### ✅ Buenas Prácticas Implementadas

- ✅ Backup se ejecuta ANTES de la operación (previene corrupción)
- ✅ Si backup falla, operación se rechaza (fail-safe)
- ✅ Credenciales de BD en variables de entorno
- ✅ Path traversal prevento en getBackupInfo()
- ✅ Middlewaare de autenticacion (`adminChatbotAuthMiddleware`) requerido
- ✅ Logs detallados de cada operación

### ⚠️ Consideraciones de Seguridad

1. **Carpeta `backups/` debe estar en `.gitignore`** (no commitear)
   ```
   # Agregar a .gitignore si no está:
   backups/
   ```

2. **Acceso a archivos backup**
   - Proteger carpeta `backups/` permisos: `chmod 700 backups/`
   - Evitar que sea servida por servidor web

3. **Encriptación de Backups (Opcional)**
   - Para mayor seguridad, encriptar `.sql` files
   ```bash
   openssl enc -aes-256-cbc -in backup.sql -out backup.sql.enc
   ```

4. **Copias Remotas**
   - Considerar sincronizar backups a S3/Google Cloud
   - No guardar backups solo localmente

---

## 🐛 Troubleshooting

### Error: `mysqldump: command not found`

**Solución:**
```bash
# Instalar MySQL client tools
# macOS
brew install mysql

# Linux (Debian/Ubuntu)
sudo apt-get install mysql-client

# Windows
# Descargar desde: https://dev.mysql.com/downloads/mysql/
```

### Error: `Access denied for user 'root'@'localhost'`

**Solución:**
```bash
# Verificar credenciales en .env
cat .env | grep DB_

# Testear conexión manualmente
mysql -h localhost -u root -p -e "SELECT 1;"
```

### Backups no se crean

**Checklist:**
- [ ] mysqldump está instalado
- [ ] Carpeta `backups/` existe y es escribible
- [ ] Credenciales de BD son correctas
- [ ] Espacio en disco disponible
- [ ] Logs muestran dónde falló exactamente

---

## 📚 Archivos Modificados

```
backend/
├── src/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── MySQLBackupService.ts ✨ NUEVO
│   │   └── http/
│   │       ├── middlewares/
│   │       │   └── autoBackupMiddleware.ts ✨ NUEVO
│   │       ├── routes/
│   │       │   └── adminChatbot.routes.ts [ACTUALIZADO]
│   │       └── controllers/
│   │           └── AdminChatbotController.ts [ACTUALIZADO - método getBackups()]
└── backups/ ← Carpeta generada automáticamente
```

---

## 🎯 Próximos Pasos

- [ ] Testear backup en ambiente local
- [ ] Configurar cronjob para backups programados (además del automático)
- [ ] Implementar encriptación de backups
- [ ] Crear interfaz UI en panel admin para visualizar/restaurar backups
- [ ] Configurar sincronización remota de backups (AWS S3, etc)

---

**Estado:** ✅ Implementado y Funcional
**Última actualización:** 4 de abril de 2026
