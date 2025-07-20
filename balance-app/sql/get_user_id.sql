-- Script para obtener tu ID de usuario de Supabase
-- Ejecuta este script primero para obtener tu user_id

SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;