const { pool } = require('../config/database');

async function crearTablaHistorialStock() {
    try {
        console.log('Creando tabla historial_stock...');

        // Crear tabla para registrar cambios en el stock
        await pool.query(`
            CREATE TABLE IF NOT EXISTS historial_stock (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                cantidad_anterior INT NOT NULL,
                cantidad_nueva INT NOT NULL,
                diferencia INT NOT NULL,
                tipo ENUM('entrada', 'salida') NOT NULL,
                motivo VARCHAR(200),
                usuario_id INT,
                fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
                INDEX idx_producto (producto_id),
                INDEX idx_fecha (fecha_movimiento),
                INDEX idx_tipo (tipo)
            )
        `);

        console.log('✓ Tabla historial_stock creada exitosamente');

        process.exit(0);
    } catch (error) {
        console.error('Error al crear tabla:', error);
        process.exit(1);
    }
}

crearTablaHistorialStock();
