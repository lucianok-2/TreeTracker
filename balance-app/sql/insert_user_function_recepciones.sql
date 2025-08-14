-- Insertar función personalizada de recepciones para el usuario específico
INSERT INTO user_functions (
    user_id,
    function_name,
    function_description,
    function_code,
    is_active,
    created_at,
    updated_at
) VALUES (
    '496f6470-2f4d-40c6-9426-bb5421116a3d',
    'Procesador de Recepciones Personalizado',
    'Procesa archivos Excel con columnas NUM_GUIA, NOMBRE_PROVEEDOR, FECHA_RECEPCION, VOLUMEN_M3. Filtra registros con volumen = 0 y usa código de producto W1.1',
    'process_recepciones_custom',
    true,
    NOW(),
    NOW()
);

-- Verificar que se insertó correctamente
SELECT * FROM user_functions WHERE user_id = '496f6470-2f4d-40c6-9426-bb5421116a3d';