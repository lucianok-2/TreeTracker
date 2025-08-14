import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Probando conexión con API Python...')
    console.log('🌐 URL de API Python:', PYTHON_API_URL)

    // Probar conexión básica
    const healthResponse = await fetch(`${PYTHON_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Respuesta de /health:', healthResponse.status)

    if (!healthResponse.ok) {
      throw new Error(`API Python no responde: ${healthResponse.status}`)
    }

    const healthData = await healthResponse.json()
    console.log('✅ Datos de health:', healthData)

    // Probar endpoint de funciones
    const functionsResponse = await fetch(`${PYTHON_API_URL}/functions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Respuesta de /functions:', functionsResponse.status)

    let functionsData = null
    if (functionsResponse.ok) {
      functionsData = await functionsResponse.json()
      console.log('✅ Datos de functions:', functionsData)
    }

    return NextResponse.json({
      success: true,
      python_api_url: PYTHON_API_URL,
      health_check: {
        status: healthResponse.status,
        data: healthData
      },
      functions_check: {
        status: functionsResponse.status,
        data: functionsData
      },
      message: 'Conexión con API Python exitosa'
    })

  } catch (error) {
    console.error('❌ Error conectando con API Python:', error)

    return NextResponse.json(
      { 
        success: false,
        python_api_url: PYTHON_API_URL,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: 'Asegúrate de que la API Python esté corriendo en http://localhost:5000',
        instructions: [
          '1. cd balance-app/python-api',
          '2. python start.py',
          '3. Verifica que aparezca "API corriendo en http://localhost:5000"'
        ]
      },
      { status: 500 }
    )
  }
}