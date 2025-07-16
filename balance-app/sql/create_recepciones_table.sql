-- Crear tabla recepciones para TreeTracker
CREATE TABLE IF NOT EXISTS recepciones (
  id SERIAL PRIMARY KEY,
  fecha_recepcion DATE NOT NULL,
  proveedor TEXT NOT NULL,
  num_guia TEXT NOT NULL,
  volumen_m3 DECIMAL(10,3) NOT NULL,
  certificacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_recepciones_fecha ON recepciones(fecha_recepcion);
CREATE INDEX IF NOT EXISTS idx_recepciones_certificacion ON recepciones(certificacion);
CREATE INDEX IF NOT EXISTS idx_recepciones_proveedor ON recepciones(proveedor);

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

-- Insertar datos de ejemplo (opcional)
INSERT INTO recepciones (fecha_recepcion, proveedor, num_guia, volumen_m3, certificacion) VALUES
('2025-01-15', 'Forestal Los Pinos SPA', 'GR-2025-001', 25.500, 'FSC 100%'),
('2025-01-14', 'Maderas del Sur LTDA', 'GR-2025-002', 18.750, 'FSC Mixto'),
('2025-01-13', 'Bosques Nativos SPA', 'GR-2025-003', 32.100, 'Material Controlado')
ON CONFLICT DO NOTHING;

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla recepciones creada exitosamente' as status;