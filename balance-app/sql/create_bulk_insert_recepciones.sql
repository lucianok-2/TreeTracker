-- Stored procedure para insertar múltiples recepciones de forma masiva
-- Este procedure recibe un array de registros y los inserta en la tabla recepciones

CREATE OR REPLACE FUNCTION bulk_insert_recepciones(
    p_recepciones JSONB
)
RETURNS TABLE(
    inserted_count INTEGER,
    success BOOLEAN,
    message TEXT,
    errors TEXT[]
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_record JSONB;
    v_inserted_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_error_msg TEXT;
BEGIN
    -- Iterar sobre cada registro en el JSON
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_recepciones)
    LOOP
        BEGIN
            -- Insertar cada registro
            INSERT INTO recepciones (
                fecha_recepcion,
                producto_codigo,
                proveedor,
                num_guia,
                volumen_m3,
                certificacion,
                user_id
            ) VALUES (
                (v_record->>'fecha_recepcion')::timestamp,
                v_record->>'producto_codigo',
                v_record->>'proveedor',
                v_record->>'num_guia',
                (v_record->>'volumen_m3')::numeric,
                v_record->>'certificacion',
                1 -- Usuario por defecto, se puede parametrizar
            );
            
            v_inserted_count := v_inserted_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Capturar errores individuales y continuar
            v_error_msg := 'Error insertando registro ' || (v_record->>'num_guia') || ': ' || SQLERRM;
            v_errors := array_append(v_errors, v_error_msg);
        END;
    END LOOP;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        v_inserted_count,
        CASE WHEN array_length(v_errors, 1) IS NULL THEN true ELSE false END,
        CASE 
            WHEN array_length(v_errors, 1) IS NULL THEN 
                'Se insertaron ' || v_inserted_count || ' registros exitosamente'
            ELSE 
                'Se insertaron ' || v_inserted_count || ' registros con ' || array_length(v_errors, 1) || ' errores'
        END,
        v_errors;
END;
$$;

-- Función auxiliar para insertar recepciones desde INSERT statements
CREATE OR REPLACE FUNCTION execute_insert_statements(
    p_statements TEXT[]
)
RETURNS TABLE(
    executed_count INTEGER,
    success BOOLEAN,
    message TEXT,
    errors TEXT[]
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_statement TEXT;
    v_executed_count INTEGER := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_error_msg TEXT;
BEGIN
    -- Iterar sobre cada statement
    FOREACH v_statement IN ARRAY p_statements
    LOOP
        BEGIN
            -- Ejecutar cada INSERT statement
            EXECUTE v_statement;
            v_executed_count := v_executed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Capturar errores individuales y continuar
            v_error_msg := 'Error ejecutando statement: ' || SQLERRM;
            v_errors := array_append(v_errors, v_error_msg);
        END;
    END LOOP;
    
    -- Retornar resultados
    RETURN QUERY SELECT 
        v_executed_count,
        CASE WHEN array_length(v_errors, 1) IS NULL THEN true ELSE false END,
        CASE 
            WHEN array_length(v_errors, 1) IS NULL THEN 
                'Se ejecutaron ' || v_executed_count || ' statements exitosamente'
            ELSE 
                'Se ejecutaron ' || v_executed_count || ' statements con ' || array_length(v_errors, 1) || ' errores'
        END,
        v_errors;
END;
$$;