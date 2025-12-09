// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Estado de la aplicación
let currentSection = 'dashboard';
let clientes = [];
let mascotas = [];
let citas = [];
let productos = [];
let trabajadores = [];
let veterinarios = [];
let currentUser = null;

// Verificar sesión al cargar
window.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
});

function verificarSesion() {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');

    if (!userData) {
        window.location.href = '/login';
        return;
    }

    try {
        currentUser = JSON.parse(userData);

        // Verificar que el usuario sea admin
        if (currentUser.rol !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder al panel.');
            window.location.href = '/';
            return;
        }

        document.getElementById('userName').textContent = currentUser.nombre_completo;
    } catch (error) {
        window.location.href = '/login';
    }
} function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboard();
    setupFilters();
});

// Navegación
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Actualizar estado activo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Cambiar sección
            const section = item.getAttribute('data-section');
            showSection(section);
        });
    });

    // Menu toggle para móvil
    const btnMenu = document.getElementById('btnMenu');
    const sidebar = document.querySelector('.sidebar');

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
        currentSection = sectionName;

        // Actualizar título
        const titles = {
            'dashboard': 'Dashboard',
            'clientes': 'Gestión de Clientes',
            'mascotas': 'Gestión de Mascotas',
            'citas': 'Gestión de Citas',
            'productos': 'Gestión de Productos',
            'trabajadores': 'Gestión de Trabajadores',
            'reportes': 'Reportes y Estadísticas'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName];

        // Cargar datos de la sección
        loadSectionData(sectionName);
    }
}

async function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'clientes':
            loadClientes();
            break;
        case 'mascotas':
            loadMascotas();
            break;
        case 'citas':
            loadCitas();
            initAdminCalendar(); // Inicializar calendario admin
            break;
        case 'productos':
            loadProductos();
            break;
        case 'trabajadores':
            loadTrabajadores();
            break;
        case 'reportes':
            // Se carga al hacer clic en botones de periodo
            document.getElementById('tablaCitasReporte').innerHTML = '<p class="loading">Seleccione un periodo para ver el reporte</p>';
            document.getElementById('tablaProductosReporte').innerHTML = '<p class="loading">Seleccione un periodo para ver el reporte</p>';
            break;
    }
}

// DASHBOARD
async function loadDashboard() {
    try {
        // Cargar estadísticas
        const [clientesRes, mascotasRes, citasHoyRes, productosRes] = await Promise.all([
            fetch(`${API_URL}/clientes`),
            fetch(`${API_URL}/mascotas`),
            fetch(`${API_URL}/citas/fecha/hoy`),
            fetch(`${API_URL}/productos`)
        ]);

        const clientesData = await clientesRes.json();
        const mascotasData = await mascotasRes.json();
        const citasHoyData = await citasHoyRes.json();
        const productosData = await productosRes.json();

        document.getElementById('totalClientes').textContent = clientesData.count || 0;
        document.getElementById('totalMascotas').textContent = mascotasData.count || 0;
        document.getElementById('citasHoy').textContent = citasHoyData.count || 0;
        document.getElementById('totalProductos').textContent = productosData.count || 0;

        // Mostrar citas del día
        mostrarCitasDelDia(citasHoyData.data || []);
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

function mostrarCitasDelDia(citas) {
    const container = document.getElementById('citasDelDia');

    if (citas.length === 0) {
        container.innerHTML = '<p class="loading">No hay citas programadas para hoy</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Mascota</th>
                    <th>Cliente</th>
                    <th>Veterinario</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${citas.map(cita => `
                    <tr>
                        <td>${formatTime(cita.fecha_cita)}</td>
                        <td>${cita.mascota_nombre}</td>
                        <td>${cita.nombres} ${cita.apellido_paterno}</td>
                        <td>Dr. ${cita.vet_nombres} ${cita.vet_apellidos}</td>
                        <td><span class="badge badge-${getBadgeClass(cita.estado)}">${formatEstado(cita.estado)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// CLIENTES
async function loadClientes() {
    try {
        const response = await fetch(`${API_URL}/clientes`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
            console.error('Error en respuesta:', data.message);
            document.getElementById('tablaClientes').innerHTML =
                `<p class="error">Error: ${data.message || 'No se pudieron cargar los clientes'}</p>`;
            return;
        }

        clientes = data.data || [];
        mostrarClientes(clientes);
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        document.getElementById('tablaClientes').innerHTML =
            `<p class="error">Error al cargar: ${error.message}</p>`;
    }
}

function mostrarClientes(clientesArray) {
    const container = document.getElementById('tablaClientes');

    if (clientesArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay clientes registrados</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>DNI</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${clientesArray.map(cliente => `
                    <tr>
                        <td>${cliente.dni}</td>
                        <td>${cliente.nombres}</td>
                        <td>${cliente.apellido_paterno} ${cliente.apellido_materno}</td>
                        <td>${cliente.telefono || '-'}</td>
                        <td>${cliente.email || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="verCliente(${cliente.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editarCliente(${cliente.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${cliente.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// MASCOTAS
async function loadMascotas() {
    try {
        const response = await fetch(`${API_URL}/mascotas`);
        const data = await response.json();
        mascotas = data.data || [];
        mostrarMascotas(mascotas);
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
    }
}

function mostrarMascotas(mascotasArray) {
    const container = document.getElementById('tablaMascotas');

    if (mascotasArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay mascotas registradas</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Especie</th>
                    <th>Raza</th>
                    <th>Propietario</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${mascotasArray.map(mascota => `
                    <tr>
                        <td><strong>${mascota.nombre}</strong></td>
                        <td>${formatEspecie(mascota.especie)}</td>
                        <td>${mascota.raza || '-'}</td>
                        <td>${mascota.nombres} ${mascota.apellido_paterno}</td>
                        <td>${mascota.telefono}</td>
                        <td><span class="badge badge-${mascota.estado === 'activo' ? 'success' : 'secondary'}">${mascota.estado}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="verMascota(${mascota.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editarMascota(${mascota.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarMascota(${mascota.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// CITAS
async function loadCitas() {
    try {
        const response = await fetch(`${API_URL}/citas`);
        const data = await response.json();
        console.log('Citas cargadas:', data);
        citas = data.data || [];
        console.log('Array de citas:', citas);
        mostrarCitas(citas);
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

function mostrarCitas(citasArray) {
    const container = document.getElementById('tablaCitas');

    if (citasArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay citas registradas</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Fecha/Hora</th>
                    <th>Mascota</th>
                    <th>Cliente</th>
                    <th>Veterinario</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${citasArray.map(cita => `
                    <tr>
                        <td>${formatDateTime(cita.fecha_cita)}</td>
                        <td>${cita.mascota_nombre}</td>
                        <td>${cita.nombres} ${cita.apellido_paterno}</td>
                        <td>Dr. ${cita.vet_nombres} ${cita.vet_apellidos}</td>
                        <td>${formatTipoCita(cita.tipo)}</td>
                        <td><span class="badge badge-${cita.estado}">${formatEstado(cita.estado)}</span></td>
                        <td>
                            <div class="cita-actions">
                                ${cita.estado === 'reserva' ? `
                                    <button class="btn-aprobar" onclick="aprobarCita(${cita.id})" title="Aprobar">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn-cancelar-cita" onclick="cancelarCitaAdmin(${cita.id})" title="Cancelar">
                                        <i class="fas fa-times"></i>
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-primary" onclick="verCita(${cita.id})" title="Ver">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="editarCita(${cita.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="eliminarCita(${cita.id})" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// Calendario Admin - Variables
let adminWeekStart = new Date();
let adminDisponibilidad = { citas: [], veterinarios: [] };

// Inicializar calendario admin
async function initAdminCalendar() {
    setAdminCurrentWeek();
    await loadAdminDisponibilidad();
}

// Establecer semana actual
function setAdminCurrentWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    adminWeekStart = new Date(today);
    adminWeekStart.setDate(today.getDate() - today.getDay());
}

// Cargar disponibilidad para admin
async function loadAdminDisponibilidad() {
    try {
        const response = await fetch(`${API_URL}/citas/disponibilidad`);
        const result = await response.json();

        if (result.success) {
            adminDisponibilidad = result.data;
            renderAdminCalendar();
        }
    } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
    }
}

// Renderizar calendario admin
function renderAdminCalendar() {
    updateAdminWeekRange();
    const calendar = document.getElementById('adminCalendar');
    if (!calendar) return;

    calendar.innerHTML = '';

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const date = new Date(adminWeekStart);
        date.setDate(adminWeekStart.getDate() + i);

        const dayColumn = document.createElement('div');
        dayColumn.className = 'admin-day-column';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'admin-day-header';
        dayHeader.innerHTML = `
            ${days[date.getDay()]}
            <span class="date">${date.getDate()}/${date.getMonth() + 1}</span>
        `;

        const timeSlots = document.createElement('div');
        timeSlots.className = 'admin-time-slots';

        // Generar horarios de 8am a 8pm
        for (let hour = 8; hour < 20; hour++) {
            const slotTime = new Date(date);
            slotTime.setHours(hour, 0, 0, 0);

            const timeSlot = document.createElement('div');
            timeSlot.className = 'admin-time-slot';

            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const isPast = slotTime < today;

            // Verificar si hay citas en este horario
            const citasEnHorario = adminDisponibilidad.citas.filter(cita => {
                const citaDate = new Date(cita.fecha_cita);
                return citaDate.getTime() === slotTime.getTime() &&
                    ['reserva', 'citada', 'atendida'].includes(cita.estado);
            });

            if (isPast) {
                timeSlot.classList.add('past');
                timeSlot.innerHTML = `<div>${timeStr}</div>`;
            } else if (citasEnHorario.length > 0) {
                timeSlot.classList.add('occupied');
                timeSlot.innerHTML = `
                    <div>${timeStr}</div>
                    <span class="slot-info">${citasEnHorario.length} cita(s)</span>
                `;
            } else {
                timeSlot.classList.add('available');
                timeSlot.innerHTML = `<div>${timeStr}</div>`;
                timeSlot.onclick = () => crearCitaRapida(slotTime);
            }

            timeSlots.appendChild(timeSlot);
        }

        dayColumn.appendChild(dayHeader);
        dayColumn.appendChild(timeSlots);
        calendar.appendChild(dayColumn);
    }
}

// Actualizar rango de semana admin
function updateAdminWeekRange() {
    const rangeElement = document.getElementById('adminWeekRange');
    if (!rangeElement) return;

    const weekEnd = new Date(adminWeekStart);
    weekEnd.setDate(adminWeekStart.getDate() + 6);

    const options = { day: 'numeric', month: 'short' };
    const startStr = adminWeekStart.toLocaleDateString('es-ES', options);
    const endStr = weekEnd.toLocaleDateString('es-ES', options);

    rangeElement.textContent = `${startStr} - ${endStr}`;
}

// Cambiar semana en admin
function cambiarSemanaAdmin(direction) {
    adminWeekStart.setDate(adminWeekStart.getDate() + (direction * 7));
    loadAdminDisponibilidad();
}

// Crear cita rápida desde calendario
function crearCitaRapida(datetime) {
    // Pre-llenar el formulario con la fecha seleccionada
    mostrarModalCita();
    setTimeout(() => {
        const dateInput = document.querySelector('#modalContainer input[type="datetime-local"]');
        if (dateInput) {
            const localDatetime = new Date(datetime.getTime() - (datetime.getTimezoneOffset() * 60000));
            dateInput.value = localDatetime.toISOString().slice(0, 16);
        }
    }, 100);
}

// Aprobar cita
async function aprobarCita(id) {
    if (!confirm('¿Está seguro de aprobar esta cita?')) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}/aprobar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Cita aprobada exitosamente');
            await loadCitas();
            await loadAdminDisponibilidad();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al aprobar la cita');
    }
}

// Cancelar cita (desde admin)
async function cancelarCitaAdmin(id) {
    if (!confirm('¿Está seguro de cancelar esta cita?')) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}/cancelar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Cita cancelada exitosamente');
            await loadCitas();
            await loadAdminDisponibilidad();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cancelar la cita');
    }
}

// PRODUCTOS
async function loadProductos() {
    try {
        console.log('Cargando productos...');
        const response = await fetch(`${API_URL}/productos`);
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Data recibida:', data);
        productos = data.data || [];
        console.log('Total productos:', productos.length);
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        const container = document.getElementById('tablaProductos');
        if (container) {
            container.innerHTML = '<p class="loading">Error al cargar productos</p>';
        }
    }
}

function mostrarProductos(productosArray) {
    const container = document.getElementById('tablaProductos');

    if (productosArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay productos registrados</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Marca</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${productosArray.map(producto => {
        let stockClass = '';
        let stockWarning = '';

        if (producto.stock === 0) {
            stockClass = 'badge badge-secondary';
            stockWarning = '<br><small style="color: #868e96;"><i class="fas fa-times-circle"></i> No disponible</small>';
        } else if (producto.stock < 3) {
            stockClass = 'badge badge-danger';
            stockWarning = '<br><small style="color: #ff6b6b;"><i class="fas fa-exclamation-triangle"></i> Poco stock</small>';
        } else if (producto.stock <= producto.stock_minimo) {
            stockClass = 'badge badge-warning';
        }

        return `
                    <tr>
                        <td>
                            <img src="${producto.imagen_url || 'https://via.placeholder.com/60x60?text=Sin+Imagen'}" 
                                 alt="${producto.nombre}" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                                 onerror="this.src='https://via.placeholder.com/60x60?text=Sin+Imagen'">
                        </td>
                        <td><strong>${producto.codigo}</strong></td>
                        <td>${producto.nombre}</td>
                        <td>${formatCategoria(producto.categoria)}</td>
                        <td>${producto.marca || '-'}</td>
                        <td>
                            <span class="${stockClass}">${producto.stock}</span>
                            ${stockWarning}
                        </td>
                        <td>S/ ${parseFloat(producto.precio_venta).toFixed(2)}</td>
                        <td><span class="badge badge-${producto.estado === 'disponible' ? 'success' : 'warning'}">${producto.estado}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="verProducto(${producto.id})" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editarProducto(${producto.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
    }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// TRABAJADORES
async function loadTrabajadores() {
    try {
        const response = await fetch(`${API_URL}/trabajadores`);
        const data = await response.json();
        trabajadores = data.data || [];
        mostrarTrabajadores(trabajadores);
    } catch (error) {
        console.error('Error al cargar trabajadores:', error);
    }
}

function mostrarTrabajadores(trabajadoresArray) {
    const container = document.getElementById('tablaTrabajadores');

    if (trabajadoresArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay trabajadores registrados</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>DNI</th>
                    <th>Nombres</th>
                    <th>Cargo</th>
                    <th>Especialidad</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${trabajadoresArray.map(trabajador => `
                    <tr>
                        <td>${trabajador.dni}</td>
                        <td>${trabajador.nombres} ${trabajador.apellidos}</td>
                        <td><span class="badge badge-info">${formatCargo(trabajador.cargo)}</span></td>
                        <td>${trabajador.especialidad || '-'}</td>
                        <td>${trabajador.telefono || '-'}</td>
                        <td><span class="badge badge-${trabajador.estado === 'activo' ? 'success' : 'secondary'}">${trabajador.estado}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editarTrabajador(${trabajador.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarTrabajador(${trabajador.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// REPORTES
async function generarReporte(periodo) {
    try {
        // Calcular fechas según el periodo
        const ahora = new Date();
        let fechaInicio, fechaFin;
        let periodoTexto;

        switch (periodo) {
            case 'dia':
                fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
                fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
                periodoTexto = `(Hoy - ${fechaInicio.toLocaleDateString('es-PE')})`;
                break;
            case 'semana':
                const diaSemana = ahora.getDay();
                const diffAlLunes = diaSemana === 0 ? 6 : diaSemana - 1;
                fechaInicio = new Date(ahora);
                fechaInicio.setDate(ahora.getDate() - diffAlLunes);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaInicio.getDate() + 6);
                fechaFin.setHours(23, 59, 59, 999);
                periodoTexto = `(Semana del ${fechaInicio.toLocaleDateString('es-PE')} al ${fechaFin.toLocaleDateString('es-PE')})`;
                break;
            case 'mes':
                fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
                fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
                const nombreMes = fechaInicio.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
                periodoTexto = `(${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)})`;
                break;
        }

        // Actualizar títulos de periodo
        document.getElementById('periodo-citas').textContent = periodoTexto;
        document.getElementById('periodo-productos').textContent = periodoTexto;

        // Cargar reporte de citas
        await cargarReporteCitas(fechaInicio, fechaFin);

        // Cargar reporte de productos
        await cargarReporteProductos(fechaInicio, fechaFin);

    } catch (error) {
        console.error('Error al generar reporte:', error);
        alert('Error al generar el reporte');
    }
}

async function cargarReporteCitas(fechaInicio, fechaFin) {
    try {
        const response = await fetch(`${API_URL}/citas`);
        const data = await response.json();
        const todasCitas = data.data || [];

        // Filtrar solo citas ATENDIDAS por rango de fechas
        const citasAtendidas = todasCitas.filter(cita => {
            const fechaCita = new Date(cita.fecha_cita);
            return cita.estado === 'atendida' && fechaCita >= fechaInicio && fechaCita <= fechaFin;
        });

        // Actualizar estadística
        document.getElementById('total-atendidas').textContent = citasAtendidas.length;

        // Mostrar tabla de citas
        mostrarTablaCitas(citasAtendidas);

    } catch (error) {
        console.error('Error al cargar reporte de citas:', error);
        document.getElementById('tablaCitasReporte').innerHTML = '<p class="loading" style="color: red;">Error al cargar el reporte</p>';
    }
}

function mostrarTablaCitas(citasArray) {
    const container = document.getElementById('tablaCitasReporte');

    if (citasArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay atenciones completadas en este periodo</p>';
        return;
    }

    // Ordenar por fecha descendente
    citasArray.sort((a, b) => new Date(b.fecha_cita) - new Date(a.fecha_cita));

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Mascota</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th>Doctor</th>
                </tr>
            </thead>
            <tbody>
                ${citasArray.map(cita => {
        const fecha = new Date(cita.fecha_cita);
        const fechaFormato = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const horaFormato = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

        return `
                        <tr>
                            <td>${fechaFormato} ${horaFormato}</td>
                            <td>${cita.mascota_nombre || '-'}</td>
                            <td>${cita.cliente_nombre || '-'}</td>
                            <td><span class="badge badge-info">${cita.tipo || 'consulta'}</span></td>
                            <td>${cita.motivo || '-'}</td>
                            <td>Dr. ${cita.trabajador_nombre || '-'}</td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

async function cargarReporteProductos(fechaInicio, fechaFin) {
    try {
        // Cargar historial de ventas (reducciones de stock)
        const response = await fetch(`${API_URL}/productos/ventas`);
        const data = await response.json();
        const todasVentas = data.data || [];

        // Filtrar ventas por rango de fechas
        const ventasFiltradas = todasVentas.filter(venta => {
            const fechaVenta = new Date(venta.fecha_movimiento);
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });

        // Calcular estadísticas
        const totalVentas = ventasFiltradas.length;
        const productosVendidos = ventasFiltradas.reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0);
        const totalIngresos = ventasFiltradas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);

        // Actualizar estadísticas
        document.getElementById('total-ventas').textContent = totalVentas;
        document.getElementById('productos-vendidos').textContent = productosVendidos;
        document.getElementById('total-ingreso-ventas').textContent = `S/ ${totalIngresos.toFixed(2)}`;

        // Mostrar tabla de ventas
        mostrarTablaVentas(ventasFiltradas);

    } catch (error) {
        console.error('Error al cargar reporte de ventas:', error);
        document.getElementById('total-ventas').textContent = '0';
        document.getElementById('productos-vendidos').textContent = '0';
        document.getElementById('total-ingreso-ventas').textContent = 'S/ 0.00';
        document.getElementById('tablaProductosReporte').innerHTML = '<p class="loading" style="color: red;">Error al cargar el reporte</p>';
    }
}

function mostrarTablaVentas(ventasArray) {
    const container = document.getElementById('tablaProductosReporte');

    if (ventasArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay ventas registradas en este periodo</p>';
        return;
    }

    // Ordenar por fecha descendente
    ventasArray.sort((a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento));

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${ventasArray.map(venta => {
        const fecha = new Date(venta.fecha_movimiento);
        const fechaFormato = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const horaFormato = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

        const cantidad = parseInt(venta.cantidad) || 0;
        const precioUnit = parseFloat(venta.precio_venta) || 0;
        const total = parseFloat(venta.total) || 0;

        return `
                        <tr>
                            <td>${fechaFormato} ${horaFormato}</td>
                            <td>${venta.producto_nombre}</td>
                            <td><span class="badge badge-info">${venta.categoria}</span></td>
                            <td><strong>${cantidad}</strong> und.</td>
                            <td>S/ ${precioUnit.toFixed(2)}</td>
                            <td><strong>S/ ${total.toFixed(2)}</strong></td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function mostrarTablaProductos(productosArray) {
    const container = document.getElementById('tablaProductosReporte');

    if (productosArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay productos registrados</p>';
        return;
    }

    // Ordenar por stock ascendente (productos con problemas primero)
    productosArray.sort((a, b) => a.stock - b.stock);

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Valor Total</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${productosArray.map(producto => {
        const precio = parseFloat(producto.precio) || 0;
        const stock = parseInt(producto.stock) || 0;
        const valorTotal = (precio * stock).toFixed(2);

        let estadoBadge = 'success';
        let estadoTexto = 'Disponible';

        if (stock === 0) {
            estadoBadge = 'danger';
            estadoTexto = 'Agotado';
        } else if (stock < 3) {
            estadoBadge = 'warning';
            estadoTexto = 'Stock Bajo';
        }

        return `
                        <tr>
                            <td>${producto.nombre}</td>
                            <td>${producto.categoria}</td>
                            <td><strong>${stock}</strong> unidades</td>
                            <td>S/ ${precio.toFixed(2)}</td>
                            <td>S/ ${valorTotal}</td>
                            <td><span class="badge badge-${estadoBadge}">${estadoTexto}</span></td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// FUNCIONES DE FORMATO
function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE');
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function formatEstado(estado) {
    const estados = {
        'reserva': 'Reserva',
        'atendida': 'Atendida',
        'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
}

function formatTipoCita(tipo) {
    const tipos = {
        'consulta': 'Consulta',
        'vacunacion': 'Vacunación',
        'cirugia': 'Cirugía',
        'control': 'Control',
        'emergencia': 'Emergencia'
    };
    return tipos[tipo] || tipo;
}

function formatEspecie(especie) {
    const especies = {
        'perro': 'Perro',
        'gato': 'Gato',
        'ave': 'Ave',
        'roedor': 'Roedor',
        'reptil': 'Reptil',
        'otro': 'Otro'
    };
    return especies[especie] || especie;
}

function formatCategoria(categoria) {
    const categorias = {
        'alimento': 'Alimento',
        'medicamento': 'Medicamento',
        'accesorio': 'Accesorio',
        'higiene': 'Higiene',
        'juguete': 'Juguete',
        'otro': 'Otro'
    };
    return categorias[categoria] || categoria;
}

function formatCargo(cargo) {
    const cargos = {
        'veterinario': 'Veterinario',
        'asistente': 'Asistente',
        'recepcionista': 'Recepcionista',
        'administrador': 'Administrador'
    };
    return cargos[cargo] || cargo;
}

function getBadgeClass(estado) {
    const classes = {
        'reserva': 'warning',
        'atendida': 'success',
        'cancelada': 'danger',
        'activo': 'success',
        'inactivo': 'secondary'
    };
    return classes[estado] || 'secondary';
}

// FILTROS Y BÚSQUEDAS
function setupFilters() {
    // Búsqueda de clientes
    const buscarCliente = document.getElementById('buscarCliente');
    if (buscarCliente) {
        buscarCliente.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = clientes.filter(c =>
                c.dni.includes(query) ||
                c.nombres.toLowerCase().includes(query) ||
                c.apellido_paterno.toLowerCase().includes(query) ||
                c.apellido_materno.toLowerCase().includes(query)
            );
            mostrarClientes(filtered);
        });
    }

    // Búsqueda de mascotas
    const buscarMascota = document.getElementById('buscarMascota');
    if (buscarMascota) {
        buscarMascota.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = mascotas.filter(m =>
                m.nombre.toLowerCase().includes(query) ||
                m.especie.toLowerCase().includes(query)
            );
            mostrarMascotas(filtered);
        });
    }

    // Filtro de fecha de citas
    const filtroCitas = document.getElementById('filtroCitas');
    if (filtroCitas) {
        filtroCitas.addEventListener('change', (e) => {
            aplicarFiltrosCitas();
        });
    }

    // Filtro de estado de citas
    const filtroEstadoCitas = document.getElementById('filtroEstadoCitas');
    if (filtroEstadoCitas) {
        filtroEstadoCitas.addEventListener('change', (e) => {
            aplicarFiltrosCitas();
        });
    }

    // Filtro de categoría de productos
    const filtroCategoriaProductos = document.getElementById('filtroCategoriaProductos');
    if (filtroCategoriaProductos) {
        filtroCategoriaProductos.addEventListener('change', (e) => {
            const categoria = e.target.value;
            const filtered = categoria ? productos.filter(p => p.categoria === categoria) : productos;
            mostrarProductos(filtered);
        });
    }

    // Filtro de cargo de trabajadores
    const filtroCargoTrabajadores = document.getElementById('filtroCargoTrabajadores');
    if (filtroCargoTrabajadores) {
        filtroCargoTrabajadores.addEventListener('change', (e) => {
            const cargo = e.target.value;
            const filtered = cargo ? trabajadores.filter(t => t.cargo === cargo) : trabajadores;
            mostrarTrabajadores(filtered);
        });
    }
}

function aplicarFiltrosCitas() {
    const fecha = document.getElementById('filtroCitas').value;
    const estado = document.getElementById('filtroEstadoCitas').value;

    let filtered = [...citas];

    if (fecha) {
        filtered = filtered.filter(c => {
            const fechaCita = new Date(c.fecha_cita).toISOString().split('T')[0];
            return fechaCita === fecha;
        });
    }

    if (estado) {
        filtered = filtered.filter(c => c.estado === estado);
    }

    mostrarCitas(filtered);
}

// MODALES
let clienteEditando = null;

function mostrarModalCliente(clienteId = null) {
    clienteEditando = clienteId;
    const cliente = clienteId ? clientes.find(c => c.id === clienteId) : null;

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <form id="formCliente" onsubmit="guardarCliente(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>DNI *</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="dni" maxlength="8" pattern="[0-9]{8}" 
                                    value="${cliente?.dni || ''}" required ${cliente ? 'readonly' : ''}>
                                ${!cliente ? '<button type="button" class="btn btn-secondary" onclick="validarDNI()">Validar RENIEC</button>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombres *</label>
                            <input type="text" id="nombres" value="${cliente?.nombres || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Apellido Paterno *</label>
                            <input type="text" id="apellido_paterno" value="${cliente?.apellido_paterno || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Apellido Materno *</label>
                            <input type="text" id="apellido_materno" value="${cliente?.apellido_materno || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="telefono" value="${cliente?.telefono || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" value="${cliente?.email || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Dirección</label>
                        <textarea id="direccion" rows="2">${cliente?.direccion || ''}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function validarDNI() {
    const dni = document.getElementById('dni').value;

    if (dni.length !== 8) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/validar-dni`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni })
        });

        const data = await response.json();

        if (data.success && data.data) {
            document.getElementById('nombres').value = data.data.nombres || '';
            document.getElementById('apellido_paterno').value = data.data.apellidoPaterno || '';
            document.getElementById('apellido_materno').value = data.data.apellidoMaterno || '';
        } else {
        }
    } catch (error) {
        console.error('Error al validar DNI:', error);
    }
}

async function guardarCliente(event) {
    event.preventDefault();

    const clienteData = {
        dni: document.getElementById('dni').value,
        nombres: document.getElementById('nombres').value,
        apellido_paterno: document.getElementById('apellido_paterno').value,
        apellido_materno: document.getElementById('apellido_materno').value,
        telefono: document.getElementById('telefono').value || null,
        email: document.getElementById('email').value || null,
        direccion: document.getElementById('direccion').value || null
    };

    try {
        const url = clienteEditando
            ? `${API_URL}/clientes/${clienteEditando}`
            : `${API_URL}/clientes`;

        const response = await fetch(url, {
            method: clienteEditando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });

        const data = await response.json();

        if (data.success) {
            cerrarModal();
            loadClientes();
        } else {
            alert('Error: ' + (data.message || 'No se pudo guardar el cliente'));
            console.error('Error del servidor:', data);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    }
}

function editarCliente(id) {
    mostrarModalCliente(id);
}

async function eliminarCliente(id) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Cliente eliminado exitosamente');
            loadClientes();
        } else {
            alert('Error al eliminar cliente: ' + (data.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar cliente');
    }
}

function verCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Detalle del Cliente</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <div class="detail-content">
                    <div class="detail-row">
                        <strong>DNI:</strong> ${cliente.dni}
                    </div>
                    <div class="detail-row">
                        <strong>Nombres:</strong> ${cliente.nombres}
                    </div>
                    <div class="detail-row">
                        <strong>Apellidos:</strong> ${cliente.apellido_paterno} ${cliente.apellido_materno}
                    </div>
                    <div class="detail-row">
                        <strong>Teléfono:</strong> ${cliente.telefono || 'No registrado'}
                    </div>
                    <div class="detail-row">
                        <strong>Email:</strong> ${cliente.email || 'No registrado'}
                    </div>
                    <div class="detail-row">
                        <strong>Dirección:</strong> ${cliente.direccion || 'No registrada'}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
                    <button class="btn btn-primary" onclick="cerrarModal(); editarCliente(${id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// MASCOTAS
let mascotaEditando = null;

async function mostrarModalMascota(mascotaId = null) {
    mascotaEditando = mascotaId;
    const mascota = mascotaId ? mascotas.find(m => m.id === mascotaId) : null;

    console.log('Modal mascota - ID:', mascotaId, 'Mascota encontrada:', mascota, 'mascotaEditando:', mascotaEditando);

    // Cargar clientes si no están cargados
    if (clientes.length === 0) {
        try {
            const response = await fetch(`${API_URL}/clientes`);
            const data = await response.json();
            clientes = data.data || [];
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    }

    if (clientes.length === 0) {
        alert('Primero debe registrar al menos un cliente');
        return;
    }

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${mascota ? 'Editar Mascota' : 'Nueva Mascota'}</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <form id="formMascota" onsubmit="guardarMascota(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cliente Propietario *</label>
                            <select id="cliente_id" required ${mascota ? 'disabled' : ''}>
                                <option value="">Seleccione un cliente</option>
                                ${clientes.map(c => `
                                    <option value="${c.id}" ${mascota && mascota.cliente_id === c.id ? 'selected' : ''}>
                                        ${c.dni} - ${c.nombres} ${c.apellido_paterno}
                                    </option>
                                `).join('')}
                            </select>
                            ${mascota ? `<input type="hidden" id="cliente_id_hidden" value="${mascota.cliente_id}">` : ''}
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombre de la Mascota *</label>
                            <input type="text" id="nombre" value="${mascota?.nombre || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Especie *</label>
                            <select id="especie" required>
                                <option value="">Seleccione especie</option>
                                <option value="Perro" ${mascota?.especie === 'Perro' ? 'selected' : ''}>Perro</option>
                                <option value="Gato" ${mascota?.especie === 'Gato' ? 'selected' : ''}>Gato</option>
                                <option value="Ave" ${mascota?.especie === 'Ave' ? 'selected' : ''}>Ave</option>
                                <option value="Conejo" ${mascota?.especie === 'Conejo' ? 'selected' : ''}>Conejo</option>
                                <option value="Hamster" ${mascota?.especie === 'Hamster' ? 'selected' : ''}>Hamster</option>
                                <option value="Otro" ${mascota?.especie === 'Otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Raza</label>
                            <input type="text" id="raza" value="${mascota?.raza || ''}">
                        </div>
                        <div class="form-group">
                            <label>Sexo *</label>
                            <select id="sexo" required>
                                <option value="">Seleccione</option>
                                <option value="Macho" ${mascota?.sexo === 'Macho' ? 'selected' : ''}>Macho</option>
                                <option value="Hembra" ${mascota?.sexo === 'Hembra' ? 'selected' : ''}>Hembra</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha de Nacimiento</label>
                            <input type="date" id="fecha_nacimiento" value="${mascota?.fecha_nacimiento || ''}">
                        </div>
                        <div class="form-group">
                            <label>Color</label>
                            <input type="text" id="color" value="${mascota?.color || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Peso (kg)</label>
                            <input type="number" step="0.01" id="peso" value="${mascota?.peso || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="observaciones" rows="3">${mascota?.observaciones || ''}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function guardarMascota(event) {
    event.preventDefault();

    // Obtener cliente_id del campo hidden si está editando, sino del select
    const clienteIdElement = document.getElementById('cliente_id_hidden');
    const clienteId = clienteIdElement
        ? parseInt(clienteIdElement.value)
        : parseInt(document.getElementById('cliente_id').value);

    const mascotaData = {
        cliente_id: clienteId,
        nombre: document.getElementById('nombre').value,
        especie: document.getElementById('especie').value,
        raza: document.getElementById('raza').value || null,
        sexo: document.getElementById('sexo').value,
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
        color: document.getElementById('color').value || null,
        peso: document.getElementById('peso').value ? parseFloat(document.getElementById('peso').value) : null,
        observaciones: document.getElementById('observaciones').value || null
    };

    try {
        const url = mascotaEditando
            ? `${API_URL}/mascotas/${mascotaEditando}`
            : `${API_URL}/mascotas`;

        console.log('URL de mascota:', url, 'Método:', mascotaEditando ? 'PUT' : 'POST');
        console.log('Datos a enviar:', mascotaData);

        const response = await fetch(url, {
            method: mascotaEditando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mascotaData)
        });

        const data = await response.json();

        if (data.success) {
            cerrarModal();
            loadMascotas();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function editarMascota(id) {
    mostrarModalMascota(id);
}

async function eliminarMascota(id) {
    if (!confirm('¿Está seguro de eliminar esta mascota?')) return;

    try {
        const response = await fetch(`${API_URL}/mascotas/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            loadMascotas();
        } else {
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function verMascota(id) {
    const mascota = mascotas.find(m => m.id === id);
    if (!mascota) return;

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Detalle de la Mascota</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <div class="detail-content">
                    <div class="detail-row">
                        <strong>Nombre:</strong> ${mascota.nombre}
                    </div>
                    <div class="detail-row">
                        <strong>Propietario:</strong> ${mascota.nombres ? `${mascota.nombres} ${mascota.apellido_paterno}` : 'No especificado'}
                    </div>
                    <div class="detail-row">
                        <strong>Especie:</strong> ${mascota.especie}
                    </div>
                    <div class="detail-row">
                        <strong>Raza:</strong> ${mascota.raza || 'No especificada'}
                    </div>
                    <div class="detail-row">
                        <strong>Sexo:</strong> ${mascota.sexo}
                    </div>
                    <div class="detail-row">
                        <strong>Fecha Nac.:</strong> ${mascota.fecha_nacimiento ? new Date(mascota.fecha_nacimiento).toLocaleDateString() : 'No registrada'}
                    </div>
                    <div class="detail-row">
                        <strong>Color:</strong> ${mascota.color || 'No especificado'}
                    </div>
                    <div class="detail-row">
                        <strong>Peso:</strong> ${mascota.peso ? mascota.peso + ' kg' : 'No registrado'}
                    </div>
                    <div class="detail-row">
                        <strong>Observaciones:</strong> ${mascota.observaciones || 'Ninguna'}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
                    <button class="btn btn-primary" onclick="cerrarModal(); editarMascota(${id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

// CITAS
let citaEditando = null;

async function mostrarModalCita(citaId = null) {
    citaEditando = citaId;
    const cita = citaId ? citas.find(c => c.id === citaId) : null;

    // Cargar mascotas si no están cargadas
    if (mascotas.length === 0) {
        try {
            const response = await fetch(`${API_URL}/mascotas`);
            const data = await response.json();
            mascotas = data.data || [];
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
        }
    }

    // Cargar trabajadores (veterinarios) si no están cargados
    if (trabajadores.length === 0) {
        try {
            const response = await fetch(`${API_URL}/trabajadores`);
            const data = await response.json();
            trabajadores = data.data || [];
        } catch (error) {
            console.error('Error al cargar trabajadores:', error);
        }
    }

    if (mascotas.length === 0) {
        alert('Primero debe registrar al menos una mascota');
        return;
    }

    const veterinarios = trabajadores.filter(t => t.cargo === 'veterinario');

    if (veterinarios.length === 0) {
        alert('No hay veterinarios registrados');
        return;
    }

    // Obtener fecha y hora mínima (hoy)
    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    const horaActual = hoy.getHours();
    const minutoActual = hoy.getMinutes();

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${cita ? 'Editar Cita' : 'Nueva Cita'}</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <form id="formCita" onsubmit="guardarCita(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Mascota *</label>
                            <select id="mascota_id" required ${cita ? 'disabled' : ''}>
                                <option value="">Seleccione una mascota</option>
                                ${mascotas.map(m => `
                                    <option value="${m.id}" ${cita && cita.mascota_id === m.id ? 'selected' : ''}>
                                        ${m.nombre} - ${m.especie} (${m.nombres} ${m.apellido_paterno})
                                    </option>
                                `).join('')}
                            </select>
                            ${cita ? `<input type="hidden" id="mascota_id_hidden" value="${cita.mascota_id}">` : ''}
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Veterinario *</label>
                            <select id="veterinario_id" required>
                                <option value="">Seleccione un veterinario</option>
                                ${veterinarios.map(v => `
                                    <option value="${v.id}" ${cita && cita.veterinario_id === v.id ? 'selected' : ''}>
                                        Dr. ${v.nombres} ${v.apellidos}${v.especialidad ? ' - ' + v.especialidad : ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha *</label>
                            <input type="date" id="fecha_cita" min="${fechaMin}" 
                                value="${cita?.fecha_cita ? cita.fecha_cita.split('T')[0] : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Hora * (8:00 AM - 8:00 PM)</label>
                            <input type="time" id="hora_cita" min="08:00" max="20:00"
                                value="${cita?.fecha_cita ? new Date(cita.fecha_cita).toTimeString().slice(0, 5) : ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Cita *</label>
                            <select id="tipo" required>
                                <option value="">Seleccione tipo</option>
                                <option value="consulta" ${cita?.tipo === 'consulta' ? 'selected' : ''}>Consulta General</option>
                                <option value="vacunacion" ${cita?.tipo === 'vacunacion' ? 'selected' : ''}>Vacunación</option>
                                <option value="cirugia" ${cita?.tipo === 'cirugia' ? 'selected' : ''}>Cirugía</option>
                                <option value="revision" ${cita?.tipo === 'revision' ? 'selected' : ''}>Revisión</option>
                                <option value="emergencia" ${cita?.tipo === 'emergencia' ? 'selected' : ''}>Emergencia</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado *</label>
                            <select id="estado" required>
                                <option value="reserva" ${cita?.estado === 'reserva' ? 'selected' : ''}>Reserva</option>
                                <option value="atendida" ${cita?.estado === 'atendida' ? 'selected' : ''}>Atendida</option>
                                <option value="cancelada" ${cita?.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Motivo de la Consulta *</label>
                        <textarea id="motivo" rows="3" required>${cita?.motivo || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="observaciones" rows="2">${cita?.observaciones || ''}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function guardarCita(event) {
    event.preventDefault();

    const fecha = document.getElementById('fecha_cita').value;
    const hora = document.getElementById('hora_cita').value;
    const fechaHora = `${fecha} ${hora}:00`;

    // Validar horario (8:00 AM a 8:00 PM)
    const [horaStr, minutoStr] = hora.split(':');
    const horaNum = parseInt(horaStr);
    const minutoNum = parseInt(minutoStr);

    if (horaNum < 8 || horaNum >= 20) {
        alert('⚠️ El horario de atención es de 8:00 AM a 8:00 PM.\nPor favor, selecciona un horario válido.');
        return;
    }

    // Obtener mascota_id del campo hidden si está editando, sino del select
    const mascotaIdElement = document.getElementById('mascota_id_hidden');
    const mascotaId = mascotaIdElement
        ? parseInt(mascotaIdElement.value)
        : parseInt(document.getElementById('mascota_id').value);

    console.log('Guardando cita con mascota_id:', mascotaId, 'citaEditando:', citaEditando);

    // Validar campos requeridos
    if (!mascotaId || isNaN(mascotaId)) {
        alert('Error: Debes seleccionar una mascota');
        return;
    }

    const veterinarioId = document.getElementById('veterinario_id').value;
    if (!veterinarioId) {
        alert('Error: Debes seleccionar un veterinario');
        return;
    }

    const citaData = {
        mascota_id: mascotaId,
        veterinario_id: parseInt(veterinarioId),
        fecha_cita: fechaHora,
        tipo: document.getElementById('tipo').value,
        motivo: document.getElementById('motivo').value,
        observaciones: document.getElementById('observaciones').value || null
    };

    // Solo incluir estado si existe en el formulario (no es obligatorio)
    const estadoElement = document.getElementById('estado');
    if (estadoElement) {
        citaData.estado = estadoElement.value;
    }

    console.log('Datos de cita a enviar:', citaData);

    try {
        const url = citaEditando
            ? `${API_URL}/citas/${citaEditando}`
            : `${API_URL}/citas`;

        const response = await fetch(url, {
            method: citaEditando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(citaData)
        });

        const data = await response.json();

        console.log('Respuesta al guardar cita:', data);

        if (data.success) {
            alert('Cita guardada correctamente');
            cerrarModal();
            await loadCitas();
            await loadAdminDisponibilidad(); // Actualizar calendario
        } else {
            alert('Error al guardar cita: ' + (data.message || 'Error desconocido'));
            console.error('Respuesta del servidor:', data);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar cita: ' + error.message);
    }
}

function editarCita(id) {
    mostrarModalCita(id);
}

async function cancelarCita(id) {
    if (!confirm('¿Está seguro de cancelar esta cita?')) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'cancelada' })
        });

        const data = await response.json();

        if (data.success) {
            loadCitas();
        } else {
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarCita(id) {
    if (!confirm('¿Está seguro de eliminar permanentemente esta cita?')) return;

    try {
        const response = await fetch(`${API_URL}/citas/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            loadCitas();
        } else {
            alert('Error al eliminar la cita');
        }
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        alert('Error al eliminar la cita');
    }
}

function verCita(id) {
    const cita = citas.find(c => c.id === id);
    if (!cita) return;

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Detalle de la Cita</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <div class="detail-content">
                    <div class="detail-row">
                        <strong>Fecha/Hora:</strong> ${formatDateTime(cita.fecha_cita)}
                    </div>
                    <div class="detail-row">
                        <strong>Mascota:</strong> ${cita.mascota_nombre}
                    </div>
                    <div class="detail-row">
                        <strong>Cliente:</strong> ${cita.nombres} ${cita.apellido_paterno}
                    </div>
                    <div class="detail-row">
                        <strong>Veterinario:</strong> Dr. ${cita.vet_nombres} ${cita.vet_apellidos}
                    </div>
                    <div class="detail-row">
                        <strong>Tipo:</strong> ${formatTipoCita(cita.tipo)}
                    </div>
                    <div class="detail-row">
                        <strong>Estado:</strong> <span class="badge badge-${getBadgeClass(cita.estado)}">${formatEstado(cita.estado)}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Motivo:</strong> ${cita.motivo}
                    </div>
                    <div class="detail-row">
                        <strong>Observaciones:</strong> ${cita.observaciones || 'Ninguna'}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
                    ${cita.estado !== 'atendida' && cita.estado !== 'cancelada' ? `
                        <button class="btn btn-primary" onclick="cerrarModal(); editarCita(${id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

function verProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    let stockHTML;
    if (producto.stock === 0) {
        stockHTML = `<div style="color: #868e96; font-weight: 600; padding: 10px; background: #f1f3f5; border-radius: 5px;">
               <i class="fas fa-times-circle"></i> Producto no disponible
           </div>`;
    } else if (producto.stock < 3) {
        stockHTML = `<div style="color: #ff6b6b; font-weight: 600; padding: 10px; background: #ffe5e5; border-radius: 5px;">
               <i class="fas fa-exclamation-triangle"></i> ¡Poco stock! (${producto.stock} unidades)
           </div>`;
    } else {
        stockHTML = `<div style="color: #51cf66; font-weight: 600; padding: 10px; background: #e6ffe6; border-radius: 5px;">
               <i class="fas fa-check-circle"></i> Stock disponible (${producto.stock} unidades)
           </div>`;
    }

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 900px;">
                <div class="modal-header">
                    <h2>Detalle del Producto</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 30px;">
                    <div>
                        <img src="${producto.imagen_url || 'https://via.placeholder.com/400x400?text=Sin+Imagen'}" 
                             alt="${producto.nombre}" 
                             style="width: 100%; height: 400px; object-fit: cover; border-radius: 10px;"
                             onerror="this.src='https://via.placeholder.com/400x400?text=Sin+Imagen'">
                    </div>
                    <div>
                        <div class="detail-row">
                            <strong>Código:</strong> ${producto.codigo}
                        </div>
                        <div class="detail-row">
                            <strong>Nombre:</strong> ${producto.nombre}
                        </div>
                        <div class="detail-row">
                            <strong>Categoría:</strong> ${formatCategoria(producto.categoria)}
                        </div>
                        <div class="detail-row">
                            <strong>Marca:</strong> ${producto.marca || 'No especificada'}
                        </div>
                        <div class="detail-row">
                            <strong>Descripción:</strong><br>
                            ${producto.descripcion || 'Sin descripción'}
                        </div>
                        <div class="detail-row" style="margin-top: 20px;">
                            ${stockHTML}
                        </div>
                        <div class="detail-row" style="margin-top: 20px;">
                            <strong>Precio de compra:</strong> S/ ${parseFloat(producto.precio_compra).toFixed(2)}
                        </div>
                        <div class="detail-row">
                            <strong>Precio de venta:</strong> 
                            <span style="font-size: 24px; color: #0dc3ff; font-weight: 700;">
                                S/ ${parseFloat(producto.precio_venta).toFixed(2)}
                            </span>
                        </div>
                        <div class="detail-row">
                            <strong>Estado:</strong> 
                            <span class="badge badge-${producto.estado === 'disponible' ? 'success' : 'warning'}">
                                ${producto.estado}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

function editarProducto(id) {
    mostrarModalProducto(id);
}

async function eliminarProducto(id) {
    if (!confirm('¿Está seguro de eliminar permanentemente este producto?')) return;

    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            loadProductos();
        } else {
            alert('Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
    }
}

async function mostrarModalProducto(id = null) {
    const producto = id ? productos.find(p => p.id === id) : null;
    const titulo = producto ? 'Editar Producto' : 'Nuevo Producto';

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${titulo}</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <form onsubmit="guardarProducto(event, ${id})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Código *</label>
                            <input type="text" id="codigo" value="${producto?.codigo || ''}" 
                                ${producto ? 'readonly' : ''} required>
                        </div>
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="categoria" required>
                                <option value="">Seleccione categoría</option>
                                <option value="alimento" ${producto?.categoria === 'alimento' ? 'selected' : ''}>Alimento</option>
                                <option value="medicamento" ${producto?.categoria === 'medicamento' ? 'selected' : ''}>Medicamento</option>
                                <option value="accesorio" ${producto?.categoria === 'accesorio' ? 'selected' : ''}>Accesorio</option>
                                <option value="higiene" ${producto?.categoria === 'higiene' ? 'selected' : ''}>Higiene</option>
                                <option value="juguete" ${producto?.categoria === 'juguete' ? 'selected' : ''}>Juguete</option>
                                <option value="otro" ${producto?.categoria === 'otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>Nombre *</label>
                            <input type="text" id="nombre" value="${producto?.nombre || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>Descripción</label>
                            <textarea id="descripcion" rows="2">${producto?.descripcion || ''}</textarea>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>URL de Imagen</label>
                            <input type="url" id="imagen_url" value="${producto?.imagen_url || ''}" 
                                placeholder="https://ejemplo.com/imagen.jpg">
                            <small style="color: #666;">Introduce la URL de la imagen del producto</small>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Marca</label>
                            <input type="text" id="marca" value="${producto?.marca || ''}">
                        </div>
                        <div class="form-group">
                            <label>Estado *</label>
                            <select id="estado" required>
                                <option value="disponible" ${producto?.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
                                <option value="agotado" ${producto?.estado === 'agotado' ? 'selected' : ''}>Agotado</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Precio Compra (S/) *</label>
                            <input type="number" id="precio_compra" step="0.01" min="0" 
                                value="${producto?.precio_compra || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Precio Venta (S/) *</label>
                            <input type="number" id="precio_venta" step="0.01" min="0" 
                                value="${producto?.precio_venta || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Stock *</label>
                            <input type="number" id="stock" min="0" 
                                value="${producto?.stock || 0}" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Mínimo *</label>
                            <input type="number" id="stock_minimo" min="0" 
                                value="${producto?.stock_minimo || 5}" required>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function guardarProducto(event, id) {
    event.preventDefault();

    const productoData = {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        categoria: document.getElementById('categoria').value,
        marca: document.getElementById('marca').value,
        precio_compra: parseFloat(document.getElementById('precio_compra').value),
        precio_venta: parseFloat(document.getElementById('precio_venta').value),
        stock: parseInt(document.getElementById('stock').value),
        stock_minimo: parseInt(document.getElementById('stock_minimo').value),
        estado: document.getElementById('estado').value,
        imagen_url: document.getElementById('imagen_url').value || null
    };

    try {
        const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        const data = await response.json();

        if (data.success) {
            cerrarModal();
            loadProductos();
        } else {
            alert(data.message || 'Error al guardar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el producto');
    }
}

function editarTrabajador(id) {
    mostrarModalTrabajador(id);
}

async function eliminarTrabajador(id) {
    if (!confirm('¿Está seguro de eliminar este trabajador?')) return;

    try {
        const response = await fetch(`${API_URL}/trabajadores/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            loadTrabajadores();
        } else {
            alert('Error al eliminar el trabajador');
        }
    } catch (error) {
        console.error('Error al eliminar trabajador:', error);
        alert('Error al eliminar el trabajador');
    }
}

async function mostrarModalTrabajador(id = null) {
    const trabajador = id ? trabajadores.find(t => t.id === id) : null;
    const titulo = trabajador ? 'Editar Trabajador' : 'Nuevo Trabajador';

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${titulo}</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <form onsubmit="guardarTrabajador(event, ${id})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>DNI *</label>
                            <input type="text" id="dni" value="${trabajador?.dni || ''}" 
                                maxlength="8" pattern="[0-9]{8}" ${trabajador ? 'readonly' : ''} required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" id="telefono" value="${trabajador?.telefono || ''}" 
                                maxlength="9" pattern="[0-9]{9}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombres *</label>
                            <input type="text" id="nombres" value="${trabajador?.nombres || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Apellidos *</label>
                            <input type="text" id="apellidos" value="${trabajador?.apellidos || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" value="${trabajador?.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Cargo *</label>
                            <select id="cargo" required>
                                <option value="">Seleccione cargo</option>
                                <option value="veterinario" ${trabajador?.cargo === 'veterinario' ? 'selected' : ''}>Veterinario</option>
                                <option value="asistente" ${trabajador?.cargo === 'asistente' ? 'selected' : ''}>Asistente</option>
                                <option value="recepcionista" ${trabajador?.cargo === 'recepcionista' ? 'selected' : ''}>Recepcionista</option>
                                <option value="administrador" ${trabajador?.cargo === 'administrador' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Especialidad</label>
                            <input type="text" id="especialidad" value="${trabajador?.especialidad || ''}" 
                                placeholder="Ej: Cirugía, Dermatología">
                        </div>
                        <div class="form-group">
                            <label>Estado *</label>
                            <select id="estado" required>
                                <option value="activo" ${trabajador?.estado === 'activo' ? 'selected' : ''}>Activo</option>
                                <option value="inactivo" ${trabajador?.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha Contratación *</label>
                            <input type="date" id="fecha_contratacion" 
                                value="${trabajador?.fecha_contratacion ? trabajador.fecha_contratacion.split('T')[0] : ''}" 
                                ${trabajador ? '' : 'required'}>
                        </div>
                        <div class="form-group">
                            <label>Salario (S/)</label>
                            <input type="number" id="salario" step="0.01" min="0" 
                                value="${trabajador?.salario || ''}">
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function guardarTrabajador(event, id) {
    event.preventDefault();

    const trabajadorData = {
        dni: document.getElementById('dni').value,
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        cargo: document.getElementById('cargo').value,
        especialidad: document.getElementById('especialidad').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        fecha_contratacion: document.getElementById('fecha_contratacion').value,
        salario: parseFloat(document.getElementById('salario').value) || null,
        estado: document.getElementById('estado').value
    };

    try {
        const url = id ? `${API_URL}/trabajadores/${id}` : `${API_URL}/trabajadores`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trabajadorData)
        });

        const data = await response.json();

        if (data.success) {
            cerrarModal();
            loadTrabajadores();
        } else {
            alert(data.message || 'Error al guardar el trabajador');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el trabajador');
    }
}

function cerrarModal() {
    document.getElementById('modalContainer').innerHTML = '';
    clienteEditando = null;
    mascotaEditando = null;
    citaEditando = null;
}
