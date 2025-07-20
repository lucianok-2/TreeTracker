'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TestSupabasePage() {
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-supabase-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      setResult(data)
      
    } catch (error) {
      console.error('Error en diagnóstico:', error)
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  const fixRLSPolicies = async () => {
    setLoading(true)
    try {
      // Simplemente deshabilitar RLS para recepciones
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE recepciones DISABLE ROW LEVEL SECURITY;' 
      })
      
      if (error) {
        console.error('Error deshabilitando RLS:', error)
        setResult({ error: error.message, details: error })
      } else {
        setResult({ success: true, message: 'RLS deshabilitado para la tabla recepciones' })
      }
      
    } catch (error) {
      console.error('Error general:', error)
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  const fixRLSPoliciesComplete = async () => {
    setLoading(true)
    try {
      // Ejecutar el script SQL para corregir las políticas RLS
      const sqlCommands = [
        'ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY',
        'ALTER TABLE document_processing_history DISABLE ROW LEVEL SECURITY', 
        'ALTER TABLE recepciones DISABLE ROW LEVEL SECURITY',
        
        'DROP POLICY IF EXISTS "Users can view their own functions" ON user_functions',
        'DROP POLICY IF EXISTS "Users can insert their own functions" ON user_functions',
        'DROP POLICY IF EXISTS "Users can update their own functions" ON user_functions',
        'DROP POLICY IF EXISTS "Users can delete their own functions" ON user_functions',
        
        'DROP POLICY IF EXISTS "Users can view their own processing history" ON document_processing_history',
        'DROP POLICY IF EXISTS "Users can insert their own processing history" ON document_processing_history',
        
        'DROP POLICY IF EXISTS "Users can view their own recepciones" ON recepciones',
        'DROP POLICY IF EXISTS "Users can insert their own recepciones" ON recepciones',
        'DROP POLICY IF EXISTS "Users can update their own recepciones" ON recepciones',
        'DROP POLICY IF EXISTS "Users can delete their own recepciones" ON recepciones',
        
        'CREATE POLICY "Allow all operations on user_functions" ON user_functions FOR ALL USING (true) WITH CHECK (true)',
        'CREATE POLICY "Allow all operations on document_processing_history" ON document_processing_history FOR ALL USING (true) WITH CHECK (true)',
        'CREATE POLICY "Allow all operations on recepciones" ON recepciones FOR ALL USING (true) WITH CHECK (true)',
        
        'ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY',
        'ALTER TABLE document_processing_history ENABLE ROW LEVEL SECURITY',
        'ALTER TABLE recepciones ENABLE ROW LEVEL SECURITY'
      ]

      const results = []
      
      for (const command of sqlCommands) {
        try {
          console.log(`Ejecutando: ${command}`)
          const { data, error } = await supabase.rpc('exec_sql', { sql: command })
          if (error) {
            console.error(`Error en comando "${command}":`, error)
            results.push({ command, success: false, error: error.message })
          } else {
            results.push({ command, success: true, data })
          }
        } catch (e) {
          console.error(`Excepción en comando "${command}":`, e)
          results.push({ command, success: false, error: e instanceof Error ? e.message : 'Error desconocido' })
        }
      }

      setResult(results)
      
    } catch (error) {
      console.error('Error general:', error)
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  const testInsertRecepcion = async () => {
    setLoading(true)
    try {
      const testRecord = {
        fecha_recepcion: new Date().toISOString(),
        producto_codigo: 'W1.1',
        proveedor: 'TEST PROVEEDOR',
        num_guia: 'TEST-001',
        volumen_m3: 10.5,
        certificacion: 'Material Controlado',
        user_id: 1
      }

      const { data, error } = await supabase
        .from('recepciones')
        .insert([testRecord])
        .select()

      if (error) {
        setResult({ error: error.message, details: error })
      } else {
        setResult({ success: true, data, message: 'Registro de prueba insertado exitosamente' })
      }
      
    } catch (error) {
      console.error('Error en test insert:', error)
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  const checkUsers = async () => {
    setLoading(true)
    try {
      // Verificar qué usuarios existen
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        console.error('Error obteniendo usuarios:', usersError)
        setResult({ error: 'Error obteniendo usuarios: ' + usersError.message })
      } else {
        setResult({ success: true, users, message: `Encontrados ${users.users.length} usuarios` })
      }
      
    } catch (error) {
      console.error('Error en check users:', error)
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  const debugRLS = async () => {
    setLoading(true)
    try {
      // Obtener token de autenticación
      const { data: { session } } = await supabase.auth.getSession()
      const authToken = session?.access_token

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/debug-rls', {
        method: 'POST',
        headers
      })

      const data = await response.json()
      setResult(data)
      
    } catch (error) {
      console.error('Error en debug RLS:', error)
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Supabase - Corregir RLS</h1>
      
      <div className="space-y-4">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Diagnosticando...' : '🔍 Diagnóstico Completo'}
        </button>

        <button
          onClick={fixRLSPolicies}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Ejecutando...' : '🔧 Corregir Políticas RLS'}
        </button>

        <button
          onClick={testInsertRecepcion}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Probando...' : '🧪 Probar Inserción'}
        </button>

        <button
          onClick={checkUsers}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Verificando...' : '👥 Verificar Usuarios'}
        </button>

        <button
          onClick={fixRLSPoliciesComplete}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Ejecutando...' : '🔧 Corregir RLS Completo'}
        </button>

        <button
          onClick={debugRLS}
          disabled={loading}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Investigando...' : '🔬 Debug RLS Detallado'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <pre className="text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}