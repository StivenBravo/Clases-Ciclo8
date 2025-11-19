document.addEventListener('DOMContentLoaded', () => {
    const API_SERVER2_URL = 'http://localhost:3002';
    const historialContainer = document.getElementById('historial-ventas');

    const cargarHistorial = async () => {
        try {
            const response = await fetch(`${API_SERVER2_URL}/ventas`);
            if (!response.ok) {
                throw new Error('No se pudo cargar el historial de ventas.');
            }
            const ventas = await response.json();

            historialContainer.innerHTML = ''; // Limpiar el mensaje de "cargando"

            if (ventas.length === 0) {
                historialContainer.innerHTML = '<div class="alert alert-info">No hay ventas registradas en el historial.</div>';
                return;
            }

            ventas.forEach((venta, index) => {
                const fecha = new Date(venta.fecha).toLocaleString('es-ES');

                // Generar las filas de la tabla para los items de la compra
                const itemsHtml = venta.items.map(item => `
                    <tr>
                        <td>${item.titulo}</td>
                        <td>${item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : 'N/A'}</td>
                        <td class="text-end">S/. ${item.precio.toFixed(2)}</td>
                    </tr>
                `).join('');

                const ventaElement = `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading-${index}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
                                <strong>Venta #${index + 1}</strong> &nbsp;-&nbsp; ${fecha} &nbsp;-&nbsp; <span class="ms-auto me-3">Total: S/. ${venta.total.toFixed(2)}</span>
                            </button>
                        </h2>
                        <div id="collapse-${index}" class="accordion-collapse collapse" aria-labelledby="heading-${index}" data-bs-parent="#historial-ventas">
                            <div class="accordion-body">
                                <p><strong>Detalle de la Compra:</strong></p>
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Tipo</th>
                                            <th class="text-end">Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                                <div class="mt-3">
                                    <div class="d-flex justify-content-between">
                                        <strong>Subtotal:</strong>
                                        <span>S/. ${venta.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <strong>IGV (18%):</strong>
                                        <span>S/. ${venta.igv.toFixed(2)}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between h5">
                                        <strong>Total:</strong>
                                        <strong>S/. ${venta.total.toFixed(2)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                historialContainer.innerHTML += ventaElement;
            });
        } catch (error) {
            console.error('Error:', error);
            historialContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    cargarHistorial();
});
