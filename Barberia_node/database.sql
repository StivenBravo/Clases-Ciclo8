-- Base de datos para Barbería
CREATE DATABASE IF NOT EXISTS barberia_db;
USE barberia_db;

CREATE TABLE servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    duracion INT NOT NULL COMMENT 'Duración en minutos',
    imagen VARCHAR(255)
);
CREATE TABLE barberos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    foto VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(100),
    servicio_id INT NOT NULL,
    barbero_id INT NOT NULL,
    fecha_cita DATETIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    comentarios TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    FOREIGN KEY (barbero_id) REFERENCES barberos(id)
);

INSERT INTO servicios (nombre, descripcion, precio, duracion, imagen) VALUES
('Corte Clásico', 'Corte tradicional con tijera y máquina, incluye lavado', 25.00, 30, 'corte-clasico.jpg'),
('Corte + Barba', 'Corte de cabello más arreglo completo de barba', 40.00, 45, 'corte-barba.jpg'),
('Afeitado Premium', 'Afeitado tradicional con navaja, toalla caliente y masaje facial', 30.00, 30, 'afeitado.jpg'),
('Diseño de Barba', 'Perfilado y diseño personalizado de barba', 20.00, 20, 'diseno-barba.jpg'),
('Corte Niño', 'Corte especial para niños hasta 12 años', 18.00, 25, 'corte-nino.jpg'),
('Paquete Completo', 'Corte + Barba + Cejas + Tratamiento capilar', 60.00, 60, 'paquete-completo.jpg');

INSERT INTO barberos (nombre, especialidad, foto, activo) VALUES
('Carlos Mendoza', 'Cortes modernos y clásicos', 'barbero1.jpg', TRUE),
('Miguel Ángel Torres', 'Especialista en barbas', 'barbero2.jpg', TRUE),
('José Ramírez', 'Diseños y degradados', 'barbero3.jpg', TRUE),
('Luis Hernández', 'Cortes clásicos', 'barbero4.jpg', TRUE);

INSERT INTO citas (cliente_nombre, cliente_telefono, cliente_email, servicio_id, barbero_id, fecha_cita, estado) VALUES
('Juan Pérez', '987654321', 'juan@email.com', 2, 1, '2025-11-26 10:00:00', 'confirmada'),
('Pedro García', '912345678', 'pedro@email.com', 1, 2, '2025-11-26 11:00:00', 'pendiente'),
('María López', '998877665', 'maria@email.com', 4, 3, '2025-11-27 15:00:00', 'confirmada');

-- Tabla de productos 
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    marca VARCHAR(50)
);

-- Tabla de horarios disponibles 
CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barbero_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (barbero_id) REFERENCES barberos(id)
);

-- Datos de ejemplo para productos
INSERT INTO productos (nombre, categoria, descripcion, precio, stock, marca) VALUES
('Cera para Cabello Matte', 'Styling', 'Cera con acabado mate, fijación fuerte', 35.00, 15, 'American Crew'),
('Pomada Brillante', 'Styling', 'Pomada con brillo alto, fijación media', 32.00, 20, 'Suavecito'),
('Aceite para Barba', 'Cuidado Barba', 'Aceite nutritivo con aroma a madera', 28.00, 12, 'Beard King'),
('Shampoo 3 en 1', 'Higiene', 'Shampoo, acondicionador y gel de ducha', 25.00, 30, 'Old Spice'),
('Navaja de Afeitar Profesional', 'Herramientas', 'Navaja de acero inoxidable con mango de madera', 85.00, 5, 'Dovo'),
('Bálsamo para Barba', 'Cuidado Barba', 'Bálsamo hidratante y suavizante', 30.00, 18, 'Honest Amish'),
('Gel Fijador Extra Fuerte', 'Styling', 'Gel con fijación extrema, efecto mojado', 22.00, 25, 'Got2b'),
('Toalla Caliente Eléctrica', 'Herramientas', 'Calentador de toallas profesional', 150.00, 3, 'Elite'),
('Colonia After Shave', 'Fragancias', 'Loción refrescante post-afeitado', 38.00, 10, 'Clubman Pinaud');

-- Datos de ejemplo para horarios (próximos 3 días)
INSERT INTO horarios (barbero_id, fecha, hora_inicio, hora_fin, disponible) VALUES
(1, '2025-11-26', '10:00:00', '11:00:00', TRUE),
(1, '2025-11-26', '11:00:00', '12:00:00', FALSE),
(1, '2025-11-26', '14:00:00', '15:00:00', TRUE),
(1, '2025-11-26', '15:00:00', '16:00:00', TRUE),
(1, '2025-11-27', '10:00:00', '11:00:00', TRUE),
(1, '2025-11-27', '11:00:00', '12:00:00', TRUE),
-- Barbero2
(2, '2025-11-26', '10:00:00', '11:00:00', TRUE),
(2, '2025-11-26', '11:00:00', '12:00:00', TRUE),
(2, '2025-11-26', '14:00:00', '15:00:00', FALSE),
(2, '2025-11-27', '10:00:00', '11:00:00', TRUE),
(2, '2025-11-27', '15:00:00', '16:00:00', TRUE),
-- Barbero3
(3, '2025-11-26', '10:00:00', '11:00:00', TRUE),
(3, '2025-11-26', '14:00:00', '15:00:00', TRUE),
(3, '2025-11-27', '10:00:00', '11:00:00', TRUE),
(3, '2025-11-27', '11:00:00', '12:00:00', TRUE);
