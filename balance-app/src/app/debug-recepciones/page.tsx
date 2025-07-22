'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

export default function DebugRecepcionesPage() {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const runDebug = async () => {
    setLoading(true)
    const info: any = {}

    try {
      // 1. Verificar usuario del contexto
      info.contextUser = user ? {
        id: user.id,
        email: user.email
      } : null

      // 2. Verificar sesión de Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      info.session = session ? {
        user_id: session.user.id,
        email: session.user.email,
        expires_at: session.expires_at
      } : null
      info.sessionError = sessionError

      // 3. Verificar usuario actual de Supabase
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
      info.supabaseUser = supabaseUser ? {
        id: supabaseUser.id,
        email: supabaseUser.email
      } : null
      info.userError = userError

      // 4. Intentar consulta simple a recepciones
      const { data: recepciones, error: recepcionesError } = await supabase
        .from('recepciones')
        .select('id, user_id, proveedor')
        .limit(5)

      info.recepciones = recepciones
      info.recepcionesError = recepcionesError

      // 5. Verificar políticas RLS
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'recepciones')

      info.policies = policies
      info.policiesError = policiesError

      // 6. Intentar consulta con auth.uid()
      const { data: authTest, error: authTestError } = await supabase
        .rpc('auth_uid_test')

      info.authTest = authTest
      info.authTestError = authTestError

    } catch (error) {
      info.generalError = error
    }

    setDebugInfo(info)
    setLoading(false)
  }

  useEffect(() => {
    runDebug()
  }, [user])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Recepciones</h1>
      
      <button
        onClick={runDebug}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-6"
      >
        🔄 Ejecutar Debug
      </button>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Ejecutando debug...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}