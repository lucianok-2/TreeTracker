# process_recepciones.py - Procesador específico para recepciones del usuario
import os
import pandas as pd
from datetime import datetime
import tempfile


def process_file(file, user_id):
    """
    Función principal que será llamada por la API Flask para procesar recepciones

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


def process_excel_file(file_path, user_id):
    """
    Procesa el archivo Excel de recepciones y genera INSERT statements

    Args:
        file_path: Ruta del archivo Excel a procesar
        user_id: ID del usuario autenticado
    """

    print("⚠️⚠️⚠️ EJECUTANDO SCRIPT DE RECEPCIONES - NO VENTAS ⚠️⚠️⚠️")
    print(f"📁 Archivo: {file_path}")
    print(f"👤 Usuario: {user_id}")
    print("⚠️⚠️⚠️ ESTE ES EL SCRIPT DE RECEPCIONES ⚠️⚠️⚠️")

    # ————————————————
    # 1) CONFIGURACIÓN
    # ————————————————

    # Código de producto fijo para todas las recepciones
    PRODUCTO_CODIGO = "W1.1"

    # Certificación por defecto
    CERTIFICACION_DEFAULT = "Material Controlado"

    total_records = 0
    processed_sheets = 0
    errors = []
    insert_statements = []

    try:
        # ————————————————
        # 2) CARGAR TODO EL EXCEL
        # ————————————————
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

            # Buscar NUM_GUIA
            for col in df.columns:
                if 'NUM_GUIA' in col.upper() or 'NUMERO_GUIA' in col.upper() or 'GUIA' in col.upper():
                    column_mapping['num_guia'] = col
                    break

            # Buscar NOMBRE_PROVEEDOR (específicamente, no RUT_PROVEEDOR)
            for col in df.columns:
                if 'NOMBRE_PROVEEDOR' in col.upper():
                    column_mapping['proveedor'] = col
                    print(f"📋 Columna de proveedor encontrada: {col}")
                    break

            # Si no se encontró NOMBRE_PROVEEDOR, buscar solo PROVEEDOR (pero no RUT)
            if 'proveedor' not in column_mapping:
                for col in df.columns:
                    if 'PROVEEDOR' in col.upper() and 'RUT' not in col.upper() and 'NOMBRE' not in col.upper():
                        column_mapping['proveedor'] = col
                        print(
                            f"📋 Columna de proveedor alternativa encontrada: {col}")
                        break

            # Buscar FECHA_RECEPCION
            for col in df.columns:
                if 'FECHA' in col.upper() and 'RECEP' in col.upper():
                    column_mapping['fecha_recepcion'] = col
                    break
                elif 'FECHA' in col.upper():
                    column_mapping['fecha_recepcion'] = col
                    break

            # Buscar VOLUMEN_M3
            for col in df.columns:
                if 'VOLUMEN' in col.upper() and 'M3' in col.upper():
                    column_mapping['volumen_m3'] = col
                    break
                elif 'M3' in col.upper() or 'VOLUMEN' in col.upper():
                    column_mapping['volumen_m3'] = col
                    break

            # Buscar ROL
            for col in df.columns:
                if 'ROL' in col.upper():
                    column_mapping['rol'] = col
                    print(f"🏷️ Columna de rol encontrada: {col}")
                    break

            # Buscar ORIGEN/PREDIO
            for col in df.columns:
                col_clean = str(col).upper().replace('/', '').replace(' ', '')
                if 'ORIGEN' in col_clean or 'PREDIO' in col_clean or ('ORIGEN' in col.upper() and 'PREDIO' in col.upper()):
                    column_mapping['origen'] = col
                    print(f"🌲 Columna de origen/predio encontrada: {col}")
                    break

            # Buscar COMUNA
            for col in df.columns:
                if 'COMUNA' in col.upper():
                    column_mapping['comuna'] = col
                    print(f"🏘️ Columna de comuna encontrada: {col}")
                    break

            print(f"📋 Mapeo de columnas: {column_mapping}")

            # Verificar que se encontraron las columnas requeridas
            required_fields = ['num_guia', 'proveedor',
                               'fecha_recepcion', 'volumen_m3']
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
                    # Obtener número de guía (requerido y convertir a entero)
                    if pd.notna(row[column_mapping['num_guia']]):
                        try:
                            # Convertir a entero para eliminar decimales
                            num_guia_int = int(
                                float(row[column_mapping['num_guia']]))
                            num_guia = str(num_guia_int)
                            print(
                                f"📋 Fila {index}: Número de guía convertido: {row[column_mapping['num_guia']]} → {num_guia}")
                        except (ValueError, TypeError):
                            print(
                                f"⚠️ Saltando fila {index}: error al convertir número de guía a entero")
                            continue
                    else:
                        print(
                            f"⚠️ Saltando fila {index}: número de guía vacío")
                        continue

                    # Obtener proveedor (requerido)
                    if pd.notna(row[column_mapping['proveedor']]):
                        proveedor = str(
                            row[column_mapping['proveedor']]).strip()
                    else:
                        print(f"⚠️ Saltando fila {index}: proveedor vacío")
                        continue

                    # Obtener volumen (requerido y debe ser > 0)
                    try:
                        if pd.notna(row[column_mapping['volumen_m3']]):
                            volumen = float(row[column_mapping['volumen_m3']])
                            if volumen <= 0:
                                print(
                                    f"⚠️ Saltando fila {index}: volumen es 0 o negativo ({volumen})")
                                continue
                        else:
                            print(f"⚠️ Saltando fila {index}: volumen vacío")
                            continue
                    except (ValueError, TypeError):
                        print(
                            f"⚠️ Saltando fila {index}: error al convertir volumen")
                        continue

                    # Validar que no sean valores vacíos o NaN
                    if num_guia in ["nan", "None", ""] or proveedor in ["nan", "None", ""]:
                        print(f"⚠️ Saltando fila {index}: datos vacíos")
                        continue

                    # Obtener fecha de recepción
                    try:
                        if pd.notna(row[column_mapping['fecha_recepcion']]):
                            fecha = pd.to_datetime(
                                row[column_mapping['fecha_recepcion']])
                            print(f"📅 Fila {index}: Fecha procesada: {fecha}")
                        else:
                            # Si no hay fecha, usar fecha actual
                            fecha = datetime.now()
                            print(
                                f"📅 Fila {index}: Usando fecha actual: {fecha}")
                    except:
                        # Si hay error al convertir la fecha, usar fecha actual
                        fecha = datetime.now()
                        print(
                            f"📅 Fila {index}: Error en fecha, usando fecha actual: {fecha}")

                    # Obtener ROL (opcional)
                    rol = None
                    if 'rol' in column_mapping and pd.notna(row[column_mapping['rol']]):
                        rol_raw = str(row[column_mapping['rol']]).strip()
                        # Eliminar comillas simples del rol
                        rol = rol_raw.replace("'", "")
                        print(
                            f"🏷️ Fila {index}: Rol procesado: '{rol_raw}' → '{rol}'")
                    else:
                        print(f"🏷️ Fila {index}: Sin rol especificado")

                    # Obtener ORIGEN/PREDIO (opcional)
                    origen = None
                    if 'origen' in column_mapping and pd.notna(row[column_mapping['origen']]):
                        origen = str(row[column_mapping['origen']]).strip()
                        print(f"🌲 Fila {index}: Origen/Predio: {origen}")
                    else:
                        print(
                            f"🌲 Fila {index}: Sin origen/predio especificado")

                    # Obtener COMUNA (opcional)
                    comuna = None
                    if 'comuna' in column_mapping and pd.notna(row[column_mapping['comuna']]):
                        comuna = str(row[column_mapping['comuna']]).strip()
                        print(f"🏘️ Fila {index}: Comuna: {comuna}")
                    else:
                        print(f"🏘️ Fila {index}: Sin comuna especificada")

                    # Generar INSERT statement CON LAS NUEVAS COLUMNAS
                    # Construir la parte de columnas y valores dinámicamente
                    columns = ['fecha_recepcion', 'producto_codigo', 'proveedor',
                        'num_guia', 'volumen_m3', 'certificacion', 'user_id']
                    values = [f"'{fecha.isoformat()}'", f"'{PRODUCTO_CODIGO}'", f"'{proveedor.replace(\"'\", \"''\")}' ", f"'{num_guia}'", str(volumen), f"'{CERTIFICACION_DEFAULT}'", f"'{user_id}'"]
                    
                    # Agregar columnas opcionales si tienen valor
                    if rol is not None:
                        columns.append('rol')
                        values.append(f"'{rol.replace(\"'\", \"''\")}'")
                    
                    if origen is not None:
                        columns.append('origen')
                        values.append(f"'{origen.replace(\"'\", \"''\")}'")
                    
                    if comuna is not None:
                        columns.append('comuna')
                        values.append(f"'{comuna.replace(\"'\", \"''\")}'")

                    insert_sql = f"""INSERT INTO recepciones ({', '.join(columns)}) 
VALUES ({', '.join(values)});"""

                    insert_statements.append(insert_sql)

                    # Log del registro procesado
                    record = {
                        "fecha_recepcion": fecha.isoformat(),
                        "producto_codigo": PRODUCTO_CODIGO,
                        "proveedor": proveedor,
                        "num_guia": num_guia,
                        "volumen_m3": volumen,
                        "certificacion": CERTIFICACION_DEFAULT,
                        "rol": rol,
                        "origen": origen,
                        "comuna": comuna,
                        "user_id": user_id
                    }

                    print(f"✅ Procesado: {record}")
                    sheet_records += 1
                    total_records += 1

                except Exception as row_error:
                    print(f"❌ Error procesando fila {index}: {row_error}")
                    continue

            processed_sheets += 1
            print(f"✅ Hoja {sheet_name} procesada: {sheet_records} registros")

        print("¡Procesamiento de recepciones completado!")

        return {
            "success": True,
            "records_processed": total_records,
            "sheets_processed": processed_sheets,
            "total_sheets": len(xf),
            "errors": errors,
            "insert_statements": insert_statements,
            "message": f"¡Procesamiento de recepciones completado! {total_records} registros procesados de {processed_sheets} hojas."
        }

    except Exception as e:
        error_msg = f"Error en el procesamiento de recepciones: {str(e)}"
        print(f"❌ {error_msg}")
        errors.append(error_msg)

        return {
            "success": False,
            "error": error_msg,
            "records_processed": total_records,
            "errors": errors,
            "insert_statements": insert_statements
        }
