import os
import json
import sqlite3
import hashlib
import time
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import math
import logging

# ======== CONFIGURACIÓN ULTRA-ECONÓMICA ========
logger = logging.getLogger(__name__)

class LowCostConfig:
    # Base de datos local (0 costo)
    DB_PATH = "pixel_memories.db"
    
    # Cache en memoria (muy barato)
    MAX_CACHE_SIZE = 1000
    CACHE_TTL_SECONDS = 3600  # 1 hora
    
    # Embeddings simples (sin modelos pesados)
    MAX_MEMORY_LENGTH = 500
    SIMILARITY_THRESHOLD = 0.3
    
    # Límites de recursos
    MAX_MEMORIES_PER_USER = 100
    MAX_CONVERSATION_HISTORY = 20
    CLEANUP_INTERVAL_HOURS = 24

# ======== SISTEMA DE EMBEDDINGS ULTRA-SIMPLE ========
class SimpleEmbeddings:
    """Embeddings ultra-simples usando hash + TF-IDF (0 costo)"""
    
    def __init__(self):
        self.word_frequencies = defaultdict(int)
        self.total_documents = 0
        self.document_vectors = {}
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenización simple"""
        # Limpiar y dividir en palabras
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = text.split()
        
        # Filtrar palabras muy cortas y comunes
        stop_words = {'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'me', 'mi', 'tu', 'si', 'ya', 'muy', 'mas', 'pero', 'como', 'todo', 'esta', 'está', 'sobre', 'entre', 'hasta', 'desde', 'hacia', 'durante', 'mediante', 'excepto', 'salvo', 'según', 'contra', 'bajo', 'ante', 'tras', 'cabe', 'so', 'sin', 'hasta', 'hacia', 'durante', 'mediante', 'excepto', 'salvo', 'según', 'contra', 'bajo', 'ante', 'tras', 'cabe', 'so', 'sin'}
        
        return [word for word in words if len(word) > 2 and word not in stop_words]
    
    def _calculate_tf_idf(self, words: List[str]) -> Dict[str, float]:
        """Calcular TF-IDF simple"""
        word_count = Counter(words)
        total_words = len(words)
        
        tf_idf = {}
        for word, count in word_count.items():
            # TF (Term Frequency)
            tf = count / total_words
            
            # IDF simple (inverso de frecuencia del documento)
            idf = math.log(self.total_documents / max(1, self.word_frequencies[word]))
            
            tf_idf[word] = tf * idf
        
        return tf_idf
    
    def add_document(self, doc_id: str, text: str):
        """Agregar documento al sistema"""
        words = self._tokenize(text)
        
        # Actualizar frecuencias globales
        unique_words = set(words)
        for word in unique_words:
            self.word_frequencies[word] += 1
        
        self.total_documents += 1
        
        # Calcular vector TF-IDF
        tf_idf_vector = self._calculate_tf_idf(words)
        self.document_vectors[doc_id] = tf_idf_vector
    
    def similarity(self, doc_id1: str, doc_id2: str) -> float:
        """Calcular similitud coseno entre documentos"""
        if doc_id1 not in self.document_vectors or doc_id2 not in self.document_vectors:
            return 0.0
        
        vec1 = self.document_vectors[doc_id1]
        vec2 = self.document_vectors[doc_id2]
        
        # Obtener todas las palabras únicas
        all_words = set(vec1.keys()) | set(vec2.keys())
        
        if not all_words:
            return 0.0
        
        # Calcular producto punto
        dot_product = sum(vec1.get(word, 0) * vec2.get(word, 0) for word in all_words)
        
        # Calcular magnitudes
        magnitude1 = math.sqrt(sum(val ** 2 for val in vec1.values()))
        magnitude2 = math.sqrt(sum(val ** 2 for val in vec2.values()))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def find_similar(self, query_text: str, threshold: float = 0.3) -> List[Tuple[str, float]]:
        """Encontrar documentos similares"""
        # Crear documento temporal para la consulta
        temp_id = f"query_{int(time.time())}"
        self.add_document(temp_id, query_text)
        
        similarities = []
        for doc_id in self.document_vectors:
            if doc_id != temp_id:
                sim = self.similarity(temp_id, doc_id)
                if sim >= threshold:
                    similarities.append((doc_id, sim))
        
        # Limpiar documento temporal
        if temp_id in self.document_vectors:
            del self.document_vectors[temp_id]
        
        return sorted(similarities, key=lambda x: x[1], reverse=True)

# ======== BASE DE DATOS ULTRA-SIMPLE ========
class SimpleMemoryDB:
    """Base de datos SQLite ultra-optimizada"""
    
    def __init__(self, db_path: str = LowCostConfig.DB_PATH):
        self.db_path = db_path
        self.embeddings = SimpleEmbeddings()
        self.cache = {}
        self.cache_timestamps = {}
        
        self._init_database()
        self._load_embeddings()
    
    def _init_database(self):
        """Inicializar base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de memorias
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                context TEXT,
                confidence REAL DEFAULT 1.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_accessed TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                expires_at TIMESTAMP
            )
        ''')
        
        # Tabla de conversaciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                messages TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Índices para optimización
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memories_expires ON memories(expires_at)')
        
        conn.commit()
        conn.close()
    
    def _load_embeddings(self):
        """Cargar embeddings desde la base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, content FROM memories WHERE expires_at IS NULL OR expires_at > datetime("now")')
        
        for memory_id, content in cursor.fetchall():
            self.embeddings.add_document(memory_id, content)
        
        conn.close()
        logger.info(f"Loaded {len(self.embeddings.document_vectors)} embeddings")
    
    def _get_cache_key(self, user_id: str, query: str) -> str:
        """Generar clave de cache"""
        return hashlib.md5(f"{user_id}:{query}".encode()).hexdigest()
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Verificar si el cache es válido"""
        if cache_key not in self.cache_timestamps:
            return False
        
        age = time.time() - self.cache_timestamps[cache_key]
        return age < LowCostConfig.CACHE_TTL_SECONDS
    
    def add_memory(self, user_id: str, content: str, memory_type: str, context: Dict[str, Any] = None) -> str:
        """Agregar memoria"""
        memory_id = hashlib.md5(f"{user_id}:{content}:{time.time()}".encode()).hexdigest()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calcular fecha de expiración
        expires_at = None
        if memory_type in ['preference', 'decision']:
            expires_at = datetime.now() + timedelta(days=30)
        
        cursor.execute('''
            INSERT OR REPLACE INTO memories 
            (id, user_id, content, memory_type, context, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            memory_id, user_id, content, memory_type,
            json.dumps(context or {}), expires_at
        ))
        
        conn.commit()
        conn.close()
        
        # Agregar a embeddings
        self.embeddings.add_document(memory_id, content)
        
        # Limpiar cache
        self._cleanup_cache()
        
        logger.info(f"Added {memory_type} memory for user {user_id}")
        return memory_id
    
    def search_memories(self, user_id: str, query: str, memory_types: List[str] = None) -> List[Dict[str, Any]]:
        """Búsqueda de memorias con cache"""
        cache_key = self._get_cache_key(user_id, query)
        
        # Verificar cache
        if self._is_cache_valid(cache_key) and cache_key in self.cache:
            logger.info("Cache hit for memory search")
            return self.cache[cache_key]
        
        # Búsqueda en base de datos
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Construir query
        sql = '''
            SELECT id, content, memory_type, context, confidence, created_at, access_count
            FROM memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime("now"))
        '''
        params = [user_id]
        
        if memory_types:
            placeholders = ','.join(['?' for _ in memory_types])
            sql += f' AND memory_type IN ({placeholders})'
            params.extend(memory_types)
        
        cursor.execute(sql, params)
        memories = cursor.fetchall()
        
        # Búsqueda semántica simple
        if query and len(query.strip()) > 2:
            similar_docs = self.embeddings.find_similar(query, LowCostConfig.SIMILARITY_THRESHOLD)
            similar_ids = [doc_id for doc_id, _ in similar_docs]
            
            # Filtrar memorias por similitud
            memories = [m for m in memories if m[0] in similar_ids]
        
        # Convertir a diccionarios
        result = []
        for memory in memories:
            result.append({
                'id': memory[0],
                'content': memory[1],
                'memory_type': memory[2],
                'context': json.loads(memory[3] or '{}'),
                'confidence': memory[4],
                'created_at': memory[5],
                'access_count': memory[6]
            })
            
            # Actualizar estadísticas de acceso
            cursor.execute('''
                UPDATE memories 
                SET last_accessed = datetime("now"), access_count = access_count + 1
                WHERE id = ?
            ''', (memory[0],))
        
        conn.commit()
        conn.close()
        
        # Guardar en cache
        self.cache[cache_key] = result
        self.cache_timestamps[cache_key] = time.time()
        
        return result
    
    def get_conversation_context(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Obtener contexto de conversación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, messages, created_at, last_activity
            FROM conversations WHERE session_id = ?
        ''', (session_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'user_id': result[0],
                'messages': json.loads(result[1] or '[]'),
                'created_at': result[2],
                'last_activity': result[3]
            }
        
        return None
    
    def update_conversation_context(self, session_id: str, user_id: str, message: str, role: str = "user"):
        """Actualizar contexto de conversación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener mensajes existentes
        cursor.execute('SELECT messages FROM conversations WHERE session_id = ?', (session_id,))
        result = cursor.fetchone()
        
        messages = []
        if result and result[0]:
            messages = json.loads(result[0])
        
        # Agregar nuevo mensaje
        messages.append({
            'role': role,
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Mantener solo los últimos mensajes
        if len(messages) > LowCostConfig.MAX_CONVERSATION_HISTORY:
            messages = messages[-LowCostConfig.MAX_CONVERSATION_HISTORY:]
        
        # Insertar o actualizar
        cursor.execute('''
            INSERT OR REPLACE INTO conversations 
            (session_id, user_id, messages, last_activity)
            VALUES (?, ?, ?, datetime("now"))
        ''', (session_id, user_id, json.dumps(messages)))
        
        conn.commit()
        conn.close()
    
    def _cleanup_cache(self):
        """Limpiar cache cuando excede el límite"""
        if len(self.cache) > LowCostConfig.MAX_CACHE_SIZE:
            # Eliminar entradas más antiguas
            sorted_items = sorted(
                self.cache_timestamps.items(),
                key=lambda x: x[1]
            )
            
            items_to_remove = len(self.cache) - LowCostConfig.MAX_CACHE_SIZE + 10
            for cache_key, _ in sorted_items[:items_to_remove]:
                if cache_key in self.cache:
                    del self.cache[cache_key]
                if cache_key in self.cache_timestamps:
                    del self.cache_timestamps[cache_key]
    
    def cleanup_expired_memories(self):
        """Limpiar memorias expiradas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM memories WHERE expires_at < datetime("now")')
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count} expired memories")
            # Reconstruir embeddings
            self._load_embeddings()

# ======== SISTEMA DE MEMORIA ULTRA-ECONÓMICO ========
class UltraLowCostMemorySystem:
    """Sistema de memoria con costo operacional mínimo"""
    
    def __init__(self):
        self.db = SimpleMemoryDB()
        self.last_cleanup = time.time()
    
    def _extract_memories_from_message(self, user_id: str, message: str) -> List[Dict[str, str]]:
        """Extraer memorias usando regex simple (0 costo)"""
        memories = []
        lower_message = message.lower()
        
        # Patrones simples para detectar información importante
        patterns = {
            'preference': [
                r'me gusta\s+(.+)',
                r'prefiero\s+(.+)',
                r'me encanta\s+(.+)',
                r'odio\s+(.+)',
                r'mi favorito\s+(.+)',
                r'siempre uso\s+(.+)',
                r'nunca uso\s+(.+)'
            ],
            'profile': [
                r'vivo en\s+(.+)',
                r'soy de\s+(.+)',
                r'trabajo en\s+(.+)',
                r'estudio\s+(.+)',
                r'toco\s+(.+)',
                r'tengo\s+(.+)',
                r'mi nombre es\s+(.+)'
            ],
            'decision': [
                r'a partir de ahora\s+(.+)',
                r'desde ahora\s+(.+)',
                r'decido\s+(.+)',
                r'quiero que\s+(.+)',
                r'configura\s+(.+)',
                r'cambia\s+(.+)'
            ]
        }
        
        for memory_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                matches = re.findall(pattern, lower_message)
                for match in matches:
                    if len(match.strip()) > 3:  # Filtrar coincidencias muy cortas
                        memories.append({
                            'type': memory_type,
                            'content': match.strip(),
                            'confidence': 0.8
                        })
        
        return memories
    
    def process_message(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Procesar mensaje con costo mínimo"""
        try:
            # Limpieza periódica
            if time.time() - self.last_cleanup > LowCostConfig.CLEANUP_INTERVAL_HOURS * 3600:
                self.db.cleanup_expired_memories()
                self.last_cleanup = time.time()
            
            # 1. Actualizar contexto de conversación
            self.db.update_conversation_context(session_id, user_id, message, "user")
            
            # 2. Extraer memorias automáticamente
            extracted_memories = self._extract_memories_from_message(user_id, message)
            
            # 3. Agregar memorias extraídas
            added_memories = []
            for memory in extracted_memories:
                memory_id = self.db.add_memory(
                    user_id, memory['content'], memory['type']
                )
                added_memories.append({
                    'id': memory_id,
                    'content': memory['content'],
                    'type': memory['type'],
                    'confidence': memory['confidence']
                })
            
            # 4. Buscar memorias relevantes
            relevant_memories = self.db.search_memories(user_id, message)
            
            # 5. Obtener contexto de conversación
            conversation_context = self.db.get_conversation_context(session_id)
            
            # 6. Generar prompt contextual simple
            contextual_prompt = self._generate_simple_prompt(
                user_id, message, relevant_memories, conversation_context
            )
            
            return {
                'contextual_prompt': contextual_prompt,
                'relevant_memories': relevant_memories,
                'extracted_memories': added_memories,
                'conversation_context': conversation_context,
                'cost_estimate': self._calculate_cost_estimate(len(relevant_memories), len(added_memories))
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                'contextual_prompt': f"Usuario: {message}",
                'relevant_memories': [],
                'extracted_memories': [],
                'conversation_context': None,
                'error': str(e),
                'cost_estimate': 0.001  # Costo mínimo de error
            }
    
    def _generate_simple_prompt(self, user_id: str, message: str, memories: List[Dict], context: Dict) -> str:
        """Generar prompt contextual simple"""
        prompt_parts = [
            "Eres Pixel IA, asistente musical inteligente.",
            "Usa las memorias del usuario para personalizar tu respuesta.",
            "",
            f"=== MEMORIAS DE {user_id} ==="
        ]
        
        if memories:
            for memory in memories[:5]:  # Máximo 5 memorias
                prompt_parts.append(f"- [{memory['memory_type'].upper()}] {memory['content']}")
        else:
            prompt_parts.append("- No hay memorias específicas")
        
        if context and context.get('messages'):
            prompt_parts.extend([
                "",
                "=== CONTEXTO RECIENTE ==="
            ])
            recent_messages = context['messages'][-3:]  # Últimos 3 mensajes
            for msg in recent_messages:
                role = msg['role'].upper()
                content = msg['content'][:100]  # Limitar longitud
                prompt_parts.append(f"{role}: {content}")
        
        prompt_parts.extend([
            "",
            f"Usuario: {message}"
        ])
        
        return "\n".join(prompt_parts)
    
    def _calculate_cost_estimate(self, relevant_count: int, extracted_count: int) -> float:
        """Calcular estimación de costo"""
        # Costo base por operación
        base_cost = 0.001  # $0.001 USD
        
        # Costo por memoria procesada
        memory_cost = (relevant_count + extracted_count) * 0.0001
        
        # Costo por embedding (simulado)
        embedding_cost = relevant_count * 0.00001
        
        return base_cost + memory_cost + embedding_cost
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Obtener estadísticas del usuario"""
        memories = self.db.search_memories(user_id, "")
        
        stats = {
            'total_memories': len(memories),
            'memory_types': {},
            'recent_activity': 0,
            'estimated_monthly_cost': 0.0
        }
        
        # Contar tipos de memoria
        for memory in memories:
            memory_type = memory['memory_type']
            stats['memory_types'][memory_type] = stats['memory_types'].get(memory_type, 0) + 1
        
        # Calcular actividad reciente
        recent_cutoff = datetime.now() - timedelta(days=7)
        stats['recent_activity'] = sum(
            1 for memory in memories 
            if datetime.fromisoformat(memory['created_at']) > recent_cutoff
        )
        
        # Estimar costo mensual
        stats['estimated_monthly_cost'] = stats['total_memories'] * 0.01  # $0.01 por memoria
        
        return stats

# ======== INSTANCIA GLOBAL ULTRA-ECONÓMICA ========
ultra_low_cost_memory = UltraLowCostMemorySystem()

# ======== FUNCIONES DE UTILIDAD ========
def process_message_low_cost(user_id: str, session_id: str, message: str) -> Dict[str, Any]:
    """Procesar mensaje con costo mínimo"""
    return ultra_low_cost_memory.process_message(user_id, session_id, message)

def get_user_stats_low_cost(user_id: str) -> Dict[str, Any]:
    """Obtener estadísticas del usuario"""
    return ultra_low_cost_memory.get_user_stats(user_id)

# ======== EJEMPLO DE USO ========
if __name__ == "__main__":
    # Test del sistema ultra-económico
    user_id = "test_user"
    session_id = "test_session"
    
    # Mensaje 1
    result1 = process_message_low_cost(
        user_id, session_id, 
        "Me gusta la música electrónica y prefiero sintetizadores analógicos"
    )
    print("Costo estimado:", result1['cost_estimate'])
    print("Memorias extraídas:", len(result1['extracted_memories']))
    
    # Mensaje 2
    result2 = process_message_low_cost(
        user_id, session_id,
        "¿Qué sintetizador me recomiendas para pads atmosféricos?"
    )
    print("Memorias relevantes encontradas:", len(result2['relevant_memories']))
    
    # Estadísticas
    stats = get_user_stats_low_cost(user_id)
    print("Estadísticas del usuario:", stats)
