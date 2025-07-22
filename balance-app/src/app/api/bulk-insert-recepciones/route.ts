import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Crear cliente con service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insert_statements, records } = body;

    if (!insert_statements && !records) {
      return NextResponse.json(
        { error: 'Se requieren insert_statements o records' },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    const errors: string[] = [];

    // Obtener el usuario autenticado real desde el request
    const authHeader = request.headers.get('authorization');
    let authenticatedUserId = null;
    
    if (authHeader) {
      try {
        // Crear cliente con el token del usuario autenticado
        const userSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: authHeader
              }
            }
          }
        );
        
        const { data: { user } } = await userSupabase.auth.getUser();
        if (user) {
          authenticatedUserId = user.id;
          console.log(`✅ Usuario autenticado encontrado: ${authenticatedUserId}`);
        }
      } catch (authError) {
        console.log('⚠️ Error obteniendo usuario autenticado:', authError);
      }
    }
    
    // IMPORTANTE: Usar SIEMPRE el usuario autenticado para mantener separación
    const validUserId = authenticatedUserId;
    
    if (!validUserId) {
      console.error('❌ No se pudo obtener usuario autenticado');
      return NextResponse.json(
        { error: 'Usuario no autenticado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }
    
    console.log(`✅ Usando user_id del usuario autenticado: ${validUserId}`);

    if (insert_statements && Array.isArray(insert_statements)) {
      console.log(`🔄 Procesando ${insert_statements.length} INSERT statements...`);
      
      const parsedRecords = [];
      
      for (const statement of insert_statements) {
        try {
          // Extraer valores del INSERT statement usando regex
          const match = statement.match(/VALUES \('([^']+)', '([^']+)', '([^']+)', '([^']+)', ([^,]+), '([^']+)'\)/);
          if (match) {
            parsedRecords.push({
              fecha_recepcion: match[1],
              producto_codigo: match[2],
              proveedor: match[3].replace(/''/g, "'"), // Desescapar comillas
              num_guia: match[4],
              volumen_m3: parseFloat(match[5]),
              certificacion: match[6].replace(/''/g, "'"), // Desescapar comillas
              user_id: validUserId
            });
          }
        } catch (parseError) {
          errors.push(`Error parseando statement: ${parseError}`);
        }
      }

      if (parsedRecords.length > 0) {
        console.log(`🔄 Insertando ${parsedRecords.length} registros...`);
        console.log('📋 Primer registro de ejemplo:', parsedRecords[0]);

        // DEBUGGING: Mostrar el SQL completo que se va a ejecutar
        console.log('🔍 DEBUGGING - SQL COMPLETO:');
        console.log('='.repeat(80));
        
        // Generar el SQL INSERT completo para debugging
        const recordsWithAuthUser = parsedRecords.map(record => ({
          fecha_recepcion: record.fecha_recepcion,
          producto_codigo: record.producto_codigo,
          proveedor: record.proveedor,
          num_guia: record.num_guia,
          volumen_m3: record.volumen_m3,
          certificacion: record.certificacion,
          user_id: validUserId // SIEMPRE usar el usuario autenticado, NUNCA NULL
          // NO incluir 'id' - se auto-genera
          // NO incluir 'created_at' - se auto-genera
          // NO incluir 'updated_at' - se auto-genera
        }));

        // VERIFICACIÓN CRÍTICA: Asegurar que TODOS los registros tienen user_id válido
        const recordsWithoutUserId = recordsWithAuthUser.filter(r => !r.user_id || r.user_id === null || r.user_id === undefined);
        if (recordsWithoutUserId.length > 0) {
          console.error('❌ REGISTROS SIN USER_ID DETECTADOS:', recordsWithoutUserId.length);
          console.error('❌ Registros problemáticos:', recordsWithoutUserId);
          return NextResponse.json(
            { 
              error: 'Error crítico: Algunos registros no tienen user_id asignado', 
              details: `${recordsWithoutUserId.length} registros sin user_id`,
              problematic_records: recordsWithoutUserId.length
            },
            { status: 400 }
          );
        }
        
        // VERIFICACIÓN ADICIONAL: Validar que el user_id es un UUID válido
        const invalidUserIds = recordsWithAuthUser.filter(r => {
          const userId = r.user_id;
          return !userId || typeof userId !== 'string' || userId.length !== 36 || !userId.includes('-');
        });
        
        if (invalidUserIds.length > 0) {
          console.error('❌ USER_IDS INVÁLIDOS DETECTADOS:', invalidUserIds.length);
          return NextResponse.json(
            { 
              error: 'Error crítico: Algunos registros tienen user_id inválido', 
              details: `${invalidUserIds.length} registros con user_id inválido`
            },
            { status: 400 }
          );
        }
        
        console.log(`✅ VERIFICACIÓN COMPLETA: TODOS LOS ${recordsWithAuthUser.length} REGISTROS TIENEN USER_ID VÁLIDO: ${validUserId}`);
        console.log(`✅ FORMATO USER_ID VERIFICADO: ${validUserId} (${validUserId.length} caracteres)`);

        // Mostrar el SQL INSERT que se generaría
        const sqlInsertExample = `
INSERT INTO recepciones (fecha_recepcion, producto_codigo, proveedor, num_guia, volumen_m3, certificacion, user_id)
VALUES 
${recordsWithAuthUser.slice(0, 3).map(record => 
  `  ('${record.fecha_recepcion}', '${record.producto_codigo}', '${record.proveedor.replace(/'/g, "''")}', '${record.num_guia}', ${record.volumen_m3}, '${record.certificacion.replace(/'/g, "''")}', '${record.user_id}')`
).join(',\n')}
${recordsWithAuthUser.length > 3 ? `... y ${recordsWithAuthUser.length - 3} registros más` : ''};
        `;
        
        console.log('📝 SQL INSERT que se ejecutará:');
        console.log(sqlInsertExample);
        console.log('='.repeat(80));
        
        // Información adicional para debugging
        console.log('🔍 INFORMACIÓN DE DEBUGGING:');
        console.log(`- Total de registros: ${recordsWithAuthUser.length}`);
        console.log(`- Usuario autenticado: ${validUserId}`);
        console.log(`- Primer registro completo:`, JSON.stringify(recordsWithAuthUser[0], null, 2));
        console.log(`- Último registro completo:`, JSON.stringify(recordsWithAuthUser[recordsWithAuthUser.length - 1], null, 2));
        console.log('='.repeat(80));

        // USAR EXACTAMENTE EL MISMO MÉTODO QUE FUNCIONA EN EL DIAGNÓSTICO
        console.log('🔧 USANDO MÉTODO IDÉNTICO AL DIAGNÓSTICO EXITOSO');
        const userSupabase = supabase; // Usar service role key directo como en el diagnóstico

        // DEBUGGING: Verificar el contexto de autenticación antes de insertar
        console.log('🔍 VERIFICANDO CONTEXTO DE AUTENTICACIÓN:');
        try {
          const { data: { user: currentUser } } = await userSupabase.auth.getUser();
          console.log('- Usuario actual en el contexto:', currentUser?.id || 'NO AUTENTICADO');
          console.log('- Email del usuario:', currentUser?.email || 'NO DISPONIBLE');
          console.log('- Rol del usuario:', currentUser?.role || 'NO DISPONIBLE');
        } catch (authCheckError) {
          console.log('- Error verificando usuario:', authCheckError);
        }

        // DEBUGGING: Verificar políticas RLS activas
        console.log('🔍 VERIFICANDO POLÍTICAS RLS:');
        try {
          const { data: policies } = await supabase.rpc('exec_sql', { 
            sql: `SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'recepciones' AND cmd = 'INSERT';`
          });
          console.log('- Políticas INSERT activas:', policies);
        } catch (policyError) {
          console.log('- Error obteniendo políticas:', policyError);
        }

        try {
          console.log('🚀 EJECUTANDO INSERCIÓN MASIVA...');
          const { data, error } = await userSupabase
            .from('recepciones')
            .insert(recordsWithAuthUser)
            .select();

          console.log('📊 RESULTADO DE INSERCIÓN MASIVA:');
          console.log('- Error:', error);
          console.log('- Data length:', data?.length || 0);
          console.log('- Error code:', error?.code);
          console.log('- Error details:', error?.details);
          console.log('- Error hint:', error?.hint);
          console.log('- Error message completo:', error?.message);

          if (!error && data) {
            insertedCount = data.length;
            console.log(`✅ Inserción masiva exitosa con usuario autenticado: ${insertedCount} registros`);
          } else {
            throw new Error(`Inserción masiva falló: ${error?.message} (Code: ${error?.code})`);
          }
        } catch (massInsertError) {
          console.log('⚠️ Inserción masiva falló, intentando inserción individual...');
          
          // Fallback: Inserción individual
          let successCount = 0;
          
          for (const record of recordsWithAuthUser) {
            try {
              console.log(`📝 Insertando registro: ${record.num_guia}`);
              
              const { data: singleData, error: singleError } = await userSupabase
                .from('recepciones')
                .insert([record])
                .select();

              if (!singleError && singleData) {
                successCount++;
                console.log(`✅ Registro ${record.num_guia} insertado exitosamente`);
              } else {
                console.error(`❌ Error insertando registro ${record.num_guia}:`, singleError);
                errors.push(`Error insertando registro ${record.num_guia}: ${singleError?.message || 'Error desconocido'}`);
              }
            } catch (singleInsertError) {
              console.error(`❌ Excepción insertando registro ${record.num_guia}:`, singleInsertError);
              errors.push(`Excepción insertando registro ${record.num_guia}: ${singleInsertError}`);
            }
          }
          
          insertedCount = successCount;
          console.log(`✅ Inserción individual completada: ${successCount}/${parsedRecords.length} registros`);
        }
      }

    } else if (records && Array.isArray(records)) {
      console.log(`🔄 Insertando ${records.length} registros directamente...`);
      
      const recordsToInsert = records.map(record => ({
        fecha_recepcion: record.fecha_recepcion,
        producto_codigo: record.producto_codigo,
        proveedor: record.proveedor,
        num_guia: record.num_guia,
        volumen_m3: record.volumen_m3,
        certificacion: record.certificacion,
        user_id: validUserId // Usar el user_id válido
      }));

      console.log('🔧 INSERTANDO DIRECTAMENTE CON SUPABASE CLIENT (SIN FUNCIÓN)');
      console.log('📋 Primer registro a insertar:', recordsToInsert[0]);

      const { data, error } = await supabase
        .from('recepciones')
        .insert(recordsToInsert)
        .select();

      console.log('📊 RESULTADO INSERCIÓN DIRECTA:');
      console.log('- Error:', error);
      console.log('- Data length:', data?.length || 0);
      console.log('- Error completo:', JSON.stringify(error, null, 2));

      if (error) {
        console.error('❌ Error insertando registros:', error);
        return NextResponse.json(
          { error: 'Error insertando registros', details: error.message },
          { status: 500 }
        );
      }

      insertedCount = data?.length || 0;
    }

    console.log(`✅ Inserción completada: ${insertedCount} registros insertados`);

    return NextResponse.json({
      success: true,
      message: errors.length > 0 
        ? `Se insertaron ${insertedCount} registros con ${errors.length} errores`
        : `Se insertaron ${insertedCount} registros exitosamente`,
      inserted_count: insertedCount,
      errors: errors
    });

  } catch (error) {
    console.error('❌ Error en bulk-insert-recepciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}