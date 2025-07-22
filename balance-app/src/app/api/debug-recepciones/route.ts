import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar la clave de servicio para bypass RLS temporalmente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug recepciones - iniciando...')

    // 1. Consulta directa sin RLS
    const { data: allRecepciones, error: allError } = await supabaseAdmin
      .from('recepciones')
      .select('*')
      .limit(10)

    console.log('Recepciones encontradas:', allRecepciones?.length || 0)

    // 2. Verificar políticas
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'recepciones')

    // 3. Contar registros por usuario
    const { data: userCounts, error: countsError } = await supabaseAdmin
      .from('recepciones')
      .select('user_id')

    const userCountsMap = userCounts?.reduce((acc: any, item) => {
      acc[item.user_id] = (acc[item.user_id] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      debug: {
        totalRecepciones: allRecepciones?.length || 0,
        recepciones: allRecepciones?.slice(0, 3), // Solo primeras 3 para debug
        policies: policies,
        userCounts: userCountsMap,
        errors: {
          allError,
          policiesError,
          countsError
        }
      }
    })

  } catch (error) {
    console.error('Error en debug:', error)
    return NextResponse.json(
      { 
        error: 'Error en debug: ' + (error instanceof Error ? error.message : 'Error desconocido')
      },
      { status: 500 }
    )
  }
}