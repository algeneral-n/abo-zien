# RARE 4N Backend

## 🚀 Backend محلي أونلاين/أوفلاين مع MongoDB + Supabase

### المميزات:
- ✅ **SQLite** - قاعدة بيانات محلية للأوفلاين
- ✅ **MongoDB** - قاعدة بيانات سحابية
- ✅ **Supabase** - قاعدة بيانات PostgreSQL + Real-time
- ✅ **Socket.IO** - WebSocket للـ Real-time
- ✅ **GPT-4o Realtime Streaming** - دعم الريل تايم
- ✅ **Voice Realtime** - Whisper + ElevenLabs
- ✅ **Security Headers** - أمان محسّن
- ✅ **CORS** - دعم متعدد الأصول

### التثبيت:

```bash
cd backend
npm install
```

### الإعداد:

1. انسخ محتوى `ENV_KEYS.txt` إلى ملف `.env` في مجلد `backend`
2. تأكد من أن جميع المفاتيح موجودة

### التشغيل:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### الـ Endpoints:

- `GET /health` - حالة الخادم
- `POST /api/ai/chat` - محادثة AI
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/maps/current-location` - الموقع الحالي
- `GET /api/weather/current` - الطقس الحالي
- `GET /api/libraries/systems` - مكتبة الأنظمة
- `GET /api/libraries/templates` - مكتبة القوالب
- `GET /api/libraries/themes` - مكتبة الثيمات

### WebSocket Namespaces:

- `/gpt/stream` - GPT Realtime Streaming
- `/voice/realtime` - Voice Realtime (Whisper + ElevenLabs)

### قاعدة البيانات:

- **SQLite**: `backend/data/abo-zien.db`
- **MongoDB**: Cloud (MongoDB Atlas)
- **Supabase**: Cloud (PostgreSQL + Real-time)

### الدومين:

- **Domain**: `zien-ai.app`
- **Google Workspace**: `gm@zien-ai.app`

### الأمان:

- Security Headers
- JWT Authentication
- Encryption
- Rate Limiting (قريباً)








