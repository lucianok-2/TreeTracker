"""
Función ID 2: Procesador de Ventas
Procesa archivos Excel de reportes de ventas
"""

import pandas as pd
from datetime import datetime
import os
import tempfile

def process_file(file, supabase):
    """
    Procesa un archivo Excel de reportes de ventas
    
    Args:
        file: Archivo subido desde el frontend
        supabase: Cliente de Supabase para insertar datos
    
    Returns:
        dict: Resultado del procesamiento
    """
    
    if not file:
        return {
            "success": False,
            "error": "No se proporcionó ningún archivo"
        }
    
    try:
        print("🚀 Iniciando procesamiento de reportes de ventas...")
        
        # Guardar archivo temporalmente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Cargar archivo Excel
            print("📊 Cargando archivo Excel de ventas...")
            df = pd.read_excel(temp_path)
            print(f"✅ Archivo cargado. Encontradas {len(df)} filas.")
            
            # Limpieza de nombres de columna
            df.columns = df.columns.str.strip()
            
            # Verificar columnas requeridas para ventas
            cols_required = ["FECHA", "CLIENTE", "PRODUCTO", "CANTIDAD", "PRECIO_UNITARIO"]
            missing_cols = [c for c in cols_required if c not in df.columns]
            
            if missing_cols:
                return {
                    "success": False,
                    "error": f"Faltan columnas requeridas: {missing_cols}. Columnas disponibles: {list(df.columns)}"
                }
            
            total_records = 0
            errors = []
            
            # Procesar cada fila
            for index, row in df.iterrows():
                try:
                    fecha = pd.to_datetime(row["FECHA"])
                    cliente = str(row["CLIENTE"]).strip()
                    producto = str(row["PRODUCTO"]).strip()
                    cantidad = float(row["CANTIDAD"])
                    precio_unitario = float(row["PRECIO_UNITARIO"])
                    
                    # Validar datos
                    if cliente in ["nan", "None", ""] or producto in ["nan", "None", ""]:
                        continue
                    
                    if pd.isna(cantidad) or cantidad <= 0:
                        continue
                    
                    if pd.isna(precio_unitario) or precio_unitario <= 0:
                        continue
                    
                    # Calcular total
                    total = cantidad * precio_unitario
                    
                    # Crear registro
                    record = {
                        "fecha": fecha.isoformat(),
                        "cliente": cliente,
                        "producto_codigo": producto,
                        "cantidad": cantidad,
                        "precio_unitario": precio_unitario,
                        "total": total,
                        "created_at": datetime.now().isoformat()
                    }
                    
                    # Insertar en Supabase
                    result = supabase.table("ventas").insert(record).execute()
                    
                    if not hasattr(result, 'error') or not result.error:
                        total_records += 1
                        print(f"✅ Venta insertada: {cliente} - {producto} - ${total:.2f}")
                    else:
                        errors.append(f"Error insertando fila {index + 1}: {result.error.message}")
                        
                except Exception as e:
                    errors.append(f"Error procesando fila {index + 1}: {str(e)}")
                    continue
            
            print(f"🎉 Procesamiento de ventas completado: {total_records} registros insertados")
            
            return {
                "success": True,
                "records_processed": total_records,
                "errors": errors,
                "message": f"Procesamiento de ventas completado exitosamente. {total_records} registros insertados."
            }
            
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
    except Exception as e:
        error_msg = f"Error general en el procesamiento de ventas: {str(e)}"
        print(f"❌ {error_msg}")
        
        return {
            "success": False,
            "error": error_msg,
            "records_processed": 0
        }