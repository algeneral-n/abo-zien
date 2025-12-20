# إعداد Backend RARE 4N

## ✅ ما تم إنجازه:

1. **Backend Server** مع Express + Socket.IO
2. **MongoDB** - اتصال بقاعدة البيانات السحابية
3. **Supabase** - اتصال بقاعدة البيانات PostgreSQL + Real-time
4. **SQLite** - قاعدة بيانات محلية للأوفلاين
5. **WebSocket** - GPT Streaming + Voice Realtime
6. **Security** - Headers + CORS محسّن
7. **Services** - Whisper + ElevenLabs

## 📋 خطوات التشغيل:

### 1. نسخ ملف البيئة:

```bash
# انسخ محتوى ENV_KEYS.txt إلى ملف .env
copy ENV_KEYS.txt .env
```

أو يدوياً:
- افتح `ENV_KEYS.txt`
- انسخ كل المحتوى
- أنشئ ملف `.env` في مجلد `backend`
- الصق المحتوى

### 2. تثبيت المكتبات:

```bash
cd backend
npm install
```

### 3. تشغيل الخادم:

```bash
# Development (مع auto-reload)
npm run dev

# Production
npm start

# أو استخدم ملف البات
start.bat
```

### 4. التحقق من التشغيل:

افتح المتصفح على:
```
http://localhost:5000/health
```

يجب أن ترى:
```json
{
  "status": "online",
  "databases": {
    "local": "connected",
    "mongodb": "connected",
    "supabase": "connected"
  },
  ...
}
```

## 🔌 WebSocket Endpoints:

### GPT Streaming:
```javascript
const socket = io('http://localhost:5000/gpt/stream');
socket.emit('message', { message: 'مرحبا' });
socket.on('token', (data) => console.log(data.token));
```

### Voice Realtime:
```javascript
const socket = io('http://localhost:5000/voice/realtime');
socket.emit('audio-input', { audio: base64Audio, language: 'ar' });
socket.on('transcription', (data) => console.log(data.text));
socket.on('assistant-audio', (data) => console.log(data.audio));
```

## 📊 قاعدة البيانات:

### MongoDB:
- **URI**: موجود في `.env` كـ `MONGODB_URI`
- **Database**: `rare4n`

### Supabase:
- **URL**: موجود في `.env` كـ `EXPO_PUBLIC_SUPABASE_URL`
- **Key**: موجود في `.env` كـ `EXPO_PUBLIC_SUPABASE_KEY`

### SQLite:
- **Path**: `backend/data/abo-zien.db`
- يتم إنشاؤه تلقائياً

## 🌐 الدومين:

- **Domain**: `zien-ai.app`
- **Google Workspace**: `gm@zien-ai.app`
- **API Domain**: `API_DOMAIN=zien-ai.app` في `.env`

## 🔒 الأمان:

- Security Headers مفعلة
- CORS محسّن
- JWT Authentication
- Encryption

## 📝 ملاحظات:

- إذا فشل اتصال MongoDB، سيستمر الخادم باستخدام SQLite فقط
- إذا فشل اتصال Supabase، سيستمر الخادم بدون Real-time features
- جميع المفاتيح موجودة في `ENV_KEYS.txt`

## 🐛 استكشاف الأخطاء:

### MongoDB لا يتصل:
- تحقق من `MONGODB_URI` في `.env`
- تحقق من اتصال الإنترنت
- الخادم سيعمل بدون MongoDB (SQLite فقط)

### Supabase لا يتصل:
- تحقق من `EXPO_PUBLIC_SUPABASE_URL` و `EXPO_PUBLIC_SUPABASE_KEY`
- الخادم سيعمل بدون Supabase (بدون Real-time)

### Port 5000 مستخدم:
- غيّر `PORT` في `.env`
- أو أغلق التطبيق الذي يستخدم Port 5000








