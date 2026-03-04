# Inventario: Edición y Eliminación de Cartas

## Descripción
Se agregó al módulo de Inventario la funcionalidad para **editar** y **eliminar** cartas desde la vista detallada , con control de permisos para que únicamente un usuario con rol **ADMIN** pueda ejecutar estas acciones.

## Funcionalidades incluidas
- Edición de carta (campos básicos como nombre y cantidad).
- Eliminación de carta con confirmación.
- Restricción por permisos (solo ADMIN puede editar/eliminar).
- Actualización visual del inventario luego de editar/eliminar.

## Archivos relacionados
- Archivo principal del módulo: `nexus-battles-v-inventory.html`
- Implementación de la funcionalidad: `nexus-battles-v-edit-delete.html`

## Nota de integración
La implementación está lista para incorporarse directamente en el archivo principal del inventario manteniendo el mismo estilo visual y estructura del módulo.
