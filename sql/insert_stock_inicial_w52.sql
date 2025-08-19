-- Script para insertar el stock inicial de W5.2 (Madera) para enero
-- Reemplaza 'tu-user-id-aqui' con tu ID de usuario real

-- Insertar stock inicial de W5.2 para enero con valor 248.3
INSERT INTO stock_inicial (user_id, año, mes, producto_codigo, volumen_m3)
VALUES (
  'tu-user-id-aqui', -- Reemplaza con tu user_id real
  2024, -- Año
  1,    -- Enero
  'W5.2', -- Código del producto (Madera dimensionada pinus radiata)
  248.3   -- Volumen inicial
)
ON CONFLICT (user_id, año, mes, producto_codigo) 
DO UPDATE SET volumen_m3 = EXCLUDED.volumen_m3;

-- Para verificar que se insertó correctamente:
-- SELECT * FROM stock_inicial WHERE producto_codigo = 'W5.2' AND mes = 1 AND año = 2024;