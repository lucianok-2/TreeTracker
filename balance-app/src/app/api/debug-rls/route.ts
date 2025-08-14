import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Investigando políticas RLS...');

    const results = {
      rls_status: null as any,
      policies: null as any,
      user_info: null as any,
      test_insert: null as any
    };

    // 1. Verificar estado de RLS
    try {
      const { data: rlsStatus } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT schemaname, tablename, rowsecurity, hasrls 
            FROM pg_tables 
            WHERE tablename = 'recepciones';
          `
        });
      results.rls_status = rlsStatus;
    } catch (e) {
      results.rls_status = { error: 'No se pudo verificar estado RLS' };
    }

    // 2. Listar políticas RLS
    try {
      const { data: policies } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
            FROM pg_policies 
            WHERE tablename = 'recepciones';
          `
        });
      results.policies = policies;
    } catch (e) {
      results.policies = { error: 'No se pudo obtener políticas' };
    }

    // 3. Obtener información del usuario autenticado
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      try {
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
        results.user_info = user;
      } catch (authError) {
        results.user_info = { error: authError.message };
      }
    } else {
      results.user_info = { error: 'No authorization header' };
    }

    // 4. Probar inserción simple
    if (results.user_info && !results.user_info.error) {
      try {
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

        const testRecord = {
          fecha_recepcion: new Date().toISOString(),
          producto_codigo: 'W1.1',
          proveedor: 'TEST DEBUG RLS',
          num_guia: 'DEBUG-' + Date.now(),
          volumen_m3: 1.0,
          certificacion: 'Material Controlado',
          user_id: results.user_info.id
        };

        const { data, error } = await userSupabase
          .from('recepciones')
          .insert([testRecord])
          .select();

        results.test_insert = {
          success: !error,
          data: data,
          error: error?.message,
          record_attempted: testRecord
        };

        // Limpiar el registro de prueba si fue exitoso
        if (!error && data && data.length > 0) {
          await userSupabase
            .from('recepciones')
            .delete()
            .eq('id', data[0].id);
        }

      } catch (insertError) {
        results.test_insert = {
          success: false,
          error: insertError.message
        };
      }
    }

    console.log('✅ Investigación RLS completada:', results);

    return NextResponse.json({
      success: true,
      message: 'Investigación RLS completada',
      results: results
    });

  } catch (error) {
    console.error('❌ Error en debug-rls:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error en investigación RLS', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}