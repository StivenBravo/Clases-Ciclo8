const { pool } = require('../config/database');

async function agregarImagenProductos() {
    try {
        console.log('🔧 Agregando campo imagen_url a tabla productos...');

        // Verificar si la columna ya existe
        const [columns] = await pool.execute(`
            SHOW COLUMNS FROM productos LIKE 'imagen_url'
        `);

        if (columns.length === 0) {
            // Agregar columna imagen_url
            await pool.execute(`
                ALTER TABLE productos 
                ADD COLUMN imagen_url VARCHAR(500) DEFAULT NULL
            `);
            console.log('✅ Campo imagen_url agregado exitosamente');
        } else {
            console.log('ℹ️ Campo imagen_url ya existe');
        }

        // Insertar productos de ejemplo con imágenes
        console.log('📦 Insertando productos de ejemplo...');

        const productos = [
            {
                codigo: 'ALI001',
                nombre: 'Royal Canin Adult Dog Food 15kg',
                descripcion: 'Alimento completo y balanceado para perros adultos. Fórmula con ingredientes de alta calidad que favorecen la digestión y el pelaje brillante.',
                categoria: 'alimento',
                marca: 'Royal Canin',
                precio_compra: 180.00,
                precio_venta: 250.00,
                stock: 15,
                stock_minimo: 5,
                imagen_url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500'
            },
            {
                codigo: 'ALI002',
                nombre: 'Whiskas Wet Cat Food 12 Pack',
                descripcion: 'Comida húmeda para gatos adultos. Incluye sabores variados: pollo, atún y salmón. Rica en proteínas.',
                categoria: 'alimento',
                marca: 'Whiskas',
                precio_compra: 45.00,
                precio_venta: 65.00,
                stock: 25,
                stock_minimo: 8,
                imagen_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500'
            },
            {
                codigo: 'MED001',
                nombre: 'Antipulgas Frontline Plus',
                descripcion: 'Tratamiento antipulgas y garrapatas para perros. Protección por 30 días. Elimina pulgas adultas, larvas y huevos.',
                categoria: 'medicamento',
                marca: 'Frontline',
                precio_compra: 55.00,
                precio_venta: 78.00,
                stock: 2,
                stock_minimo: 5,
                imagen_url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=500'
            },
            {
                codigo: 'MED002',
                nombre: 'Antiparasitario Interno Drontal',
                descripcion: 'Desparasitante de amplio espectro para perros y gatos. Elimina lombrices intestinales.',
                categoria: 'medicamento',
                marca: 'Drontal',
                precio_compra: 38.00,
                precio_venta: 55.00,
                stock: 18,
                stock_minimo: 6,
                imagen_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'
            },
            {
                codigo: 'ACC001',
                nombre: 'Collar Ajustable con Placa ID',
                descripcion: 'Collar resistente y cómodo con hebilla de seguridad. Incluye placa de identificación grabable.',
                categoria: 'accesorio',
                marca: 'PetSafe',
                precio_compra: 25.00,
                precio_venta: 45.00,
                stock: 12,
                stock_minimo: 5,
                imagen_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'
            },
            {
                codigo: 'ACC002',
                nombre: 'Correa Retráctil 5 Metros',
                descripcion: 'Correa extensible de alta resistencia. Sistema de freno automático. Soporta hasta 25kg.',
                categoria: 'accesorio',
                marca: 'Flexi',
                precio_compra: 48.00,
                precio_venta: 75.00,
                stock: 8,
                stock_minimo: 4,
                imagen_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500'
            },
            {
                codigo: 'HIG001',
                nombre: 'Shampoo Antipulgas y Garrapatas',
                descripcion: 'Shampoo medicado con ingredientes naturales. Elimina pulgas y garrapatas, deja el pelaje suave y brillante.',
                categoria: 'higiene',
                marca: 'Bio Pet',
                precio_compra: 22.00,
                precio_venta: 35.00,
                stock: 20,
                stock_minimo: 8,
                imagen_url: 'https://images.unsplash.com/photo-1556228852-80898c9d1f4f?w=500'
            },
            {
                codigo: 'HIG002',
                nombre: 'Cepillo para Mascotas 2 en 1',
                descripcion: 'Cepillo dual con cerdas suaves y púas metálicas. Ideal para desenredar y dar brillo al pelaje.',
                categoria: 'higiene',
                marca: 'FurMaster',
                precio_compra: 18.00,
                precio_venta: 32.00,
                stock: 1,
                stock_minimo: 5,
                imagen_url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500'
            },
            {
                codigo: 'JUG001',
                nombre: 'Pelota Kong Classic Roja',
                descripcion: 'Juguete resistente de caucho natural. Ideal para perros activos. Se puede rellenar con snacks.',
                categoria: 'juguete',
                marca: 'Kong',
                precio_compra: 35.00,
                precio_venta: 58.00,
                stock: 14,
                stock_minimo: 6,
                imagen_url: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500'
            },
            {
                codigo: 'JUG002',
                nombre: 'Ratón de Juguete con Catnip',
                descripcion: 'Juguete para gatos relleno de catnip natural. Estimula el instinto de caza y reduce el estrés.',
                categoria: 'juguete',
                marca: 'Catit',
                precio_compra: 12.00,
                precio_venta: 22.00,
                stock: 30,
                stock_minimo: 10,
                imagen_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500'
            },
            {
                codigo: 'ACC003',
                nombre: 'Cama Acolchada para Mascotas',
                descripcion: 'Cama suave y lavable. Base antideslizante. Tamaño mediano (60x45cm). Colores surtidos.',
                categoria: 'accesorio',
                marca: 'PetComfort',
                precio_compra: 65.00,
                precio_venta: 95.00,
                stock: 6,
                stock_minimo: 4,
                imagen_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500'
            },
            {
                codigo: 'ALI003',
                nombre: 'Snacks Dentales para Perros',
                descripcion: 'Premios funcionales que ayudan a limpiar los dientes. Reducen el sarro y refrescan el aliento.',
                categoria: 'alimento',
                marca: 'Pedigree',
                precio_compra: 15.00,
                precio_venta: 28.00,
                stock: 2,
                stock_minimo: 8,
                imagen_url: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500'
            }
        ];

        for (const producto of productos) {
            await pool.execute(`
                INSERT INTO productos (codigo, nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock, stock_minimo, imagen_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    descripcion = VALUES(descripcion),
                    imagen_url = VALUES(imagen_url),
                    stock = VALUES(stock)
            `, [
                producto.codigo,
                producto.nombre,
                producto.descripcion,
                producto.categoria,
                producto.marca,
                producto.precio_compra,
                producto.precio_venta,
                producto.stock,
                producto.stock_minimo,
                producto.imagen_url
            ]);
        }

        console.log(`✅ ${productos.length} productos insertados/actualizados`);
        console.log('🎉 Migración completada exitosamente');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
}

agregarImagenProductos();
