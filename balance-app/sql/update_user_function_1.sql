-- Crear o actualizar el user function con id=1 para asociarle el código Python de procesamiento de ingresos
-- IMPORTANTE: Reemplaza el UUID con tu ID de usuario real de Supabase

INSERT INTO user_functions (id, user_id, function_name, function_description, function_code, is_active, created_at, updated_at)
VALUES (
    1,
    '00000000-0000-0000-0000-000000000000', -- CAMBIAR POR TU USER ID REAL
    'Procesador de Reportes de Ingreso',
    'Procesa archivos Excel de reportes de ingreso de planta y los carga automáticamente a la tabla de recepciones en Supabase. Maneja múltiples hojas (meses) y valida los datos antes de la inserción.',
    '# process_ingresos.py
import os
import pandas as pd
from supabase import create_client, Client
from datetime import datetime

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

# Inicializa cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Cargar archivo Excel
file_path = "Reportes Ingreso Planta 2025.xlsx"
xf = pd.read_excel(file_path, sheet_name=None)

total_records = 0

for sheet_name, df in xf.items():
    mes_num = MESES.get(sheet_name.strip().upper())
    if not mes_num:
        print(f"⚠️ Ignorando hoja «{sheet_name}»")
        continue
    
    print(f"ℹ️ Procesando hoja: {sheet_name}")
    df.columns = df.columns.str.strip()
    
    cols = ["NOMBRE PROVEEDOR", "ROL", "Descripción de material código FSC", "M3 o m3st"]
    if not all(c in df.columns for c in cols):
        print(f"❌ Faltan columnas en {sheet_name}")
        continue
    
    for _, row in df.iterrows():
        try:
            proveedor = str(row["NOMBRE PROVEEDOR"]).strip()
            num_guia = str(row["ROL"]).strip()
            certificacion = str(row["Descripción de material código FSC"] or "Material Controlado").strip()
            
            if proveedor in ["nan", "None", ""] or num_guia in ["nan", "None", ""]:
                continue
            
            volumen = float(row["M3 o m3st"])
            if pd.isna(volumen) or volumen <= 0:
                continue
            
            fecha = datetime(AÑO, mes_num, 1)
            
            record = {
                "fecha_recepcion": fecha.isoformat(),
                "producto_codigo": PRODUCTO_CODIGO,
                "proveedor": proveedor,
                "num_guia": num_guia,
                "volumen_m3": volumen,
                "certificacion": certificacion
            }
            
            res = supabase.table("recepciones").insert(record).execute()
            if not hasattr(res, "error") or not res.error:
                total_records += 1
                print(f"✅ Insertado: {proveedor} - {volumen} m3")
                
        except Exception as e:
            continue
    
    print(f"✅ Hoja {sheet_name} procesada")

print(f"🎉 Procesamiento completado: {total_records} registros insertados")',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    function_name = EXCLUDED.function_name,
    function_description = EXCLUDED.function_description,
    function_code = EXCLUDED.function_code,
    updated_at = NOW();