document.addEventListener('DOMContentLoaded', () => {
    const API_SERVER2_URL = 'http://localhost:3002';
    const historialContainer = document.getElementById('historial-cuentas');

    const cargarHistorial = async () => {
        try {
            const response = await fetch(`${API_SERVER2_URL}/facturas`);
            if (!response.ok) {
                throw new Error('No se pudo cargar el historial de cuentas.');
            }
            const facturas = await response.json();

            historialContainer.innerHTML = ''; // Limpiar el mensaje de "cargando"

            if (facturas.length === 0) {
                historialContainer.innerHTML = '<div class="alert alert-info">No hay cuentas guardadas en el historial.</div>';
                return;
            }

            facturas.forEach((factura, index) => {
                const fecha = new Date(factura.fecha).toLocaleString('es-ES');

                // Generar las filas de la tabla para los items del pedido
                const itemsHtml = factura.items.map(item => `
                    <tr>
                        <td>${item.nombre}</td>
                        <td class="text-end">S/. ${item.precio.toFixed(2)}</td>
                    </tr>
                `).join('');

                const facturaElement = `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading-${index}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
                                <strong>Cuenta #${index + 1}</strong> &nbsp;-&nbsp; ${fecha} &nbsp;-&nbsp; <span class="ms-auto me-3">Total: S/. ${factura.total.toFixed(2)}</span>
                            </button>
                        </h2>
                        <div id="collapse-${index}" class="accordion-collapse collapse" aria-labelledby="heading-${index}" data-bs-parent="#historial-cuentas">
                            <div class="accordion-body">
                                <p><strong>Detalle del Consumo:</strong></p>
                                <table class="table table-sm table-striped">
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                historialContainer.innerHTML += facturaElement;
            });
        } catch (error) {
            console.error('Error:', error);
            historialContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    cargarHistorial();
});