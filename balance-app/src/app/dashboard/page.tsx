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
import UserFunctionsManager from '../components/UserFunctionsManager'
import DocumentProcessor from '../components/DocumentProcessor'
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
  stockInicial: Record<string, Record<string, number>> // producto -> mes -> valor
  ingresos: Record<string, Record<string, number>>
  stockFinal: Record<string, Record<string, number>>
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

  // Función para formatear números: 1 decimal, pero si es entero no mostrar .0
  const formatNumber = (value: number | undefined | null): string => {
    if (!value || value === 0) return ''
    // Si es un número entero, no mostrar decimales
    if (value % 1 === 0) return value.toString()
    // Si tiene decimales, mostrar 1 decimal
    return value.toFixed(1)
  }
  const [isRecepcionOpen, setRecepcionOpen] = useState(false)
  const [isProduccionOpen, setProduccionOpen] = useState(false)
  const [isVentaOpen, setVentaOpen] = useState(false)
  const [isStockInicialOpen, setStockInicialOpen] = useState(false)
  const [isConsumoOpen, setConsumoOpen] = useState(false)
  const [isFunctionsManagerOpen, setFunctionsManagerOpen] = useState(false)
  const [isDocumentProcessorOpen, setDocumentProcessorOpen] = useState(false)
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
        await loadAllData()
      } catch (error) {
        console.error('Error en fetchData:', error)
      }
    }

    const loadAllData = async () => {
      try {
        const currentYear = year

        // Cargar stock inicial
        const { data: stockData, error: stockError } = await supabase
          .from('stock_inicial')
          .select('*')
          .eq('año', currentYear)

        // Cargar recepciones
        const { data: recepcionesData, error: recepcionesError } = await supabase
          .from('recepciones')
          .select('*')
          .gte('fecha_recepcion', `${currentYear}-01-01`)
          .lte('fecha_recepcion', `${currentYear}-12-31`)

        // Cargar consumos
        const { data: consumosData, error: consumosError } = await supabase
          .from('consumos')
          .select('*')
          .gte('fecha_consumo', `${currentYear}-01-01`)
          .lte('fecha_consumo', `${currentYear}-12-31`)

        // Cargar producción
        const { data: produccionData, error: produccionError } = await supabase
          .from('produccion')
          .select('*')
          .gte('fecha_produccion', `${currentYear}-01-01`)
          .lte('fecha_produccion', `${currentYear}-12-31`)

        // Cargar ventas
        const { data: ventasData, error: ventasError } = await supabase
          .from('ventas')
          .select('*')
          .gte('fecha_venta', `${currentYear}-01-01`)
          .lte('fecha_venta', `${currentYear}-12-31`)

        if (stockError) console.error('Error loading stock:', stockError)
        if (recepcionesError) console.error('Error loading recepciones:', recepcionesError)
        if (consumosError) console.error('Error loading consumos:', consumosError)
        if (produccionError) console.error('Error loading produccion:', produccionError)
        if (ventasError) console.error('Error loading ventas:', ventasError)

        // Procesar y organizar los datos
        const processedData = processDataForDashboard({
          stock: stockData || [],
          recepciones: recepcionesData || [],
          consumos: consumosData || [],
          produccion: produccionData || [],
          ventas: ventasData || []
        })

        setData(processedData)
        console.log('Datos cargados y procesados:', processedData)

      } catch (error) {
        console.error('Error en loadAllData:', error)
      }
    }

    // Función para procesar los datos y organizarlos por mes
    const processDataForDashboard = (rawData: unknown) => {
      const processedData: DashboardData = {
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
      }

      // Procesar stock inicial
      rawData.stock.forEach((item: unknown) => {
        const mesNombre = MESES[item.mes - 1]
        if (!processedData.stockInicial[item.producto_codigo]) {
          processedData.stockInicial[item.producto_codigo] = {}
        }
        processedData.stockInicial[item.producto_codigo][mesNombre] = parseFloat(item.volumen_m3)
      })

      // Procesar recepciones (ingresos)
      rawData.recepciones.forEach((item: unknown) => {
        const fecha = new Date(item.fecha_recepcion)
        const mesNombre = MESES[fecha.getMonth()]
        const cert = item.certificacion

        if (!processedData.ingresos[cert]) {
          processedData.ingresos[cert] = {}
        }
        if (!processedData.ingresos[cert][mesNombre]) {
          processedData.ingresos[cert][mesNombre] = 0
        }
        processedData.ingresos[cert][mesNombre] += parseFloat(item.volumen_m3)
      })

      // Procesar consumos
      rawData.consumos.forEach((item: unknown) => {
        // Usar una forma más robusta de procesar la fecha
        const fechaStr = item.fecha_consumo
        const [año, mes, dia] = fechaStr.split('-').map(Number)
        const mesNumero = mes - 1 // Convertir de 1-12 a 0-11
        const mesNombre = MESES[mesNumero]

        console.log('Procesando consumo:', {
          fecha_original: item.fecha_consumo,
          año: año,
          mes: mes,
          dia: dia,
          mes_numero: mesNumero,
          mes_nombre: mesNombre,
          volumen: item.volumen_m3
        })

        if (!processedData.consumo[mesNombre]) {
          processedData.consumo[mesNombre] = 0
        }
        processedData.consumo[mesNombre] += parseFloat(item.volumen_m3)
      })

      // Procesar producción
      rawData.produccion.forEach((item: unknown) => {
        const fecha = new Date(item.fecha_produccion)
        const mesNombre = MESES[fecha.getMonth()]

        // Producción de madera (W5.2)
        if (item.producto_destino_codigo === 'W5.2') {
          if (!processedData.produccionMadera[mesNombre]) {
            processedData.produccionMadera[mesNombre] = 0
          }
          processedData.produccionMadera[mesNombre] += parseFloat(item.volumen_destino_m3)

          // Factor de rendimiento
          if (item.factor_rendimiento) {
            processedData.rendimientoMadera[mesNombre] = parseFloat(item.factor_rendimiento)
          }
        }

        // Producción de astillas (W3.1)
        if (item.producto_destino_codigo === 'W3.1') {
          if (!processedData.produccionAstillas[mesNombre]) {
            processedData.produccionAstillas[mesNombre] = 0
          }
          processedData.produccionAstillas[mesNombre] += parseFloat(item.volumen_destino_m3)

          if (item.factor_rendimiento) {
            processedData.rendimientoAstillas[mesNombre] = parseFloat(item.factor_rendimiento)
          }
        }

        // Producción de aserrín (W3.2)
        if (item.producto_destino_codigo === 'W3.2') {
          if (!processedData.produccionAserrin[mesNombre]) {
            processedData.produccionAserrin[mesNombre] = 0
          }
          processedData.produccionAserrin[mesNombre] += parseFloat(item.volumen_destino_m3)

          if (item.factor_rendimiento) {
            processedData.rendimientoAserrin[mesNombre] = parseFloat(item.factor_rendimiento)
          }
        }
      })

      // Procesar ventas
      if (rawData.ventas && Array.isArray(rawData.ventas)) {
        rawData.ventas.forEach((item: unknown) => {
          const fecha = new Date(item.fecha_venta)
          const mesNombre = MESES[fecha.getMonth()]
          const cert = item.certificacion

          // Ventas de madera (W5.2)
          if (item.producto_codigo === 'W5.2') {
            if (!processedData.ventasMadera[cert]) {
              processedData.ventasMadera[cert] = {}
            }
            if (!processedData.ventasMadera[cert][mesNombre]) {
              processedData.ventasMadera[cert][mesNombre] = 0
            }
            processedData.ventasMadera[cert][mesNombre] += parseFloat(item.volumen_m3)
          }

          // Ventas de astillas (W3.1)
          if (item.producto_codigo === 'W3.1') {
            if (!processedData.ventasAstillas[cert]) {
              processedData.ventasAstillas[cert] = {}
            }
            if (!processedData.ventasAstillas[cert][mesNombre]) {
              processedData.ventasAstillas[cert][mesNombre] = 0
            }
            processedData.ventasAstillas[cert][mesNombre] += parseFloat(item.volumen_m3)
          }

          // Ventas de aserrín (W3.2)
          if (item.producto_codigo === 'W3.2') {
            if (!processedData.ventasAserrin[cert]) {
              processedData.ventasAserrin[cert] = {}
            }
            if (!processedData.ventasAserrin[cert][mesNombre]) {
              processedData.ventasAserrin[cert][mesNombre] = 0
            }
            processedData.ventasAserrin[cert][mesNombre] += parseFloat(item.volumen_m3)
          }
        })
      }

      // Calcular Stock Inicial automático y Stock Final
      // El stock inicial de cada mes debe ser el stock final del mes anterior
      ['W1.1', 'W5.2', 'W3.1', 'W3.2'].forEach(producto => {
        let stockAnterior = 0

        MESES.forEach((mes, index) => {
          // Asegurar que la estructura existe
          if (!processedData.stockInicial[producto]) {
            processedData.stockInicial[producto] = {}
          }
          if (!processedData.stockFinal[producto]) {
            processedData.stockFinal[producto] = {}
          }

          // Stock inicial: usar el configurado manualmente o el stock final del mes anterior
          let stockInicial = processedData.stockInicial[producto][mes] || 0

          // Si no hay stock inicial configurado y hay stock anterior, usar el stock anterior
          if (stockInicial === 0 && stockAnterior > 0) {
            stockInicial = stockAnterior
            // Actualizar el stock inicial calculado
            if (!processedData.stockInicial[producto]) {
              processedData.stockInicial[producto] = {}
            }
            processedData.stockInicial[producto][mes] = stockInicial
          }

          // Calcular recepciones para este producto en este mes
          let totalRecepciones = 0
          if (producto === 'W1.1') {
            // Para W1.1, sumar todas las recepciones
            Object.keys(processedData.ingresos).forEach(cert => {
              totalRecepciones += processedData.ingresos[cert]?.[mes] || 0
            })
          }

          // Calcular producción para productos terminados
          let produccionMes = 0
          if (producto === 'W5.2') {
            produccionMes = processedData.produccionMadera[mes] || 0
          } else if (producto === 'W3.1') {
            produccionMes = processedData.produccionAstillas[mes] || 0
          } else if (producto === 'W3.2') {
            produccionMes = processedData.produccionAserrin[mes] || 0
          }

          // Calcular consumo (principalmente afecta a W1.1)
          const consumoMes = producto === 'W1.1' ? (processedData.consumo[mes] || 0) : 0

          // Calcular ventas para productos terminados
          let ventasMes = 0
          if (producto === 'W5.2') {
            Object.keys(processedData.ventasMadera).forEach(cert => {
              ventasMes += processedData.ventasMadera[cert]?.[mes] || 0
            })
          } else if (producto === 'W3.1') {
            Object.keys(processedData.ventasAstillas).forEach(cert => {
              ventasMes += processedData.ventasAstillas[cert]?.[mes] || 0
            })
          } else if (producto === 'W3.2') {
            Object.keys(processedData.ventasAserrin).forEach(cert => {
              ventasMes += processedData.ventasAserrin[cert]?.[mes] || 0
            })
          }

          // Calcular stock final: Stock Inicial + Recepción - Consumo
          const stockFinal = stockInicial + totalRecepciones - consumoMes

          // Guardar stock final
          if (!processedData.stockFinal[producto]) {
            processedData.stockFinal[producto] = {}
          }
          processedData.stockFinal[producto][mes] = stockFinal

          // Actualizar stock anterior para el próximo mes
          stockAnterior = stockFinal
        })
      })

      // Calcular factores de rendimiento automáticamente
      // Factor de Rendimiento = (Producción / Consumo) * 100
      MESES.forEach(mes => {
        // Factor de rendimiento para madera
        if (processedData.produccionMadera[mes] && processedData.consumo[mes]) {
          const factor = (processedData.produccionMadera[mes] / processedData.consumo[mes]) * 100
          processedData.rendimientoMadera[mes] = factor
        }

        // Factor de rendimiento para astillas
        if (processedData.produccionAstillas[mes] && processedData.consumo[mes]) {
          const factor = (processedData.produccionAstillas[mes] / processedData.consumo[mes]) * 100
          processedData.rendimientoAstillas[mes] = factor
        }

        // Factor de rendimiento para aserrín
        if (processedData.produccionAserrin[mes] && processedData.consumo[mes]) {
          const factor = (processedData.produccionAserrin[mes] / processedData.consumo[mes]) * 100
          processedData.rendimientoAserrin[mes] = factor
        }
      })

      return processedData
    }

    fetchData()
  }, [user, year])

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
              <div className="border-l border-gray-300 mx-2 h-8"></div>
              <button
                onClick={() => setFunctionsManagerOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium text-sm"
              >
                Gestionar Funciones
              </button>
              <button
                onClick={() => setDocumentProcessorOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg font-medium text-sm"
              >
                Procesar Documentos
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
                    {formatNumber(data.stockInicial['W1.1']?.[m])}
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
                      {formatNumber(data.ingresos[cert]?.[m])}
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
                    {formatNumber(data.stockFinal['W1.1']?.[m])}
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
                    {formatNumber(data.consumo[m])}
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
                    {formatNumber(data.produccionMadera[m])}
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
                    {formatNumber(data.rendimientoMadera[m])}
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
                      {formatNumber(data.ventasMadera[cert]?.[m])}
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
                    {formatNumber(data.stockInicial['W5.2']?.[m])}
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
                    {formatNumber(data.stockFinal['W5.2']?.[m])}
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
                    {formatNumber(data.produccionAstillas[m])}
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
                    {formatNumber(data.rendimientoAstillas[m])}
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
                      {formatNumber(data.ventasAstillas[cert]?.[m])}
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
                    {formatNumber(data.stockInicial['W3.1']?.[m])}
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
                    {formatNumber(data.stockFinal['W3.1']?.[m])}
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
                    {formatNumber(data.produccionAserrin[m])}
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
                    {formatNumber(data.rendimientoAserrin[m])}
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
                      {formatNumber(data.ventasAserrin[cert]?.[m])}
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
                    {formatNumber(data.stockInicial['W3.2']?.[m])}
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
                    {formatNumber(data.stockFinal['W3.2']?.[m])}
                  </td>
                ))}
              </tr>
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
      <UserFunctionsManager
        isOpen={isFunctionsManagerOpen}
        onClose={() => setFunctionsManagerOpen(false)}
      />
      <DocumentProcessor
        isOpen={isDocumentProcessorOpen}
        onClose={() => setDocumentProcessorOpen(false)}
        onProcessingComplete={() => {
          // Recargar datos del dashboard después del procesamiento
          window.location.reload()
        }}
      />
    </div>
  )
}

export default withAuth(DashboardPage)