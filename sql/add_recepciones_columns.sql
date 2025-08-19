-- Agregar columnas adicionales a la tabla recepciones

-- Agregar las nuevas columnas si no existen
ALTER TABLE recepciones 
ADD COLUMN IF NOT EXISTS rol TEXT,
ADD COLUMN IF NOT EXISTS comuna TEXT,
ADD COLUMN IF NOT EXISTS origen TEXT;

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_recepciones_rol ON recepciones(rol);
CREATE INDEX IF NOT EXISTS idx_recepciones_comuna ON recepciones(comuna);
CREATE INDEX IF NOT EXISTS idx_recepciones_origen ON recepciones(origen);

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'recepciones' 
ORDER BY ordinal_position;