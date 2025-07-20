-- Script para corregir las políticas RLS de las tablas user_functions, document_processing_history y recepciones

-- Deshabilitar RLS temporalmente para permitir operaciones
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE recepciones DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own functions" ON user_functions;
DROP POLICY IF EXISTS "Users can insert their own functions" ON user_functions;
DROP POLICY IF EXISTS "Users can update their own functions" ON user_functions;
DROP POLICY IF EXISTS "Users can delete their own functions" ON user_functions;

DROP POLICY IF EXISTS "Users can view their own processing history" ON document_processing_history;
DROP POLICY IF EXISTS "Users can insert their own processing history" ON document_processing_history;

-- Eliminar políticas existentes de recepciones si existen
DROP POLICY IF EXISTS "Users can view their own recepciones" ON recepciones;
DROP POLICY IF EXISTS "Users can insert their own recepciones" ON recepciones;
DROP POLICY IF EXISTS "Users can update their own recepciones" ON recepciones;
DROP POLICY IF EXISTS "Users can delete their own recepciones" ON recepciones;

-- Crear políticas más permisivas para desarrollo
-- Política para user_functions: permitir todas las operaciones
CREATE POLICY "Allow all operations on user_functions" ON user_functions
    FOR ALL USING (true) WITH CHECK (true);

-- Política para document_processing_history: permitir todas las operaciones  
CREATE POLICY "Allow all operations on document_processing_history" ON document_processing_history
    FOR ALL USING (true) WITH CHECK (true);

-- Política para recepciones: permitir todas las operaciones
CREATE POLICY "Allow all operations on recepciones" ON recepciones
    FOR ALL USING (true) WITH CHECK (true);

-- Volver a habilitar RLS
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recepciones ENABLE ROW LEVEL SECURITY;

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('user_functions', 'document_processing_history', 'recepciones');