// src/app/components/ProduccionForm.tsx
'use client'

import { useState } from 'react'
import Modal from './Modal'

interface ProduccionFormProps {
  isOpen: boolean
  onClose: () => void
}

const PRODUCTOS = ['Madera', 'Astillas', 'Aserrín']

export default function ProduccionForm({
  isOpen,
  onClose
}: ProduccionFormProps) {
  const [formData, setFormData] = useState({
    fecha: '',
    producto: PRODUCTOS[0],
    volumen: ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Lógica para enviar a Supabase
    console.log('Nueva Producción:', formData)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Producción">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fecha" className="block mb-2">
            Fecha
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="producto" className="block mb-2">
            Producto
          </label>
          <select
            id="producto"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded"
          >
            {PRODUCTOS.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="volumen" className="block mb-2">
            Volumen (m³)
          </label>
          <input
            type="number"
            id="volumen"
            name="volumen"
            value={formData.volumen}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded"
            required
            step="0.001"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
