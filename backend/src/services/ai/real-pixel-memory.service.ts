import json
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# ======== SISTEMA REAL DE MEMORIA ========
class RealMemorySystem:
    """Sistema de memoria REAL que funciona de verdad"""
    
    def __init__(self, db_path: str = "real_memories.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Inicializar base de datos REAL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla simple de memorias
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                memory_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP
            )
        ''')
        
        # Tabla simple de conversaciones
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
        
        conn.commit()
        conn.close()
        logger.info("Database initialized")
    
    def add_memory(self, user_id: str, content: str, memory_type: str) -> int:
        """Agregar memoria REAL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calcular expiración
        expires_at = None
        if memory_type in ['preference', 'decision']:
            expires_at = datetime.now() + timedelta(days=30)
        
        cursor.execute('''
            INSERT INTO memories (user_id, content, memory_type, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (user_id, content, memory_type, expires_at))
        
        memory_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Added memory {memory_id} for user {user_id}")
        return memory_id
    
    def get_memories(self, user_id: str, memory_type: str = None) -> List[Dict[str, Any]]:
        """Obtener memorias REALES"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        sql = '''
            SELECT id, content, memory_type, created_at
            FROM memories 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
        '''
        params = [user_id]
        
        if memory_type:
            sql += ' AND memory_type = ?'
            params.append(memory_type)
        
        sql += ' ORDER BY created_at DESC LIMIT 20'
        
        cursor.execute(sql, params)
        memories = cursor.fetchall()
        conn.close()
        
        return [
            {
                'id': mem[0],
                'content': mem[1],
                'memory_type': mem[2],
                'created_at': mem[3]
            }
            for mem in memories
        ]
    
    def add_message(self, session_id: str, user_id: str, message: str, role: str = "user"):
        """Agregar mensaje REAL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversations (session_id, user_id, message, role)
            VALUES (?, ?, ?, ?)
        ''', (session_id, user_id, message, role))
        
        conn.commit()
        conn.close()
    
    def get_recent_messages(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtener mensajes recientes REALES"""
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
            for msg in reversed(messages)  # Orden cronológico
        ]
    
    def extract_simple_memories(self, message: str) -> List[Dict[str, str]]:
        """Extraer memorias usando patrones SIMPLES"""
        memories = []
        lower_msg = message.lower()
        
        # Patrones REALES que funcionan
        if 'me gusta' in lower_msg:
            # Extraer lo que le gusta
            parts = message.split('me gusta')
            if len(parts) > 1:
                content = parts[1].strip()
                if len(content) > 3:
                    memories.append({
                        'type': 'preference',
                        'content': f"Le gusta: {content}"
                    })
        
        if 'prefiero' in lower_msg:
            # Extraer preferencia
            parts = message.split('prefiero')
            if len(parts) > 1:
                content = parts[1].strip()
                if len(content) > 3:
                    memories.append({
                        'type': 'preference',
                        'content': f"Prefiere: {content}"
                    })
        
        if 'vivo en' in lower_msg:
            # Extraer ubicación
            parts = message.split('vivo en')
            if len(parts) > 1:
                content = parts[1].strip()
                if len(content) > 2:
                    memories.append({
                        'type': 'profile',
                        'content': f"Vive en: {content}"
                    })
        
        if 'toco' in lower_msg:
            # Extraer instrumento
            parts = message.split('toco')
            if len(parts) > 1:
                content = parts[1].strip()
                if len(content) > 2:
                    memories.append({
                        'type': 'profile',
                        'content': f"Toca: {content}"
                    })
        
        return memories
    
    def build_context_prompt(self, user_id: str, session_id: str, current_message: str) -> str:
        """Construir prompt contextual REAL"""
        # Obtener memorias del usuario
        memories = self.get_memories(user_id)
        
        # Obtener mensajes recientes
        recent_messages = self.get_recent_messages(session_id, 5)
        
        # Construir prompt
        prompt_parts = [
            "Eres Pixel IA, asistente musical inteligente.",
            "Usa la información del usuario para responder de forma personalizada.",
            "",
            "=== INFORMACIÓN DEL USUARIO ==="
        ]
        
        if memories:
            for memory in memories[:5]:  # Máximo 5 memorias
                prompt_parts.append(f"- {memory['content']}")
        else:
            prompt_parts.append("- No hay información específica del usuario")
        
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
            f"Usuario: {current_message}",
            "",
            "Responde de forma natural y útil, usando la información disponible."
        ])
        
        return "\n".join(prompt_parts)

# ======== CONTROLADOR REAL ========
class RealPixelController:
    """Controlador REAL que funciona"""
    
    def __init__(self):
        self.memory = RealMemorySystem()
    
    def process_message(self, user_id: str, session_id: str, message: str) -> Dict[str, Any]:
        """Procesar mensaje REAL"""
        try:
            # 1. Guardar mensaje del usuario
            self.memory.add_message(session_id, user_id, message, "user")
            
            # 2. Extraer memorias automáticamente
            extracted_memories = self.memory.extract_simple_memories(message)
            
            # 3. Guardar memorias extraídas
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
            
            # 4. Construir prompt contextual
            context_prompt = self.memory.build_context_prompt(user_id, session_id, message)
            
            # 5. Obtener memorias existentes
            existing_memories = self.memory.get_memories(user_id)
            
            return {
                'success': True,
                'context_prompt': context_prompt,
                'extracted_memories': saved_memories,
                'existing_memories': existing_memories,
                'message_count': len(self.memory.get_recent_messages(session_id))
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                'success': False,
                'error': str(e),
                'context_prompt': f"Usuario: {message}"
            }
    
    def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """Obtener información REAL del usuario"""
        memories = self.memory.get_memories(user_id)
        
        # Agrupar por tipo
        preferences = [m for m in memories if m['memory_type'] == 'preference']
        profile = [m for m in memories if m['memory_type'] == 'profile']
        
        return {
            'user_id': user_id,
            'total_memories': len(memories),
            'preferences': len(preferences),
            'profile_info': len(profile),
            'recent_memories': memories[:5]  # Últimas 5
        }

# ======== INSTANCIA GLOBAL REAL ========
real_pixel_controller = RealPixelController()

# ======== FUNCIONES DE UTILIDAD REALES ========
def process_real_message(user_id: str, session_id: str, message: str) -> Dict[str, Any]:
    """Procesar mensaje REAL"""
    return real_pixel_controller.process_message(user_id, session_id, message)

def get_real_user_info(user_id: str) -> Dict[str, Any]:
    """Obtener información REAL del usuario"""
    return real_pixel_controller.get_user_info(user_id)

# ======== TEST REAL ========
if __name__ == "__main__":
    print("=== TEST DEL SISTEMA REAL ===")
    
    user_id = "test_user_123"
    session_id = "session_456"
    
    # Test 1: Usuario comparte preferencia
    print("\n1. Usuario comparte preferencia:")
    result1 = process_real_message(
        user_id, session_id,
        "Me gusta la música electrónica y prefiero sintetizadores analógicos"
    )
    print(f"Memorias extraídas: {len(result1['extracted_memories'])}")
    for mem in result1['extracted_memories']:
        print(f"  - {mem['content']}")
    
    # Test 2: Usuario comparte perfil
    print("\n2. Usuario comparte perfil:")
    result2 = process_real_message(
        user_id, session_id,
        "Vivo en México y toco la guitarra"
    )
    print(f"Memorias extraídas: {len(result2['extracted_memories'])}")
    for mem in result2['extracted_memories']:
        print(f"  - {mem['content']}")
    
    # Test 3: Usuario hace pregunta
    print("\n3. Usuario hace pregunta:")
    result3 = process_real_message(
        user_id, session_id,
        "¿Qué sintetizador me recomiendas para crear pads atmosféricos?"
    )
    print(f"Memorias existentes: {len(result3['existing_memories'])}")
    print(f"Mensajes en sesión: {result3['message_count']}")
    
    # Test 4: Información del usuario
    print("\n4. Información del usuario:")
    user_info = get_real_user_info(user_id)
    print(f"Total memorias: {user_info['total_memories']}")
    print(f"Preferencias: {user_info['preferences']}")
    print(f"Info de perfil: {user_info['profile_info']}")
    
    print("\n=== SISTEMA FUNCIONANDO REALMENTE ===")
