# 🎛️ THE GENERATOR - ENDPOINTS DISPONIBLES

## 📋 **RESUMEN DE ENDPOINTS**

### 1. **🎛️ Generación de Prompts Inteligentes**
- **Endpoint**: `/netlify/functions/generator-prompt`
- **Método**: `POST`
- **Funcionalidad**: Genera prompts creativos para arreglos en The Generator

**Request Body:**
```json
{
  "prompt": "string",
  "style": "string",
  "genre": "string", 
  "mood": "string",
  "creativityLevel": "conservative" | "moderate" | "creative" | "experimental",
  "targetInstrumentation": ["string"],
  "arrangementGoals": ["string"],
  "userId": "string"
}
```

**Response:**
```json
{
  "basePrompt": "string",
  "enhancedPrompt": "string", 
  "creativePrompt": "string",
  "technicalPrompt": "string",
  "arrangementSuggestions": [
    {
      "section": "string",
      "suggestion": "string", 
      "confidence": number
    }
  ],
  "instrumentation": {
    "primary": ["string"],
    "secondary": ["string"],
    "effects": ["string"]
  },
  "creativeElements": ["string"],
  "technicalSpecs": {
    "tempo": "string",
    "key": "string",
    "timeSignature": "string", 
    "dynamics": "string"
  },
  "confidence": number
}
```

---

### 2. **📝 Generación de Letras Estructuradas**
- **Endpoint**: `/netlify/functions/structured-lyrics`
- **Método**: `POST`
- **Funcionalidad**: Genera letras con estructura musical sólida

**Request Body:**
```json
{
  "prompt": "string",
  "literaryKnobs": {
    "narrativeDepth": number,
    "emotionalIntensity": number,
    "poeticComplexity": number,
    "metaphorUsage": number,
    "rhymeDensity": number,
    "storyArc": number,
    "characterDevelopment": number,
    "thematicConsistency": number
  },
  "structure": {
    "type": "verse-chorus" | "verse-prechorus-chorus" | "verse-chorus-bridge" | "intro-verse-chorus-bridge" | "custom",
    "customStructure": "string"
  },
  "style": "string",
  "genre": "string", 
  "mood": "string",
  "userId": "string"
}
```

**Response:**
```json
{
  "lyrics": "string",
  "structure": {
    "sections": [
      {
        "name": "string",
        "lines": ["string"],
        "rhymeScheme": "string",
        "syllableCount": [number]
      }
    ],
    "totalLines": number,
    "rhymePattern": "string"
  },
  "literaryAnalysis": {
    "narrativeDepth": number,
    "emotionalIntensity": number,
    "poeticComplexity": number,
    "metaphorCount": number,
    "rhymeDensity": number,
    "thematicConsistency": number
  },
  "metadata": {
    "complexity": number,
    "coherence": number,
    "creativity": number,
    "emotionalImpact": number
  }
}
```

---

### 3. **🎵 Análisis de Audio**
- **Endpoint**: `/netlify/functions/analyze-audio`
- **Método**: `POST`
- **Funcionalidad**: Analiza pistas de audio para determinar BPM, tonalidad, géneros

**Request Body:**
```json
{
  "audioFile": "base64_string",
  "fileName": "string",
  "userId": "string"
}
```

**Response:**
```json
{
  "bpm": number,
  "key": "string",
  "energy": number,
  "mood": "string",
  "genres": [
    {
      "name": "string",
      "confidence": number
    }
  ],
  "suggestions": ["string"],
  "analysis": {
    "tempo": "string",
    "harmonicComplexity": number,
    "rhythmicPatterns": ["string"],
    "instrumentation": ["string"]
  }
}
```

---

### 4. **🎼 Prompts de Arreglo**
- **Endpoint**: `/netlify/functions/arrangement-prompt`
- **Método**: `POST`
- **Funcionalidad**: Genera prompts creativos para arreglos musicales

**Request Body:**
```json
{
  "prompt": "string",
  "style": "string",
  "genre": "string",
  "mood": "string",
  "creativityLevel": "conservative" | "moderate" | "creative" | "experimental",
  "userId": "string"
}
```

**Response:**
```json
{
  "basePrompt": "string",
  "enhancedPrompt": "string",
  "creativePrompt": "string",
  "arrangementSuggestions": [
    {
      "section": "string",
      "suggestion": "string",
      "confidence": number
    }
  ],
  "instrumentation": {
    "primary": ["string"],
    "secondary": ["string"],
    "effects": ["string"]
  },
  "creativeElements": ["string"],
  "technicalSpecs": {
    "tempo": "string",
    "key": "string",
    "timeSignature": "string",
    "dynamics": "string"
  }
}
```

---

## 🔧 **CONFIGURACIÓN REQUERIDA**

### Variables de Entorno:
```bash
QWEN_API_KEY=your_qwen_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Base URL de Netlify Functions:
```
https://68ebcc1e58a3244416592635--son1k.netlify.app/.netlify/functions
```

---

## 🚀 **EJEMPLO DE USO**

```javascript
// Generar prompts inteligentes
const response = await fetch('/netlify/functions/generator-prompt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: "Una canción sobre la libertad",
    style: "rock",
    genre: "alternative",
    mood: "energetic",
    creativityLevel: "creative",
    userId: "user_123"
  })
});

const prompts = await response.json();
console.log(prompts.enhancedPrompt);
```

---

## 📊 **ESTADOS DE RESPUESTA**

- **200**: Éxito
- **400**: Error en la petición (datos faltantes)
- **405**: Método no permitido
- **500**: Error interno del servidor

---

## 🎯 **CARACTERÍSTICAS PRINCIPALES**

1. **Prompts Inteligentes**: Múltiples niveles de creatividad
2. **Letras Estructuradas**: Con análisis literario automático
3. **Análisis de Audio**: Detección de BPM, tonalidad y géneros
4. **Arreglos Creativos**: Sugerencias por sección musical
5. **Integración Qwen 2**: IA avanzada para generación de contenido
6. **Persistencia Supabase**: Guardado automático de resultados
