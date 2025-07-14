'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
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
  const [data, setData] = useState<any>({
    stockInicial: {},
    ingresos: {},
    stockFinal: {},
    consumo: {},
    produccionMadera: {},
    rendimientoMadera: {},
    ventasMadera: {},
    // … y así para astillas / aserrín
  })

  useEffect(() => {
    // TODO: aquí llamas a supabase para traer tus tablas de
    // recepciones, producción, ventas, stock… y llenas el objeto “data”
    // de modo que, por ejemplo, data.ingresos['FSC 100%']['Enero'] = 3.691
  }, [year])

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">
        Balance de Materiales – Los Castaños SPA
      </h1>

      <div className="mb-6">
        <label className="mr-2">Año:</label>
        <select
          className="bg-gray-800 border border-gray-600 px-2 py-1"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
        >
          {[2023,2024,2025,2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1 bg-gray-700">Concepto</th>
            <th className="border px-2 py-1 bg-gray-700">Producto</th>
            <th className="border px-2 py-1 bg-gray-700">Certificación</th>
            {MESES.map(m => (
              <th key={m} className="border px-2 py-1 bg-gray-700">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* === STOCK INICIAL === */}
          <tr>
            <td className="border px-2 py-1 font-semibold">Stock Inicial</td>
            <td className="border px-2 py-1">W1.1 Trozos de pinus radiata</td>
            <td className="border px-2 py-1">—</td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 text-right">
                {data.stockInicial[m]?.toFixed(3) ?? '0.000'}
              </td>
            ))}
          </tr>

          {/* === INGRESOS === */}
          <tr>
            <td colSpan={3} className="border px-2 py-1 font-semibold bg-gray-800">
              INGRESOS
            </td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 bg-gray-800" />
            ))}
          </tr>
          {CERTS.map(cert => (
            <tr key={cert}>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">W1.1 Trozos de pinus radiata</td>
              <td className="border px-2 py-1">{cert}</td>
              {MESES.map(m => (
                <td key={m} className="border px-2 py-1 text-right">
                  {data.ingresos[cert]?.[m]?.toFixed(3) ?? '0.000'}
                </td>
              ))}
            </tr>
          ))}

          {/* === STOCK FINAL === */}
          <tr>
            <td className="border px-2 py-1 font-semibold">Stock Final</td>
            <td className="border px-2 py-1">W1.1 Trozos de pinus radiata</td>
            <td className="border px-2 py-1">—</td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 text-right">
                {data.stockFinal[m]?.toFixed(3) ?? '0.000'}
              </td>
            ))}
          </tr>

          {/* === CONSUMO === */}
          <tr>
            <td className="border px-2 py-1 font-semibold">Consumo</td>
            <td className="border px-2 py-1">—</td>
            <td className="border px-2 py-1">—</td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 text-right">
                {data.consumo[m]?.toFixed(3) ?? '0.000'}
              </td>
            ))}
          </tr>

          {/* === PRODUCCIÓN MADERA === */}
          <tr>
            <td className="border px-2 py-1 font-semibold">Producción Madera</td>
            <td className="border px-2 py-1">—</td>
            <td className="border px-2 py-1">—</td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 text-right">
                {data.produccionMadera[m]?.toFixed(3) ?? '0.000'}
              </td>
            ))}
          </tr>

          {/* === FACTOR RENDIMIENTO === */}
          <tr>
            <td className="border px-2 py-1 font-semibold">Factor Rendimiento</td>
            <td className="border px-2 py-1">—</td>
            <td className="border px-2 py-1">%</td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 text-right">
                {data.rendimientoMadera[m]?.toFixed(1) ?? '0.0'}
              </td>
            ))}
          </tr>

          {/* === VENTAS MADERA === */}
          <tr>
            <td colSpan={3} className="border px-2 py-1 font-semibold bg-gray-800">
              VENTAS MADERA
            </td>
            {MESES.map(m => (
              <td key={m} className="border px-2 py-1 bg-gray-800" />
            ))}
          </tr>
          {CERTS.map(cert => (
            <tr key={cert + '-venta'}>
              <td className="border px-2 py-1">—</td>
              <td className="border px-2 py-1">W5.2 Madera dimensionada pinus radiata</td>
              <td className="border px-2 py-1">{cert}</td>
              {MESES.map(m => (
                <td key={m} className="border px-2 py-1 text-right">
                  {data.ventasMadera[cert]?.[m]?.toFixed(3) ?? '0.000'}
                </td>
              ))}
            </tr>
          ))}

          {/* … Repite el mismo patrón para ASTILLAS y ASERRÍN … */}

        </tbody>
      </table>
    </div>
  )
}
