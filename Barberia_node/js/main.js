// Configuración de las APIs - Usando servidores separados (como tu ejemplo)
const API_SERVICIOS = 'http://localhost:3001';  // Servidor 1 - Servicios
const API_CITAS = 'http://localhost:3002';      // Servidor 2 - Citas
const API_BARBEROS = 'http://localhost:3003';   // Servidor 3 - Barberos

// Cargar servicios al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarServicios();
    cargarBarberos();
    cargarServiciosSelect();
    cargarBarberosSelect();
    configurarFormularioCita();
    configurarFechaMinima();
});

// ============== FUNCIONES PARA SERVICIOS ==============

async function cargarServicios() {
    const grid = document.getElementById('servicios-grid');

    try {
        const response = await fetch(`${API_SERVICIOS}/servicios`);
        const servicios = await response.json(); if (servicios.length === 0) {
            grid.innerHTML = '<p class="loading">No hay servicios disponibles</p>';
            return;
        }

        grid.innerHTML = servicios.map(servicio => `
            <div class="servicio-card">
                <h3>${servicio.nombre}</h3>
                <p>${servicio.descripcion}</p>
                <div class="servicio-info">
                    <span class="servicio-precio">S/ ${servicio.precio.toFixed(2)}</span>
                    <span class="servicio-duracion">⏱ ${servicio.duracion} min</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error al cargar servicios:', error);
        grid.innerHTML = '<p class="loading" style="color: red;">Error al cargar los servicios. Verifica que el servidor esté corriendo.</p>';
    }
}

// ============== FUNCIONES PARA BARBEROS ==============

async function cargarBarberos() {
    const grid = document.getElementById('barberos-grid');

    try {
        const response = await fetch(`${API_BARBEROS}/barberos`);
        const barberos = await response.json(); if (barberos.length === 0) {
            grid.innerHTML = '<p class="loading">No hay barberos disponibles</p>';
            return;
        }

        grid.innerHTML = barberos.map(barbero => {
            const iniciales = barbero.nombre.split(' ').map(n => n[0]).join('');
            return `
                <div class="barbero-card">
                    <div class="barbero-avatar">${iniciales}</div>
                    <h3>${barbero.nombre}</h3>
                    <p>${barbero.especialidad}</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error al cargar barberos:', error);
        grid.innerHTML = '<p class="loading" style="color: red;">Error al cargar los barberos.</p>';
    }
}

// ============== FUNCIONES PARA FORMULARIO DE CITAS ==============

async function cargarServiciosSelect() {
    const select = document.getElementById('servicio');

    try {
        const response = await fetch(`${API_SERVICIOS}/servicios`);
        const servicios = await response.json(); servicios.forEach(servicio => {
            const option = document.createElement('option');
            option.value = servicio.id;
            option.textContent = `${servicio.nombre} - S/ ${servicio.precio.toFixed(2)}`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar servicios en el select:', error);
    }
}

async function cargarBarberosSelect() {
    const select = document.getElementById('barbero');

    try {
        const response = await fetch(`${API_BARBEROS}/barberos`);
        const barberos = await response.json(); barberos.forEach(barbero => {
            const option = document.createElement('option');
            option.value = barbero.id;
            option.textContent = `${barbero.nombre} - ${barbero.especialidad}`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar barberos en el select:', error);
    }
}

function configurarFechaMinima() {
    const inputFecha = document.getElementById('fecha');
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const fechaMin = manana.toISOString().split('T')[0];
    inputFecha.setAttribute('min', fechaMin);
    inputFecha.value = fechaMin;
}

function configurarFormularioCita() {
    const form = document.getElementById('form-cita');
    const mensajeResultado = document.getElementById('mensaje-resultado');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener datos del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const email = document.getElementById('email').value.trim();
        const servicio_id = parseInt(document.getElementById('servicio').value);
        const barbero_id = parseInt(document.getElementById('barbero').value);
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const comentarios = document.getElementById('comentarios').value.trim();

        // Combinar fecha y hora
        const fecha_cita = `${fecha} ${hora}:00`;

        // Preparar datos para enviar
        const citaData = {
            cliente_nombre: nombre,
            cliente_telefono: telefono,
            cliente_email: email,
            servicio_id: servicio_id,
            barbero_id: barbero_id,
            fecha_cita: fecha_cita,
            comentarios: comentarios
        };

        try {
            // Mostrar loading
            mensajeResultado.className = 'mensaje-resultado';
            mensajeResultado.textContent = 'Procesando reserva...';
            mensajeResultado.style.display = 'block';

            // Enviar datos al servidor de CITAS (puerto 3002)
            const response = await fetch(`${API_CITAS}/citas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(citaData)
            }); const resultado = await response.json();

            if (response.ok) {
                // Éxito
                mensajeResultado.className = 'mensaje-resultado exito';
                mensajeResultado.innerHTML = `
                    <strong>¡Cita reservada exitosamente!</strong><br>
                    Tu número de reserva es: #${resultado.id}<br>
                    Te esperamos el ${formatearFecha(fecha_cita)}
                `;
                form.reset();
                configurarFechaMinima(); // Restablecer fecha mínima
            } else {
                // Error
                mensajeResultado.className = 'mensaje-resultado error';
                mensajeResultado.textContent = resultado.error || 'Error al crear la cita';
            }

        } catch (error) {
            console.error('Error al enviar cita:', error);
            mensajeResultado.className = 'mensaje-resultado error';
            mensajeResultado.textContent = 'Error de conexión. Verifica que el servidor esté corriendo.';
        }

        // Ocultar mensaje después de 8 segundos
        setTimeout(() => {
            mensajeResultado.style.display = 'none';
        }, 8000);
    });
}

// ============== FUNCIONES AUXILIARES ==============

function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Scroll suave para los enlaces del menú
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
