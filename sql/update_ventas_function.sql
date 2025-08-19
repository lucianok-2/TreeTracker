-- Script para actualizar la función de ventas generales al nuevo nombre

-- Deshabilitar RLS temporalmente para actualizar datos
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;

-- Actualizar la función de ventas generales al nuevo nombre
UPDATE user_functions 
SET 
    function_name = 'Procesador de Ventas MASISA',
    function_description = 'Procesa archivos Excel de ventas MASISA con certificación Material Controlado y multiplicador 2.54 para ASTILLA VERDE (TS)',
    function_code = '496f6470-2f4d-40c6-9426-bb5421116a3d/process_ventas_masisa.py',
    updated_at = NOW()
WHERE 
    user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d' 
    AND (function_name LIKE '%Ventas Generales%' OR function_code LIKE '%process_ventas_generales.py%');

-- Si no existe, insertarla
INSERT INTO user_functions (user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
SELECT 
    '496f6470-2f4d-40c6-9426-bb5421116a3d',
    'Procesador de Ventas MASISA',
    'Procesa archivos Excel de ventas MASISA con certificación Material Controlado y multiplicador 2.54 para ASTILLA VERDE (TS)',
    '496f6470-2f4d-40c6-9426-bb5421116a3d/process_ventas_masisa.py',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user_functions 
    WHERE user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d' 
    AND function_code = '496f6470-2f4d-40c6-9426-bb5421116a3d/process_ventas_masisa.py'
);

-- Volver a habilitar RLS
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;

-- Mostrar todas las funciones actualizadas
SELECT id, user_id, function_name, function_description, function_code, is_active 
FROM user_functions 
WHERE user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d'
ORDER BY id;