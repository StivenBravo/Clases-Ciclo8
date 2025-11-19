document.addEventListener('DOMContentLoaded', () => {
    const API_SERVER1_URL = 'http://localhost:3001'; // Para libros
    const API_SERVER2_URL = 'http://localhost:3002'; // Para guardar ventas
    const API_SERVER3_URL = 'http://localhost:3003'; // Para comics y revistas

    const catalogoLibrosContainer = document.getElementById('catalogo-libros');
    const catalogoComicsContainer = document.getElementById('catalogo-comics');
    const catalogoRevistasContainer = document.getElementById('catalogo-revistas');
    const formNuevoLibro = document.getElementById('form-nuevo-libro');
    const listaCarrito = document.getElementById('lista-carrito');
    const subtotalElem = document.getElementById('subtotal');
    const igvElem = document.getElementById('igv');
    const totalElem = document.getElementById('total');
    const btnComprar = document.getElementById('btn-comprar');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.getElementById('toast-body');
    const bsToast = new bootstrap.Toast(toastElement);

    let carritoActual = [];
    const IGV_RATE = 0.18;

    // --- FUNCIONES DE CARGA DE DATOS ---
    const cargarCatalogoLibros = async () => {
        try {
            const response = await fetch(`${API_SERVER1_URL}/libros`);
            if (!response.ok) throw new Error('No se pudo cargar el catálogo de libros.');
            const libros = await response.json();
            renderizarCatalogo(libros, catalogoLibrosContainer, 'libro');
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    };

    // Cargar y mostrar el catálogo de comics y revistas desde server3
    const cargarCatalogoComicsRevistas = async () => {
        try {
            const response = await fetch(`${API_SERVER3_URL}/productos`);
            if (!response.ok) throw new Error('No se pudo cargar el catálogo de comics y revistas.');
            const productos = await response.json();

            // Filtro de comics y de revistas
            const comics = productos.filter(p => p.tipo === 'comic');
            const revistas = productos.filter(p => p.tipo === 'revista');

            renderizarCatalogo(comics, catalogoComicsContainer, 'comic');
            renderizarCatalogo(revistas, catalogoRevistasContainer, 'revista');
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    };


    // Renderiza una lista de items (libros, comics o revistas) en su contenedor
    const renderizarCatalogo = (items, container, tipo) => {
        if (items.length === 0) {
            container.innerHTML = `<p class="text-muted">No hay ${tipo}s disponibles en este momento.</p>`;
            return;
        }
        const html = items.map(item => {
            const displayInfo = tipo === 'libro'
                ? `<p class="card-text small"><strong>Autor:</strong> ${item.autor}</p>`
                : `<p class="card-text small"><strong>Edición:</strong> ${item.edicion || 'N/A'}</p>`;

            return `
                <div class="card h-100 product-card">
                    <div class="card-body d-flex flex-column p-2">
                        <h6 class="card-title">${item.titulo || item.nombre}</h6>
                        ${displayInfo}
                        <p class="card-text small"><strong>Precio:</strong> S/. ${item.precio.toFixed(2)}</p>
                        <button class="btn btn-sm mt-auto" style="background-color: #17a2b8; color: white;" data-titulo="${item.titulo || item.nombre}" data-precio="${item.precio}" data-autor="${item.autor || ''}" data-tipo="${tipo}">
                            🛒 Añadir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        container.innerHTML = html;
    };

    // Actualiza la lista del carrito y los totales en la UI
    const actualizarCarritoUI = () => {
        listaCarrito.innerHTML = '';
        if (carritoActual.length === 0) {
            listaCarrito.innerHTML = '<li class="list-group-item text-center text-muted">Tu carrito está vacío.</li>';
            btnComprar.disabled = true;
        } else {
            carritoActual.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.textContent = `${item.titulo} - S/. ${item.precio.toFixed(2)}`;
                listaCarrito.appendChild(li);
            });
            btnComprar.disabled = false;
        }

        const subtotal = carritoActual.reduce((sum, item) => sum + item.precio, 0);
        const igv = subtotal * IGV_RATE;
        const total = subtotal + igv;

        subtotalElem.textContent = `S/. ${subtotal.toFixed(2)}`;
        igvElem.textContent = `S/. ${igv.toFixed(2)}`;
        totalElem.textContent = `S/. ${total.toFixed(2)}`;
    };

    // --- MANEJADORES DE EVENTOS ---

    // Añadir un nuevo libro
    formNuevoLibro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('titulo-libro').value;
        const autor = document.getElementById('autor-libro').value;
        const precio = parseFloat(document.getElementById('precio-libro').value);

        try {
            const response = await fetch(`${API_SERVER1_URL}/libros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, autor, precio }),
            });
            if (!response.ok) throw new Error('Error al añadir el libro.');

            formNuevoLibro.reset();
            mostrarNotificacion(`'${titulo}' fue añadido al catálogo.`, 'success');
            cargarCatalogoLibros(); // Recargar el catálogo de libros
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion(error.message, 'danger');
        }
    });

    // Añadir un item al carrito (delegación de eventos)
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.btn-sm') || e.target.closest('.btn-sm')) {
            const button = e.target.matches('.btn-sm') ? e.target : e.target.closest('.btn-sm');
            if (!button.dataset.titulo) return; // Evitar conflictos con otros botones
            const titulo = button.dataset.titulo;
            const precio = parseFloat(button.dataset.precio);
            const tipo = button.dataset.tipo;
            const autor = button.dataset.autor;

            carritoActual.push({ titulo, precio, tipo, autor });
            actualizarCarritoUI();
            mostrarNotificacion(`'${titulo}' añadido al carrito.`, 'info');
        }
    });

    // Limpiar el carrito actual
    btnLimpiar.addEventListener('click', () => {
        carritoActual = [];
        actualizarCarritoUI();
        mostrarNotificacion('El carrito ha sido limpiado.', 'warning');
    });

    // Finalizar y guardar la venta
    btnComprar.addEventListener('click', async () => {
        const subtotal = carritoActual.reduce((sum, item) => sum + item.precio, 0);
        const igv = subtotal * IGV_RATE;
        const total = subtotal + igv;

        const venta = {
            subtotal: parseFloat(subtotal.toFixed(2)),
            igv: parseFloat(igv.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            fecha: new Date().toISOString(),
            items: carritoActual
        };

        try {
            const response = await fetch(`${API_SERVER2_URL}/ventas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(venta),
            });
            if (!response.ok) throw new Error('No se pudo guardar la venta.');

            mostrarNotificacion('¡Compra realizada con éxito! La venta ha sido registrada.', 'success');
            carritoActual = [];
            actualizarCarritoUI();
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
    cargarCatalogoLibros();
    cargarCatalogoComicsRevistas();
    actualizarCarritoUI();
});
