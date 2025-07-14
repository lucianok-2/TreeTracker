// src/app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">Balance de Materiales</h1>
      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Ver Dashboard
        </Link>
        <Link
          href="/recepciones"
          className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Añadir Recepción
        </Link>
      </nav>
    </div>
  )
}
