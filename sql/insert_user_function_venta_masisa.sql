-- Script para insertar la función de procesamiento de ventas MASISA (ID = 3)
-- Para el usuario 496f6470-2f4d-40c6-9426-bb5421116a3d

-- Deshabilitar RLS temporalmente para insertar datos
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;

-- Insertar la función de ventas MASISA con ID específico = 3
INSERT INTO user_functions (id, user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
VALUES 
(
    3, -- ID específico solicitado
    '496f6470-2f4d-40c6-9426-bb5421116a3d', -- User ID específico
    'PROCESAR VENTA ASTILLA MASISA',
    'Procesa archivos XLS de ventas MASISA. Lee columnas: "Fecha contabiliz." (formato numérico YYYYMMDD), "Guía Flete", "Descripción Material", "Recepción". Identifica productos: "MATERIAL VERDE VALOR. COMB. COGENERACION" → W3.2 (aserrín), "ASTILLA VERDE (TS)" → W3.1 (astilla con conversión (Recepción/1000)*2,54).',
    '496f6470-2f4d-40c6-9426-bb5421116a3d/process_venta_astilla_masisa.py', -- Ruta a la función
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    function_name = EXCLUDED.function_name,
    function_description = EXCLUDED.function_description,
    function_code = EXCLUDED.function_code,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Volver a habilitar RLS
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;

-- Mostrar la función creada
SELECT id, user_id, function_name, function_description, function_code, is_active 
FROM user_functions 
WHERE id = 3 AND user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d'
ORDER BY id;

-- Verificar todas las funciones del usuario
SELECT id, function_name, is_active, created_at
FROM user_functions 
WHERE user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d'
ORDER BY id;