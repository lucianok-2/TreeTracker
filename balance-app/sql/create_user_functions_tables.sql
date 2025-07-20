-- Tabla para almacenar las funciones personalizadas de cada usuario
CREATE TABLE user_functions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    function_name VARCHAR(255) NOT NULL,
    function_description TEXT,
    function_code TEXT, -- Código de la función personalizada
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para el historial de procesamiento de documentos
CREATE TABLE document_processing_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    function_id INTEGER NOT NULL REFERENCES user_functions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, error
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_user_functions_user_id ON user_functions(user_id);
CREATE INDEX idx_user_functions_active ON user_functions(user_id, is_active);
CREATE INDEX idx_document_processing_user_id ON document_processing_history(user_id);
CREATE INDEX idx_document_processing_function_id ON document_processing_history(function_id);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE user_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_history ENABLE ROW LEVEL SECURITY;

-- Política para user_functions: los usuarios solo pueden ver sus propias funciones
CREATE POLICY "Users can view their own functions" ON user_functions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own functions" ON user_functions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own functions" ON user_functions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own functions" ON user_functions
    FOR DELETE USING (auth.uid() = user_id);

-- Política para document_processing_history: los usuarios solo pueden ver su propio historial
CREATE POLICY "Users can view their own processing history" ON document_processing_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own processing history" ON document_processing_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_user_functions_updated_at 
    BEFORE UPDATE ON user_functions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();