-- Función para probar auth.uid() desde el cliente
CREATE OR REPLACE FUNCTION auth_uid_test()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'auth_uid', auth.uid(),
    'current_user', current_user,
    'session_user', session_user,
    'current_timestamp', current_timestamp
  );
$$;