# 🌐 دليل ربط الباك اند بالدومين والآيفون

## 📋 **الخطوات:**

### **1️⃣ إعداد الباك اند على اللابتوب:**

#### **أ) استخدام ngrok (أسهل طريقة - للتطوير):**

```bash
# تثبيت ngrok
npm install -g ngrok

# تشغيل ngrok
ngrok http 5000

# ستحصل على رابط مثل:
# https://abc123.ngrok.io
```

**المميزات:**
- ✅ سهل جداً
- ✅ HTTPS تلقائي
- ✅ مجاني للتطوير
- ❌ الرابط يتغير كل مرة (ما عدا النسخة المدفوعة)

---

#### **ب) استخدام Cloudflare Tunnel (مجاني + ثابت):**

```bash
# تثبيت cloudflared
# Windows: تحميل من cloudflare.com
# أو استخدام Chocolatey: choco install cloudflared

# تسجيل الدخول
cloudflared tunnel login

# إنشاء tunnel
cloudflared tunnel create rare4n-backend

# إعداد DNS
cloudflared tunnel route dns rare4n-backend api.rare4n.com

# تشغيل tunnel
cloudflared tunnel run rare4n-backend
```

**المميزات:**
- ✅ مجاني 100%
- ✅ دومين ثابت
- ✅ HTTPS تلقائي
- ✅ سريع جداً

---

#### **ج) استخدام VPS + Nginx (احترافي):**

```bash
# على VPS:
# 1. تثبيت Nginx
sudo apt install nginx

# 2. إعداد reverse proxy
sudo nano /etc/nginx/sites-available/rare4n-backend

# 3. المحتوى:
server {
    listen 80;
    server_name api.rare4n.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 4. تفعيل SSL مع Let's Encrypt
sudo certbot --nginx -d api.rare4n.com
```

---

### **2️⃣ تحسين الباك اند (قوي + آمن):**

#### **أ) إضافة Security Headers:**
```javascript
// ✅ في server.js
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

#### **ب) إضافة Rate Limiting:**
```javascript
// ✅ تثبيت: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
});

app.use('/api/', limiter);
```

#### **ج) إضافة Compression:**
```javascript
// ✅ تثبيت: npm install compression
import compression from 'compression';

app.use(compression());
```

#### **د) تحسين CORS:**
```javascript
// ✅ CORS محسّن
app.use(cors({
  origin: [
    'http://localhost:8081', // Expo Dev
    'https://api.rare4n.com', // Production
    'https://*.ngrok.io', // ngrok
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
}));
```

---

### **3️⃣ إعداد Mobile App:**

#### **أ) إنشاء Config File:**
```typescript
// mobile/config/api.ts
const isDev = __DEV__;
const isProduction = !isDev;

// Development
const DEV_API = 'http://192.168.1.X:5000/api'; // IP address للابتوب

// Production
const PROD_API = 'https://api.rare4n.com/api'; // الدومين

// ngrok (للتطوير)
const NGROK_API = 'https://abc123.ngrok.io/api';

export const API_BASE = isProduction ? PROD_API : NGROK_API;
```

#### **ب) استخدام Config في جميع الصفحات:**
```typescript
// ✅ في boot.tsx, login.tsx, home.tsx, etc.
import { API_BASE } from '../config/api';

// بدلاً من:
// const API_BASE = 'http://localhost:5000/api';
```

---

### **4️⃣ إعدادات إضافية للقوة:**

#### **أ) Database Connection Pooling:**
```javascript
// ✅ في localDB.js
// SQLite لا يحتاج pooling، لكن يمكن تحسينه:
const db = new Database(DB_PATH, {
  verbose: console.log, // للتطوير فقط
  timeout: 5000,
});
```

#### **ب) Error Handling شامل:**
```javascript
// ✅ في server.js
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});
```

#### **ج) Request Logging:**
```javascript
// ✅ تثبيت: npm install morgan
import morgan from 'morgan';

app.use(morgan('combined'));
```

#### **د) Health Check محسّن:**
```javascript
// ✅ في server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});
```

---

## 🚀 **الخطوات العملية:**

### **الطريقة الأسهل (ngrok):**

1. **تشغيل الباك اند:**
   ```bash
   cd backend
   npm start
   ```

2. **تشغيل ngrok:**
   ```bash
   ngrok http 5000
   ```

3. **نسخ الرابط (مثل: https://abc123.ngrok.io)**

4. **تحديث mobile/config/api.ts:**
   ```typescript
   export const API_BASE = 'https://abc123.ngrok.io/api';
   ```

5. **إعادة تشغيل التطبيق**

---

### **الطريقة الاحترافية (Cloudflare Tunnel):**

1. **تثبيت cloudflared:**
   ```bash
   # Windows: تحميل من cloudflare.com
   ```

2. **تسجيل الدخول:**
   ```bash
   cloudflared tunnel login
   ```

3. **إنشاء tunnel:**
   ```bash
   cloudflared tunnel create rare4n-backend
   ```

4. **إعداد DNS:**
   ```bash
   cloudflared tunnel route dns rare4n-backend api.rare4n.com
   ```

5. **تشغيل tunnel:**
   ```bash
   cloudflared tunnel run rare4n-backend
   ```

6. **تحديث mobile/config/api.ts:**
   ```typescript
   export const API_BASE = 'https://api.rare4n.com/api';
   ```

---

## 📊 **مقارنة الطرق:**

| الطريقة | السهولة | التكلفة | الثبات | الأمان |
|---------|---------|---------|--------|--------|
| ngrok | ⭐⭐⭐⭐⭐ | مجاني/مدفوع | ❌ | ✅ |
| Cloudflare Tunnel | ⭐⭐⭐⭐ | مجاني | ✅ | ✅✅ |
| VPS + Nginx | ⭐⭐ | مدفوع | ✅ | ✅✅✅ |

---

## ✅ **الخلاصة:**

**للتطوير السريع:** استخدم ngrok
**للإنتاج:** استخدم Cloudflare Tunnel أو VPS + Nginx

**الباك اند القوي يحتاج:**
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Compression
- ✅ Error Handling
- ✅ Logging
- ✅ Health Checks
- ✅ CORS محسّن









