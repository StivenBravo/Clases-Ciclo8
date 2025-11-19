document.addEventListener('DOMContentLoaded', () => {
    // URLs de nuestros micro-servidores
    const API_SERVER1_URL = 'http://localhost:3001'; // Para platos de comida
    const API_SERVER2_URL = 'http://localhost:3002'; // Para guardar facturas
    const API_SERVER3_URL = 'http://localhost:3003'; // Para tragos

    // Elementos del DOM
    const menuComidasContainer = document.getElementById('menu-comidas');
    const menuTragosContainer = document.getElementById('menu-tragos');
    const formNuevoPlato = document.getElementById('form-nuevo-plato');
    const listaPedido = document.getElementById('lista-pedido');
    const subtotalElem = document.getElementById('subtotal');
    const igvElem = document.getElementById('igv');
    const totalElem = document.getElementById('total');
    const btnPagar = document.getElementById('btn-pagar');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.getElementById('toast-body');
    const bsToast = new bootstrap.Toast(toastElement);

    let pedidoActual = [];
    const IGV_RATE = 0.18;

    // --- FUNCIONES DE CARGA DE DATOS ---

    // Cargar y mostrar el menú de comidas desde server1
    const cargarMenuComidas = async () => {
        try {
            const response = await fetch(`${API_SERVER1_URL}/platos`);
            if (!response.ok) throw new Error('No se pudo cargar el menú de comidas.');
            const platos = await response.json();
            renderizarMenu(platos, menuComidasContainer, 'comida');
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    };

    // Cargar y mostrar el menú de tragos desde server3
    const cargarMenuTragos = async () => {
        try {
            const response = await fetch(`${API_SERVER3_URL}/tragos`);
            if (!response.ok) throw new Error('No se pudo cargar la carta de tragos.');
            const tragos = await response.json();
            renderizarMenu(tragos, menuTragosContainer, 'trago');
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    };

    // --- FUNCIONES DE RENDERIZADO ---

    // Renderiza una lista de items (platos o tragos) en su contenedor
    const renderizarMenu = (items, container, tipo) => {
        if (items.length === 0) {
            container.innerHTML = `<p class="text-muted">No hay ${tipo}s disponibles en este momento.</p>`;
            return;
        }
        const html = items.map(item => {
            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.nombre}</h5>
                            <p class="card-text">Precio: S/. ${item.precio.toFixed(2)}</p>
                            <button class="btn btn-outline-primary mt-auto" data-nombre="${item.nombre}" data-precio="${item.precio}">Añadir al Pedido</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        container.innerHTML = html;
    };

    // Actualiza la lista del pedido y los totales en la UI
    const actualizarPedidoUI = () => {
        listaPedido.innerHTML = '';
        if (pedidoActual.length === 0) {
            listaPedido.innerHTML = '<li class="list-group-item text-center text-muted">Aún no has pedido nada.</li>';
            btnPagar.disabled = true;
        } else {
            pedidoActual.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.textContent = `${item.nombre} - S/. ${item.precio.toFixed(2)}`;
                listaPedido.appendChild(li);
            });
            btnPagar.disabled = false;
        }

        const subtotal = pedidoActual.reduce((sum, item) => sum + item.precio, 0);
        const igv = subtotal * IGV_RATE;
        const total = subtotal + igv;

        subtotalElem.textContent = `S/. ${subtotal.toFixed(2)}`;
        igvElem.textContent = `S/. ${igv.toFixed(2)}`;
        totalElem.textContent = `S/. ${total.toFixed(2)}`;
    };

    // --- MANEJADORES DE EVENTOS ---

    // Añadir un nuevo plato de comida
    formNuevoPlato.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre-plato').value;
        const precio = parseFloat(document.getElementById('precio-plato').value);

        try {
            const response = await fetch(`${API_SERVER1_URL}/platos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio }),
            });
            if (!response.ok) throw new Error('Error al añadir el plato.');
            
            formNuevoPlato.reset();
            mostrarNotificacion(`'${nombre}' fue añadido al menú.`, 'success');
            cargarMenuComidas(); // Recargar el menú de comidas
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    });

    // Añadir un item al pedido (delegación de eventos)
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.btn-outline-primary')) {
            const nombre = e.target.dataset.nombre;
            const precio = parseFloat(e.target.dataset.precio);
            pedidoActual.push({ nombre, precio });
            actualizarPedidoUI();
            mostrarNotificacion(`'${nombre}' añadido al pedido.`, 'info');
        }
    });

    // Limpiar el pedido actual
    btnLimpiar.addEventListener('click', () => {
        pedidoActual = [];
        actualizarPedidoUI();
        mostrarNotificacion('El pedido ha sido limpiado.', 'warning');
    });

    // Finalizar y guardar la factura
    btnPagar.addEventListener('click', async () => {
        const subtotal = pedidoActual.reduce((sum, item) => sum + item.precio, 0);
        const igv = subtotal * IGV_RATE;
        const total = subtotal + igv;

        const factura = {
            subtotal: parseFloat(subtotal.toFixed(2)),
            igv: parseFloat(igv.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            fecha: new Date().toISOString(),
            items: pedidoActual
        };

        try {
            const response = await fetch(`${API_SERVER2_URL}/facturas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(factura),
            });
            if (!response.ok) throw new Error('No se pudo guardar la factura.');

            mostrarNotificacion('¡Pago realizado con éxito! La factura ha sido guardada.', 'success');
            pedidoActual = [];
            actualizarPedidoUI();
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    });

    // --- UTILIDADES ---

    // Muestra una notificación toast
    function mostrarNotificacion(mensaje, tipo = 'info') {
        // Elimina clases de color anteriores y añade la nueva
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
        toastBody.classList.remove('text-white');
        
        if (tipo !== 'info') {
            toastElement.classList.add(`bg-${tipo}`);
            toastBody.classList.add('text-white');
        }

        toastBody.textContent = mensaje;
        bsToast.show();
    }

    // --- INICIALIZACIÓN ---
    cargarMenuComidas();
    cargarMenuTragos();
    actualizarPedidoUI();
});