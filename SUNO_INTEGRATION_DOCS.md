# 🎵 DOCUMENTACIÓN SUNO INTEGRATION - NO MODIFICAR SIN LEER

## ⚠️ ADVERTENCIA CRÍTICA PARA AGENTES IA
**ANTES DE MODIFICAR CUALQUIER ARCHIVO RELACIONADO CON SUNO, LEE ESTE DOCUMENTO COMPLETO**

---

## 📐 ARQUITECTURA DEL SISTEMA

### COMPONENTES CRÍTICOS (NO TOCAR):
```
src/
├── config/
│   └── apiTokens.ts           ← Configuración del API de Suno
│
├── services/
│   ├── tokenManager.ts        ← Gestión de tokens de autenticación
│   └── sunoService.ts         ← Servicio principal de generación
│
├── hooks/
│   └── useSunoService.ts      ← Hook de React para UI
│
└── components/suno/
    ├── SimpleGenerator.tsx    ← Formulario de generación
    └── DualMusicPlayer.tsx    ← Reproductor de audio
```

---

## 🔑 CONFIGURACIÓN DEL API

### Endpoint Configuration (apiTokens.ts):
```typescript
SUNO_CONFIG = {
  BASE_URL: 'https://ai.imgkits.com/suno',
  POLLING_URL: 'https://usa.imgkits.com/node-api/suno',
  AUTH_TOKEN: 'Bearer [TOKEN_AQUI]'
}
```

### Headers OBLIGATORIOS:
```javascript
{
  'Content-Type': 'application/json',
  'authorization': 'Bearer [TOKEN]',
  'channel': 'node-api',              // ⚠️ REQUERIDO
  'origin': 'https://www.livepolls.app',     // ⚠️ REQUERIDO
  'referer': 'https://www.livepolls.app/'    // ⚠️ REQUERIDO
}
```

❌ **NO REMOVER** ninguno de estos headers  
❌ **NO cambiar** los valores de origin/referer

---

## 🔄 FLUJO DE GENERACIÓN

### 1. GENERACIÓN (POST):
```
POST https://ai.imgkits.com/suno/generate
Body: {
  prompt: string,
  style: string,
  title: string,
  customMode: boolean,
  instrumental: boolean,
  lyrics: string,
  gender: string
}
Response: { taskId: string }
```

### 2. POLLING (GET):
```
GET https://usa.imgkits.com/node-api/suno/get_mj_status/{taskId}

Response mientras procesa:
{ running: true }

Response cuando termina:
{ 
  running: false,
  audio_url: string,
  data: { ... }
}
```

⚠️ **IMPORTANTE:**
- El taskId va en el **PATH**, NO como query param
- Endpoint correcto: `/get_mj_status/{taskId}`
- Endpoint INCORRECTO: `/get?taskId={taskId}`

---

## 🚫 REGLAS ESTRICTAS

### ❌ NO HACER:

**NO crear archivos alternativos como:**
- `sunoServiceV2.ts`
- `sunoPolling.ts`
- `useSunoComplement.ts`
- Cualquier variación de nombres

**NO modificar los endpoints:**
- ✅ Correcto: `https://ai.imgkits.com/suno/generate`
- ❌ Incorrecto: `https://usa.imgkits.com/suno/generate`
- ❌ Incorrecto: `https://api.suno.ai/...`

**NO cambiar la estructura de headers**
**NO implementar "proxies inteligentes" o interceptores**
**NO agregar middleware de autenticación adicional**

---

## ✅ MODIFICACIONES PERMITIDAS

### Puedes modificar SOLO:

**UI/UX de los componentes:**
- Estilos en `SimpleGenerator.tsx`
- Layout del `DualMusicPlayer.tsx`
- Animaciones y transiciones

**Manejo de errores:**
- Mensajes de error más descriptivos
- UI de loading states
- Toasts/notificaciones

**Validaciones de formulario:**
- Validación de inputs
- Límites de caracteres
- Formato de texto

---

## 🔧 SI NECESITAS HACER CAMBIOS EN LA LÓGICA

### ANTES de modificar, verifica:

**¿El token está actualizado?**
```bash
# Verifica en src/config/apiTokens.ts
AUTH_TOKEN: 'Bearer eyJ...'
```

**¿Los headers son correctos?**
```bash
grep -A 5 "HEADERS" src/config/apiTokens.ts
```

**¿El endpoint de polling es correcto?**
```bash
grep "get_mj_status" src/services/sunoService.ts
```

### DESPUÉS de modificar:
1. Prueba la extensión de Chrome original (debe seguir funcionando)
2. Prueba el frontend en `http://localhost:5173/suno`
3. Verifica los logs en la consola del navegador

---

## 🐛 DEBUGGING

### Error 401 Unauthorized:
```bash
# 1. Verifica el token
cat src/config/apiTokens.ts | grep AUTH_TOKEN

# 2. Verifica los headers
cat src/services/sunoService.ts | grep -A 10 "headers"

# 3. Compara con la extensión Chrome (DevTools → Network)
```

### Error "job not found":
```bash
# Verifica que uses el endpoint correcto:
grep "get_mj_status" src/services/sunoService.ts

# Debe ser: /get_mj_status/{taskId}
# NO: /get?taskId={taskId}
```

---

## 📞 CONTACTO DE EMERGENCIA

### Si vas a hacer cambios mayores que puedan romper la integración:

1. **Crea un backup primero:**
```bash
cp -r src/services src/services.backup
cp -r src/hooks src/hooks.backup
```

2. **Documenta los cambios en CHANGELOG.md**
3. **Prueba con la extensión original antes de commitear**

---

## 🎯 REFERENCIA RÁPIDA

### Token Manager:
- **Propósito:** Gestiona tokens de autenticación
- **NO tocar:** Lógica de headers
- **Modificable:** Mensajes de log, manejo de errores

### Suno Service:
- **Propósito:** Comunicación con API de Suno
- **NO tocar:** URLs, estructura de requests/responses
- **Modificable:** Timeouts, reintentos, logging

### useSunoService Hook:
- **Propósito:** Conecta UI con servicio
- **NO tocar:** Lógica de llamadas al servicio
- **Modificable:** Estados de UI, progress tracking

---

## 📚 RECURSOS

- **Extensión Chrome original:** `suno-extension/`
- **Logs de pruebas exitosas:** Ver Network tab en DevTools
- **Token actual funcional:** Ver `src/config/apiTokens.ts`

---

**ÚLTIMA ACTUALIZACIÓN:** $(date)  
**VERSIÓN ESTABLE:** 1.0.0  
**ESTADO:** ✅ FUNCIONANDO - NO MODIFICAR SIN RAZÓN
