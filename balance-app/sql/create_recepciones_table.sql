-- Crear tabla recepciones para TreeTracker con autenticación
CREATE TABLE IF NOT EXISTS recepciones (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_recepcion DATE NOT NULL,
  proveedor TEXT NOT NULL,
  num_guia TEXT NOT NULL,
  volumen_m3 DECIMAL(10,3) NOT NULL,
  certificacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_recepciones_user_id ON recepciones(user_id);
CREATE INDEX IF NOT EXISTS idx_recepciones_fecha ON recepciones(fecha_recepcion);
CREATE INDEX IF NOT EXISTS idx_recepciones_certificacion ON recepciones(certificacion);
CREATE INDEX IF NOT EXISTS idx_recepciones_proveedor ON recepciones(proveedor);

-- Habilitar RLS (Row Level Security)
ALTER TABLE recepciones ENABLE ROW LEVEL SECURITY;

-- Crear política para que los usuarios solo vean sus propios registros
CREATE POLICY "Users can view own recepciones" ON recepciones
    FOR SELECT USING (auth.uid() = user_id);

-- Crear política para que los usuarios solo puedan insertar sus propios registros
CREATE POLICY "Users can insert own recepciones" ON recepciones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crear política para que los usuarios solo puedan actualizar sus propios registros
CREATE POLICY "Users can update own recepciones" ON recepciones
    FOR UPDATE USING (auth.uid() = user_id);

-- Crear política para que los usuarios solo puedan eliminar sus propios registros
CREATE POLICY "Users can delete own recepciones" ON recepciones
    FOR DELETE USING (auth.uid() = user_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_recepciones_updated_at ON recepciones;
CREATE TRIGGER update_recepciones_updated_at
    BEFORE UPDATE ON recepciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla recepciones con autenticación creada exitosamente' as status;