-- Script simple para deshabilitar RLS durante desarrollo
-- IMPORTANTE: Solo para desarrollo, no usar en producción

-- Deshabilitar RLS en las tablas problemáticas
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_history DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_functions', 'document_processing_history');