import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando diagnóstico de Supabase...');

    // Crear cliente con service role key
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Crear cliente con anon key para comparar
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const results = {
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_role_key_preview: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50) + '...'
      },
      tests: []
    };

    // Test 1: Verificar conexión básica con service role
    try {
      const { data, error } = await supabaseServiceRole
        .from('recepciones')
        .select('count(*)', { count: 'exact', head: true });
      
      results.tests.push({
        name: 'Conexión con Service Role Key',
        success: !error,
        data: data,
        error: error?.message,
        details: 'Verificar si podemos conectar y contar registros'
      });
    } catch (e) {
      results.tests.push({
        name: 'Conexión con Service Role Key',
        success: false,
        error: e instanceof Error ? e.message : 'Error desconocido',
        details: 'Error en la conexión básica'
      });
    }

    // Test 2: Verificar si podemos leer registros existentes
    try {
      const { data, error } = await supabaseServiceRole
        .from('recepciones')
        .select('*')
        .limit(1);
      
      results.tests.push({
        name: 'Lectura de Registros',
        success: !error,
        data: data ? `${data.length} registros encontrados` : null,
        error: error?.message,
        details: 'Verificar si podemos leer registros existentes'
      });
    } catch (e) {
      results.tests.push({
        name: 'Lectura de Registros',
        success: false,
        error: e instanceof Error ? e.message : 'Error desconocido',
        details: 'Error en la lectura de registros'
      });
    }

    // Test 4: Investigar la estructura de la tabla y obtener user_id válido
    let validUserId = null;
    let tableInfo = null;
    
    try {
      // Primero, obtener información completa del registro existente
      const { data: existingRecords, error: readError } = await supabaseServiceRole
        .from('recepciones')
        .select('*')
        .limit(1);

      tableInfo = {
        recordsFound: existingRecords?.length || 0,
        sampleRecord: existingRecords?.[0] || null,
        readError: readError?.message || null
      };

      if (existingRecords && existingRecords.length > 0) {
        const record = existingRecords[0];
        validUserId = record.user_id;
        
        // Si user_id es null, intentar crear uno válido
        if (!validUserId) {
          // Intentar obtener usuarios de auth.users si es posible
          try {
            const { data: authUsers } = await supabaseServiceRole.auth.admin.listUsers();
            if (authUsers.users && authUsers.users.length > 0) {
              validUserId = authUsers.users[0].id;
            }
          } catch (authError) {
            console.log('No se pudo acceder a auth.users:', authError);
          }
        }
      }

      results.tests.push({
        name: 'Investigar Tabla Recepciones',
        success: true,
        data: tableInfo,
        details: 'Obtener información completa de la tabla recepciones'
      });

      results.tests.push({
        name: 'Obtener User ID Válido',
        success: !!validUserId,
        data: validUserId ? `User ID encontrado: ${validUserId}` : 'No se encontró user_id válido',
        error: !validUserId ? 'Los registros existentes tienen user_id NULL o no hay usuarios en el sistema' : undefined,
        details: 'Obtener un user_id válido de registros existentes o usuarios de auth'
      });

    } catch (e) {
      results.tests.push({
        name: 'Investigar Tabla Recepciones',
        success: false,
        error: e instanceof Error ? e.message : 'Error desconocido',
        details: 'Error investigando la tabla recepciones'
      });
      
      results.tests.push({
        name: 'Obtener User ID Válido',
        success: false,
        error: e instanceof Error ? e.message : 'Error desconocido',
        details: 'Error obteniendo user_id válido'
      });
    }

    // Test 5: Intentar inserción con user_id válido
    if (validUserId) {
      try {
        const testRecord = {
          fecha_recepcion: new Date().toISOString(),
          producto_codigo: 'W1.1',
          proveedor: 'TEST PROVEEDOR DIAGNOSTICO',
          num_guia: 'DIAG-' + Date.now(),
          volumen_m3: 99.99,
          certificacion: 'Material Controlado Test',
          user_id: validUserId
        };

        const { data, error } = await supabaseServiceRole
          .from('recepciones')
          .insert([testRecord])
          .select();

        results.tests.push({
          name: 'Inserción con User ID Válido',
          success: !error,
          data: data,
          error: error?.message,
          details: 'Intentar insertar con user_id válido obtenido'
        });

        // Si la inserción fue exitosa, eliminar el registro de prueba
        if (!error && data && data.length > 0) {
          await supabaseServiceRole
            .from('recepciones')
            .delete()
            .eq('id', data[0].id);
        }

      } catch (e) {
        results.tests.push({
          name: 'Inserción con User ID Válido',
          success: false,
          error: e instanceof Error ? e.message : 'Error desconocido',
          details: 'Error al intentar insertar con user_id válido'
        });
      }
    } else {
      results.tests.push({
        name: 'Inserción con User ID Válido',
        success: false,
        error: 'No se pudo obtener un user_id válido',
        details: 'Saltando prueba porque no hay user_id válido'
      });
    }

    // Test 5: Verificar permisos con anon key para comparar
    try {
      const { data, error } = await supabaseAnon
        .from('recepciones')
        .select('count(*)', { count: 'exact', head: true });
      
      results.tests.push({
        name: 'Conexión con Anon Key',
        success: !error,
        data: data,
        error: error?.message,
        details: 'Comparar permisos entre service role y anon key'
      });
    } catch (e) {
      results.tests.push({
        name: 'Conexión con Anon Key',
        success: false,
        error: e instanceof Error ? e.message : 'Error desconocido',
        details: 'Error con anon key'
      });
    }

    console.log('✅ Diagnóstico completado:', results);

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completado',
      results: results
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error en diagnóstico', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}