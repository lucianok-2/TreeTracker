-- CUIDADO: Este script eliminará todos los datos existentes en la tabla recepciones
-- Solo usar si no hay datos importantes o como último recurso

-- Crear la tabla de productos si no existe
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'materia_prima', 'producto_terminado', 'subproducto'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar productos base
INSERT INTO productos (codigo, nombre, tipo) VALUES
('W1.1', 'Trozos de pinus radiata', 'materia_prima'),
('W5.2', 'Madera dimensionada pinus radiata', 'producto_terminado'),
('W3.1', 'Astillas pinus radiata', 'subproducto'),
('W3.2', 'Aserrín pinus radiata', 'subproducto')
ON CONFLICT (codigo) DO NOTHING;

-- Eliminar la tabla recepciones existente (CUIDADO: Esto borra todos los datos)
DROP TABLE IF EXISTS recepciones CASCADE;

-- Recrear la tabla recepciones con la estructura correcta
CREATE TABLE recepciones (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_recepcion DATE NOT NULL,
  producto_codigo TEXT REFERENCES productos(codigo) NOT NULL,
  proveedor TEXT NOT NULL,
  num_guia TEXT NOT NULL,
  volumen_m3 DECIMAL(10,3) NOT NULL,
  certificacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_recepciones_user_id ON recepciones(user_id);
CREATE INDEX idx_recepciones_fecha ON recepciones(fecha_recepcion);
CREATE INDEX idx_recepciones_producto_codigo ON recepciones(producto_codigo);

-- Habilitar RLS
ALTER TABLE recepciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Users can view own recepciones" ON recepciones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recepciones" ON recepciones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recepciones" ON recepciones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recepciones" ON recepciones FOR DELETE USING (auth.uid() = user_id);

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recepciones_updated_at 
    BEFORE UPDATE ON recepciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Tabla recepciones recreada exitosamente' as status;