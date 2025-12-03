-- Base de datos para Sistema de Gestión de Veterinaria
-- MySQL Database

CREATE DATABASE IF NOT EXISTS veterinaria_db;
USE veterinaria_db;

-- Tabla de Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100),
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    INDEX idx_dni (dni)
);

-- Tabla de Mascotas
CREATE TABLE mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    especie ENUM('perro', 'gato', 'ave', 'roedor', 'reptil', 'otro') NOT NULL,
    raza VARCHAR(50),
    fecha_nacimiento DATE,
    sexo ENUM('macho', 'hembra') NOT NULL,
    color VARCHAR(50),
    peso DECIMAL(5,2),
    observaciones TEXT,
    estado ENUM('activo', 'inactivo', 'fallecido') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id)
);

-- Tabla de Trabajadores
CREATE TABLE trabajadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cargo ENUM('veterinario', 'asistente', 'recepcionista', 'administrador') NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(15),
    email VARCHAR(100),
    fecha_contratacion DATE NOT NULL,
    salario DECIMAL(10,2),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    INDEX idx_cargo (cargo)
);

-- Tabla de Citas
CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    fecha_cita DATETIME NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    tipo ENUM('consulta', 'vacunacion', 'cirugia', 'control', 'emergencia') NOT NULL,
    estado ENUM('reserva', 'atendida', 'cancelada') DEFAULT 'reserva',
    observaciones TEXT,
    costo DECIMAL(10,2),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_id) REFERENCES trabajadores(id),
    INDEX idx_fecha (fecha_cita),
    INDEX idx_estado (estado)
);

-- Tabla de Tratamientos
CREATE TABLE tratamientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT NOT NULL,
    mascota_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    diagnostico TEXT NOT NULL,
    tratamiento TEXT NOT NULL,
    medicamentos TEXT,
    indicaciones TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    costo DECIMAL(10,2),
    estado ENUM('en_curso', 'completado', 'suspendido') DEFAULT 'en_curso',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cita_id) REFERENCES citas(id),
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_id) REFERENCES trabajadores(id),
    INDEX idx_mascota (mascota_id)
);

-- Tabla de Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria ENUM('alimento', 'medicamento', 'accesorio', 'higiene', 'juguete', 'otro') NOT NULL,
    marca VARCHAR(50),
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    estado ENUM('disponible', 'agotado', 'descontinuado') DEFAULT 'disponible',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_stock (stock)
);

-- Tabla de Ventas
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    trabajador_id INT NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    igv DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') NOT NULL,
    estado ENUM('completada', 'cancelada') DEFAULT 'completada',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
    INDEX idx_fecha (fecha_venta)
);

-- Tabla de Detalle de Ventas
CREATE TABLE detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Datos de ejemplo
INSERT INTO trabajadores (dni, nombres, apellidos, cargo, especialidad, telefono, email, fecha_contratacion, salario) VALUES
('12345678', 'Carlos', 'Mendoza Ruiz', 'veterinario', 'Medicina General', '987654321', 'cmendoza@vet.com', '2023-01-15', 3500.00),
('87654321', 'Ana', 'García López', 'veterinario', 'Cirugía', '987654322', 'agarcia@vet.com', '2023-02-01', 4000.00),
('11223344', 'Luis', 'Torres Vega', 'asistente', NULL, '987654323', 'ltorres@vet.com', '2023-03-10', 1500.00),
('44332211', 'María', 'Salazar Díaz', 'recepcionista', NULL, '987654324', 'msalazar@vet.com', '2023-01-20', 1200.00);

INSERT INTO productos (codigo, nombre, descripcion, categoria, marca, precio_compra, precio_venta, stock, stock_minimo) VALUES
('PROD001', 'Alimento Premium Adulto', 'Alimento para perros adultos 15kg', 'alimento', 'Ricocan', 80.00, 120.00, 50, 10),
('PROD002', 'Vacuna Sextuple', 'Vacuna para cachorros', 'medicamento', 'Zoetis', 25.00, 45.00, 30, 5),
('PROD003', 'Collar Antipulgas', 'Collar antipulgas y garrapatas', 'accesorio', 'Bayer', 15.00, 30.00, 40, 8),
('PROD004', 'Shampoo Medicado', 'Shampoo para perros con piel sensible', 'higiene', 'PetCare', 12.00, 25.00, 25, 5),
('PROD005', 'Pelota Interactiva', 'Juguete para mascotas', 'juguete', 'Kong', 8.00, 18.00, 60, 10);
