const express = require('express');
const cors = require('cors');
const { pool } = require('../../config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_PRODUCTOS || 3004;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Productos', timestamp: new Date().toISOString() });
});

// GET - Listar todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const { categoria, estado } = req.query;
        let query = 'SELECT * FROM productos WHERE 1=1';
        const params = [];

        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }
        if (estado) {
            query += ' AND estado = ?';
            params.push(estado);
        }

        query += ' ORDER BY nombre ASC';

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Obtener producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Buscar producto por código
app.get('/api/productos/codigo/:codigo', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE codigo = ?', [req.params.codigo]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Productos con stock bajo
app.get('/api/productos/stock/bajo', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE stock <= stock_minimo AND estado = "disponible"');
        res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Registrar nuevo producto
app.post('/api/productos', async (req, res) => {
    try {
        const { codigo, nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock, stock_minimo, imagen_url } = req.body;

        // Validar campos requeridos
        if (!codigo || !nombre || !categoria || !precio_compra || !precio_venta) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
        }

        // Verificar si el código ya existe
        const [existing] = await pool.query('SELECT id FROM productos WHERE codigo = ?', [codigo]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'El código ya está registrado' });
        }

        const estado = stock > 0 ? 'disponible' : 'agotado';

        const [result] = await pool.query(
            'INSERT INTO productos (codigo, nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock, stock_minimo, estado, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [codigo, nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock || 0, stock_minimo || 5, estado, imagen_url || null]
        );

        res.status(201).json({
            success: true,
            message: 'Producto registrado exitosamente',
            data: { id: result.insertId, codigo, nombre }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock, stock_minimo, estado, imagen_url } = req.body;

        // Obtener stock anterior para comparar
        const [productoAnterior] = await pool.query('SELECT stock, nombre, precio_venta FROM productos WHERE id = ?', [req.params.id]);

        if (productoAnterior.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const stockAnterior = productoAnterior[0].stock;
        const stockNuevo = parseInt(stock);

        // Actualizar producto
        const [result] = await pool.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, categoria = ?, marca = ?, precio_compra = ?, precio_venta = ?, stock = ?, stock_minimo = ?, estado = ?, imagen_url = ? WHERE id = ?',
            [nombre, descripcion, categoria, marca, precio_compra, precio_venta, stockNuevo, stock_minimo, estado, imagen_url || null, req.params.id]
        );

        // Si el stock cambió, registrar en historial
        if (stockAnterior !== stockNuevo) {
            const diferencia = stockNuevo - stockAnterior;
            const tipo = diferencia > 0 ? 'entrada' : 'salida';
            const motivo = diferencia < 0 ? 'Venta desde panel admin' : 'Ajuste de inventario';

            await pool.query(
                'INSERT INTO historial_stock (producto_id, cantidad_anterior, cantidad_nueva, diferencia, tipo, motivo) VALUES (?, ?, ?, ?, ?, ?)',
                [req.params.id, stockAnterior, stockNuevo, Math.abs(diferencia), tipo, motivo]
            );
        }

        res.json({ success: true, message: 'Producto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar stock
app.put('/api/productos/:id/stock', async (req, res) => {
    try {
        const { cantidad, tipo } = req.body; // tipo: 'entrada' o 'salida'

        if (!cantidad || !tipo) {
            return res.status(400).json({ success: false, message: 'Faltan parámetros requeridos' });
        }

        // Obtener stock actual
        const [producto] = await pool.query('SELECT stock FROM productos WHERE id = ?', [req.params.id]);
        if (producto.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        let nuevoStock = producto[0].stock;
        if (tipo === 'entrada') {
            nuevoStock += cantidad;
        } else if (tipo === 'salida') {
            if (cantidad > nuevoStock) {
                return res.status(400).json({ success: false, message: 'Stock insuficiente' });
            }
            nuevoStock -= cantidad;
        }

        const nuevoEstado = nuevoStock > 0 ? 'disponible' : 'agotado';

        const [result] = await pool.query(
            'UPDATE productos SET stock = ?, estado = ? WHERE id = ?',
            [nuevoStock, nuevoEstado, req.params.id]
        );

        res.json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: { stock_anterior: producto[0].stock, stock_nuevo: nuevoStock }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Estadísticas de productos
app.get('/api/productos/stats/general', async (req, res) => {
    try {
        const [categorias] = await pool.query(`
            SELECT categoria, COUNT(*) as cantidad, SUM(stock * precio_venta) as valor_inventario
            FROM productos 
            WHERE estado != 'descontinuado'
            GROUP BY categoria
        `);

        const [total] = await pool.query(`
            SELECT 
                COUNT(*) as total_productos,
                SUM(stock) as total_stock,
                SUM(stock * precio_venta) as valor_total
            FROM productos 
            WHERE estado != 'descontinuado'
        `);

        res.json({
            success: true,
            data: {
                resumen: total[0],
                por_categoria: categorias
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Historial de ventas (salidas de stock)
app.get('/api/productos/ventas', async (req, res) => {
    try {
        const [ventas] = await pool.query(`
            SELECT 
                h.id,
                h.producto_id,
                p.nombre as producto_nombre,
                p.categoria,
                p.precio_venta,
                h.diferencia as cantidad,
                (h.diferencia * p.precio_venta) as total,
                h.motivo,
                h.fecha_movimiento
            FROM historial_stock h
            INNER JOIN productos p ON h.producto_id = p.id
            WHERE h.tipo = 'salida'
            ORDER BY h.fecha_movimiento DESC
        `);

        res.json({
            success: true,
            data: ventas
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servicio de Productos corriendo en http://localhost:${PORT}`);
});
