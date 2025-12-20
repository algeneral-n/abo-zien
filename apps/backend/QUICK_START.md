# 🚀 Quick Start - ربط الباك اند بالدومين

## **الطريقة الأسهل (ngrok):**

### **1. تشغيل الباك اند:**
```bash
cd backend
npm start
```

### **2. تثبيت ngrok:**
```bash
npm install -g ngrok
```

### **3. تشغيل ngrok:**
```bash
ngrok http 5000
```

### **4. نسخ الرابط:**
ستحصل على رابط مثل: `https://abc123.ngrok.io`

### **5. تحديث mobile/config/api.ts:**
```typescript
const DEV_API_NGROK = 'https://abc123.ngrok.io/api'; // ⚠️ لصق الرابط هنا
```

### **6. إعادة تشغيل التطبيق**

---

## **الطريقة الاحترافية (Cloudflare Tunnel):**

### **1. تثبيت cloudflared:**
- Windows: تحميل من https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
- أو: `choco install cloudflared`

### **2. تسجيل الدخول:**
```bash
cloudflared tunnel login
```

### **3. إنشاء tunnel:**
```bash
cloudflared tunnel create rare4n-backend
```

### **4. إعداد DNS:**
```bash
cloudflared tunnel route dns rare4n-backend api.rare4n.com
```

### **5. تشغيل tunnel:**
```bash
cloudflared tunnel run rare4n-backend
```

### **6. تحديث mobile/config/api.ts:**
```typescript
const PROD_API = 'https://api.rare4n.com/api';
```

---

## **للشبكة المحلية (Local Network):**

### **1. الحصول على IP address:**
- Windows: `ipconfig` (ابحث عن IPv4 Address)
- Mac/Linux: `ifconfig` (ابحث عن inet)

### **2. تحديث mobile/config/api.ts:**
```typescript
const DEV_API_LOCAL = 'http://192.168.1.100:5000/api'; // ⚠️ غيّر IP
```

### **3. التأكد من أن الآيفون والابتوب على نفس الشبكة**

---

## **ملاحظات مهمة:**

1. ✅ الباك اند الآن محسّن بـ:
   - Security Headers
   - CORS محسّن (يدعم ngrok + Cloudflare)
   - Error Handling
   - Health Check محسّن

2. ✅ ملف `mobile/config/api.ts` جاهز للاستخدام

3. ✅ جميع الصفحات يجب أن تستخدم `API_BASE` من config

---

## **التحقق من الاتصال:**

### **من المتصفح:**
افتح: `http://localhost:5000/health`

### **من الآيفون:**
افتح: `https://abc123.ngrok.io/health` (أو رابطك)

### **من التطبيق:**
استخدم `checkApiHealth()` من `mobile/config/api.ts`









