'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import RecepcionForm from '../components/RecepcionForm'
import ProduccionForm from '../components/ProduccionForm'
import VentaForm from '../components/VentaForm'
import StockInicialForm from '../components/StockInicialForm'
import ConsumoForm from '../components/ConsumoForm'
import Navbar from '../components/Navbar'
import withAuth from '../components/with-auth'

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Certificaciones que usas
const CERTS = [
  'FSC 100%',
  'FSC Mixto',
  'FSC Controlled Wood',
  'Material Controlado'
]

interface DashboardData {
  stockInicial: Record<string, number>
  ingresos: Record<string, Record<string, number>>
  stockFinal: Record<string, number>
  consumo: Record<string, number>
  produccionMadera: Record<string, number>
  rendimientoMadera: Record<string, number>
  ventasMadera: Record<string, Record<string, number>>
  stockInicialMadera: Record<string, number>
  stockFinalMadera: Record<string, number>
  produccionAstillas: Record<string, number>
  rendimientoAstillas: Record<string, number>
  ventasAstillas: Record<string, Record<string, number>>
  stockInicialAstillas: Record<string, number>
  stockFinalAstillas: Record<string, number>
  produccionAserrin: Record<string, number>
  rendimientoAserrin: Record<string, number>
  ventasAserrin: Record<string, Record<string, number>>
  stockInicialAserrin: Record<string, number>
  stockFinalAserrin: Record<string, number>
}

function DashboardPage() {
  const { user } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [isRecepcionOpen, setRecepcionOpen] = useState(false)
  const [isProduccionOpen, setProduccionOpen] = useState(false)
  const [isVentaOpen, setVentaOpen] = useState(false)
  const [isStockInicialOpen, setStockInicialOpen] = useState(false)
  const [isConsumoOpen, setConsumoOpen] = useState(false)
  const [data, setData] = useState<DashboardData>({
    stockInicial: {},
    ingresos: {},
    stockFinal: {},
    consumo: {},
    produccionMadera: {},
    rendimientoMadera: {},
    ventasMadera: {},
    stockInicialMadera: {},
    stockFinalMadera: {},
    produccionAstillas: {},
    rendimientoAstillas: {},
    ventasAstillas: {},
    stockInicialAstillas: {},
    stockFinalAstillas: {},
    produccionAserrin: {},
    rendimientoAserrin: {},
    ventasAserrin: {},
    stockInicialAserrin: {},
    stockFinalAserrin: {}
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Verificar conexión con Supabase
        const { data: tablesData, error: tablesError } = await supabase
          .from('pg_catalog.pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')

        if (tablesError) {
          console.error('Error fetching tables:', tablesError)
          return
        }

        console.log('Tables:', tablesData?.map(t => t.tablename))

        // Cargar recepciones si la tabla existe
        const tables = tablesData?.map(t => t.tablename) || []
        if (tables.includes('recepciones')) {
          await loadRecepciones()
        } else {
          console.warn('Tabla recepciones no encontrada. Ve a /test-supabase para crearla.')
        }
      } catch (error) {
        console.error('Error en fetchData:', error)
      }
    }

    const loadRecepciones = async () => {
      try {
        const { data: recepcionesData, error } = await supabase
          .from('recepciones')
          .select('*')
          .order('fecha_recepcion', { ascending: false })

        if (error) {
          console.error('Error loading recepciones:', error)
        } else {
          console.log('Recepciones cargadas:', recepcionesData)
          // Aquí puedes procesar los datos para actualizar el estado
          // Por ejemplo, agrupar por mes y certificación
          if (recepcionesData && recepcionesData.length > 0) {
            console.log(`Se encontraron ${recepcionesData.length} recepciones del usuario`)
            // Procesar datos y actualizar el estado si es necesario
            // setData(processedData)
          }
        }
      } catch (error) {
        console.error('Error en loadRecepciones:', error)
      }
    }

    fetchData()
  }, [user])

  return (
    <div className="min-h-screen" style={{ background: 'var(--light-green)' }}>
      {/* Header con navbar */}
      <Navbar />

      <div className="p-6">
        <div className="treetracker-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label className="mr-3 text-gray-700 font-medium">Año:</label>
              <select
                className="px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  borderColor: 'var(--light-brown)',
                  backgroundColor: 'white'
                }}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStockInicialOpen(true)}
                className="treetracker-button-secondary px-3 py-2 rounded-lg font-medium text-sm"
              >
                Stock Inicial
              </button>
              <button
                onClick={() => setRecepcionOpen(true)}
                className="treetracker-button-primary px-3 py-2 rounded-lg font-medium text-sm"
              >
                Recepción
              </button>
              <button
                onClick={() => setConsumoOpen(true)}
                className="treetracker-button-primary px-3 py-2 rounded-lg font-medium text-sm"
              >
                Consumo
              </button>
              <button
                onClick={() => setProduccionOpen(true)}
                className="treetracker-button-primary px-3 py-2 rounded-lg font-medium text-sm"
              >
                Producción
              </button>
              <button
                onClick={() => setVentaOpen(true)}
                className="treetracker-button-secondary px-3 py-2 rounded-lg font-medium text-sm"
              >
                Venta
              </button>
            </div>
          </div>
        </div>

        <div className="treetracker-table">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-white" style={{ backgroundColor: 'var(--dark-green)' }}>
                  Concepto
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white" style={{ backgroundColor: 'var(--dark-green)' }}>
                  Producto
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white" style={{ backgroundColor: 'var(--dark-green)' }}>
                  Certificación
                </th>
                {MESES.map(m => (
                  <th key={m} className="px-3 py-3 text-center font-semibold text-white" style={{ backgroundColor: 'var(--dark-green)' }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* === STOCK INICIAL === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                  Stock Inicial
                </td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                  W1.1 Trozos de pinus radiata
                </td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                  —
                </td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockInicial[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === INGRESOS === */}
              <tr>
                <td colSpan={3} className="px-4 py-3 font-bold text-white" style={{ backgroundColor: 'var(--medium-brown)' }}>
                  INGRESOS
                </td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3" style={{ backgroundColor: 'var(--medium-brown)' }} />
                ))}
              </tr>
              {CERTS.map(cert => (
                <tr key={cert} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W1.1 Trozos de pinus radiata</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>{cert}</td>
                  {MESES.map(m => (
                    <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                      {data.ingresos[cert]?.[m]?.toFixed(3) ?? '0.000'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Resto de las filas de la tabla... */}
              {/* Por brevedad, incluyo solo algunas filas. El resto sigue el mismo patrón */}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALES --- */}
      <StockInicialForm
        isOpen={isStockInicialOpen}
        onClose={() => setStockInicialOpen(false)}
      />
      <RecepcionForm
        isOpen={isRecepcionOpen}
        onClose={() => setRecepcionOpen(false)}
      />
      <ConsumoForm
        isOpen={isConsumoOpen}
        onClose={() => setConsumoOpen(false)}
      />
      <ProduccionForm
        isOpen={isProduccionOpen}
        onClose={() => setProduccionOpen(false)}
      />
      <VentaForm
        isOpen={isVentaOpen}
        onClose={() => setVentaOpen(false)}
      />
    </div>
  )
}

export default withAuth(DashboardPage)