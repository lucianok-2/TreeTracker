'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Modal from './Modal'

interface ProduccionFormProps {
  isOpen: boolean
  onClose: () => void
}

const PRODUCTOS = [
  { codigo: 'W1.1', nombre: 'Trozos de pinus radiata' },
  { codigo: 'W5.2', nombre: 'Madera dimensionada pinus radiata' },
  { codigo: 'W3.1', nombre: 'Astillas pinus radiata' },
  { codigo: 'W3.2', nombre: 'Aserrín pinus radiata' }
]

export default function ProduccionForm({ isOpen, onClose }: ProduccionFormProps) {
  const [formData, setFormData] = useState({
    fecha: '',
    producto_origen: PRODUCTOS[0].codigo,
    producto_destino: PRODUCTOS[1].codigo,
    volumen_origen: '',
    volumen_destino: '',
    descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar datos
      if (!formData.fecha || !formData.volumen_origen || !formData.volumen_destino) {
        throw new Error('Por favor completa todos los campos requeridos')
      }

      const volumenOrigenNumerico = parseFloat(formData.volumen_origen)
      const volumenDestinoNumerico = parseFloat(formData.volumen_destino)
      
      if (isNaN(volumenOrigenNumerico) || volumenOrigenNumerico <= 0) {
        throw new Error('El volumen de origen debe ser un número positivo')
      }
      
      if (isNaN(volumenDestinoNumerico) || volumenDestinoNumerico <= 0) {
        throw new Error('El volumen de destino debe ser un número positivo')
      }

      if (formData.producto_origen === formData.producto_destino) {
        throw new Error('El producto de origen debe ser diferente al producto de destino')
      }

      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Insertar en Supabase
      const { data, error: supabaseError } = await supabase
        .from('produccion')
        .insert([
          {
            user_id: user.id,
            fecha_produccion: formData.fecha,
            producto_origen_codigo: formData.producto_origen,
            producto_destino_codigo: formData.producto_destino,
            volumen_origen_m3: volumenOrigenNumerico,
            volumen_destino_m3: volumenDestinoNumerico,
            descripcion: formData.descripcion || null
          }
        ])
        .select()

      if (supabaseError) {
        console.error('Error de Supabase:', supabaseError)
        throw new Error(`Error al guardar: ${supabaseError.message}`)
      }

      console.log('Producción guardada exitosamente:', data)
      
      // Limpiar formulario y cerrar
      setFormData({
        fecha: '',
        producto_origen: PRODUCTOS[0].codigo,
        producto_destino: PRODUCTOS[1].codigo,
        volumen_origen: '',
        volumen_destino: '',
        descripcion: ''
      })
      onClose()
      
      // Mostrar mensaje de éxito
      alert('Producción registrada exitosamente')
      
    } catch (err) {
      console.error('Error al guardar producción:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Calcular factor de rendimiento en tiempo real
  const factorRendimiento = formData.volumen_origen && formData.volumen_destino 
    ? ((parseFloat(formData.volumen_destino) / parseFloat(formData.volumen_origen)) * 100).toFixed(1)
    : '0.0'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Producción">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="fecha" className="block mb-2 text-gray-700 font-medium">
            Fecha de Producción
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full border-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ 
              borderColor: 'var(--light-brown)',
              backgroundColor: 'white'
            }}
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="producto_origen" className="block mb-2 text-gray-700 font-medium">
              Producto de Origen
            </label>
            <select
              id="producto_origen"
              name="producto_origen"
              value={formData.producto_origen}
              onChange={handleChange}
              className="w-full border-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ 
                borderColor: 'var(--light-brown)',
                backgroundColor: 'white'
              }}
              disabled={loading}
            >
              {PRODUCTOS.map(p => (
                <option key={p.codigo} value={p.codigo}>
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="producto_destino" className="block mb-2 text-gray-700 font-medium">
              Producto de Destino
            </label>
            <select
              id="producto_destino"
              name="producto_destino"
              value={formData.producto_destino}
              onChange={handleChange}
              className="w-full border-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ 
                borderColor: 'var(--light-brown)',
                backgroundColor: 'white'
              }}
              disabled={loading}
            >
              {PRODUCTOS.map(p => (
                <option key={p.codigo} value={p.codigo}>
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="volumen_origen" className="block mb-2 text-gray-700 font-medium">
              Volumen Origen (m³)
            </label>
            <input
              type="number"
              id="volumen_origen"
              name="volumen_origen"
              value={formData.volumen_origen}
              onChange={handleChange}
              className="w-full border-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ 
                borderColor: 'var(--light-brown)',
                backgroundColor: 'white'
              }}
              required
              step="0.001"
              min="0"
              placeholder="Ej: 3.443"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="volumen_destino" className="block mb-2 text-gray-700 font-medium">
              Volumen Destino (m³)
            </label>
            <input
              type="number"
              id="volumen_destino"
              name="volumen_destino"
              value={formData.volumen_destino}
              onChange={handleChange}
              className="w-full border-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ 
                borderColor: 'var(--light-brown)',
                backgroundColor: 'white'
              }}
              required
              step="0.001"
              min="0"
              placeholder="Ej: 1.647"
              disabled={loading}
            />
          </div>
        </div>

        {/* Mostrar factor de rendimiento calculado */}
        {formData.volumen_origen && formData.volumen_destino && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-green-800 font-medium">
              Factor de Rendimiento: {factorRendimiento}%
            </p>
          </div>
        )}

        <div>
          <label htmlFor="descripcion" className="block mb-2 text-gray-700 font-medium">
            Descripción (Opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full border-2 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ 
              borderColor: 'var(--light-brown)',
              backgroundColor: 'white'
            }}
            rows={3}
            placeholder="Descripción del proceso de producción..."
            disabled={loading}
          />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--light-brown)',
              color: 'var(--dark-brown)'
            }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="treetracker-button-primary px-6 py-2 rounded-lg font-medium flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}