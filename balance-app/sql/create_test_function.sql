-- Script temporal para crear una función de prueba
-- Este script crea una función con un UUID temporal para que puedas probar el sistema

-- Primero, deshabilitar RLS temporalmente para insertar datos de prueba
ALTER TABLE user_functions DISABLE ROW LEVEL SECURITY;

-- Insertar la función de prueba
INSERT INTO user_functions (id, user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
VALUES (
    1,
    '11111111-1111-1111-1111-111111111111', -- UUID temporal para pruebas
    'Procesador de Reportes de Ingreso',
    'Procesa archivos Excel de reportes de ingreso de planta y los carga automáticamente a la tabla de recepciones en Supabase. Maneja múltiples hojas (meses) y valida los datos antes de la inserción.',
    '# process_ingresos.py
import os
import pandas as pd
from supabase import create_client, Client
from datetime import datetime

print("🚀 Iniciando procesamiento de archivo Excel...")

# Variables de entorno
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Código de producto de las recepciones
PRODUCTO_CODIGO = "W1.1"
AÑO = 2025

# Mapeo de meses
MESES = {
    "ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4,
    "MAYO": 5, "JUNIO": 6, "JULIO": 7, "AGOSTO": 8,
    "SEPTIEMBRE": 9, "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12
}

print("✅ Configuración cargada correctamente")
print("✅ Procesamiento completado exitosamente")
print("🎉 Total de registros procesados: 150")',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    function_name = EXCLUDED.function_name,
    function_description = EXCLUDED.function_description,
    function_code = EXCLUDED.function_code,
    updated_at = NOW();

-- Volver a habilitar RLS
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;