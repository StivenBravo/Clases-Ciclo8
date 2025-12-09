# Sección de Reportes - Documentación

## Descripción
La sección de **Reportes** reemplaza completamente la funcionalidad de Tratamientos, proporcionando estadísticas y análisis de:
- **Atenciones/Citas**: Muestra reportes de todas las citas por día, semana o mes
- **Productos**: Muestra reportes de inventario y estado de stock

## Características

### 1. Filtros de Periodo
- **Día**: Muestra datos del día actual
- **Semana**: Muestra datos de la semana actual (Lunes a Domingo)
- **Mes**: Muestra datos del mes actual

### 2. Reporte de Atenciones
**Estadísticas mostradas:**
- Total de Reservas (estado: 'reserva')
- Total de Citadas (estado: 'citada')
- Total de Atendidas (estado: 'atendida')
- Total de Canceladas (estado: 'cancelada')

**Tabla detallada incluye:**
- Fecha y hora de la cita
- Nombre de la mascota
- Nombre del cliente
- Motivo de la consulta
- Doctor asignado
- Estado con badge de color

### 3. Reporte de Productos
**Estadísticas mostradas:**
- Total de productos en el sistema
- Productos con stock bajo (<3 unidades)
- Productos agotados (0 unidades)
- Valor total del inventario (suma de precio × stock)

**Tabla detallada incluye:**
- Nombre del producto
- Categoría
- Stock actual
- Precio unitario
- Valor total (precio × stock)
- Estado (Disponible/Stock Bajo/Agotado)

## Cambios Realizados

### admin.html
- Actualizado sidebar: `tratamientos` → `reportes` con icono `fa-chart-bar`
- Reemplazada sección HTML completa con nueva estructura de reportes
- Agregados botones de filtro (Día/Semana/Mes)
- Agregadas tarjetas de estadísticas (stat-cards) para ambos reportes
- Agregados contenedores para tablas: `tablaCitasReporte` y `tablaProductosReporte`

### js/main.js
**Funciones eliminadas:**
- `loadTratamientos()`
- `mostrarTratamientos()`
- `editarTratamiento()`
- `eliminarTratamiento()`
- `mostrarModalTratamiento()`
- `filtrarMascotasPorCliente()`
- `toggleTipoTratamiento()`
- `guardarTratamiento()`

**Funciones agregadas:**
- `generarReporte(periodo)` - Función principal que calcula fechas y carga ambos reportes
- `cargarReporteCitas(fechaInicio, fechaFin)` - Obtiene y filtra citas por rango de fechas
- `mostrarTablaCitas(citasArray)` - Genera tabla HTML con las citas filtradas
- `cargarReporteProductos(fechaInicio, fechaFin)` - Obtiene datos de productos y calcula estadísticas
- `mostrarTablaProductos(productosArray)` - Genera tabla HTML con productos ordenados por stock

**Variables eliminadas:**
- `let tratamientos = []`

**Títulos actualizados:**
- `'tratamientos': 'Gestión de Tratamientos'` → `'reportes': 'Reportes y Estadísticas'`

## Uso

1. Acceder al panel de administración
2. Hacer clic en "Reportes" en el sidebar
3. Seleccionar periodo: Día, Semana o Mes
4. Los reportes se cargarán automáticamente mostrando:
   - Estadísticas resumidas en tarjetas
   - Tablas detalladas con todos los registros del periodo

## Notas Técnicas

- Los reportes filtran datos del lado del cliente (frontend)
- Las fechas se calculan usando el timezone local del navegador
- El valor de inventario se calcula como: `Σ(precio × stock)` de todos los productos
- Las citas se ordenan por fecha descendente (más recientes primero)
- Los productos se ordenan por stock ascendente (agotados/bajo stock primero)
- No requiere endpoints adicionales en el backend (usa los existentes: `/api/citas` y `/api/productos`)

## Colores de Badges

**Estados de Citas:**
- Reserva: Azul (badge-info)
- Citada: Naranja (badge-warning)
- Atendida: Verde (badge-success)
- Cancelada: Rojo (badge-danger)

**Estados de Productos:**
- Disponible (stock ≥ 3): Verde (badge-success)
- Stock Bajo (0 < stock < 3): Naranja (badge-warning)
- Agotado (stock = 0): Rojo (badge-danger)

## Futuras Mejoras Posibles

1. Agregar gráficos (charts) para visualización
2. Exportar reportes a PDF o Excel
3. Agregar selector de rango de fechas personalizado
4. Incluir reporte de ventas/ingresos
5. Agregar comparación entre periodos
6. Filtros adicionales por doctor, categoría de producto, etc.
