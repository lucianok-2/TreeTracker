'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
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
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Bienvenido</p>
              <p className="font-medium text-gray-800">
                {user.user_metadata?.username || user.user_metadata?.display_name || user.email}
              </p>
              {(user.user_metadata?.username || user.user_metadata?.display_name) && (
                <p className="text-xs text-gray-500">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="treetracker-button-secondary px-4 py-2 rounded-lg font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}