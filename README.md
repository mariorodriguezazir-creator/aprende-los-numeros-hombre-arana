# 🕷️ Aprende los Números con el Hombre Araña

Una PWA educativa gamificada con temática Spider-Man para que los niños aprendan a contar, leer y escribir números del **1 al 50**.

> Creada con amor para **Azir** 🕷️❤️

---

## ✨ Características

| Feature | Descripción |
|---|---|
| 🔢 **Trazado de números** | Canvas interactivo para practicar la escritura del dígito y su nombre |
| 🎤 **Dictado por voz** | Reconocimiento de voz con Web Speech API y validación flexible |
| 🤖 **Validación con IA** | Gemini Vision evalúa el trazado del alumno en tiempo real |
| 🎬 **Recompensas en video** | Videos de YouTube al completar cada número |
| 🎵 **Música de fondo** | Música temática con toggle on/off que se recuerda entre sesiones |
| 📱 **PWA instalable** | Funciona offline e instalable como app nativa en cualquier dispositivo |
| 🕷️ **Tema Spider-Man** | Diseño inmersivo con animaciones GSAP y paleta de colores del trepamuros |
| 📊 **Progreso local** | El avance se guarda automáticamente en el dispositivo |

---

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** v3 — Estilos con `h-dvh` para mobile
- **Zustand** — Estado global con persistencia en `localStorage`
- **GSAP** v3 — Animaciones de celebración y Spider-Man
- **Google Gemini 3 Flash** — Validación IA del trazado (Canvas → Base64 → Vision)
- **Web Speech API** — Reconocimiento de voz nativo del navegador
- **React Router v7** — Navegación con guards de autenticación
- **vite-plugin-pwa** — Service Worker, manifiesto y caché offline

---

## ⚙️ Variables de Entorno

Creá un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Luego editá `.env` con tus valores:

```env
VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

> 🔑 Obtenés tu API key **gratuita** en [Google AI Studio](https://aistudio.google.com/apikey)

**⚠️ Importante:** Nunca subas el archivo `.env` al repositorio. Ya está en `.gitignore`.

---

## 🚀 Correr Localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/mariorodriguezazir-creator/aprende-los-numeros-hombre-arana.git
cd aprende-los-numeros-hombre-arana

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editá .env con tu API key de Gemini

# 4. Agregar música de fondo
# Colocá un archivo MP3 en: public/audio/bg-music.mp3

# 5. Servidor de desarrollo
npm run dev

# 6. Build de producción
npm run build
```

---

## 📱 Instalar como PWA

1. Abrí la app en **Chrome** o **Edge**
2. Click en el ícono de instalación (⊕) en la barra de direcciones
3. Confirmá la instalación
4. ¡La app queda disponible como aplicación nativa!

---

## 🗂️ Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables (Button, TracingCanvas, MusicToggle…)
├── screens/           # Pantallas de la app (Home, Tracing, Voice, Celebration…)
├── hooks/             # Custom hooks (useBgMusic, useVoiceRecognition, useTracing…)
├── store/             # Estado global con Zustand
├── services/          # Gemini AI, Levenshtein, Web Speech
├── data/              # Datos de números del 1 al 50 y videos de YouTube
├── lib/               # Animaciones GSAP
└── types/             # TypeScript types e interfaces
public/
├── audio/             # bg-music.mp3 (no incluido en el repo)
└── icons/             # Iconos de la PWA
```

---

## 🎮 Flujo de la Aplicación

```
Splash → Configurar nombre → Home (1–50)
  └─ Número seleccionado
       ├─ TracingScreen (dígito → nombre escrito)
       ├─ VoiceScreen (dictado por voz)
       ├─ CelebrationScreen (animación Spider-Man)
       └─ VideoRewardScreen (video YouTube)
```

---

## 🔒 Seguridad

- Las API keys están en `.env` (excluido del repositorio)
- El archivo `.env.example` muestra las variables necesarias **sin valores reales**
- El progreso del usuario se guarda solo en `localStorage` del dispositivo (sin nube)

---

## 📄 Licencia

Este proyecto es de uso personal y educativo. Creado con ❤️ para Azir.

---

*Spider-Man y todos los personajes relacionados son marcas registradas de Marvel Entertainment.*
