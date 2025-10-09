import os
import time
import json
import uuid
import numpy as np
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel
from datetime import datetime, timedelta
import asyncio
from sentence_transformers import SentenceTransformer
import logging

# ======== CONFIGURACIÓN ========
logger = logging.getLogger(__name__)

class MemoryConfig:
    EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    MEMORY_TTL_HOURS = 24 * 7  # 7 días
    MAX_MEMORIES_PER_USER = 1000
    SIMILARITY_THRESHOLD = 0.7
    TOP_K_MEMORIES = 5

# ======== MODELOS DE DATOS ========
class MemoryItem(BaseModel):
    id: str
    user_id: str
    content: str
    memory_type: str  # "preference" | "profile" | "decision" | "fact" | "behavior"
    context: Dict[str, Any] = {}
    confidence: float = 1.0
    created_at: datetime
    last_accessed: Optional[datetime] = None
    access_count: int = 0
    expires_at: Optional[datetime] = None

class ConversationContext(BaseModel):
    user_id: str
    session_id: str
    messages: List[Dict[str, str]] = []
    current_context: Dict[str, Any] = {}
    created_at: datetime
    last_activity: datetime

class PixelInsight(BaseModel):
    user_id: str
    insight: str
    confidence: float
    category: str
    evidence: List[str] = []
    reasoning: str
    created_at: datetime

# ======== SISTEMA DE MEMORIA INTELIGENTE ========
class IntelligentMemorySystem:
    def __init__(self, db_path: str = "pixel_memories.db"):
        self.db_path = db_path
        self.embedder = SentenceTransformer(MemoryConfig.EMBEDDING_MODEL)
        self.memories: Dict[str, List[MemoryItem]] = {}
        self.conversations: Dict[str, ConversationContext] = {}
        self.embeddings_cache: Dict[str, np.ndarray] = {}
        
        # Cargar memorias existentes
        self._load_memories()
    
    def _load_memories(self):
        """Cargar memorias desde base de datos"""
        try:
            if os.path.exists(self.db_path):
                with open(self.db_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for user_id, memories_data in data.get('memories', {}).items():
                        self.memories[user_id] = [
                            MemoryItem(**mem) for mem in memories_data
                        ]
                    for session_id, conv_data in data.get('conversations', {}).items():
                        self.conversations[session_id] = ConversationContext(**conv_data)
                logger.info(f"Loaded {sum(len(m) for m in self.memories.values())} memories")
        except Exception as e:
            logger.error(f"Error loading memories: {e}")
    
    def _save_memories(self):
        """Guardar memorias en base de datos"""
        try:
            data = {
                'memories': {
                    user_id: [mem.dict() for mem in memories]
                    for user_id, memories in self.memories.items()
                },
                'conversations': {
                    session_id: conv.dict() for session_id, conv in self.conversations.items()
                }
            }
            with open(self.db_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving memories: {e}")
    
    def _extract_memories_from_message(self, user_id: str, message: str, context: Dict[str, Any]) -> List[MemoryItem]:
        """Extraer memorias importantes del mensaje del usuario"""
        memories = []
        lower_message = message.lower()
        
        # Patrones para detectar preferencias
        preference_patterns = [
            "me gusta", "prefiero", "me encanta", "odio", "no me gusta",
            "siempre uso", "nunca uso", "mi favorito", "mi estilo"
        ]
        
        if any(pattern in lower_message for pattern in preference_patterns):
            memories.append(MemoryItem(
                id=str(uuid.uuid4()),
                user_id=user_id,
                content=message,
                memory_type="preference",
                context=context,
                confidence=0.8,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(days=30)
            ))
        
        # Patrones para detectar información de perfil
        profile_patterns = [
            "vivo en", "radico en", "soy de", "trabajo en", "estudio",
            "toco", "tengo", "mi nombre es", "me llamo"
        ]
        
        if any(pattern in lower_message for pattern in profile_patterns):
            memories.append(MemoryItem(
                id=str(uuid.uuid4()),
                user_id=user_id,
                content=message,
                memory_type="profile",
                context=context,
                confidence=0.9,
                created_at=datetime.now(),
                expires_at=None  # Información de perfil no expira
            ))
        
        # Patrones para detectar decisiones
        decision_patterns = [
            "a partir de ahora", "desde ahora", "decido", "quiero que",
            "configura", "cambia", "establece"
        ]
        
        if any(pattern in lower_message for pattern in decision_patterns):
            memories.append(MemoryItem(
                id=str(uuid.uuid4()),
                user_id=user_id,
                content=message,
                memory_type="decision",
                context=context,
                confidence=0.85,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(days=7)
            ))
        
        return memories
    
    def add_memory(self, user_id: str, content: str, memory_type: str, context: Dict[str, Any] = None) -> MemoryItem:
        """Agregar nueva memoria"""
        memory = MemoryItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            content=content,
            memory_type=memory_type,
            context=context or {},
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=MemoryConfig.MEMORY_TTL_HOURS)
        )
        
        if user_id not in self.memories:
            self.memories[user_id] = []
        
        self.memories[user_id].append(memory)
        
        # Limitar número de memorias por usuario
        if len(self.memories[user_id]) > MemoryConfig.MAX_MEMORIES_PER_USER:
            # Eliminar las más antiguas
            self.memories[user_id] = sorted(
                self.memories[user_id], 
                key=lambda m: m.created_at, 
                reverse=True
            )[:MemoryConfig.MAX_MEMORIES_PER_USER]
        
        self._save_memories()
        logger.info(f"Added {memory_type} memory for user {user_id}")
        return memory
    
    def search_memories(self, user_id: str, query: str, memory_types: List[str] = None) -> List[MemoryItem]:
        """Búsqueda semántica de memorias"""
        if user_id not in self.memories:
            return []
        
        user_memories = self.memories[user_id]
        
        # Filtrar por tipo si se especifica
        if memory_types:
            user_memories = [m for m in user_memories if m.memory_type in memory_types]
        
        # Filtrar memorias expiradas
        now = datetime.now()
        user_memories = [m for m in user_memories if not m.expires_at or m.expires_at > now]
        
        if not user_memories:
            return []
        
        # Generar embeddings si no existen
        memory_texts = [m.content for m in user_memories]
        query_embedding = self.embedder.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]
        
        # Calcular similitudes
        similarities = []
        for i, memory in enumerate(user_memories):
            if memory.id not in self.embeddings_cache:
                memory_embedding = self.embedder.encode([memory.content], convert_to_numpy=True, normalize_embeddings=True)[0]
                self.embeddings_cache[memory.id] = memory_embedding
            else:
                memory_embedding = self.embeddings_cache[memory.id]
            
            similarity = np.dot(query_embedding, memory_embedding)
            similarities.append((similarity, memory))
        
        # Ordenar por similitud y filtrar por umbral
        similarities.sort(key=lambda x: x[0], reverse=True)
        relevant_memories = [
            memory for similarity, memory in similarities
            if similarity >= MemoryConfig.SIMILARITY_THRESHOLD
        ][:MemoryConfig.TOP_K_MEMORIES]
        
        # Actualizar estadísticas de acceso
        for memory in relevant_memories:
            memory.last_accessed = now
            memory.access_count += 1
        
        self._save_memories()
        return relevant_memories
    
    def get_conversation_context(self, session_id: str) -> Optional[ConversationContext]:
        """Obtener contexto de conversación"""
        return self.conversations.get(session_id)
    
    def update_conversation_context(self, session_id: str, user_id: str, message: str, role: str = "user"):
        """Actualizar contexto de conversación"""
        if session_id not in self.conversations:
            self.conversations[session_id] = ConversationContext(
                user_id=user_id,
                session_id=session_id,
                created_at=datetime.now(),
                last_activity=datetime.now()
            )
        
        conv = self.conversations[session_id]
        conv.messages.append({"role": role, "content": message, "timestamp": datetime.now().isoformat()})
        conv.last_activity = datetime.now()
        
        # Mantener solo los últimos 20 mensajes
        if len(conv.messages) > 20:
            conv.messages = conv.messages[-20:]
        
        self._save_memories()
    
    def generate_contextual_prompt(self, user_id: str, session_id: str, current_message: str) -> str:
        """Generar prompt contextual con memorias relevantes"""
        # Buscar memorias relevantes
        relevant_memories = self.search_memories(user_id, current_message)
        
        # Obtener contexto de conversación
        conv_context = self.get_conversation_context(session_id)
        
        # Construir prompt
        prompt_parts = [
            "Eres Pixel IA, un asistente musical inteligente con memoria personalizada.",
            "Usa las memorias del usuario para responder de forma contextual y personalizada.",
            "Si no tienes información específica, pregunta o continúa sin inventar datos.",
            "",
            f"=== MEMORIAS RELEVANTES DE {user_id} ==="
        ]
        
        if relevant_memories:
            for memory in relevant_memories:
                prompt_parts.append(f"- [{memory.memory_type.upper()}] {memory.content}")
        else:
            prompt_parts.append("- No hay memorias específicas para este contexto")
        
        prompt_parts.extend([
            "",
            "=== CONTEXTO DE CONVERSACIÓN ==="
        ])
        
        if conv_context and conv_context.messages:
            recent_messages = conv_context.messages[-5:]  # Últimos 5 mensajes
            for msg in recent_messages:
                role = msg["role"].upper()
                content = msg["content"]
                prompt_parts.append(f"{role}: {content}")
        
        prompt_parts.extend([
            "",
            "=== INSTRUCCIONES ===",
            "- Responde de forma natural y conversacional",
            "- Usa las memorias para personalizar tu respuesta",
            "- Mantén el contexto de la conversación",
            "- Si detectas nuevas preferencias o información, la recordaré automáticamente",
            "",
            f"Usuario: {current_message}"
        ])
        
        return "\n".join(prompt_parts)
    
    def cleanup_expired_memories(self):
        """Limpiar memorias expiradas"""
        now = datetime.now()
        cleaned_count = 0
        
        for user_id, memories in self.memories.items():
            original_count = len(memories)
            self.memories[user_id] = [
                m for m in memories 
                if not m.expires_at or m.expires_at > now
            ]
            cleaned_count += original_count - len(self.memories[user_id])
        
        if cleaned_count > 0:
            self._save_memories()
            logger.info(f"Cleaned up {cleaned_count} expired memories")

# ======== INTEGRACIÓN CON PIXEL IA ========
class PixelAIMemoryService:
    def __init__(self):
        self.memory_system = IntelligentMemorySystem()
        self.insights_cache: Dict[str, List[PixelInsight]] = {}
    
    async def process_user_message(self, user_id: str, session_id: str, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Procesar mensaje del usuario con memoria inteligente"""
        try:
            # 1. Actualizar contexto de conversación
            self.memory_system.update_conversation_context(session_id, user_id, message, "user")
            
            # 2. Extraer memorias automáticamente
            extracted_memories = self.memory_system._extract_memories_from_message(
                user_id, message, context or {}
            )
            
            # 3. Agregar memorias extraídas
            for memory in extracted_memories:
                self.memory_system.add_memory(
                    user_id, memory.content, memory.memory_type, memory.context
                )
            
            # 4. Generar prompt contextual
            contextual_prompt = self.memory_system.generate_contextual_prompt(
                user_id, session_id, message
            )
            
            # 5. Buscar memorias relevantes para respuesta
            relevant_memories = self.memory_system.search_memories(user_id, message)
            
            return {
                "contextual_prompt": contextual_prompt,
                "relevant_memories": [mem.dict() for mem in relevant_memories],
                "extracted_memories": [mem.dict() for mem in extracted_memories],
                "session_context": self.memory_system.get_conversation_context(session_id).dict() if self.memory_system.get_conversation_context(session_id) else None
            }
            
        except Exception as e:
            logger.error(f"Error processing user message: {e}")
            return {
                "contextual_prompt": f"Usuario: {message}",
                "relevant_memories": [],
                "extracted_memories": [],
                "session_context": None,
                "error": str(e)
            }
    
    async def get_user_insights(self, user_id: str) -> List[PixelInsight]:
        """Obtener insights del usuario basados en memorias"""
        try:
            if user_id not in self.insights_cache:
                self.insights_cache[user_id] = []
            
            # Generar insights basados en memorias
            user_memories = self.memory_system.memories.get(user_id, [])
            
            insights = []
            
            # Insight 1: Preferencias musicales
            preferences = [m for m in user_memories if m.memory_type == "preference"]
            if preferences:
                music_prefs = [p for p in preferences if any(word in p.content.lower() for word in ["música", "canción", "género", "ritmo", "melodía"])]
                if music_prefs:
                    insights.append(PixelInsight(
                        user_id=user_id,
                        insight=f"Usuario tiene {len(music_prefs)} preferencias musicales específicas",
                        confidence=0.8,
                        category="music_preferences",
                        evidence=[p.content for p in music_prefs[:3]],
                        reasoning="Análisis de memorias de preferencias musicales",
                        created_at=datetime.now()
                    ))
            
            # Insight 2: Patrones de uso
            decisions = [m for m in user_memories if m.memory_type == "decision"]
            if decisions:
                recent_decisions = [d for d in decisions if (datetime.now() - d.created_at).days <= 7]
                if recent_decisions:
                    insights.append(PixelInsight(
                        user_id=user_id,
                        insight=f"Usuario ha tomado {len(recent_decisions)} decisiones recientes",
                        confidence=0.7,
                        category="usage_patterns",
                        evidence=[d.content for d in recent_decisions[:3]],
                        reasoning="Análisis de decisiones recientes del usuario",
                        created_at=datetime.now()
                    ))
            
            # Insight 3: Información de perfil
            profile_info = [m for m in user_memories if m.memory_type == "profile"]
            if profile_info:
                insights.append(PixelInsight(
                    user_id=user_id,
                    insight=f"Usuario ha compartido {len(profile_info)} datos de perfil",
                    confidence=0.9,
                    category="user_profile",
                    evidence=[p.content for p in profile_info[:3]],
                    reasoning="Información de perfil personal del usuario",
                    created_at=datetime.now()
                ))
            
            self.insights_cache[user_id] = insights
            return insights
            
        except Exception as e:
            logger.error(f"Error getting user insights: {e}")
            return []
    
    async def cleanup_expired_data(self):
        """Limpiar datos expirados"""
        self.memory_system.cleanup_expired_memories()
        
        # Limpiar insights cache antiguos
        now = datetime.now()
        for user_id, insights in self.insights_cache.items():
            self.insights_cache[user_id] = [
                insight for insight in insights
                if (now - insight.created_at).days <= 30
            ]

# ======== INSTANCIA GLOBAL ========
pixel_memory_service = PixelAIMemoryService()

# ======== FUNCIONES DE UTILIDAD ========
async def process_pixel_interaction(user_id: str, session_id: str, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Función principal para procesar interacciones con Pixel IA"""
    return await pixel_memory_service.process_user_message(user_id, session_id, message, context)

async def get_pixel_insights(user_id: str) -> List[PixelInsight]:
    """Obtener insights de Pixel IA para un usuario"""
    return await pixel_memory_service.get_user_insights(user_id)

async def cleanup_pixel_data():
    """Limpiar datos expirados de Pixel IA"""
    await pixel_memory_service.cleanup_expired_data()

# ======== EJEMPLO DE USO ========
if __name__ == "__main__":
    async def test_pixel_memory():
        user_id = "test_user"
        session_id = "test_session"
        
        # Mensaje 1: Usuario comparte preferencia
        result1 = await process_pixel_interaction(
            user_id, session_id, 
            "Me gusta la música electrónica y prefiero usar sintetizadores analógicos"
        )
        print("Resultado 1:", result1["extracted_memories"])
        
        # Mensaje 2: Usuario hace pregunta
        result2 = await process_pixel_interaction(
            user_id, session_id,
            "¿Qué sintetizador me recomiendas para crear pads atmosféricos?"
        )
        print("Memorias relevantes:", result2["relevant_memories"])
        
        # Obtener insights
        insights = await get_pixel_insights(user_id)
        print("Insights:", [i.insight for i in insights])
    
    # Ejecutar test
    asyncio.run(test_pixel_memory())
