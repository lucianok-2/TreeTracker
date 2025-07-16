'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RecepcionForm from '../components/RecepcionForm'
import ProduccionForm from '../components/ProduccionForm'
import VentaForm from '../components/VentaForm'

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

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [isRecepcionOpen, setRecepcionOpen] = useState(false)
  const [isProduccionOpen, setProduccionOpen] = useState(false)
  const [isVentaOpen, setVentaOpen] = useState(false)
  const [data, setData] = useState<any>({
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
      try {
        // Verificar conexión con Supabase
        const { data: tablesData, error: tablesError } = await supabase
          .from('pg_catalog.pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');

        if (tablesError) {
          console.error('Error fetching tables:', tablesError);
          return;
        }

        console.log('Tables:', tablesData?.map(t => t.tablename));

        // Cargar recepciones si la tabla existe
        const tables = tablesData?.map(t => t.tablename) || [];
        if (tables.includes('recepciones')) {
          await loadRecepciones();
        } else {
          console.warn('Tabla recepciones no encontrada. Ve a /test-supabase para crearla.');
        }
      } catch (error) {
        console.error('Error en fetchData:', error);
      }
    };

    const loadRecepciones = async () => {
      try {
        const { data: recepcionesData, error } = await supabase
          .from('recepciones')
          .select('*')
          .order('fecha', { ascending: false });

        if (error) {
          console.error('Error loading recepciones:', error);
        } else {
          console.log('Recepciones cargadas:', recepcionesData);
          // Aquí puedes procesar los datos para actualizar el estado
          // Por ejemplo, agrupar por mes y certificación
        }
      } catch (error) {
        console.error('Error en loadRecepciones:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--light-green)' }}>
      {/* Header con logo */}
      <div className="treetracker-header p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/treetracker-logo.svg"
              alt="TreeTracker Logo"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Balance de Materiales
              </h1>
              <p className="text-lg text-gray-600">Los Castaños SPA</p>
            </div>
          </div>
        </div>
      </div>

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
            <div className="flex space-x-3">
              <button
                onClick={() => setRecepcionOpen(true)}
                className="treetracker-button-primary px-4 py-2 rounded-lg font-medium"
              >
                Añadir Recepción
              </button>
              <button
                onClick={() => setProduccionOpen(true)}
                className="treetracker-button-primary px-4 py-2 rounded-lg font-medium"
              >
                Añadir Producción
              </button>
              <button
                onClick={() => setVentaOpen(true)}
                className="treetracker-button-secondary px-4 py-2 rounded-lg font-medium"
              >
                Añadir Venta
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

              {/* === STOCK FINAL === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Final</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W1.1 Trozos de pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockFinal[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === CONSUMO === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Consumo</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.consumo[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === PRODUCCIÓN MADERA === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Producción Madera</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.produccionMadera[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === FACTOR RENDIMIENTO === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Factor Rendimiento</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>%</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.rendimientoMadera[m]?.toFixed(1) ?? '0.0'}
                  </td>
                ))}
              </tr>

              {/* === VENTAS MADERA === */}
              <tr>
                <td colSpan={3} className="px-4 py-3 font-bold text-white" style={{ backgroundColor: 'var(--medium-brown)' }}>
                  VENTAS MADERA
                </td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3" style={{ backgroundColor: 'var(--medium-brown)' }} />
                ))}
              </tr>
              {CERTS.map(cert => (
                <tr key={cert + '-venta'} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W5.2 Madera dimensionada pinus radiata</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>{cert}</td>
                  {MESES.map(m => (
                    <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                      {data.ventasMadera[cert]?.[m]?.toFixed(3) ?? '0.000'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* === STOCK INICIAL MADERA === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Inicial Madera</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W5.2 Madera dimensionada pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockInicialMadera?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === STOCK FINAL MADERA === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Final Madera</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W5.2 Madera dimensionada pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockFinalMadera?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === SEPARADOR ASTILLAS === */}
              <tr>
                <td colSpan={15} className="h-4" style={{ backgroundColor: 'var(--light-brown)' }} />
              </tr>

              {/* === PRODUCCIÓN ASTILLAS === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Producción Astillas</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.produccionAstillas?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === FACTOR RENDIMIENTO ASTILLAS === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Factor Rendimiento</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>%</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.rendimientoAstillas?.[m]?.toFixed(1) ?? '0.0'}
                  </td>
                ))}
              </tr>

              {/* === VENTAS ASTILLAS === */}
              <tr>
                <td colSpan={3} className="px-4 py-3 font-bold text-white" style={{ backgroundColor: 'var(--medium-brown)' }}>
                  VENTAS ASTILLAS
                </td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3" style={{ backgroundColor: 'var(--medium-brown)' }} />
                ))}
              </tr>
              {CERTS.map(cert => (
                <tr key={cert + '-venta-astillas'} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W3.1 Astillas pinus radiata</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>{cert}</td>
                  {MESES.map(m => (
                    <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                      {data.ventasAstillas?.[cert]?.[m]?.toFixed(3) ?? '0.000'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* === STOCK INICIAL ASTILLAS === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Inicial Astillas</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W3.1 Astillas pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockInicialAstillas?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === STOCK FINAL ASTILLAS === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Final Astillas</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W3.1 Astillas pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockFinalAstillas?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === SEPARADOR ASERRÍN === */}
              <tr>
                <td colSpan={15} className="h-4" style={{ backgroundColor: 'var(--light-brown)' }} />
              </tr>

              {/* === PRODUCCIÓN ASERRÍN === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Producción Aserrín</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.produccionAserrin?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === FACTOR RENDIMIENTO ASERRÍN === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Factor Rendimiento</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>%</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.rendimientoAserrin?.[m]?.toFixed(1) ?? '0.0'}
                  </td>
                ))}
              </tr>

              {/* === VENTAS ASERRÍN === */}
              <tr>
                <td colSpan={3} className="px-4 py-3 font-bold text-white" style={{ backgroundColor: 'var(--medium-brown)' }}>
                  VENTAS ASERRÍN
                </td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3" style={{ backgroundColor: 'var(--medium-brown)' }} />
                ))}
              </tr>
              {CERTS.map(cert => (
                <tr key={cert + '-venta-aserrin'} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W3.2 Aserrín pinus radiata</td>
                  <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>{cert}</td>
                  {MESES.map(m => (
                    <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                      {data.ventasAserrin?.[cert]?.[m]?.toFixed(3) ?? '0.000'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* === STOCK INICIAL ASERRÍN === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Inicial Aserrín</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W3.2 Aserrín pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockInicialAserrin?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>

              {/* === STOCK FINAL ASERRÍN === */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800 border-b" style={{ borderColor: 'var(--light-brown)' }}>Stock Final Aserrín</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>W3.2 Aserrín pinus radiata</td>
                <td className="px-4 py-3 text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>—</td>
                {MESES.map(m => (
                  <td key={m} className="px-3 py-3 text-right text-gray-700 border-b" style={{ borderColor: 'var(--light-brown)' }}>
                    {data.stockFinalAserrin?.[m]?.toFixed(3) ?? '0.000'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALES --- */}
      <RecepcionForm
        isOpen={isRecepcionOpen}
        onClose={() => setRecepcionOpen(false)}
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
