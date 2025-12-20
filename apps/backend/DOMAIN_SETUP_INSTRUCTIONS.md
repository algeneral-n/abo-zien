# 🌐 إعداد الدومين `zien-ai.app` للباك اند

## 📋 **الخطوات:**

### **1️⃣ إنشاء Subdomain للباك اند:**

نحتاج إنشاء subdomain للباك اند، مثل:
- `api.zien-ai.app` (موصى به)
- أو `backend.zien-ai.app`
- أو `server.zien-ai.app`

---

### **2️⃣ إعداد DNS Records:**

#### **الطريقة الأولى: Cloudflare Tunnel (موصى به - مجاني 100%)**

**المميزات:**
- ✅ مجاني تماماً
- ✅ HTTPS تلقائي
- ✅ سريع جداً
- ✅ لا يحتاج فتح ports
- ✅ يعمل حتى لو IP address يتغير

**الخطوات:**

1. **تثبيت cloudflared:**
   ```bash
   # Windows: تحميل من
   # https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **تسجيل الدخول:**
   ```bash
   cloudflared tunnel login
   ```
   - سيُفتح متصفح
   - اختر الدومين `zien-ai.app`
   - سيوافق على الإذن

3. **إنشاء Tunnel:**
   ```bash
   cloudflared tunnel create rare4n-backend
   ```

4. **إعداد DNS Record:**
   ```bash
   cloudflared tunnel route dns rare4n-backend api.zien-ai.app
   ```

5. **إنشاء ملف الإعداد:**
   ```bash
   # في مجلد backend/
   # إنشاء ملف: config.yml
   ```
   
   محتوى `config.yml`:
   ```yaml
   tunnel: rare4n-backend
   credentials-file: C:\Users\Admin\.cloudflared\<tunnel-id>.json
   
   ingress:
     - hostname: api.zien-ai.app
       service: http://localhost:5000
     - service: http_status:404
   ```

6. **تشغيل Tunnel:**
   ```bash
   cloudflared tunnel run rare4n-backend
   ```

7. **تشغيل Tunnel كخدمة (اختياري - للعمل الدائم):**
   ```bash
   cloudflared service install
   ```

---

#### **الطريقة الثانية: DNS A Record (يحتاج IP ثابت)**

**المتطلبات:**
- ❌ IP address ثابت (Static IP)
- ❌ فتح port 5000 في Firewall
- ❌ SSL certificate (Let's Encrypt)

**الخطوات:**

1. **الحصول على IP address للابتوب:**
   ```bash
   # Windows:
   ipconfig
   # ابحث عن IPv4 Address
   ```

2. **إعداد DNS A Record في Squarespace:**
   - اذهب إلى DNS settings
   - أضف A Record:
     ```
     Type: A
     Host: api
     Points to: [IP address للابتوب]
     TTL: 3600
     ```

3. **فتح Port في Firewall:**
   ```bash
   # Windows Firewall:
   # Control Panel > Windows Defender Firewall > Advanced Settings
   # Inbound Rules > New Rule > Port > TCP > 5000 > Allow
   ```

4. **إعداد SSL (Let's Encrypt):**
   ```bash
   # تثبيت certbot
   # Windows: استخدام WSL أو certbot-win
   ```

---

#### **الطريقة الثالثة: Dynamic DNS (إذا IP يتغير)**

**إذا IP address يتغير، استخدم Dynamic DNS:**

1. **استخدام خدمة مثل No-IP أو DuckDNS:**
   - سجل في noip.com
   - أنشئ hostname: `rare4n-backend.ddns.net`
   - ثبت No-IP DUC (Dynamic Update Client)

2. **إعداد DNS CNAME:**
   ```
   Type: CNAME
   Host: api
   Points to: rare4n-backend.ddns.net
   TTL: 3600
   ```

---

### **3️⃣ تحديث ملفات الإعداد:**

#### **أ) تحديث `backend/src/server.js`:**

الباك اند جاهز بالفعل! ✅

#### **ب) تحديث `mobile/config/api.ts`:**

```typescript
// Production API
const PROD_API = 'https://api.zien-ai.app/api'; // ✅ الدومين الجديد
```

---

### **4️⃣ اختبار الاتصال:**

#### **من المتصفح:**
افتح: `https://api.zien-ai.app/health`

يجب أن ترى:
```json
{
  "status": "online",
  "database": "connected",
  "uptime": 123,
  "memory": {...},
  "environment": "production",
  "timestamp": "..."
}
```

#### **من Terminal:**
```bash
curl https://api.zien-ai.app/health
```

---

## 🎯 **التوصية:**

### **✅ استخدم Cloudflare Tunnel:**

**لماذا؟**
1. ✅ مجاني 100%
2. ✅ HTTPS تلقائي
3. ✅ لا يحتاج IP ثابت
4. ✅ لا يحتاج فتح ports
5. ✅ سريع وآمن
6. ✅ سهل الإعداد

---

## 📝 **خطوات سريعة (Cloudflare Tunnel):**

1. **تثبيت cloudflared:**
   ```bash
   # تحميل من cloudflare.com
   ```

2. **تسجيل الدخول:**
   ```bash
   cloudflared tunnel login
   ```

3. **إنشاء Tunnel:**
   ```bash
   cloudflared tunnel create rare4n-backend
   ```

4. **إعداد DNS:**
   ```bash
   cloudflared tunnel route dns rare4n-backend api.zien-ai.app
   ```

5. **تشغيل Tunnel:**
   ```bash
   cloudflared tunnel run rare4n-backend
   ```

6. **تحديث `mobile/config/api.ts`:**
   ```typescript
   const PROD_API = 'https://api.zien-ai.app/api';
   ```

7. **اختبار:**
   ```bash
   curl https://api.zien-ai.app/health
   ```

---

## ⚠️ **ملاحظات مهمة:**

1. **DNS Propagation:**
   - قد يستغرق 5-30 دقيقة حتى يعمل الدومين
   - استخدم `nslookup api.zien-ai.app` للتحقق

2. **SSL Certificate:**
   - Cloudflare Tunnel يعطي SSL تلقائياً ✅
   - لا تحتاج Let's Encrypt

3. **Firewall:**
   - Cloudflare Tunnel لا يحتاج فتح ports ✅
   - الباك اند يعمل على localhost فقط

4. **IP Changes:**
   - Cloudflare Tunnel يعمل حتى لو IP تغير ✅
   - لا تحتاج Dynamic DNS

---

## 🔒 **الأمان:**

الباك اند محسّن بالفعل بـ:
- ✅ Security Headers
- ✅ CORS محسّن
- ✅ Error Handling
- ✅ Rate Limiting (يمكن إضافته)

---

## 📊 **الخلاصة:**

**الدومين:** `zien-ai.app`
**Subdomain للباك اند:** `api.zien-ai.app`
**الطريقة الموصى بها:** Cloudflare Tunnel
**التكلفة:** مجاني 100%

**الخطوات:**
1. ✅ تثبيت cloudflared
2. ✅ تسجيل الدخول
3. ✅ إنشاء tunnel
4. ✅ إعداد DNS
5. ✅ تشغيل tunnel
6. ✅ تحديث mobile config
7. ✅ اختبار

---

## 🚀 **جاهز للبدء؟**

ابدأ بالخطوة 1: تثبيت cloudflared









