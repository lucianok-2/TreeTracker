-- Crear todas las tablas para el sistema completo de balance de materiales TreeTracker

-- Tabla de productos/grupos
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

-- Tabla de recepciones (ya existe, pero la actualizamos)
CREATE TABLE IF NOT EXISTS recepciones (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_recepcion DATE NOT NULL,
  producto_codigo TEXT REFERENCES productos(codigo),
  proveedor TEXT NOT NULL,
  num_guia TEXT NOT NULL,
  volumen_m3 DECIMAL(10,3) NOT NULL,
  certificacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de stock inicial
CREATE TABLE IF NOT EXISTS stock_inicial (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  año INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  producto_codigo TEXT REFERENCES productos(codigo),
  volumen_m3 DECIMAL(10,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, año, mes, producto_codigo)
);

-- Tabla de consumos
CREATE TABLE IF NOT EXISTS consumos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_consumo DATE NOT NULL,
  producto_codigo TEXT REFERENCES productos(codigo),
  volumen_m3 DECIMAL(10,3) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de producción
CREATE TABLE IF NOT EXISTS produccion (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_produccion DATE NOT NULL,
  producto_origen_codigo TEXT REFERENCES productos(codigo),
  producto_destino_codigo TEXT REFERENCES productos(codigo),
  volumen_origen_m3 DECIMAL(10,3) NOT NULL,
  volumen_destino_m3 DECIMAL(10,3) NOT NULL,
  factor_rendimiento DECIMAL(5,2), -- Calculado automáticamente
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_venta DATE NOT NULL,
  producto_codigo TEXT REFERENCES productos(codigo),
  cliente TEXT NOT NULL,
  num_factura TEXT,
  volumen_m3 DECIMAL(10,3) NOT NULL,
  certificacion TEXT NOT NULL,
  precio_unitario DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_recepciones_user_fecha ON recepciones(user_id, fecha_recepcion);
CREATE INDEX IF NOT EXISTS idx_recepciones_producto ON recepciones(producto_codigo);
CREATE INDEX IF NOT EXISTS idx_stock_inicial_user_año_mes ON stock_inicial(user_id, año, mes);
CREATE INDEX IF NOT EXISTS idx_consumos_user_fecha ON consumos(user_id, fecha_consumo);
CREATE INDEX IF NOT EXISTS idx_produccion_user_fecha ON produccion(user_id, fecha_produccion);
CREATE INDEX IF NOT EXISTS idx_ventas_user_fecha ON ventas(user_id, fecha_venta);

-- Habilitar RLS (Row Level Security) para todas las tablas
ALTER TABLE recepciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_inicial ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para recepciones
DROP POLICY IF EXISTS "Users can view own recepciones" ON recepciones;
DROP POLICY IF EXISTS "Users can insert own recepciones" ON recepciones;
DROP POLICY IF EXISTS "Users can update own recepciones" ON recepciones;
DROP POLICY IF EXISTS "Users can delete own recepciones" ON recepciones;

CREATE POLICY "Users can view own recepciones" ON recepciones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recepciones" ON recepciones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recepciones" ON recepciones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recepciones" ON recepciones FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para stock_inicial
CREATE POLICY "Users can view own stock_inicial" ON stock_inicial FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stock_inicial" ON stock_inicial FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock_inicial" ON stock_inicial FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stock_inicial" ON stock_inicial FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para consumos
CREATE POLICY "Users can view own consumos" ON consumos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumos" ON consumos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consumos" ON consumos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own consumos" ON consumos FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para produccion
CREATE POLICY "Users can view own produccion" ON produccion FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own produccion" ON produccion FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own produccion" ON produccion FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own produccion" ON produccion FOR DELETE USING (auth.uid() = user_id);

-- Políticas de seguridad para ventas
CREATE POLICY "Users can view own ventas" ON ventas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ventas" ON ventas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ventas" ON ventas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ventas" ON ventas FOR DELETE USING (auth.uid() = user_id);

-- Función para calcular factor de rendimiento automáticamente
CREATE OR REPLACE FUNCTION calculate_factor_rendimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.volumen_origen_m3 > 0 THEN
        NEW.factor_rendimiento = (NEW.volumen_destino_m3 / NEW.volumen_origen_m3) * 100;
    ELSE
        NEW.factor_rendimiento = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular factor de rendimiento automáticamente
DROP TRIGGER IF EXISTS trigger_calculate_factor_rendimiento ON produccion;
CREATE TRIGGER trigger_calculate_factor_rendimiento
    BEFORE INSERT OR UPDATE ON produccion
    FOR EACH ROW
    EXECUTE FUNCTION calculate_factor_rendimiento();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at en todas las tablas
DROP TRIGGER IF EXISTS update_recepciones_updated_at ON recepciones;
CREATE TRIGGER update_recepciones_updated_at BEFORE UPDATE ON recepciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_inicial_updated_at ON stock_inicial;
CREATE TRIGGER update_stock_inicial_updated_at BEFORE UPDATE ON stock_inicial FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consumos_updated_at ON consumos;
CREATE TRIGGER update_consumos_updated_at BEFORE UPDATE ON consumos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produccion_updated_at ON produccion;
CREATE TRIGGER update_produccion_updated_at BEFORE UPDATE ON produccion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ventas_updated_at ON ventas;
CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar que las tablas se crearon correctamente
SELECT 'Sistema completo de balance de materiales creado exitosamente' as status;