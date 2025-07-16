'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState('Probando...')
  const [tables, setTables] = useState<string[]>([])
  const [recepciones, setRecepciones] = useState<unknown[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Probar conexión básica
      const { data: healthCheck, error: healthError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(1)

      if (healthError) {
        throw new Error(`Error de conexión: ${healthError.message}`)
      }

      setConnectionStatus('✅ Conexión exitosa')

      // Obtener lista de tablas
      const { data: tablesData, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')

      if (tablesError) {
        console.error('Error obteniendo tablas:', tablesError)
      } else {
        const tableNames = tablesData?.map(t => t.tablename) || []
        setTables(tableNames)
      }

      // Probar tabla recepciones
      const { data: recepcionesData, error: recepcionesError } = await supabase
        .from('recepciones')
        .select('*')
        .limit(10)

      if (recepcionesError) {
        console.error('Error con tabla recepciones:', recepcionesError)
        setError(`Error tabla recepciones: ${recepcionesError.message}`)
      } else {
        setRecepciones(recepcionesData || [])
      }

    } catch (err) {
      console.error('Error de conexión:', err)
      setConnectionStatus('❌ Error de conexión')
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const createRecepcionesTable = async () => {
    try {
      const { error } = await supabase.rpc('create_recepciones_table')
      
      if (error) {
        // Si no existe la función, intentamos crear la tabla directamente
        console.log('Intentando crear tabla recepciones...')
        alert('Para crear la tabla, ve a tu panel de Supabase y ejecuta este SQL:\n\nCREATE TABLE recepciones (\n  id SERIAL PRIMARY KEY,\n  fecha DATE NOT NULL,\n  certificacion TEXT NOT NULL,\n  volumen DECIMAL(10,3) NOT NULL,\n  producto TEXT NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);')
      } else {
        alert('Tabla recepciones creada exitosamente')
        testConnection()
      }
    } catch (err) {
      console.error('Error creando tabla:', err)
      alert('Error al crear tabla. Ve al panel de Supabase para crearla manualmente.')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--light-green)' }}>
      {/* Header con logo */}
      <div className="treetracker-header p-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/treetracker-logo.svg" 
            alt="TreeTracker Logo" 
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Test de Conexión Supabase
            </h1>
            <p className="text-lg text-gray-600">Diagnóstico del Sistema</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="treetracker-card p-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Estado de Conexión</h2>
            <p className="text-lg text-gray-700">{connectionStatus}</p>
            {error && (
              <div className="mt-3 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="treetracker-card p-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Tablas Disponibles</h2>
            {tables.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {tables.map(table => (
                  <li key={table} className={table === 'recepciones' ? 'font-semibold' : 'text-gray-700'} style={{ color: table === 'recepciones' ? 'var(--medium-green)' : undefined }}>
                    {table}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No se encontraron tablas</p>
            )}
            
            {!tables.includes('recepciones') && (
              <div className="mt-4">
                <button
                  onClick={createRecepcionesTable}
                  className="treetracker-button-primary px-4 py-2 rounded-lg font-medium"
                >
                  Crear Tabla Recepciones
                </button>
              </div>
            )}
          </div>

          <div className="treetracker-card p-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Recepciones Guardadas</h2>
          {recepciones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr style={{ backgroundColor: 'var(--dark-green)' }}>
                    <th className="px-4 py-2 text-left text-white font-semibold">ID</th>
                    <th className="px-4 py-2 text-left text-white font-semibold">Fecha</th>
                    <th className="px-4 py-2 text-left text-white font-semibold">Proveedor</th>
                    <th className="px-4 py-2 text-left text-white font-semibold">Núm. Guía</th>
                    <th className="px-4 py-2 text-left text-white font-semibold">Volumen (m³)</th>
                    <th className="px-4 py-2 text-left text-white font-semibold">Certificación</th>
                  </tr>
                </thead>
                <tbody>
                  {recepciones.map(recepcion => (
                    <tr key={recepcion.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--light-brown)' }}>
                      <td className="px-4 py-2 text-gray-700">{recepcion.id}</td>
                      <td className="px-4 py-2 text-gray-700">{recepcion.fecha_recepcion}</td>
                      <td className="px-4 py-2 text-gray-700">{recepcion.proveedor}</td>
                      <td className="px-4 py-2 text-gray-700">{recepcion.num_guia}</td>
                      <td className="px-4 py-2 text-gray-700 text-right">{recepcion.volumen_m3}</td>
                      <td className="px-4 py-2 text-gray-700">{recepcion.certificacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay recepciones guardadas</p>
          )}
        </div>

          <div className="treetracker-card p-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Acciones</h2>
            <div className="flex space-x-4">
              <button
                onClick={testConnection}
                className="treetracker-button-primary px-6 py-2 rounded-lg font-medium"
              >
                Probar Conexión
              </button>
              <a
                href="/dashboard"
                className="treetracker-button-secondary px-6 py-2 rounded-lg font-medium inline-block text-center"
              >
                Volver al Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}