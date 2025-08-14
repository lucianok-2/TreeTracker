# process_ventas_generales.py - Procesador para ventas generales (archivos XLSX)
import os
import pandas as pd
from datetime import datetime
import tempfile


def process_file(file, user_id):
    """
    Función principal que será llamada por la API Flask para procesar ventas generales

    Args:
        file: Archivo subido desde el frontend
        user_id: ID del usuario autenticado

    Returns:
        dict: Resultado del procesamiento con INSERT statements
    """

    if not file:
        return {
            "success": False,
            "error": "No se proporcionó ningún archivo"
        }

    try:
        # Guardar archivo temporalmente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name

        try:
            # Ejecutar el procesamiento principal CON EL USER_ID
            result = process_excel_file(temp_path, user_id)
            return result

        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as e:
        return {
            "success": False,
            "error": f"Error general: {str(e)}",
            "records_processed": 0
        }


def convert_date_number_to_datetime(date_number):
    """
    Convierte un número de fecha como 20250728 a datetime

    Args:
        date_number: Número de fecha en formato YYYYMMDD

    Returns:
        datetime: Fecha convertida
    """
    try:
        # Convertir a string y extraer año, mes, día
        date_str = str(int(date_number))
        if len(date_str) == 8:  # YYYYMMDD
            year = int(date_str[:4])
            month = int(date_str[4:6])
            day = int(date_str[6:8])
            return datetime(year, month, day)
        else:
            raise ValueError(f"Formato de fecha inválido: {date_number}")
    except Exception as e:
        raise ValueError(f"Error al convertir fecha {date_number}: {str(e)}")


def process_excel_file(file_path, user_id):
    """
    Procesa el archivo Excel de ventas generales y genera INSERT statements

    Args:
        file_path: Ruta del archivo Excel a procesar
        user_id: ID del usuario autenticado
    """
    
    print("🚀🚀🚀 EJECUTANDO SCRIPT DE VENTAS GENERALES 🚀🚀🚀")
    print(f"🎯 Archivo: {file_path}")
    print(f"👤 Usuario: {user_id}")
    print("🚀🚀🚀 ESTE ES EL SCRIPT PARA VENTAS GENERALES 🚀🚀🚀")

    # ————————————————
    # 1) CONFIGURACIÓN
    # ————————————————

    # Certificación por defecto
    CERTIFICACION_DEFAULT = "Sin certificacion"

    # Mapeo de productos por defecto (puede expandirse según necesidades)
    PRODUCTO_MAPPING = {
        "W1.1": "Astillas pinus radiata",
        "W1.2": "Aserrín pinus radiata", 
        "W2.1": "Madera aserrada",
        "W3.1": "Astillas pinus radiata",
        "W3.2": "Aserrín pinus radiata"
    }

    total_records = 0
    processed_sheets = 0
    errors = []
    insert_statements = []

    try:
        print(f"📁 Procesando archivo XLSX: {file_path}")
        
        # ————————————————
        # 2) CARGAR TODO EL EXCEL
        # ————————————————
        # Leer archivo XLSX usando openpyxl
        try:
            print("🔧 Usando engine 'openpyxl' para archivo .xlsx")
            xf = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')
        except Exception as read_error:
            print(f"❌ Error leyendo archivo Excel: {read_error}")
            # Intentar con engine automático como fallback
            print("🔄 Intentando con engine automático...")
            xf = pd.read_excel(file_path, sheet_name=None)

        # ————————————————
        # 3) PROCESAR CADA HOJA
        # ————————————————
        for sheet_name, df in xf.items():
            print(f"📊 Procesando hoja: {sheet_name} con {len(df)} filas")

            # Limpieza de nombres de columna (quita espacios al inicio/fin)
            df.columns = df.columns.str.strip()

            print(f"📋 Columnas encontradas: {list(df.columns)}")

            # Mapear las columnas requeridas (buscar variaciones)
            column_mapping = {}

            # Buscar FECHA_VENTA (con variaciones de caracteres especiales)
            for col in df.columns:
                col_clean = str(col).upper().replace('Ó', 'O').replace('Í', 'I').replace('Á', 'A')
                if 'FECHA' in col_clean and ('CONTABILIZ' in col_clean or 'CONTABIL' in col_clean):
                    column_mapping['fecha_venta'] = col
                    print(f"📅 Columna de fecha contabilización encontrada: {col}")
                    break
            
            # Si no se encuentra fecha contabiliz, buscar fecha venta
            if 'fecha_venta' not in column_mapping:
                for col in df.columns:
                    col_clean = str(col).upper().replace('Á', 'A').replace('É', 'E')
                    if 'FECHA' in col_clean and ('VENTA' in col_clean or 'FACTURA' in col_clean):
                        column_mapping['fecha_venta'] = col
                        print(f"📅 Columna de fecha venta encontrada: {col}")
                        break
            
            # Si no se encuentra, buscar solo FECHA
            if 'fecha_venta' not in column_mapping:
                for col in df.columns:
                    if 'FECHA' in str(col).upper():
                        column_mapping['fecha_venta'] = col
                        print(f"📅 Columna de fecha encontrada: {col}")
                        break

            # Buscar CLIENTE
            for col in df.columns:
                col_clean = str(col).upper().replace('Í', 'I').replace('É', 'E')
                if 'CLIENTE' in col_clean or 'COMPRADOR' in col_clean:
                    column_mapping['cliente'] = col
                    print(f"👤 Columna de cliente encontrada: {col}")
                    break

            # Buscar NUM_FACTURA o NUM_GUIA
            for col in df.columns:
                col_clean = str(col).upper().replace('Ú', 'U').replace('Í', 'I')
                if ('FACTURA' in col_clean or 'GUIA' in col_clean or 'NUMERO' in col_clean) and 'NUM' in col_clean:
                    column_mapping['num_factura'] = col
                    print(f"📄 Columna de número factura encontrada: {col}")
                    break
            
            # Si no se encuentra num_factura, buscar variaciones
            if 'num_factura' not in column_mapping:
                for col in df.columns:
                    col_clean = str(col).upper().replace('Í', 'I')
                    if 'FACTURA' in col_clean or 'GUIA' in col_clean:
                        column_mapping['num_factura'] = col
                        print(f"📄 Columna de factura/guía encontrada: {col}")
                        break

            # Buscar DESCRIPCIÓN MATERIAL (para determinar producto_codigo)
            for col in df.columns:
                col_clean = str(col).upper().replace('Ó', 'O').replace('Í', 'I').replace('Á', 'A')
                if ('DESCRIPCION' in col_clean or 'DESCRIPC' in col_clean) and 'MATERIAL' in col_clean:
                    column_mapping['descripcion_material'] = col
                    print(f"📝 Columna de descripción material encontrada: {col}")
                    break

            # Buscar PRODUCTO_CODIGO (opcional)
            for col in df.columns:
                col_clean = str(col).upper().replace('Ó', 'O')
                if ('PRODUCTO' in col_clean and 'CODIGO' in col_clean) or 'COD_PRODUCTO' in col_clean:
                    column_mapping['producto_codigo'] = col
                    print(f"🏷️ Columna de código producto encontrada: {col}")
                    break

            # Buscar VOLUMEN_M3
            for col in df.columns:
                col_clean = str(col).upper().replace('Ó', 'O')
                if ('VOLUMEN' in col_clean and 'M3' in col_clean) or 'M3' in col_clean or 'RECEPCION' in col_clean:
                    column_mapping['volumen_m3'] = col
                    print(f"📦 Columna de volumen encontrada: {col}")
                    break
            
            # Si no se encuentra volumen_m3, buscar CANTIDAD o VOLUMEN
            if 'volumen_m3' not in column_mapping:
                for col in df.columns:
                    col_clean = str(col).upper()
                    if 'VOLUMEN' in col_clean or 'CANTIDAD' in col_clean:
                        column_mapping['volumen_m3'] = col
                        print(f"📦 Columna de volumen/cantidad encontrada: {col}")
                        break

            print(f"📋 Mapeo de columnas: {column_mapping}")

            # Verificar que se encontraron las columnas requeridas
            required_fields = ['fecha_venta', 'volumen_m3']
            missing_fields = [
                field for field in required_fields if field not in column_mapping]

            if missing_fields:
                error_msg = f"No se encontraron las columnas requeridas en la hoja «{sheet_name}»: {missing_fields}"
                errors.append(error_msg)
                print(f"❌ {error_msg}")
                continue

            sheet_records = 0

            # Itera sobre cada fila de la hoja
            for index, row in df.iterrows():
                try:
                    # Obtener fecha de venta (requerido)
                    if pd.notna(row[column_mapping['fecha_venta']]):
                        try:
                            # Intentar convertir como número de fecha primero
                            fecha_numero = int(float(row[column_mapping['fecha_venta']]))
                            fecha_venta = convert_date_number_to_datetime(fecha_numero)
                            print(f"📅 Fila {index}: Fecha convertida: {fecha_numero} → {fecha_venta}")
                        except (ValueError, TypeError):
                            # Si falla, intentar como fecha normal
                            fecha_venta = pd.to_datetime(row[column_mapping['fecha_venta']])
                            print(f"📅 Fila {index}: Fecha procesada: {fecha_venta}")
                    else:
                        print(f"⚠️ Saltando fila {index}: fecha venta vacía")
                        continue

                    # Cliente fijo MASISA
                    cliente = "MASISA"
                    print(f"👤 Fila {index}: Cliente fijo: {cliente}")

                    # Obtener número de factura (opcional, generar automático)
                    num_factura = f"AUTO-{index+1:04d}"  # Valor por defecto
                    if 'num_factura' in column_mapping and pd.notna(row[column_mapping['num_factura']]):
                        try:
                            # Convertir a entero para eliminar decimales si es necesario
                            num_factura_int = int(float(row[column_mapping['num_factura']]))
                            num_factura = str(num_factura_int)
                            print(f"📄 Fila {index}: Número factura convertido: {row[column_mapping['num_factura']]} → {num_factura}")
                        except (ValueError, TypeError):
                            num_factura = str(row[column_mapping['num_factura']]).strip()
                            print(f"📄 Fila {index}: Número factura como string: {num_factura}")
                    else:
                        print(f"📄 Fila {index}: Usando número factura automático: {num_factura}")

                    # Determinar código de producto basado en descripción material
                    producto_codigo = "W3.2"  # Valor por defecto
                    producto_nombre = "Aserrín pinus radiata"  # Nombre por defecto
                    
                    if 'descripcion_material' in column_mapping and pd.notna(row[column_mapping['descripcion_material']]):
                        descripcion_material = str(row[column_mapping['descripcion_material']]).strip()
                        print(f"📝 Fila {index}: Descripción material: {descripcion_material}")
                        
                        # Verificar si es astilla verde
                        if "ASTILLA VERDE (TS)" in descripcion_material.upper():
                            producto_codigo = "W3.1"
                            producto_nombre = "Astillas pinus radiata"
                            print(f"✅ Fila {index}: Producto identificado: ASTILLA VERDE (TS) → {producto_codigo}")
                        else:
                            producto_codigo = "W3.2"
                            producto_nombre = "Aserrín pinus radiata"
                            print(f"✅ Fila {index}: Producto identificado: Material por defecto → {producto_codigo}")
                    else:
                        print(f"🏷️ Fila {index}: Sin descripción material, usando código por defecto: {producto_codigo}")
                    
                    # Si hay columna de producto_codigo específica, usarla como override
                    if 'producto_codigo' in column_mapping and pd.notna(row[column_mapping['producto_codigo']]):
                        producto_codigo_override = str(row[column_mapping['producto_codigo']]).strip()
                        print(f"🔄 Fila {index}: Override código producto: {producto_codigo_override}")
                        producto_codigo = producto_codigo_override
                        producto_nombre = PRODUCTO_MAPPING.get(producto_codigo, "Producto desconocido")

                    # Obtener volumen (requerido y debe ser > 0) - SIEMPRE DIVIDIR POR 1000
                    try:
                        if pd.notna(row[column_mapping['volumen_m3']]):
                            volumen_original = float(row[column_mapping['volumen_m3']])
                            if volumen_original <= 0:
                                print(f"⚠️ Saltando fila {index}: volumen es 0 o negativo ({volumen_original})")
                                continue
                            
                            # SIEMPRE dividir por 1000
                            volumen = volumen_original / 1000
                            print(f"📦 Fila {index}: Volumen convertido: {volumen_original} / 1000 = {volumen}")
                        else:
                            print(f"⚠️ Saltando fila {index}: volumen vacío")
                            continue
                    except (ValueError, TypeError):
                        print(f"⚠️ Saltando fila {index}: error al convertir volumen")
                        continue

                    # Validar que no sean valores vacíos
                    if num_factura in ["nan", "None", ""] or cliente in ["nan", "None", ""]:
                        print(f"⚠️ Saltando fila {index}: datos vacíos")
                        continue

                    # Generar INSERT statement para la tabla ventas (precio_unitario como NULL)
                    insert_sql = f"""INSERT INTO ventas (fecha_venta, producto_codigo, cliente, num_factura, volumen_m3, certificacion, precio_unitario, user_id) 
VALUES ('{fecha_venta.isoformat()}', '{producto_codigo}', '{cliente.replace("'", "''")}', '{num_factura}', {volumen}, '{CERTIFICACION_DEFAULT}', NULL, '{user_id}');"""

                    insert_statements.append(insert_sql)

                    # Log del registro procesado
                    record = {
                        "fecha_venta": fecha_venta.isoformat(),
                        "producto_codigo": producto_codigo,
                        "producto_nombre": producto_nombre,
                        "cliente": cliente,
                        "num_factura": num_factura,
                        "volumen_m3": volumen,
                        "certificacion": CERTIFICACION_DEFAULT,
                        "user_id": user_id
                    }

                    print(f"✅ Procesado: {record}")
                    sheet_records += 1
                    total_records += 1

                except Exception as row_error:
                    print(f"❌ Error procesando fila {index}: {row_error}")
                    errors.append(f"Error en fila {index}: {str(row_error)}")
                    continue

            processed_sheets += 1
            print(f"✅ Hoja {sheet_name} procesada: {sheet_records} registros")

        print("¡Procesamiento de ventas generales completado!")
        
        # DEBUG: Mostrar los primeros INSERT statements generados
        print("🔍 DEBUG - PRIMEROS INSERT STATEMENTS GENERADOS:")
        for i, stmt in enumerate(insert_statements[:3]):
            print(f"📝 Statement {i+1}: {stmt}")
        print(f"📊 Total de INSERT statements generados: {len(insert_statements)}")

        return {
            "success": True,
            "records_processed": total_records,
            "sheets_processed": processed_sheets,
            "total_sheets": len(xf),
            "errors": errors,
            "insert_statements": insert_statements,
            "message": f"¡Procesamiento de ventas generales completado! {total_records} registros procesados de {processed_sheets} hojas."
        }

    except Exception as e:
        error_msg = f"Error en el procesamiento de ventas generales: {str(e)}"
        print(f"❌ {error_msg}")
        errors.append(error_msg)

        return {
            "success": False,
            "error": error_msg,
            "records_processed": total_records,
            "errors": errors,
            "insert_statements": insert_statements
        }