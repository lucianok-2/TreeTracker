-- Script para insertar la función de procesamiento ARAUCO en la tabla user_functions

-- Deshabilitar RLS temporalmente para insertar datos
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;

-- Insertar la función de procesamiento ARAUCO
INSERT INTO user_functions (user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
VALUES 
(
    '496f6470-2f4d-40c6-9426-bb5421116a3d', -- Tu user ID real
    'Procesador de Proforma ARAUCO',
    'Procesa archivos Excel de proforma ARAUCO. Mapea FCH_RECEPCION→fecha_venta, NUM_GUIA_SERIE_C→num_factura, VOLUMEN_M3_RECEPCION→volumen_m3. COD_ADICIONAL: ASCM→W3.2, ASTI→W3.1. Cliente fijo ARAUCO, certificación Material Controlado.',
    '496f6470-2f4d-40c6-9426-bb5421116a3d/process_ventas_arauco.py', -- Ruta a tu función personalizada
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

-- Mostrar todas las funciones del usuario
SELECT id, user_id, function_name, function_description, function_code, is_active 
FROM user_functions 
WHERE user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d'
ORDER BY id;