-- Script para inicializar las funciones Python en la base de datos
-- Ejecutar este script después de crear las tablas user_functions y document_processing_history

-- Deshabilitar RLS temporalmente para insertar datos
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;

-- Insertar las funciones disponibles
INSERT INTO user_functions (id, user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
VALUES 
(
    1,
    '11111111-1111-1111-1111-111111111111', -- UUID temporal - cambiar por tu user ID real
    'Procesador de Reportes de Ingreso',
    'Procesa archivos Excel de reportes de ingreso de planta y los carga automáticamente a la tabla de recepciones. Maneja múltiples hojas (meses) y valida los datos antes de la inserción.',
    'process_ingresos.py',
    true,
    NOW(),
    NOW()
),
(
    2,
    '11111111-1111-1111-1111-111111111111', -- UUID temporal - cambiar por tu user ID real
    'Procesador de Ventas',
    'Procesa archivos Excel de reportes de ventas y los carga automáticamente a la tabla de ventas. Calcula totales automáticamente y valida precios y cantidades.',
    'process_ventas.py',
    true,
    NOW(),
    NOW()
),
(
    3,
    '11111111-1111-1111-1111-111111111111', -- UUID temporal - cambiar por tu user ID real
    'Procesador de Inventario',
    'Procesa archivos Excel de inventario y actualiza el stock actual. Determina automáticamente el estado del stock (NORMAL, BAJO, CRITICO) basado en stock mínimo.',
    'process_inventario.py',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    function_name = EXCLUDED.function_name,
    function_description = EXCLUDED.function_description,
    function_code = EXCLUDED.function_code,
    updated_at = NOW();

-- Volver a habilitar RLS
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;

-- Mostrar las funciones creadas
SELECT id, function_name, function_description, is_active 
FROM user_functions 
ORDER BY id;