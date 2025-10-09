import json
import sqlite3
import hashlib
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import requests
import os
from enum import Enum

logger = logging.getLogger(__name__)

# ======== CONFIGURACIÓN PREMIUM INTELIGENTE ========
class SmartPremiumConfig:
    # Base de datos local (costo: $0)
    DB_PATH = "smart_premium_memories.db"
    
    # APIs optimizadas por costo/calidad
    OPENAI_API_URL = "https://api.openai.com/v1"
    EMBEDDING_MODEL = "text-embedding-3-small"  # Más barato pero bueno
    CHAT_MODEL = "gpt-4o-mini"  # Balance perfecto costo/calidad
    
    # Límites inteligentes por tier
    TIER_LIMITS = {
        'pro': {
            'daily_ai_requests': 50,
            'daily_embeddings': 200,
            'max_memories': 100,
            'max_conversation_history': 20
        },
        'premium': {
            'daily_ai_requests': 100,
            'daily_embeddings': 500,
            'max_memories': 250,
            'max_conversation_history': 50
        },
        'enterprise': {
            'daily_ai_requests': 200,
            'daily_embeddings': 1000,
            'max_memories': 500,
            'max_conversation_history': 100
        }
    }
    
    # Cache inteligente
    EMBEDDING_CACHE_TTL = 7200  # 2 horas
    RESPONSE_CACHE_TTL = 1800   # 30 minutos
    
    # Optimizaciones de costo
    MIN_QUERY_LENGTH_FOR_EMBEDDING = 10  # Solo embeddings para consultas significativas
    MAX_EMBEDDING_TEXT_LENGTH = 500      # Limitar texto para embeddings
    MAX_RESPONSE_TOKENS = 300            # Respuestas concisas pero útiles

class SubscriptionTier(Enum):
    PRO = "pro"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

# ======== SISTEMA PREMIUM INTELIGENTE ========
class SmartPremiumMemorySystem:
    """Sistema premium que optimiza costos sin sacrificar calidad"""
    
    def __init__(self):
        self.db_path = SmartPremiumConfig.DB_PATH
        self.embedding_cache = {}
        self.response_cache = {}
        self.daily_counters = {}
        self._init_database()
    
    def _init_database(self):
        """Inicializar base de datos optimizada"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de usuarios premium
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS premium_users (
                user_id TEXT PRIMARY KEY,
                subscription_tier TEXT NOT NULL,
                subscription_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                subscription_end TIMESTAMP,
                daily_limits JSON,
                is_active BOOLEAN DEFAULT 1,
                last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de memorias optimizada
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS smart_memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                category TEXT,
                embedding_hash TEXT,
                importance_score REAL DEFAULT 0.5,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Tabla de conversaciones optimizada
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS smart_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                message TEXT NOT NULL,
                role TEXT NOT NULL,
                response_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Tabla de uso diario
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                ai_requests INTEGER DEFAULT 0,
                embeddings INTEGER DEFAULT 0,
                tokens_used INTEGER DEFAULT 0,
                cost REAL DEFAULT 0.0,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Índices optimizados
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_smart_memories_user ON smart_memories(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_smart_memories_type ON smart_memories(memory_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_smart_conversations_session ON smart_conversations(session_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date)')
        
        conn.commit()
        conn.close()
        logger.info("Smart premium database initialized")
    
    def _check_premium_access(self, user_id: str) -> bool:
        """Verificar acceso premium"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT is_active, subscription_end
            FROM premium_users 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return False
        
        is_active, subscription_end = result
        return is_active and (not subscription_end or datetime.fromisoformat(subscription_end) > datetime.now())
    
    def _get_user_tier(self, user_id: str) -> Optional[SubscriptionTier]:
        """Obtener tier del usuario"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT subscription_tier
            FROM premium_users 
            WHERE user_id = ? AND is_active = 1
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        return SubscriptionTier(result[0]) if result else None
    
    def _get_daily_limits(self, user_id: str) -> Dict[str, int]:
        """Obtener límites diarios del usuario"""
        tier = self._get_user_tier(user_id)
        if not tier:
            return SmartPremiumConfig.TIER_LIMITS['pro']
        
        return SmartPremiumConfig.TIER_LIMITS[tier.value]
    
    def _check_daily_limits(self, user_id: str, operation: str) -> bool:
        """Verificar límites diarios"""
        limits = self._get_daily_limits(user_id)
        
        # Obtener uso actual
        today = datetime.now().strftime('%Y-%m-%d')
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ai_requests, embeddings
            FROM daily_usage 
            WHERE user_id = ? AND date = ?
        ''', (user_id, today))
        
        result = cursor.fetchone()
        conn.close()
        
        current_ai = result[0] if result else 0
        current_embeddings = result[1] if result else 0
        
        # Verificar límites
        if operation == 'ai_request' and current_ai >= limits['daily_ai_requests']:
            return False
        if operation == 'embedding' and current_embeddings >= limits['daily_embeddings']:
            return False
        
        return True
    
    def _update_daily_usage(self, user_id: str, operation: str, tokens: int = 0, cost: float = 0.0):
        """Actualizar uso diario"""
        today = datetime.now().strftime('%Y-%m-%d')
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insertar o actualizar uso diario
        cursor.execute('''
            INSERT INTO daily_usage (user_id, date, ai_requests, embeddings, tokens_used, cost)
            VALUES (?, ?, 0, 0, 0, 0.0)
            ON CONFLICT(user_id, date) DO NOTHING
        ''', (user_id, today))
        
        if operation == 'ai_request':
            cursor.execute('''
                UPDATE daily_usage 
                SET ai_requests = ai_requests + 1, tokens_used = tokens_used + ?, cost = cost + ?
                WHERE user_id = ? AND date = ?
            ''', (tokens, cost, user_id, today))
        elif operation == 'embedding':
            cursor.execute('''
                UPDATE daily_usage 
                SET embeddings = embeddings + 1, cost = cost + ?
                WHERE user_id = ? AND date = ?
            ''', (cost, user_id, today))
        
        conn.commit()
        conn.close()
    
    def _get_embedding_smart(self, text: str) -> Optional[List[float]]:
        """Obtener embedding con optimizaciones inteligentes"""
        # Solo para textos significativos
        if len(text.strip()) < SmartPremiumConfig.MIN_QUERY_LENGTH_FOR_EMBEDDING:
            return None
        
        # Limitar longitud para reducir costo
        text = text[:SmartPremiumConfig.MAX_EMBEDDING_TEXT_LENGTH]
        
        # Verificar cache
        cache_key = hashlib.md5(text.encode()).hexdigest()
        if cache_key in self.embedding_cache:
            cached_data = self.embedding_cache[cache_key]
            if time.time() - cached_data['timestamp'] < SmartPremiumConfig.EMBEDDING_CACHE_TTL:
                return cached_data['embedding']
        
        try:
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": SmartPremiumConfig.EMBEDDING_MODEL,
                "input": text,
                "encoding_format": "float"
            }
            
            response = requests.post(
                f"{SmartPremiumConfig.OPENAI_API_URL}/embeddings",
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
                
                return embedding
            else:
                logger.error(f"Embedding API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            return None
    
    def add_smart_memory(self, user_id: str, content: str, memory_type: str, category: str = None) -> int:
        """Agregar memoria con optimizaciones"""
        if not self._check_premium_access(user_id):
            raise ValueError("Premium subscription required")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Solo obtener embedding para memorias importantes
        embedding_hash = None
        if memory_type in ['preference', 'profile'] and len(content) > 20:
            embedding = self._get_embedding_smart(content)
            if embedding:
                embedding_hash = hashlib.md5(str(embedding).encode()).hexdigest()
        
        # Calcular importancia inteligente
        importance_score = self._calculate_smart_importance(content, memory_type)
        
        # Extraer tags simples
        tags = self._extract_smart_tags(content, memory_type)
        
        # Calcular expiración
        expires_at = None
        if memory_type in ['preference', 'decision']:
            expires_at = datetime.now() + timedelta(days=60)  # Más tiempo para premium
        
        cursor.execute('''
            INSERT INTO smart_memories 
            (user_id, content, memory_type, category, embedding_hash, importance_score, tags, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, content, memory_type, category, embedding_hash, importance_score, tags, expires_at))
        
        memory_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Added smart memory {memory_id} for user {user_id}")
        return memory_id
    
    def _calculate_smart_importance(self, content: str, memory_type: str) -> float:
        """Calcular importancia de forma inteligente"""
        base_scores = {
            'preference': 0.8,
            'profile': 0.9,
            'decision': 0.7,
            'fact': 0.6,
            'behavior': 0.5
        }
        
        base_score = base_scores.get(memory_type, 0.5)
        
        # Ajustar por contenido musical
        music_keywords = ['música', 'sintetizador', 'guitarra', 'piano', 'batería', 'voz', 'grabación', 'mezcla']
        music_factor = sum(0.05 for keyword in music_keywords if keyword.lower() in content.lower())
        
        # Ajustar por longitud (más detalle = más importante)
        length_factor = min(len(content) / 200, 0.2)
        
        return min(base_score + music_factor + length_factor, 1.0)
    
    def _extract_smart_tags(self, content: str, memory_type: str) -> str:
        """Extraer tags de forma inteligente"""
        tags = [memory_type]
        
        # Tags musicales simples
        music_tags = {
            'instrumentos': ['guitarra', 'piano', 'batería', 'bajo', 'sintetizador'],
            'géneros': ['rock', 'pop', 'jazz', 'electrónica', 'clásica'],
            'proceso': ['grabación', 'mezcla', 'mastering', 'composición']
        }
        
        content_lower = content.lower()
        for category, keywords in music_tags.items():
            for keyword in keywords:
                if keyword in content_lower:
                    tags.append(keyword)
                    break  # Solo un tag por categoría
        
        return ','.join(tags[:5])  # Máximo 5 tags
    
    def search_smart_memories(self, user_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Búsqueda inteligente con fallbacks"""
        if not self._check_premium_access(user_id):
            raise ValueError("Premium subscription required")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener memorias del usuario
        cursor.execute('''
            SELECT id, content, memory_type, category, importance_score, tags, created_at, access_count
            FROM smart_memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY importance_score DESC, created_at DESC
            LIMIT 30
        ''', (user_id,))
        
        memories = cursor.fetchall()
        conn.close()
        
        if not memories or not query.strip():
            return []
        
        # Búsqueda semántica solo si es necesario
        if len(query) >= SmartPremiumConfig.MIN_QUERY_LENGTH_FOR_EMBEDDING:
            query_embedding = self._get_embedding_smart(query)
            if query_embedding:
                # Búsqueda semántica
                similarities = []
                for memory in memories:
                    if memory[4]:  # Si tiene embedding_hash
                        # Simulación de similitud (en producción usarías el embedding real)
                        similarity = 0.5 + (memory[4] * 0.3)  # Basado en importancia
                        similarities.append((similarity, memory))
                    else:
                        similarities.append((memory[4] * 0.5, memory))  # Solo importancia
                
                similarities.sort(key=lambda x: x[0], reverse=True)
                memories = [mem for _, mem in similarities]
        
        # Actualizar contadores de acceso
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        result = []
        for memory in memories[:limit]:
            result.append({
                'id': memory[0],
                'content': memory[1],
                'memory_type': memory[2],
                'category': memory[3],
                'importance_score': memory[4],
                'tags': memory[5].split(',') if memory[5] else [],
                'created_at': memory[6],
                'access_count': memory[7]
            })
            
            # Actualizar contador
            cursor.execute('''
                UPDATE smart_memories 
                SET access_count = access_count + 1
                WHERE id = ?
            ''', (memory[0],))
        
        conn.commit()
        conn.close()
        
        return result
    
    def add_smart_message(self, session_id: str, user_id: str, message: str, role: str = "user", response_hash: str = None):
        """Agregar mensaje con optimizaciones"""
        if not self._check_premium_access(user_id):
            raise ValueError("Premium subscription required")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO smart_conversations 
            (session_id, user_id, message, role, response_hash)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, user_id, message, role, response_hash))
        
        conn.commit()
        conn.close()
    
    def get_smart_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtener historial de conversación optimizado"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message, role, created_at
            FROM smart_conversations 
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
    
    def generate_smart_response(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Generar respuesta inteligente con optimizaciones de costo"""
        if not self._check_premium_access(user_id):
            return {
                'success': False,
                'error': 'Premium subscription required',
                'response': 'Esta funcionalidad está disponible solo para usuarios premium.'
            }
        
        # Verificar límites diarios
        if not self._check_daily_limits(user_id, 'ai_request'):
            return {
                'success': False,
                'error': 'Daily AI request limit reached',
                'response': 'Has alcanzado el límite diario de solicitudes AI. Inténtalo mañana.'
            }
        
        # Verificar cache de respuestas similares
        response_hash = hashlib.md5(f"{user_id}:{message}".encode()).hexdigest()
        if response_hash in self.response_cache:
            cached_response = self.response_cache[response_hash]
            if time.time() - cached_response['timestamp'] < SmartPremiumConfig.RESPONSE_CACHE_TTL:
                logger.info("Using cached response")
                return {
                    'success': True,
                    'response': cached_response['response'],
                    'cached': True,
                    'cost_estimate': 0.0
                }
        
        try:
            # Obtener memorias relevantes
            relevant_memories = self.search_smart_memories(user_id, message, 3)
            
            # Obtener historial de conversación
            conversation_history = self.get_smart_conversation_history(session_id, 5)
            
            # Construir prompt optimizado
            prompt_parts = [
                "Eres Pixel IA Premium, asistente musical inteligente.",
                "Responde de forma útil y personalizada usando la información del usuario.",
                "Sé conciso pero valioso.",
                "",
                "=== INFORMACIÓN DEL USUARIO ==="
            ]
            
            if relevant_memories:
                for memory in relevant_memories:
                    tags_str = f" ({', '.join(memory['tags'])})" if memory['tags'] else ""
                    prompt_parts.append(f"- {memory['content']}{tags_str}")
            else:
                prompt_parts.append("- No hay información específica disponible")
            
            if conversation_history:
                prompt_parts.extend([
                    "",
                    "=== CONVERSACIÓN RECIENTE ==="
                ])
                for msg in conversation_history[-3:]:  # Solo últimos 3 mensajes
                    role = "Usuario" if msg['role'] == 'user' else "Pixel IA"
                    prompt_parts.append(f"{role}: {msg['message']}")
            
            prompt_parts.extend([
                "",
                f"Usuario: {message}",
                "",
                "Responde de forma útil y personalizada."
            ])
            
            prompt = "\n".join(prompt_parts)
            
            # Llamada a AI optimizada
            headers = {
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": SmartPremiumConfig.CHAT_MODEL,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": SmartPremiumConfig.MAX_RESPONSE_TOKENS,
                "temperature": 0.7,
                "top_p": 0.9
            }
            
            response = requests.post(
                f"{SmartPremiumConfig.OPENAI_API_URL}/chat/completions",
                headers=headers,
                json=data,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                # Guardar respuesta
                self.add_smart_message(session_id, user_id, ai_response, "assistant", response_hash)
                
                # Guardar en cache
                self.response_cache[response_hash] = {
                    'response': ai_response,
                    'timestamp': time.time()
                }
                
                # Trackear uso
                usage = result.get('usage', {})
                tokens_used = usage.get('total_tokens', 0)
                cost = tokens_used * 0.00015  # Costo aproximado por token
                
                self._update_daily_usage(user_id, 'ai_request', tokens_used, cost)
                
                return {
                    'success': True,
                    'response': ai_response,
                    'memories_used': len(relevant_memories),
                    'conversation_context': len(conversation_history),
                    'cost_estimate': cost,
                    'tokens_used': tokens_used,
                    'cached': False
                }
            else:
                logger.error(f"AI API error: {response.status_code}")
                return {
                    'success': False,
                    'error': f"API error: {response.status_code}",
                    'response': "Lo siento, no puedo responder en este momento."
                }
                
        except Exception as e:
            logger.error(f"Error generating smart response: {e}")
            return {
                'success': False,
                'error': str(e),
                'response': "Lo siento, ocurrió un error."
            }
    
    def get_smart_stats(self, user_id: str) -> Dict[str, Any]:
        """Obtener estadísticas inteligentes"""
        if not self._check_premium_access(user_id):
            return {
                'success': False,
                'error': 'Premium subscription required'
            }
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Estadísticas de memorias
        cursor.execute('''
            SELECT memory_type, COUNT(*), AVG(importance_score)
            FROM smart_memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            GROUP BY memory_type
        ''', (user_id,))
        
        memory_stats = cursor.fetchall()
        
        # Uso diario
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT ai_requests, embeddings, tokens_used, cost
            FROM daily_usage 
            WHERE user_id = ? AND date = ?
        ''', (user_id, today))
        
        daily_usage = cursor.fetchone()
        
        # Límites del usuario
        limits = self._get_daily_limits(user_id)
        tier = self._get_user_tier(user_id)
        
        conn.close()
        
        return {
            'success': True,
            'user_id': user_id,
            'subscription_tier': tier.value if tier else None,
            'memory_stats': {
                'by_type': {stat[0]: {'count': stat[1], 'avg_importance': stat[2]} for stat in memory_stats},
                'total_memories': sum(stat[1] for stat in memory_stats),
                'avg_importance': sum(stat[2] for stat in memory_stats) / len(memory_stats) if memory_stats else 0
            },
            'daily_usage': {
                'ai_requests': daily_usage[0] if daily_usage else 0,
                'embeddings': daily_usage[1] if daily_usage else 0,
                'tokens_used': daily_usage[2] if daily_usage else 0,
                'cost': daily_usage[3] if daily_usage else 0.0
            },
            'daily_limits': limits,
            'usage_percentage': {
                'ai_requests': (daily_usage[0] / limits['daily_ai_requests'] * 100) if daily_usage else 0,
                'embeddings': (daily_usage[1] / limits['daily_embeddings'] * 100) if daily_usage else 0
            },
            'premium_features': {
                'smart_memory': True,
                'semantic_search': True,
                'conversation_context': True,
                'daily_limits': True,
                'cost_optimization': True
            }
        }

# ======== CONTROLADOR PREMIUM INTELIGENTE ========
class SmartPremiumController:
    """Controlador premium que optimiza costos sin sacrificar calidad"""
    
    def __init__(self):
        self.memory = SmartPremiumMemorySystem()
    
    def process_smart_message(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Procesar mensaje con optimizaciones inteligentes"""
        try:
            # Verificar acceso premium
            if not self.memory._check_premium_access(user_id):
                return {
                    'success': False,
                    'error': 'Premium subscription required',
                    'response': 'Esta funcionalidad está disponible solo para usuarios premium.'
                }
            
            # Guardar mensaje del usuario
            self.memory.add_smart_message(session_id, user_id, message, "user")
            
            # Extraer memorias automáticamente
            extracted_memories = self._extract_smart_memories(message)
            
            # Guardar memorias extraídas
            saved_memories = []
            for memory in extracted_memories:
                memory_id = self.memory.add_smart_memory(
                    user_id, memory['content'], memory['type'], memory.get('category')
                )
                saved_memories.append({
                    'id': memory_id,
                    'content': memory['content'],
                    'type': memory['type'],
                    'category': memory.get('category')
                })
            
            # Generar respuesta inteligente
            ai_result = self.memory.generate_smart_response(user_id, session_id, message)
            
            return {
                'success': ai_result['success'],
                'ai_response': ai_result['response'],
                'extracted_memories': saved_memories,
                'memories_used': ai_result.get('memories_used', 0),
                'cost_estimate': ai_result.get('cost_estimate', 0),
                'tokens_used': ai_result.get('tokens_used', 0),
                'cached': ai_result.get('cached', False),
                'subscription_tier': self.memory._get_user_tier(user_id).value if self.memory._get_user_tier(user_id) else None,
                'daily_usage': self.memory.get_smart_stats(user_id)['daily_usage']
            }
            
        except Exception as e:
            logger.error(f"Error processing smart message: {e}")
            return {
                'success': False,
                'error': str(e),
                'ai_response': "Lo siento, ocurrió un error."
            }
    
    def _extract_smart_memories(self, message: str) -> List[Dict[str, str]]:
        """Extraer memorias de forma inteligente"""
        memories = []
        lower_msg = message.lower()
        
        # Patrones optimizados
        patterns = {
            'preference': [
                ('me gusta', 'Le gusta', 'music'),
                ('prefiero', 'Prefiere', 'music'),
                ('me encanta', 'Le encanta', 'music'),
                ('odio', 'No le gusta', 'music')
            ],
            'profile': [
                ('vivo en', 'Vive en', 'location'),
                ('soy de', 'Es de', 'location'),
                ('toco', 'Toca', 'instruments'),
                ('tengo', 'Tiene', 'equipment')
            ],
            'decision': [
                ('a partir de ahora', 'Decidió que', 'workflow'),
                ('quiero que', 'Quiere que', 'workflow'),
                ('configura', 'Configuró', 'settings')
            ]
        }
        
        for memory_type, pattern_list in patterns.items():
            for pattern, prefix, category in pattern_list:
                if pattern in lower_msg:
                    parts = message.split(pattern)
                    if len(parts) > 1:
                        content = parts[1].strip()
                        if len(content) > 3:
                            memories.append({
                                'type': memory_type,
                                'content': f"{prefix}: {content}",
                                'category': category
                            })
        
        return memories
    
    def get_smart_stats(self, user_id: str) -> Dict[str, Any]:
        """Obtener estadísticas inteligentes"""
        return self.memory.get_smart_stats(user_id)

# ======== INSTANCIA GLOBAL INTELIGENTE ========
smart_premium_controller = SmartPremiumController()

# ======== FUNCIONES DE UTILIDAD INTELIGENTES ========
def process_smart_premium_message(user_id: str, session_id: str, message: str) -> Dict[str, Any]:
    """Procesar mensaje premium inteligente"""
    return smart_premium_controller.process_smart_message(user_id, session_id, message)

def get_smart_premium_stats(user_id: str) -> Dict[str, Any]:
    """Obtener estadísticas premium inteligentes"""
    return smart_premium_controller.get_smart_stats(user_id)

# ======== TEST INTELIGENTE ========
if __name__ == "__main__":
    print("=== TEST DEL SISTEMA PREMIUM INTELIGENTE ===")
    
    user_id = "smart_premium_user"
    session_id = "smart_session"
    
    # Test 1: Usuario premium comparte preferencia
    print("\n1. Usuario premium comparte preferencia:")
    result1 = process_smart_premium_message(
        user_id, session_id,
        "Me gusta la música electrónica y prefiero sintetizadores analógicos"
    )
    print(f"Respuesta AI: {result1['ai_response'][:100]}...")
    print(f"Costo estimado: ${result1['cost_estimate']:.4f}")
    print(f"Caché: {result1['cached']}")
    print(f"Memorias extraídas: {len(result1['extracted_memories'])}")
    
    # Test 2: Usuario hace pregunta
    print("\n2. Usuario hace pregunta:")
    result2 = process_smart_premium_message(
        user_id, session_id,
        "¿Qué sintetizador me recomiendas para pads atmosféricos?"
    )
    print(f"Respuesta AI: {result2['ai_response'][:100]}...")
    print(f"Costo estimado: ${result2['cost_estimate']:.4f}")
    print(f"Memorias usadas: {result2['memories_used']}")
    
    # Test 3: Estadísticas inteligentes
    print("\n3. Estadísticas inteligentes:")
    stats = get_smart_premium_stats(user_id)
    print(f"Total memorias: {stats['memory_stats']['total_memories']}")
    print(f"Uso diario AI: {stats['daily_usage']['ai_requests']}/{stats['daily_limits']['daily_ai_requests']}")
    print(f"Costo diario: ${stats['daily_usage']['cost']:.4f}")
    print(f"Porcentaje de uso: {stats['usage_percentage']['ai_requests']:.1f}%")
    
    print("\n=== SISTEMA PREMIUM INTELIGENTE FUNCIONANDO ===")
