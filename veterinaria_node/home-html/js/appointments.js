// Sistema de Reserva de Citas
(function () {
    let currentWeekStart = new Date();
    let disponibilidad = { citas: [], veterinarios: [] };
    let selectedSlot = null;
    let userSession = null;

    // Inicializar
    document.addEventListener('DOMContentLoaded', function () {
        checkUserSession();
        loadVeterinarios();
        setCurrentWeek();
        loadDisponibilidad();
        setupEventListeners();
    });

    // Verificar sesión del usuario
    function checkUserSession() {
        userSession = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');

        // Siempre mostrar el calendario y formulario
        const appointmentContainer = document.getElementById('appointmentContainer');
        const alertLogin = document.getElementById('alertLogin');

        // Ocultar alerta de login
        if (alertLogin) {
            alertLogin.style.display = 'none';
        }

        // Mostrar contenedor
        if (appointmentContainer) {
            appointmentContainer.style.display = 'block';
        }

        // Si está logueado, autocompletar nombre
        if (userSession && userSession.rol === 'cliente') {
            const nombreInput = document.getElementById('nombreCliente');
            if (nombreInput) {
                nombreInput.value = userSession.nombre_completo || '';
            }
        }
    }

    // Cargar veterinarios
    async function loadVeterinarios() {
        try {
            console.log('Cargando veterinarios...');
            const response = await fetch('/api/citas/disponibilidad');
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Resultado:', result);

            if (result.success) {
                disponibilidad = result.data;
                renderVeterinarios();
            }
        } catch (error) {
            console.error('Error al cargar veterinarios:', error);
            alert('Error: No se pudo conectar con el servidor. Verifica que los servicios estén corriendo.');
        }
    }

    // Renderizar lista de veterinarios (inicialmente vacío)
    function renderVeterinarios() {
        const select = document.getElementById('veterinario');
        select.innerHTML = '<option value="">Primero seleccione un horario en el calendario</option>';
        select.disabled = true;
    }    // Establecer semana actual
    function setCurrentWeek() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay()); // Inicio de semana (domingo)
    }

    // Cargar disponibilidad
    async function loadDisponibilidad() {
        try {
            console.log('Cargando disponibilidad...');
            const response = await fetch('/api/citas/disponibilidad');
            console.log('Response status disponibilidad:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Disponibilidad cargada:', result);

            if (result.success) {
                disponibilidad = result.data;
                renderCalendar();
            }
        } catch (error) {
            console.error('Error al cargar disponibilidad:', error);
            showError('Error al cargar la disponibilidad. Intente nuevamente.');
        }
    }

    // Renderizar calendario
    function renderCalendar() {
        console.log('=== RENDERIZANDO CALENDARIO ===');
        console.log('Veterinarios disponibles:', disponibilidad.veterinarios);

        updateWeekRange();
        const calendar = document.getElementById('weekCalendar');
        if (!calendar) {
            console.error('No se encontró el elemento weekCalendar');
            return;
        }
        calendar.innerHTML = '';

        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('Fecha actual:', today);
        console.log('Inicio de semana:', currentWeekStart);

        let diasMostrados = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);

            console.log(`Día ${i}: ${date.toDateString()}, es pasado: ${date < today}`);

            // No mostrar días pasados
            if (date < today) continue;

            diasMostrados++;

            const dayColumn = document.createElement('div');
            dayColumn.className = 'day_column';

            const dayHeader = document.createElement('div');
            dayHeader.className = 'day_header';
            dayHeader.innerHTML = `
                ${days[date.getDay()]}
                <span class="date">${date.getDate()}</span>
            `;

            const timeSlots = document.createElement('div');
            timeSlots.className = 'time_slots';

            const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];

            // Generar horarios de 8am a 8pm
            for (let hour = 8; hour < 20; hour++) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);

                const timeSlot = document.createElement('div');
                timeSlot.className = 'time_slot';

                const timeStr = `${hour.toString().padStart(2, '0')}:00`;

                // Verificar si hay doctores disponibles en este horario
                const doctoresDisponibles = getDoctoresDisponibles(diaSemana, hour);
                const cantidadDoctores = doctoresDisponibles.length;

                if (cantidadDoctores > 0) {
                    timeSlot.innerHTML = `${timeStr}<br><small style="font-size: 9px;">${cantidadDoctores} Dr(s)</small>`;
                } else {
                    timeSlot.textContent = timeStr;
                }

                timeSlot.dataset.datetime = slotTime.toISOString();

                // Verificar si está ocupado o no hay doctores
                const isOccupied = isSlotOccupied(slotTime);
                const isPast = slotTime < new Date();
                const sinDoctores = cantidadDoctores === 0;

                if (isPast || isOccupied || sinDoctores) {
                    timeSlot.classList.add('occupied');
                    timeSlot.style.cursor = 'not-allowed';
                    if (sinDoctores && !isPast) {
                        timeSlot.title = 'No hay doctores disponibles en este horario';
                    }
                } else {
                    timeSlot.classList.add('available');
                    timeSlot.title = `${cantidadDoctores} doctor(es) disponible(s)`;
                    timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot, slotTime, doctoresDisponibles));
                }

                timeSlots.appendChild(timeSlot);
            }

            dayColumn.appendChild(dayHeader);
            dayColumn.appendChild(timeSlots);
            calendar.appendChild(dayColumn);
        }

        console.log(`Total de días mostrados: ${diasMostrados}`);
        console.log('=== FIN RENDERIZADO ===');
    }

    // Obtener doctores disponibles para un día y hora específica
    function getDoctoresDisponibles(diaSemana, hora) {
        // Determinar turno según la hora
        let turno = '';
        if (hora >= 8 && hora < 12) {
            turno = 'mañana';
        } else if (hora >= 12 && hora < 16) {
            turno = 'ambos'; // Solapamiento - ambos turnos
        } else if (hora >= 16 && hora < 20) {
            turno = 'tarde';
        }

        return disponibilidad.veterinarios.filter(vet => {
            // Verificar que trabaje ese día
            const trabajaEsteDia = vet.dias_trabajo && vet.dias_trabajo.includes(diaSemana);

            if (!trabajaEsteDia) return false;

            // Verificar turno
            if (turno === 'ambos') {
                // En el solapamiento, ambos turnos están disponibles
                return vet.turno === 'mañana' || vet.turno === 'tarde';
            } else {
                return vet.turno === turno;
            }
        });
    }

    // Verificar si un horario está ocupado
    function isSlotOccupied(datetime) {
        const veterinarioId = document.getElementById('veterinario').value;
        if (!veterinarioId) return false;

        return disponibilidad.citas.some(cita => {
            const citaDate = new Date(cita.fecha_cita);
            return citaDate.getTime() === datetime.getTime() &&
                cita.veterinario_id == veterinarioId &&
                ['reserva', 'atendida'].includes(cita.estado);
        });
    }

    // Seleccionar horario
    function selectTimeSlot(element, datetime, doctoresDisponibles) {
        // Verificar si el usuario está logueado
        if (!userSession || userSession.rol !== 'cliente') {
            if (confirm('⚠️ Debes iniciar sesión como cliente para reservar una cita.\n\n¿Deseas ir al login ahora?')) {
                window.location.href = '/login';
            }
            return;
        }

        // Actualizar lista de veterinarios disponibles para esta hora
        updateVeterinariosSelect(doctoresDisponibles);

        // Remover selección anterior
        document.querySelectorAll('.time_slot.selected').forEach(slot => {
            slot.classList.remove('selected');
            slot.classList.add('available');
        });

        // Agregar nueva selección
        element.classList.remove('available');
        element.classList.add('selected');
        selectedSlot = datetime;

        // Actualizar campo de fecha
        const dateInput = document.getElementById('fechaCita');
        const localDatetime = new Date(datetime.getTime() - (datetime.getTimezoneOffset() * 60000));
        dateInput.value = localDatetime.toISOString().slice(0, 16);
    }

    // Actualizar select de veterinarios con los disponibles
    function updateVeterinariosSelect(doctoresDisponibles) {
        const select = document.getElementById('veterinario');
        const currentValue = select.value;

        select.disabled = false;
        select.innerHTML = '<option value="">Seleccione un veterinario</option>';

        if (doctoresDisponibles.length === 0) {
            select.innerHTML = '<option value="">No hay doctores disponibles en este horario</option>';
            select.disabled = true;
            return;
        }

        doctoresDisponibles.forEach(vet => {
            const option = document.createElement('option');
            option.value = vet.id;
            const turnoLabel = vet.turno === 'mañana' ? '🌅' : '🌆';
            option.textContent = `${turnoLabel} Dr(a). ${vet.nombres} ${vet.apellidos}${vet.especialidad ? ' - ' + vet.especialidad : ''}`;

            // Mantener selección si el doctor sigue disponible
            if (vet.id == currentValue) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    }

    // Actualizar rango de semana
    function updateWeekRange() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);

        const options = { month: 'short', day: 'numeric' };
        const startStr = currentWeekStart.toLocaleDateString('es-ES', options);
        const endStr = weekEnd.toLocaleDateString('es-ES', options);

        document.getElementById('weekRange').textContent = `${startStr} - ${endStr}`;
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Navegación de semana
        document.getElementById('prevWeek').addEventListener('click', () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayWeekStart = new Date(today);
            todayWeekStart.setDate(today.getDate() - today.getDay());

            const newWeek = new Date(currentWeekStart);
            newWeek.setDate(currentWeekStart.getDate() - 7);

            // Permitir retroceder hasta la semana actual
            if (newWeek >= todayWeekStart) {
                currentWeekStart = newWeek;
                loadDisponibilidad();
            }
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            const newWeek = new Date(currentWeekStart);
            newWeek.setDate(currentWeekStart.getDate() + 7);
            currentWeekStart = newWeek;
            loadDisponibilidad();
        });

        // Envío de formulario
        document.getElementById('formReserva').addEventListener('submit', handleReserva);
    }

    // Manejar reserva
    async function handleReserva(e) {
        e.preventDefault();

        if (!userSession || userSession.rol !== 'cliente') {
            if (confirm('⚠️ Debes iniciar sesión como cliente para reservar una cita.\n\n¿Deseas ir al login ahora?')) {
                window.location.href = '/login';
            }
            return;
        }

        if (!selectedSlot) {
            showError('Por favor seleccione un horario del calendario');
            return;
        }

        const btnReservar = document.getElementById('btnReservar');
        btnReservar.disabled = true;
        btnReservar.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Reservando...';

        const formData = {
            dni: userSession.username, // El username es el DNI
            nombre_mascota: document.getElementById('nombreMascota').value,
            especie: document.getElementById('especie').value,
            veterinario_id: document.getElementById('veterinario').value,
            fecha_cita: selectedSlot.toISOString(),
            tipo: document.getElementById('tipoCita').value,
            motivo: document.getElementById('motivo').value
        };

        try {
            const response = await fetch('/api/citas/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showSuccess(result.message);
                document.getElementById('formReserva').reset();
                document.getElementById('nombreCliente').value = userSession.nombre_completo;
                selectedSlot = null;
                loadDisponibilidad();
            } else {
                showError(result.message);
            }
        } catch (error) {
            console.error('Error al reservar:', error);
            showError('Error al procesar la reserva. Intente nuevamente.');
        } finally {
            btnReservar.disabled = false;
            btnReservar.innerHTML = '<i class="fa fa-calendar-check"></i> Reservar Cita';
        }
    }

    // Mostrar error
    function showError(message) {
        alert('❌ ' + message);
    }

    // Mostrar éxito
    function showSuccess(message) {
        alert('✅ ' + message);
    }
})();
