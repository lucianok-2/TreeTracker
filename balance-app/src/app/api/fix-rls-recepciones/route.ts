import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Para corregir las políticas RLS, ejecuta el siguiente script en el SQL Editor de Supabase:',
    instructions: [
      '1. Ve a tu dashboard de Supabase',
      '2. Abre el SQL Editor',
      '3. Copia y pega el contenido del archivo: balance-app/sql/fix_rls_recepciones_simple.sql',
      '4. Ejecuta el script',
      '5. Verifica que las políticas se crearon correctamente'
    ],
    sql_file: 'balance-app/sql/fix_rls_recepciones_simple.sql',
    note: 'Este script creará políticas más permisivas que permitirán los INSERT statements'
  })
}