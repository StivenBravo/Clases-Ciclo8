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
let tratamientos = [];
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
        window.location.href = '/login';
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
            'tratamientos': 'Gestión de Tratamientos'
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
            break;
        case 'productos':
            loadProductos();
            break;
        case 'trabajadores':
            loadTrabajadores();
            break;
        case 'tratamientos':
            loadTratamientos();
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
                        <td><span class="badge badge-${getBadgeClass(cita.estado)}">${formatEstado(cita.estado)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="verCita(${cita.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editarCita(${cita.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarCita(${cita.id})">
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
                ${productosArray.map(producto => `
                    <tr>
                        <td><strong>${producto.codigo}</strong></td>
                        <td>${producto.nombre}</td>
                        <td>${formatCategoria(producto.categoria)}</td>
                        <td>${producto.marca || '-'}</td>
                        <td><span class="${producto.stock <= producto.stock_minimo ? 'badge badge-danger' : ''}">${producto.stock}</span></td>
                        <td>S/ ${parseFloat(producto.precio_venta).toFixed(2)}</td>
                        <td><span class="badge badge-${producto.estado === 'disponible' ? 'success' : 'warning'}">${producto.estado}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editarProducto(${producto.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})">
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

// TRATAMIENTOS
async function loadTratamientos() {
    try {
        const response = await fetch(`${API_URL}/tratamientos`);
        const data = await response.json();
        tratamientos = data.data || [];
        mostrarTratamientos(tratamientos);
    } catch (error) {
        console.error('Error al cargar tratamientos:', error);
    }
}

function mostrarTratamientos(tratamientosArray) {
    const container = document.getElementById('tablaTratamientos');

    if (tratamientosArray.length === 0) {
        container.innerHTML = '<p class="loading">No hay tratamientos registrados</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Mascota</th>
                    <th>Tutor</th>
                    <th>Enfermedad/Vacuna</th>
                    <th>Veterinario</th>
                    <th>Próxima Visita</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${tratamientosArray.map(trat => `
                    <tr>
                        <td><span class="badge badge-${trat.tipo === 'vacuna' ? 'info' : 'warning'}">${trat.tipo === 'vacuna' ? 'Vacuna' : 'Enfermedad'}</span></td>
                        <td>${trat.mascota_nombre}</td>
                        <td>${trat.nombres} ${trat.apellido_paterno}</td>
                        <td>${trat.tipo === 'vacuna' ? trat.vacuna : trat.enfermedad}</td>
                        <td>Dr. ${trat.vet_nombres} ${trat.vet_apellidos}</td>
                        <td>${trat.fecha_proxima_visita ? formatDate(trat.fecha_proxima_visita) : '-'}</td>
                        <td><span class="badge badge-${trat.estado === 'completado' ? 'success' : 'info'}">${trat.estado === 'completado' ? 'Completado' : 'En Curso'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editarTratamiento(${trat.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarTratamiento(${trat.id})">
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
            loadClientes();
        } else {
        }
    } catch (error) {
        console.error('Error:', error);
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
                            <label>Hora * (8:00 AM - 6:00 PM)</label>
                            <input type="time" id="hora_cita" min="08:00" max="17:59"
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

    // Validar horario (8:00 AM a 6:00 PM)
    const [horaStr, minutoStr] = hora.split(':');
    const horaNum = parseInt(horaStr);
    const minutoNum = parseInt(minutoStr);

    if (horaNum < 8 || horaNum >= 18) {
        alert('⚠️ El horario de atención es de 8:00 AM a 6:00 PM.\nPor favor, selecciona un horario válido.');
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
            loadCitas();
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
        estado: document.getElementById('estado').value
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

function editarTratamiento(id) {
    mostrarModalTratamiento(id);
}

async function eliminarTratamiento(id) {
    if (!confirm('¿Está seguro de eliminar este tratamiento?')) return;

    try {
        const response = await fetch(`${API_URL}/tratamientos/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            loadTratamientos();
        } else {
            alert('Error al eliminar el tratamiento');
        }
    } catch (error) {
        console.error('Error al eliminar tratamiento:', error);
        alert('Error al eliminar el tratamiento');
    }
}

async function mostrarModalTratamiento(id = null) {
    // Cargar clientes, mascotas y trabajadores si no están cargados
    try {
        if (clientes.length === 0) {
            const responseClientes = await fetch(`${API_URL}/clientes`);
            const dataClientes = await responseClientes.json();
            clientes = dataClientes.data || [];
        }

        if (mascotas.length === 0) {
            const responseMascotas = await fetch(`${API_URL}/mascotas`);
            const dataMascotas = await responseMascotas.json();
            mascotas = dataMascotas.data || [];
        }

        if (trabajadores.length === 0) {
            const responseTrabajadores = await fetch(`${API_URL}/trabajadores`);
            const dataTrabajadores = await responseTrabajadores.json();
            trabajadores = dataTrabajadores.data || [];
        }

        // Filtrar solo veterinarios
        veterinarios = trabajadores.filter(t => t.cargo === 'veterinario' && t.estado === 'activo');
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos necesarios');
        return;
    }

    const tratamiento = id ? tratamientos.find(t => t.id === id) : null;
    const titulo = tratamiento ? 'Editar Tratamiento' : 'Nuevo Tratamiento';

    // Si está editando, encontrar el cliente de la mascota
    let clienteSeleccionado = null;
    if (tratamiento) {
        const mascotaTratamiento = mascotas.find(m => m.id === tratamiento.mascota_id);
        if (mascotaTratamiento) {
            clienteSeleccionado = mascotaTratamiento.cliente_id;
        }
    }

    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${titulo}</h2>
                    <button class="modal-close" onclick="cerrarModal()">&times;</button>
                </div>
                <form onsubmit="guardarTratamiento(event, ${id})">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tutor / Cliente *</label>
                            <select id="cliente_id" required ${tratamiento ? 'disabled' : ''} onchange="filtrarMascotasPorCliente()">
                                <option value="">Seleccione tutor</option>
                                ${clientes.map(c => `
                                    <option value="${c.id}" ${clienteSeleccionado === c.id ? 'selected' : ''}>
                                        ${c.nombres} ${c.apellido_paterno} - ${c.dni}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Mascota *</label>
                            <select id="mascota_id" required ${tratamiento ? 'disabled' : ''}>
                                <option value="">Seleccione mascota</option>
                            </select>
                            ${tratamiento ? `<input type="hidden" id="mascota_id_hidden" value="${tratamiento.mascota_id}">` : ''}
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Veterinario Encargado *</label>
                            <select id="veterinario_id" required>
                                <option value="">Seleccione veterinario</option>
                                ${veterinarios.map(v => `
                                    <option value="${v.id}" ${tratamiento && tratamiento.veterinario_id === v.id ? 'selected' : ''}>
                                        Dr. ${v.nombres} ${v.apellidos}${v.especialidad ? ' - ' + v.especialidad : ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado *</label>
                            <select id="estado" required>
                                <option value="en_curso" ${tratamiento?.estado === 'en_curso' ? 'selected' : ''}>En Curso</option>
                                <option value="completado" ${tratamiento?.estado === 'completado' ? 'selected' : ''}>Completado</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select id="tipo" required onchange="toggleTipoTratamiento()">
                                <option value="">Seleccione tipo</option>
                                <option value="enfermedad" ${tratamiento?.tipo === 'enfermedad' ? 'selected' : ''}>Enfermedad a Tratar</option>
                                <option value="vacuna" ${tratamiento?.tipo === 'vacuna' ? 'selected' : ''}>Vacuna a Colocar</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row" id="row_enfermedad" style="display: ${tratamiento?.tipo === 'enfermedad' || !tratamiento ? 'flex' : 'none'}">
                        <div class="form-group full-width">
                            <label>Enfermedad a Tratar</label>
                            <input type="text" id="enfermedad" value="${tratamiento?.enfermedad || ''}" 
                                placeholder="Ej: Parasitosis, Dermatitis, Infección">
                        </div>
                    </div>
                    <div class="form-row" id="row_vacuna" style="display: ${tratamiento?.tipo === 'vacuna' ? 'flex' : 'none'}">
                        <div class="form-group full-width">
                            <label>Vacuna a Colocar</label>
                            <input type="text" id="vacuna" value="${tratamiento?.vacuna || ''}" 
                                placeholder="Ej: Sextuple, Antirrábica, Triple Felina">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>Descripción / Indicaciones</label>
                            <textarea id="descripcion" rows="3" placeholder="Detalles adicionales, medicamentos, instrucciones...">${tratamiento?.descripcion || ''}</textarea>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha Inicio *</label>
                            <input type="date" id="fecha_inicio" 
                                value="${tratamiento?.fecha_inicio ? tratamiento.fecha_inicio.split('T')[0] : ''}" 
                                ${tratamiento ? 'readonly' : 'required'}>
                        </div>
                        <div class="form-group">
                            <label>Próxima Visita (Cuándo Regresar)</label>
                            <input type="date" id="fecha_proxima_visita" 
                                value="${tratamiento?.fecha_proxima_visita ? tratamiento.fecha_proxima_visita.split('T')[0] : ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Costo (S/)</label>
                            <input type="number" id="costo" step="0.01" min="0" 
                                value="${tratamiento?.costo || ''}">
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

    // Establecer fecha inicial si es nuevo
    if (!tratamiento) {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha_inicio').value = hoy;
    } else {
        // Si está editando, filtrar y seleccionar la mascota
        filtrarMascotasPorCliente();
    }
}

function filtrarMascotasPorCliente() {
    const clienteId = document.getElementById('cliente_id').value;
    const selectMascota = document.getElementById('mascota_id');
    const mascotaActual = selectMascota.value; // Guardar selección actual si existe

    // Limpiar opciones
    selectMascota.innerHTML = '<option value="">Seleccione mascota</option>';

    if (clienteId) {
        // Filtrar mascotas del cliente seleccionado
        const mascotasCliente = mascotas.filter(m => m.cliente_id == clienteId && m.estado === 'activo');

        mascotasCliente.forEach(m => {
            const option = document.createElement('option');
            option.value = m.id;
            option.textContent = `${m.nombre} (${m.especie} - ${m.raza})`;
            if (m.id == mascotaActual) {
                option.selected = true;
            }
            selectMascota.appendChild(option);
        });

        if (mascotasCliente.length === 0) {
            selectMascota.innerHTML = '<option value="">No hay mascotas registradas para este tutor</option>';
        }
    }
}

function toggleTipoTratamiento() {
    const tipo = document.getElementById('tipo').value;
    const rowEnfermedad = document.getElementById('row_enfermedad');
    const rowVacuna = document.getElementById('row_vacuna');

    if (tipo === 'enfermedad') {
        rowEnfermedad.style.display = 'flex';
        rowVacuna.style.display = 'none';
        document.getElementById('vacuna').value = '';
    } else if (tipo === 'vacuna') {
        rowEnfermedad.style.display = 'none';
        rowVacuna.style.display = 'flex';
        document.getElementById('enfermedad').value = '';
    } else {
        rowEnfermedad.style.display = 'none';
        rowVacuna.style.display = 'none';
    }
}

async function guardarTratamiento(event, id) {
    event.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const tratamientoData = {
        mascota_id: id ? document.getElementById('mascota_id_hidden').value : document.getElementById('mascota_id').value,
        veterinario_id: document.getElementById('veterinario_id').value,
        tipo: tipo,
        enfermedad: tipo === 'enfermedad' ? document.getElementById('enfermedad').value : null,
        vacuna: tipo === 'vacuna' ? document.getElementById('vacuna').value : null,
        descripcion: document.getElementById('descripcion').value,
        fecha_inicio: document.getElementById('fecha_inicio').value,
        fecha_proxima_visita: document.getElementById('fecha_proxima_visita').value || null,
        costo: parseFloat(document.getElementById('costo').value) || null,
        estado: document.getElementById('estado').value
    };

    try {
        const url = id ? `${API_URL}/tratamientos/${id}` : `${API_URL}/tratamientos`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tratamientoData)
        });

        const data = await response.json();

        if (data.success) {
            cerrarModal();
            loadTratamientos();
        } else {
            alert(data.message || 'Error al guardar el tratamiento');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el tratamiento');
    }
}

function cerrarModal() {
    document.getElementById('modalContainer').innerHTML = '';
    clienteEditando = null;
    mascotaEditando = null;
    citaEditando = null;
}
