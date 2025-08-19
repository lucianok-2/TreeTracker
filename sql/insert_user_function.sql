-- Script para insertar tu función personalizada en la tabla user_functions

-- Deshabilitar RLS temporalmente para insertar datos
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;

-- Insertar tu función personalizada
INSERT INTO user_functions (user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
VALUES 
(
    '496f6470-2f4d-40c6-9426-bb5421116a3d', -- Tu user ID real
    'Procesador de Recepciones Personalizado',
    'Procesa archivos Excel con columnas NUM_GUIA, NOMBRE_PROVEEDOR, FECHA_RECEPCION, VOLUMEN_M3. Filtra registros con volumen = 0 y usa código de producto W1.1 para todas las recepciones.',
    '496f6470-2f4d-40c6-9426-bb5421116a3d/process_recepciones.py', -- Ruta a tu función personalizada
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id, function_name) DO UPDATE SET
    function_description = EXCLUDED.function_description,
    function_code = EXCLUDED.function_code,
    updated_at = NOW();

-- Volver a habilitar RLS
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;

-- Mostrar tu función creada
SELECT id, user_id, function_name, function_description, function_code, is_active 
FROM user_functions 
WHERE user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d'
ORDER BY id;