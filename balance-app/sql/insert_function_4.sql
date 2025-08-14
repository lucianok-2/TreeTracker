-- Insertar función ID 4 para ventas generales
INSERT INTO user_functions (
    user_id,
    function_name,
    function_description,
    function_code,
    is_active
) VALUES (
    '496f6470-2f4d-40c6-9426-bb5421116a3d',
    'Procesador de Ventas Generales',
    'Procesa archivos Excel de ventas generales con columnas estándar (fecha_venta, cliente, num_factura, volumen_m3, producto_codigo)',
    'python_function',
    true
);