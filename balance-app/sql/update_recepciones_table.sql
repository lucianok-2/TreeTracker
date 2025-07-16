-- Actualizar tabla recepciones existente para añadir la columna producto_codigo

-- Primero, crear la tabla de productos si no existe
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'materia_prima', 'producto_terminado', 'subproducto'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar productos base si no existen
INSERT INTO productos (codigo, nombre, tipo) VALUES
('W1.1', 'Trozos de pinus radiata', 'materia_prima'),
('W5.2', 'Madera dimensionada pinus radiata', 'producto_terminado'),
('W3.1', 'Astillas pinus radiata', 'subproducto'),
('W3.2', 'Aserrín pinus radiata', 'subproducto')
ON CONFLICT (codigo) DO NOTHING;

-- Añadir la columna producto_codigo a la tabla recepciones si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recepciones' 
        AND column_name = 'producto_codigo'
    ) THEN
        ALTER TABLE recepciones ADD COLUMN producto_codigo TEXT REFERENCES productos(codigo);
        
        -- Establecer un valor por defecto para registros existentes
        UPDATE recepciones SET producto_codigo = 'W1.1' WHERE producto_codigo IS NULL;
        
        -- Hacer la columna NOT NULL después de establecer valores
        ALTER TABLE recepciones ALTER COLUMN producto_codigo SET NOT NULL;
    END IF;
END $$;

-- Crear índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_recepciones_producto_codigo ON recepciones(producto_codigo);

-- Verificar la estructura actualizada
SELECT 'Tabla recepciones actualizada exitosamente' as status;

-- Mostrar la estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'recepciones' 
ORDER BY ordinal_position;