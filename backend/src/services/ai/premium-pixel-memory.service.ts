import json
import sqlite3
import hashlib
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import requests
import os
import asyncio
import aiohttp
from enum import Enum

logger = logging.getLogger(__name__)

# ======== CONFIGURACIÓN PREMIUM ========
class PremiumConfig:
    # Base de datos premium
    DB_PATH = "premium_pixel_memories.db"
    
    # APIs premium (mejor calidad)
    OPENAI_API_URL = "https://api.openai.com/v1"
    EMBEDDING_MODEL = "text-embedding-3-large"  # Mejor calidad
    CHAT_MODEL = "gpt-4o-mini"  # Balance calidad/precio
    
    # Qwen premium
    QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    QWEN_MODEL = "qwen2.5-72b-instruct"  # Modelo más potente
    
    # Límites premium generosos
    MAX_MEMORIES_PER_USER = 500
    MAX_CONVERSATION_HISTORY = 50
    MAX_EMBEDDING_REQUESTS_PER_DAY = 1000
    MAX_AI_REQUESTS_PER_DAY = 500
    
    # Funcionalidades premium
    ENABLE_ADVANCED_ANALYSIS = True
    ENABLE_PREDICTIVE_INSIGHTS = True
    ENABLE_MUSIC_RECOMMENDATIONS = True
    ENABLE_WORKFLOW_OPTIMIZATION = True

class SubscriptionTier(Enum):
    PRO = "pro"
    ENTERPRISE = "enterprise"
    PREMIUM = "premium"

# ======== SISTEMA PREMIUM DE MEMORIA ========
class PremiumMemorySystem:
    """Sistema de memoria premium que justifica el costo"""
    
    def __init__(self):
        self.db_path = PremiumConfig.DB_PATH
        self.embedding_cache = {}
        self.request_counters = {
            'embeddings': 0,
            'ai_requests': 0,
            'last_reset': time.time()
        }
        self._init_database()
    
    def _init_database(self):
        """Inicializar base de datos premium"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de usuarios premium
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS premium_users (
                user_id TEXT PRIMARY KEY,
                subscription_tier TEXT NOT NULL,
                subscription_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                subscription_end TIMESTAMP,
                monthly_limits JSON,
                features_enabled JSON,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # Tabla de memorias premium
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS premium_memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                category TEXT,
                embedding TEXT,
                confidence REAL DEFAULT 1.0,
                importance_score REAL DEFAULT 0.5,
                tags TEXT,
                context JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                last_accessed TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Tabla de conversaciones premium
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS premium_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                message TEXT NOT NULL,
                role TEXT NOT NULL,
                sentiment TEXT,
                intent TEXT,
                entities JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Tabla de insights premium
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS premium_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                insight_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                confidence REAL NOT NULL,
                category TEXT NOT NULL,
                actionable BOOLEAN DEFAULT 0,
                priority INTEGER DEFAULT 5,
                evidence JSON,
                recommendations JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Tabla de análisis musical
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS music_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                analysis_type TEXT NOT NULL,
                data JSON NOT NULL,
                insights TEXT,
                recommendations JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Tabla de costos premium
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS premium_cost_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                operation_type TEXT NOT NULL,
                cost REAL NOT NULL,
                tokens_used INTEGER,
                model_used TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES premium_users(user_id)
            )
        ''')
        
        # Índices premium
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_premium_memories_user ON premium_memories(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_premium_memories_type ON premium_memories(memory_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_premium_memories_category ON premium_memories(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_premium_conversations_session ON premium_conversations(session_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_premium_insights_user ON premium_insights(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_premium_insights_type ON premium_insights(insight_type)')
        
        conn.commit()
        conn.close()
        logger.info("Premium database initialized")
    
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
        
        if not is_active:
            return False
        
        if subscription_end and datetime.fromisoformat(subscription_end) < datetime.now():
            return False
        
        return True
    
    def _get_user_subscription_tier(self, user_id: str) -> Optional[SubscriptionTier]:
        """Obtener tier de suscripción"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT subscription_tier
            FROM premium_users 
            WHERE user_id = ? AND is_active = 1
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return SubscriptionTier(result[0])
        
        return None
    
    def _reset_daily_counters(self):
        """Resetear contadores diarios"""
        current_time = time.time()
        if current_time - self.request_counters['last_reset'] > 86400:  # 24 horas
            self.request_counters['embeddings'] = 0
            self.request_counters['ai_requests'] = 0
            self.request_counters['last_reset'] = current_time
    
    async def _get_embedding_premium(self, text: str) -> Optional[List[float]]:
        """Obtener embedding premium"""
        # Verificar cache
        cache_key = hashlib.md5(text.encode()).hexdigest()
        if cache_key in self.embedding_cache:
            cached_data = self.embedding_cache[cache_key]
            if time.time() - cached_data['timestamp'] < 3600:  # 1 hora
                return cached_data['embedding']
        
        # Verificar límites
        self._reset_daily_counters()
        if self.request_counters['embeddings'] >= PremiumConfig.MAX_EMBEDDING_REQUESTS_PER_DAY:
            logger.warning("Daily embedding limit reached")
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "model": PremiumConfig.EMBEDDING_MODEL,
                    "input": text,
                    "encoding_format": "float"
                }
                
                async with session.post(
                    f"{PremiumConfig.OPENAI_API_URL}/embeddings",
                    headers=headers,
                    json=data,
                    timeout=30
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        embedding = result['data'][0]['embedding']
                        
                        # Guardar en cache
                        self.embedding_cache[cache_key] = {
                            'embedding': embedding,
                            'timestamp': time.time()
                        }
                        
                        self.request_counters['embeddings'] += 1
                        return embedding
                    else:
                        logger.error(f"Embedding API error: {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"Error getting premium embedding: {e}")
            return None
    
    async def _analyze_message_sentiment(self, message: str) -> Dict[str, Any]:
        """Analizar sentimiento del mensaje"""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "model": PremiumConfig.CHAT_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "Analiza el sentimiento y extrae entidades del siguiente mensaje. Responde en JSON con: sentiment (positive/negative/neutral), confidence (0-1), entities (lista de entidades importantes), intent (qué quiere hacer el usuario)."
                        },
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
                    "max_tokens": 200,
                    "temperature": 0.3
                }
                
                async with session.post(
                    f"{PremiumConfig.OPENAI_API_URL}/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=15
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        analysis_text = result['choices'][0]['message']['content']
                        
                        try:
                            return json.loads(analysis_text)
                        except:
                            return {
                                'sentiment': 'neutral',
                                'confidence': 0.5,
                                'entities': [],
                                'intent': 'unknown'
                            }
                    else:
                        return {
                            'sentiment': 'neutral',
                            'confidence': 0.5,
                            'entities': [],
                            'intent': 'unknown'
                        }
                        
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {
                'sentiment': 'neutral',
                'confidence': 0.5,
                'entities': [],
                'intent': 'unknown'
            }
    
    async def add_premium_memory(self, user_id: str, content: str, memory_type: str, category: str = None) -> int:
        """Agregar memoria premium"""
        if not self._check_premium_access(user_id):
            raise ValueError("User does not have premium access")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener embedding premium
        embedding = await self._get_embedding_premium(content)
        embedding_json = json.dumps(embedding) if embedding else None
        
        # Calcular importancia basada en tipo y contenido
        importance_score = self._calculate_importance_score(content, memory_type)
        
        # Extraer tags automáticamente
        tags = self._extract_tags(content, memory_type)
        
        # Calcular expiración
        expires_at = None
        if memory_type in ['preference', 'decision']:
            expires_at = datetime.now() + timedelta(days=90)  # Más tiempo para premium
        
        cursor.execute('''
            INSERT INTO premium_memories 
            (user_id, content, memory_type, category, embedding, importance_score, tags, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, content, memory_type, category, embedding_json, importance_score, tags, expires_at))
        
        memory_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Added premium memory {memory_id} for user {user_id}")
        return memory_id
    
    def _calculate_importance_score(self, content: str, memory_type: str) -> float:
        """Calcular score de importancia"""
        base_scores = {
            'preference': 0.8,
            'profile': 0.9,
            'decision': 0.7,
            'fact': 0.6,
            'behavior': 0.5
        }
        
        base_score = base_scores.get(memory_type, 0.5)
        
        # Ajustar por longitud y palabras clave
        length_factor = min(len(content) / 100, 1.0)
        
        # Palabras clave que aumentan importancia
        important_keywords = ['música', 'sintetizador', 'guitarra', 'piano', 'batería', 'voz', 'grabación', 'mezcla', 'mastering']
        keyword_count = sum(1 for keyword in important_keywords if keyword.lower() in content.lower())
        keyword_factor = min(keyword_count * 0.1, 0.3)
        
        return min(base_score + length_factor * 0.1 + keyword_factor, 1.0)
    
    def _extract_tags(self, content: str, memory_type: str) -> str:
        """Extraer tags automáticamente"""
        tags = []
        
        # Tags por tipo
        type_tags = {
            'preference': ['preferencia'],
            'profile': ['perfil'],
            'decision': ['decisión'],
            'fact': ['hecho'],
            'behavior': ['comportamiento']
        }
        
        tags.extend(type_tags.get(memory_type, []))
        
        # Tags por contenido musical
        music_keywords = {
            'instrumentos': ['guitarra', 'piano', 'batería', 'bajo', 'sintetizador', 'teclado'],
            'géneros': ['rock', 'pop', 'jazz', 'electrónica', 'clásica', 'reggae', 'blues'],
            'proceso': ['grabación', 'mezcla', 'mastering', 'composición', 'producción'],
            'equipos': ['amplificador', 'micrófono', 'consola', 'interfaz', 'monitor']
        }
        
        content_lower = content.lower()
        for category, keywords in music_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    tags.append(keyword)
        
        return ','.join(tags[:10])  # Máximo 10 tags
    
    async def search_premium_memories(self, user_id: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Búsqueda semántica premium"""
        if not self._check_premium_access(user_id):
            raise ValueError("User does not have premium access")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener memorias del usuario
        cursor.execute('''
            SELECT id, content, memory_type, category, embedding, confidence, importance_score, tags, created_at, access_count
            FROM premium_memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY importance_score DESC, created_at DESC
            LIMIT 50
        ''', (user_id,))
        
        memories = cursor.fetchall()
        conn.close()
        
        if not memories or not query.strip():
            return []
        
        # Obtener embedding de la consulta
        query_embedding = await self._get_embedding_premium(query)
        if not query_embedding:
            # Fallback: búsqueda por texto
            return [
                {
                    'id': mem[0],
                    'content': mem[1],
                    'memory_type': mem[2],
                    'category': mem[3],
                    'confidence': mem[5],
                    'importance_score': mem[6],
                    'tags': mem[7].split(',') if mem[7] else [],
                    'created_at': mem[8],
                    'access_count': mem[9]
                }
                for mem in memories[:limit]
            ]
        
        # Calcular similitudes semánticas
        similarities = []
        for memory in memories:
            memory_embedding = json.loads(memory[4]) if memory[4] else None
            
            if memory_embedding:
                similarity = self._cosine_similarity(query_embedding, memory_embedding)
                # Combinar similitud semántica con importancia
                combined_score = similarity * 0.7 + memory[6] * 0.3  # 70% semántica, 30% importancia
                similarities.append((combined_score, memory))
            else:
                similarities.append((memory[6] * 0.3, memory))  # Solo importancia
        
        # Ordenar por score combinado
        similarities.sort(key=lambda x: x[0], reverse=True)
        
        # Actualizar contadores de acceso
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        result = []
        for score, memory in similarities[:limit]:
            if score > 0.2:  # Umbral mínimo
                result.append({
                    'id': memory[0],
                    'content': memory[1],
                    'memory_type': memory[2],
                    'category': memory[3],
                    'confidence': memory[5],
                    'importance_score': memory[6],
                    'tags': memory[7].split(',') if memory[7] else [],
                    'created_at': memory[8],
                    'access_count': memory[9],
                    'relevance_score': score
                })
                
                # Actualizar contador de acceso
                cursor.execute('''
                    UPDATE premium_memories 
                    SET access_count = access_count + 1, last_accessed = datetime('now')
                    WHERE id = ?
                ''', (memory[0],))
        
        conn.commit()
        conn.close()
        
        return result
    
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
    
    async def add_premium_message(self, session_id: str, user_id: str, message: str, role: str = "user"):
        """Agregar mensaje premium con análisis"""
        if not self._check_premium_access(user_id):
            raise ValueError("User does not have premium access")
        
        # Analizar mensaje
        analysis = await self._analyze_message_sentiment(message)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO premium_conversations 
            (session_id, user_id, message, role, sentiment, intent, entities)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            session_id, user_id, message, role,
            analysis['sentiment'], analysis['intent'],
            json.dumps(analysis['entities'])
        ))
        
        conn.commit()
        conn.close()
    
    async def generate_premium_response(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Generar respuesta premium usando AI avanzada"""
        if not self._check_premium_access(user_id):
            raise ValueError("User does not have premium access")
        
        try:
            # Obtener memorias relevantes
            relevant_memories = await self.search_premium_memories(user_id, message, 5)
            
            # Obtener contexto de conversación
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT message, role, sentiment, intent, entities
                FROM premium_conversations 
                WHERE session_id = ?
                ORDER BY created_at DESC
                LIMIT 10
            ''', (session_id,))
            
            conversation_history = cursor.fetchall()
            conn.close()
            
            # Construir prompt premium
            prompt_parts = [
                "Eres Pixel IA Premium, asistente musical de élite con memoria avanzada y análisis profundo.",
                "Tienes acceso a información detallada del usuario y puedes hacer recomendaciones personalizadas.",
                "Usa toda la información disponible para crear respuestas únicas y valiosas.",
                "",
                "=== INFORMACIÓN PREMIUM DEL USUARIO ==="
            ]
            
            if relevant_memories:
                for memory in relevant_memories:
                    tags_str = f" (Tags: {', '.join(memory['tags'])})" if memory['tags'] else ""
                    prompt_parts.append(f"- [{memory['memory_type'].upper()}] {memory['content']}{tags_str}")
            else:
                prompt_parts.append("- No hay información específica disponible")
            
            if conversation_history:
                prompt_parts.extend([
                    "",
                    "=== HISTORIAL DE CONVERSACIÓN ==="
                ])
                for msg in reversed(conversation_history[-5:]):  # Últimos 5 mensajes
                    role = "Usuario" if msg[1] == 'user' else "Pixel IA"
                    sentiment = f" (Sentimiento: {msg[2]})" if msg[2] else ""
                    prompt_parts.append(f"{role}: {msg[0]}{sentiment}")
            
            prompt_parts.extend([
                "",
                f"Usuario: {message}",
                "",
                "Responde como un experto musical que conoce profundamente al usuario. ",
                "Proporciona recomendaciones específicas, insights valiosos y sugerencias personalizadas. ",
                "Sé conversacional pero profesional, y demuestra que recuerdas y entiendes al usuario."
            ])
            
            prompt = "\n".join(prompt_parts)
            
            # Llamada a AI premium
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                    "Content-Type": "application/json"
                }
                
                data = {
                    "model": PremiumConfig.CHAT_MODEL,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 400,  # Respuestas más largas para premium
                    "temperature": 0.8,
                    "top_p": 0.9
                }
                
                async with session.post(
                    f"{PremiumConfig.OPENAI_API_URL}/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=30
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        ai_response = result['choices'][0]['message']['content']
                        
                        # Guardar respuesta
                        await self.add_premium_message(session_id, user_id, ai_response, "assistant")
                        
                        # Trackear costo
                        usage = result.get('usage', {})
                        self._track_premium_cost(user_id, 'ai_generation', 0.01, usage.get('total_tokens', 0), PremiumConfig.CHAT_MODEL)
                        
                        return {
                            'success': True,
                            'response': ai_response,
                            'memories_used': len(relevant_memories),
                            'conversation_context': len(conversation_history),
                            'cost_estimate': 0.01,
                            'tokens_used': usage.get('total_tokens', 0),
                            'premium_features': {
                                'semantic_search': True,
                                'sentiment_analysis': True,
                                'advanced_memory': True,
                                'personalized_response': True
                            }
                        }
                    else:
                        logger.error(f"Premium AI API error: {response.status}")
                        return {
                            'success': False,
                            'error': f"API error: {response.status}",
                            'response': "Lo siento, no puedo responder en este momento."
                        }
                        
        except Exception as e:
            logger.error(f"Error generating premium response: {e}")
            return {
                'success': False,
                'error': str(e),
                'response': "Lo siento, ocurrió un error."
            }
    
    def _track_premium_cost(self, user_id: str, operation_type: str, cost: float, tokens: int, model: str):
        """Trackear costos premium"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO premium_cost_tracking (user_id, operation_type, cost, tokens_used, model_used)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, operation_type, cost, tokens, model))
        
        conn.commit()
        conn.close()
    
    async def generate_premium_insights(self, user_id: str) -> List[Dict[str, Any]]:
        """Generar insights premium basados en análisis profundo"""
        if not self._check_premium_access(user_id):
            raise ValueError("User does not have premium access")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener datos del usuario
        cursor.execute('''
            SELECT memory_type, content, importance_score, tags, created_at
            FROM premium_memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY importance_score DESC, created_at DESC
        ''', (user_id,))
        
        memories = cursor.fetchall()
        
        cursor.execute('''
            SELECT sentiment, intent, entities
            FROM premium_conversations 
            WHERE user_id = ? AND created_at > datetime('now', '-30 days')
        ''', (user_id,))
        
        conversations = cursor.fetchall()
        conn.close()
        
        insights = []
        
        # Insight 1: Preferencias musicales
        preferences = [m for m in memories if m[0] == 'preference']
        if preferences:
            music_prefs = [p for p in preferences if any(tag in p[3].lower() for tag in ['música', 'instrumento', 'género', 'estilo'])]
            if music_prefs:
                insights.append({
                    'type': 'musical_preferences',
                    'title': 'Preferencias Musicales Detectadas',
                    'description': f'Has expresado {len(music_prefs)} preferencias musicales específicas que puedo usar para recomendaciones personalizadas.',
                    'confidence': 0.9,
                    'category': 'music',
                    'actionable': True,
                    'priority': 8,
                    'evidence': [p[1] for p in music_prefs[:3]],
                    'recommendations': [
                        'Crear playlist personalizada basada en tus preferencias',
                        'Recomendar instrumentos que se alineen con tu estilo',
                        'Sugerir técnicas de producción que prefieres'
                    ]
                })
        
        # Insight 2: Patrones de comportamiento
        if conversations:
            sentiments = [c[0] for c in conversations if c[0]]
            if sentiments:
                positive_ratio = sentiments.count('positive') / len(sentiments)
                if positive_ratio > 0.7:
                    insights.append({
                        'type': 'positive_engagement',
                        'title': 'Alto Engagement Positivo',
                        'description': f'Tienes un {positive_ratio*100:.0f}% de interacciones positivas, lo que indica alta satisfacción con el sistema.',
                        'confidence': 0.8,
                        'category': 'behavior',
                        'actionable': True,
                        'priority': 6,
                        'evidence': [f'{positive_ratio*100:.0f}% sentimientos positivos'],
                        'recommendations': [
                            'Continuar con el enfoque actual',
                            'Explorar funcionalidades avanzadas',
                            'Compartir feedback para mejorar aún más'
                        ]
                    })
        
        # Insight 3: Evolución musical
        recent_memories = [m for m in memories if (datetime.now() - datetime.fromisoformat(m[4])).days <= 30]
        if len(recent_memories) > 5:
            insights.append({
                'type': 'musical_evolution',
                'title': 'Evolución Musical Activa',
                'description': f'Has agregado {len(recent_memories)} memorias musicales en el último mes, mostrando crecimiento constante.',
                'confidence': 0.7,
                'category': 'growth',
                'actionable': True,
                'priority': 7,
                'evidence': [f'{len(recent_memories)} memorias recientes'],
                'recommendations': [
                    'Documentar tu progreso musical',
                    'Establecer objetivos específicos',
                    'Explorar nuevos géneros o técnicas'
                ]
            })
        
        # Guardar insights
        for insight in insights:
            cursor.execute('''
                INSERT INTO premium_insights 
                (user_id, insight_type, title, description, confidence, category, actionable, priority, evidence, recommendations)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, insight['type'], insight['title'], insight['description'],
                insight['confidence'], insight['category'], insight['actionable'],
                insight['priority'], json.dumps(insight['evidence']),
                json.dumps(insight['recommendations'])
            ))
        
        conn.commit()
        conn.close()
        
        return insights

# ======== CONTROLADOR PREMIUM ========
class PremiumPixelController:
    """Controlador premium que justifica el costo de suscripción"""
    
    def __init__(self):
        self.memory = PremiumMemorySystem()
    
    async def process_premium_message(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Procesar mensaje premium"""
        try:
            # Verificar acceso premium
            if not self.memory._check_premium_access(user_id):
                return {
                    'success': False,
                    'error': 'Premium subscription required',
                    'response': 'Esta funcionalidad está disponible solo para usuarios premium.'
                }
            
            # Guardar mensaje con análisis
            await self.memory.add_premium_message(session_id, user_id, message, "user")
            
            # Extraer memorias automáticamente
            extracted_memories = self._extract_premium_memories(message)
            
            # Guardar memorias extraídas
            saved_memories = []
            for memory in extracted_memories:
                memory_id = await self.memory.add_premium_memory(
                    user_id, memory['content'], memory['type'], memory.get('category')
                )
                saved_memories.append({
                    'id': memory_id,
                    'content': memory['content'],
                    'type': memory['type'],
                    'category': memory.get('category')
                })
            
            # Generar respuesta premium
            ai_result = await self.memory.generate_premium_response(user_id, session_id, message)
            
            return {
                'success': True,
                'ai_response': ai_result['response'],
                'extracted_memories': saved_memories,
                'memories_used': ai_result.get('memories_used', 0),
                'cost_estimate': ai_result.get('cost_estimate', 0),
                'tokens_used': ai_result.get('tokens_used', 0),
                'premium_features': ai_result.get('premium_features', {}),
                'subscription_tier': self.memory._get_user_subscription_tier(user_id).value if self.memory._get_user_subscription_tier(user_id) else None
            }
            
        except Exception as e:
            logger.error(f"Error processing premium message: {e}")
            return {
                'success': False,
                'error': str(e),
                'ai_response': "Lo siento, ocurrió un error."
            }
    
    def _extract_premium_memories(self, message: str) -> List[Dict[str, str]]:
        """Extraer memorias premium con categorización avanzada"""
        memories = []
        lower_msg = message.lower()
        
        # Patrones premium más sofisticados
        patterns = {
            'preference': [
                ('me gusta', 'Le gusta', 'music'),
                ('prefiero', 'Prefiere', 'music'),
                ('me encanta', 'Le encanta', 'music'),
                ('odio', 'No le gusta', 'music'),
                ('mi favorito', 'Su favorito es', 'music'),
                ('siempre uso', 'Siempre usa', 'equipment'),
                ('nunca uso', 'Nunca usa', 'equipment')
            ],
            'profile': [
                ('vivo en', 'Vive en', 'location'),
                ('soy de', 'Es de', 'location'),
                ('trabajo en', 'Trabaja en', 'work'),
                ('estudio', 'Estudia', 'education'),
                ('toco', 'Toca', 'instruments'),
                ('tengo', 'Tiene', 'equipment'),
                ('mi nombre es', 'Se llama', 'identity')
            ],
            'decision': [
                ('a partir de ahora', 'Decidió que', 'workflow'),
                ('desde ahora', 'Decidió que', 'workflow'),
                ('quiero que', 'Quiere que', 'workflow'),
                ('configura', 'Configuró', 'settings'),
                ('cambia', 'Cambió', 'settings'),
                ('establece', 'Estableció', 'settings')
            ],
            'behavior': [
                ('siempre hago', 'Siempre hace', 'workflow'),
                ('nunca hago', 'Nunca hace', 'workflow'),
                ('me gusta trabajar', 'Le gusta trabajar', 'workflow'),
                ('prefiero grabar', 'Prefiere grabar', 'workflow')
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
    
    async def get_premium_insights(self, user_id: str) -> Dict[str, Any]:
        """Obtener insights premium"""
        if not self.memory._check_premium_access(user_id):
            return {
                'success': False,
                'error': 'Premium subscription required'
            }
        
        try:
            insights = await self.memory.generate_premium_insights(user_id)
            
            return {
                'success': True,
                'insights': insights,
                'total_insights': len(insights),
                'categories': list(set(insight['category'] for insight in insights)),
                'actionable_insights': len([i for i in insights if i['actionable']])
            }
            
        except Exception as e:
            logger.error(f"Error getting premium insights: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_premium_stats(self, user_id: str) -> Dict[str, Any]:
        """Obtener estadísticas premium"""
        if not self.memory._check_premium_access(user_id):
            return {
                'success': False,
                'error': 'Premium subscription required'
            }
        
        conn = sqlite3.connect(self.memory.db_path)
        cursor = conn.cursor()
        
        # Estadísticas de memorias
        cursor.execute('''
            SELECT memory_type, COUNT(*), AVG(importance_score)
            FROM premium_memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            GROUP BY memory_type
        ''', (user_id,))
        
        memory_stats = cursor.fetchall()
        
        # Estadísticas de conversaciones
        cursor.execute('''
            SELECT COUNT(*), AVG(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END)
            FROM premium_conversations 
            WHERE user_id = ? AND created_at > datetime('now', '-30 days')
        ''', (user_id,))
        
        conversation_stats = cursor.fetchone()
        
        # Estadísticas de insights
        cursor.execute('''
            SELECT COUNT(*), COUNT(CASE WHEN actionable = 1 THEN 1 END)
            FROM premium_insights 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
        ''', (user_id,))
        
        insight_stats = cursor.fetchone()
        
        conn.close()
        
        return {
            'success': True,
            'user_id': user_id,
            'subscription_tier': self.memory._get_user_subscription_tier(user_id).value if self.memory._get_user_subscription_tier(user_id) else None,
            'memory_stats': {
                'by_type': {stat[0]: {'count': stat[1], 'avg_importance': stat[2]} for stat in memory_stats},
                'total_memories': sum(stat[1] for stat in memory_stats),
                'avg_importance': sum(stat[2] for stat in memory_stats) / len(memory_stats) if memory_stats else 0
            },
            'conversation_stats': {
                'total_messages': conversation_stats[0] if conversation_stats else 0,
                'positive_sentiment_ratio': conversation_stats[1] if conversation_stats else 0
            },
            'insight_stats': {
                'total_insights': insight_stats[0] if insight_stats else 0,
                'actionable_insights': insight_stats[1] if insight_stats else 0
            },
            'premium_features': {
                'semantic_search': True,
                'sentiment_analysis': True,
                'advanced_memory': True,
                'personalized_insights': True,
                'priority_support': True
            }
        }

# ======== INSTANCIA GLOBAL PREMIUM ========
premium_pixel_controller = PremiumPixelController()

# ======== FUNCIONES DE UTILIDAD PREMIUM ========
async def process_premium_message(user_id: str, session_id: str, message: str) -> Dict[str, Any]:
    """Procesar mensaje premium"""
    return await premium_pixel_controller.process_premium_message(user_id, session_id, message)

async def get_premium_insights(user_id: str) -> Dict[str, Any]:
    """Obtener insights premium"""
    return await premium_pixel_controller.get_premium_insights(user_id)

def get_premium_stats(user_id: str) -> Dict[str, Any]:
    """Obtener estadísticas premium"""
    return premium_pixel_controller.get_premium_stats(user_id)

# ======== TEST PREMIUM ========
if __name__ == "__main__":
    async def test_premium_system():
        print("=== TEST DEL SISTEMA PREMIUM ===")
        
        user_id = "premium_user_123"
        session_id = "premium_session_456"
        
        # Test 1: Usuario premium comparte preferencia
        print("\n1. Usuario premium comparte preferencia:")
        result1 = await process_premium_message(
            user_id, session_id,
            "Me gusta la música electrónica y prefiero sintetizadores analógicos como el Moog"
        )
        print(f"Respuesta AI: {result1['ai_response'][:150]}...")
        print(f"Funcionalidades premium: {result1['premium_features']}")
        print(f"Costo estimado: ${result1['cost_estimate']:.4f}")
        
        # Test 2: Usuario hace pregunta compleja
        print("\n2. Usuario hace pregunta compleja:")
        result2 = await process_premium_message(
            user_id, session_id,
            "¿Cómo puedo crear pads atmosféricos que se adapten a mi estilo de música electrónica?"
        )
        print(f"Respuesta AI: {result2['ai_response'][:150]}...")
        print(f"Memorias usadas: {result2['memories_used']}")
        
        # Test 3: Insights premium
        print("\n3. Insights premium:")
        insights = await get_premium_insights(user_id)
        print(f"Total insights: {insights['total_insights']}")
        print(f"Insights accionables: {insights['actionable_insights']}")
        
        # Test 4: Estadísticas premium
        print("\n4. Estadísticas premium:")
        stats = get_premium_stats(user_id)
        print(f"Total memorias: {stats['memory_stats']['total_memories']}")
        print(f"Ratio sentimiento positivo: {stats['conversation_stats']['positive_sentiment_ratio']:.2f}")
        print(f"Funcionalidades premium: {list(stats['premium_features'].keys())}")
        
        print("\n=== SISTEMA PREMIUM FUNCIONANDO ===")
    
    # Ejecutar test
    asyncio.run(test_premium_system())
