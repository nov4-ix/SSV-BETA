import json
import sqlite3
import hashlib
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import requests
import os

logger = logging.getLogger(__name__)

# ======== CONFIGURACIÓN ECONÓMICA PERO FUNCIONAL ========
class CostOptimizedConfig:
    # Base de datos local (costo: $0)
    DB_PATH = "pixel_memories.db"
    
    # Embeddings económicos (costo: ~$0.001 por request)
    EMBEDDING_API_URL = "https://api.openai.com/v1/embeddings"
    EMBEDDING_MODEL = "text-embedding-3-small"  # Más barato que ada-002
    
    # Qwen API económica (costo: ~$0.002 por request)
    QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    QWEN_MODEL = "qwen2.5-7b-instruct"  # Modelo más pequeño y económico
    
    # Límites para controlar costos
    MAX_MEMORIES_PER_USER = 50
    MAX_CONVERSATION_HISTORY = 10
    EMBEDDING_CACHE_TTL = 3600  # 1 hora
    MAX_EMBEDDING_REQUESTS_PER_HOUR = 100

# ======== SISTEMA DE MEMORIA ECONÓMICO PERO FUNCIONAL ========
class CostOptimizedMemorySystem:
    """Sistema de memoria que vale la pena el costo"""
    
    def __init__(self):
        self.db_path = CostOptimizedConfig.DB_PATH
        self.embedding_cache = {}
        self.request_count = 0
        self.last_reset = time.time()
        self._init_database()
    
    def _init_database(self):
        """Inicializar base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de memorias con embeddings
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                embedding TEXT,
                confidence REAL DEFAULT 1.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                access_count INTEGER DEFAULT 0
            )
        ''')
        
        # Tabla de conversaciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                message TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de costos (para tracking)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cost_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_type TEXT NOT NULL,
                cost REAL NOT NULL,
                tokens_used INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Índices para optimización
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id)')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized with cost tracking")
    
    def _get_embedding(self, text: str) -> Optional[List[float]]:
        """Obtener embedding económico"""
        # Verificar cache primero
        cache_key = hashlib.md5(text.encode()).hexdigest()
        if cache_key in self.embedding_cache:
            cached_data = self.embedding_cache[cache_key]
            if time.time() - cached_data['timestamp'] < CostOptimizedConfig.EMBEDDING_CACHE_TTL:
                return cached_data['embedding']
        
        # Verificar límite de requests
        if self._check_rate_limit():
            logger.warning("Rate limit reached for embeddings")
            return None
        
        try:
            # Llamada a API económica
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": CostOptimizedConfig.EMBEDDING_MODEL,
                "input": text[:1000],  # Limitar texto para reducir costo
                "encoding_format": "float"
            }
            
            response = requests.post(
                CostOptimizedConfig.EMBEDDING_API_URL,
                headers=headers,
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                embedding = result['data'][0]['embedding']
                
                # Guardar en cache
                self.embedding_cache[cache_key] = {
                    'embedding': embedding,
                    'timestamp': time.time()
                }
                
                # Trackear costo
                self._track_cost('embedding', 0.0001, result.get('usage', {}).get('total_tokens', 0))
                
                return embedding
            else:
                logger.error(f"Embedding API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            return None
    
    def _check_rate_limit(self) -> bool:
        """Verificar límite de requests por hora"""
        current_time = time.time()
        
        # Reset contador cada hora
        if current_time - self.last_reset > 3600:
            self.request_count = 0
            self.last_reset = current_time
        
        return self.request_count >= CostOptimizedConfig.MAX_EMBEDDING_REQUESTS_PER_HOUR
    
    def _track_cost(self, operation_type: str, cost: float, tokens: int = 0):
        """Trackear costos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO cost_tracking (operation_type, cost, tokens_used)
            VALUES (?, ?, ?)
        ''', (operation_type, cost, tokens))
        
        conn.commit()
        conn.close()
        
        self.request_count += 1
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calcular similitud coseno"""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def add_memory(self, user_id: str, content: str, memory_type: str) -> int:
        """Agregar memoria con embedding"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener embedding
        embedding = self._get_embedding(content)
        embedding_json = json.dumps(embedding) if embedding else None
        
        # Calcular expiración
        expires_at = None
        if memory_type in ['preference', 'decision']:
            expires_at = datetime.now() + timedelta(days=30)
        
        cursor.execute('''
            INSERT INTO memories (user_id, content, memory_type, embedding, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, content, memory_type, embedding_json, expires_at))
        
        memory_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Added memory {memory_id} for user {user_id} (cost: ~$0.0001)")
        return memory_id
    
    def search_memories(self, user_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Búsqueda semántica económica"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener memorias del usuario
        cursor.execute('''
            SELECT id, content, memory_type, embedding, confidence, created_at, access_count
            FROM memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY created_at DESC
            LIMIT 20
        ''', (user_id,))
        
        memories = cursor.fetchall()
        conn.close()
        
        if not memories or not query.strip():
            return []
        
        # Obtener embedding de la consulta
        query_embedding = self._get_embedding(query)
        if not query_embedding:
            # Fallback: búsqueda por texto simple
            return [
                {
                    'id': mem[0],
                    'content': mem[1],
                    'memory_type': mem[2],
                    'confidence': mem[4],
                    'created_at': mem[5],
                    'access_count': mem[6]
                }
                for mem in memories[:limit]
            ]
        
        # Calcular similitudes
        similarities = []
        for memory in memories:
            memory_embedding = json.loads(memory[3]) if memory[3] else None
            
            if memory_embedding:
                similarity = self._cosine_similarity(query_embedding, memory_embedding)
                similarities.append((similarity, memory))
            else:
                # Fallback para memorias sin embedding
                similarities.append((0.1, memory))
        
        # Ordenar por similitud
        similarities.sort(key=lambda x: x[0], reverse=True)
        
        # Actualizar contadores de acceso
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        result = []
        for similarity, memory in similarities[:limit]:
            if similarity > 0.3:  # Umbral mínimo de similitud
                result.append({
                    'id': memory[0],
                    'content': memory[1],
                    'memory_type': memory[2],
                    'confidence': memory[4],
                    'created_at': memory[5],
                    'access_count': memory[6],
                    'similarity': similarity
                })
                
                # Actualizar contador de acceso
                cursor.execute('''
                    UPDATE memories 
                    SET access_count = access_count + 1
                    WHERE id = ?
                ''', (memory[0],))
        
        conn.commit()
        conn.close()
        
        return result
    
    def add_message(self, session_id: str, user_id: str, message: str, role: str = "user"):
        """Agregar mensaje"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversations (session_id, user_id, message, role)
            VALUES (?, ?, ?, ?)
        ''', (session_id, user_id, message, role))
        
        conn.commit()
        conn.close()
    
    def get_recent_messages(self, session_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Obtener mensajes recientes"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message, role, created_at
            FROM conversations 
            WHERE session_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ''', (session_id, limit))
        
        messages = cursor.fetchall()
        conn.close()
        
        return [
            {
                'message': msg[0],
                'role': msg[1],
                'created_at': msg[2]
            }
            for msg in reversed(messages)
        ]
    
    def generate_response(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Generar respuesta usando Qwen API económica"""
        try:
            # Obtener memorias relevantes
            relevant_memories = self.search_memories(user_id, message, 3)
            
            # Obtener contexto de conversación
            recent_messages = self.get_recent_messages(session_id, 3)
            
            # Construir prompt económico pero efectivo
            prompt_parts = [
                "Eres Pixel IA, asistente musical inteligente con memoria personalizada.",
                "Responde de forma útil y personalizada usando la información del usuario.",
                "",
                "=== INFORMACIÓN DEL USUARIO ==="
            ]
            
            if relevant_memories:
                for memory in relevant_memories:
                    prompt_parts.append(f"- {memory['content']}")
            else:
                prompt_parts.append("- No hay información específica disponible")
            
            if recent_messages:
                prompt_parts.extend([
                    "",
                    "=== CONVERSACIÓN RECIENTE ==="
                ])
                for msg in recent_messages:
                    role = "Usuario" if msg['role'] == 'user' else "Pixel IA"
                    prompt_parts.append(f"{role}: {msg['message']}")
            
            prompt_parts.extend([
                "",
                f"Usuario: {message}",
                "",
                "Pixel IA:"
            ])
            
            prompt = "\n".join(prompt_parts)
            
            # Llamada a Qwen API económica
            headers = {
                "Authorization": f"Bearer {os.getenv('DASHSCOPE_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": CostOptimizedConfig.QWEN_MODEL,
                "input": {
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                },
                "parameters": {
                    "max_tokens": 200,  # Limitar tokens para reducir costo
                    "temperature": 0.7,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(
                CostOptimizedConfig.QWEN_API_URL,
                headers=headers,
                json=data,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['output']['text']
                
                # Guardar respuesta del AI
                self.add_message(session_id, user_id, ai_response, "assistant")
                
                # Trackear costo
                usage = result.get('usage', {})
                self._track_cost('qwen_generation', 0.002, usage.get('total_tokens', 0))
                
                return {
                    'success': True,
                    'response': ai_response,
                    'memories_used': len(relevant_memories),
                    'cost_estimate': 0.002,
                    'tokens_used': usage.get('total_tokens', 0)
                }
            else:
                logger.error(f"Qwen API error: {response.status_code}")
                return {
                    'success': False,
                    'error': f"API error: {response.status_code}",
                    'response': "Lo siento, no puedo responder en este momento."
                }
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                'success': False,
                'error': str(e),
                'response': "Lo siento, ocurrió un error."
            }
    
    def get_cost_summary(self, days: int = 7) -> Dict[str, Any]:
        """Obtener resumen de costos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT operation_type, SUM(cost), SUM(tokens_used), COUNT(*)
            FROM cost_tracking 
            WHERE created_at > datetime('now', '-{} days')
            GROUP BY operation_type
        '''.format(days))
        
        costs = cursor.fetchall()
        conn.close()
        
        total_cost = sum(cost[1] for cost in costs)
        total_tokens = sum(cost[2] for cost in costs)
        
        return {
            'total_cost': total_cost,
            'total_tokens': total_tokens,
            'days': days,
            'breakdown': [
                {
                    'operation': cost[0],
                    'cost': cost[1],
                    'tokens': cost[2],
                    'requests': cost[3]
                }
                for cost in costs
            ],
            'daily_average': total_cost / days if days > 0 else 0
        }

# ======== CONTROLADOR ECONÓMICO PERO FUNCIONAL ========
class CostOptimizedPixelController:
    """Controlador que vale la pena el costo"""
    
    def __init__(self):
        self.memory = CostOptimizedMemorySystem()
    
    def process_message(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Procesar mensaje con costo optimizado"""
        try:
            # Guardar mensaje del usuario
            self.memory.add_message(session_id, user_id, message, "user")
            
            # Extraer memorias automáticamente (simple pero efectivo)
            extracted_memories = self._extract_memories_simple(message)
            
            # Guardar memorias extraídas
            saved_memories = []
            for memory in extracted_memories:
                memory_id = self.memory.add_memory(
                    user_id, memory['content'], memory['type']
                )
                saved_memories.append({
                    'id': memory_id,
                    'content': memory['content'],
                    'type': memory['type']
                })
            
            # Generar respuesta usando AI
            ai_result = self.memory.generate_response(user_id, session_id, message)
            
            return {
                'success': True,
                'ai_response': ai_result['response'],
                'extracted_memories': saved_memories,
                'memories_used': ai_result.get('memories_used', 0),
                'cost_estimate': ai_result.get('cost_estimate', 0),
                'tokens_used': ai_result.get('tokens_used', 0)
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                'success': False,
                'error': str(e),
                'ai_response': "Lo siento, ocurrió un error."
            }
    
    def _extract_memories_simple(self, message: str) -> List[Dict[str, str]]:
        """Extraer memorias usando patrones simples pero efectivos"""
        memories = []
        lower_msg = message.lower()
        
        # Patrones que realmente funcionan
        patterns = {
            'preference': [
                ('me gusta', 'Le gusta'),
                ('prefiero', 'Prefiere'),
                ('me encanta', 'Le encanta'),
                ('odio', 'No le gusta'),
                ('mi favorito', 'Su favorito es')
            ],
            'profile': [
                ('vivo en', 'Vive en'),
                ('soy de', 'Es de'),
                ('trabajo en', 'Trabaja en'),
                ('toco', 'Toca'),
                ('tengo', 'Tiene')
            ],
            'decision': [
                ('a partir de ahora', 'Decidió que'),
                ('desde ahora', 'Decidió que'),
                ('quiero que', 'Quiere que'),
                ('configura', 'Configuró')
            ]
        }
        
        for memory_type, pattern_list in patterns.items():
            for pattern, prefix in pattern_list:
                if pattern in lower_msg:
                    parts = message.split(pattern)
                    if len(parts) > 1:
                        content = parts[1].strip()
                        if len(content) > 3:
                            memories.append({
                                'type': memory_type,
                                'content': f"{prefix}: {content}"
                            })
        
        return memories
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Obtener estadísticas del usuario"""
        conn = sqlite3.connect(self.memory.db_path)
        cursor = conn.cursor()
        
        # Contar memorias por tipo
        cursor.execute('''
            SELECT memory_type, COUNT(*)
            FROM memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            GROUP BY memory_type
        ''', (user_id,))
        
        memory_counts = dict(cursor.fetchall())
        
        # Contar mensajes recientes
        cursor.execute('''
            SELECT COUNT(*)
            FROM conversations 
            WHERE user_id = ? AND created_at > datetime('now', '-7 days')
        ''', (user_id,))
        
        recent_messages = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'user_id': user_id,
            'memory_counts': memory_counts,
            'total_memories': sum(memory_counts.values()),
            'recent_messages': recent_messages,
            'system_status': 'operational'
        }

# ======== INSTANCIA GLOBAL ECONÓMICA ========
cost_optimized_controller = CostOptimizedPixelController()

# ======== FUNCIONES DE UTILIDAD ========
def process_message_cost_optimized(user_id: str, session_id: str, message: str) -> Dict[str, Any]:
    """Procesar mensaje con costo optimizado"""
    return cost_optimized_controller.process_message(user_id, session_id, message)

def get_user_stats_cost_optimized(user_id: str) -> Dict[str, Any]:
    """Obtener estadísticas del usuario"""
    return cost_optimized_controller.get_user_stats(user_id)

def get_cost_summary(days: int = 7) -> Dict[str, Any]:
    """Obtener resumen de costos"""
    return cost_optimized_controller.memory.get_cost_summary(days)

# ======== TEST ECONÓMICO ========
if __name__ == "__main__":
    print("=== TEST DEL SISTEMA ECONÓMICO PERO FUNCIONAL ===")
    
    user_id = "test_user_economico"
    session_id = "session_economica"
    
    # Test 1: Usuario comparte preferencia
    print("\n1. Usuario comparte preferencia:")
    result1 = process_message_cost_optimized(
        user_id, session_id,
        "Me gusta la música electrónica y prefiero sintetizadores analógicos"
    )
    print(f"Respuesta AI: {result1['ai_response'][:100]}...")
    print(f"Costo estimado: ${result1['cost_estimate']:.4f}")
    print(f"Memorias extraídas: {len(result1['extracted_memories'])}")
    
    # Test 2: Usuario hace pregunta
    print("\n2. Usuario hace pregunta:")
    result2 = process_message_cost_optimized(
        user_id, session_id,
        "¿Qué sintetizador me recomiendas para crear pads atmosféricos?"
    )
    print(f"Respuesta AI: {result2['ai_response'][:100]}...")
    print(f"Costo estimado: ${result2['cost_estimate']:.4f}")
    print(f"Memorias usadas: {result2['memories_used']}")
    
    # Test 3: Estadísticas
    print("\n3. Estadísticas del usuario:")
    stats = get_user_stats_cost_optimized(user_id)
    print(f"Total memorias: {stats['total_memories']}")
    print(f"Mensajes recientes: {stats['recent_messages']}")
    
    # Test 4: Resumen de costos
    print("\n4. Resumen de costos:")
    cost_summary = get_cost_summary(1)
    print(f"Costo total: ${cost_summary['total_cost']:.4f}")
    print(f"Tokens usados: {cost_summary['total_tokens']}")
    print(f"Promedio diario: ${cost_summary['daily_average']:.4f}")
    
    print("\n=== SISTEMA ECONÓMICO PERO REAL ===")
