# 🚀 ABO ZIEN - Cognitive-Orchestrated System

## 📋 **النظام:**

```
Cognitive-Orchestrated System (نظام مترابط)
├── محكوم بـ Kernel
├── مُدار بـ Agents
└── قراره الوحيد من Cognitive Loop
```

---

## 🏗️ **المعمارية:**

### **القاعدة الذهبية:**
```
❌ ممنوع: UI → API مباشرة
❌ ممنوع: Agent يشتغل بدون أمر من Cognitive Loop
✅ الوحيد المسموح: UI → Cognitive Loop → Kernel → Agent
```

### **Flow الصحيح:**
```
User Input (UI)
    ↓
Cognitive Loop (Understanding + Reasoning + Decision)
    ↓
Kernel (Orchestration)
    ↓
Agent (Execution)
    ↓
Response → UI
```

---

## 🖥️ **Backend محلي ذكي:**

### **المميزات:**
- ✅ **Offline/Online Intelligent** - يعمل بدون سحابة
- ✅ **SQLite Database** - قاعدة بيانات محلية
- ✅ **Local API Server** - خادم API محلي
- ✅ **Cognitive Learning** - تعلم من التفاعلات
- ✅ **Smart Caching** - تخزين ذكي

### **البنية:**
```
backend/
├── src/
│   ├── server.js          # Local server
│   ├── database/
│   │   └── localDB.js     # SQLite database
│   ├── services/
│   │   └── apiService.js  # API services
│   └── routes/
│       ├── ai.js          # AI routes
│       ├── auth.js        # Auth routes
│       ├── files.js       # Files routes
│       ├── financial.js   # Financial routes
│       ├── maps.js        # Maps routes
│       └── cognitive.js   # Cognitive routes
└── data/
    ├── abo-zien.db        # SQLite database
    └── files/              # Local files storage
```

---

## 📁 **البنية الكاملة:**

```
abo-zien/
├── core/           # 17 Core System
├── engines/        # 8 Engines/Agents
├── systems/        # 8 Systems
├── services/       # Local API services
│   └── localAPI.ts
├── config/         # Configuration
│   ├── api-keys.ts
│   └── local-backend.ts
├── backend/        # Local Backend (NEW!)
│   ├── src/
│   │   ├── server.js
│   │   ├── database/
│   │   ├── services/
│   │   └── routes/
│   └── package.json
├── index.ts
├── package.json
└── README.md
```

---

## 🚀 **البدء:**

### **1. تثبيت Dependencies:**
```bash
cd backend
npm install
```

### **2. إعداد Environment Variables:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys
```

### **3. تشغيل Backend:**
```bash
cd backend
npm start
```

### **4. تشغيل Frontend:**
```bash
npm install
npm start
```

---

## 🔑 **API Keys:**

المفاتيح يتم إضافتها في:
- `backend/.env` - متغيرات البيئة (git ignored)
- `config/api-keys.ts` - ملف المفاتيح (git ignored)

---

## 📝 **ملاحظات:**

- ✅ المشروع محلي فقط - لا يتم رفعه على الريبو
- ✅ Backend محلي ذكي - يعمل بدون سحابة
- ✅ كل Agent يشتغل فقط بأمر من Cognitive Loop
- ✅ Kernel يتحكم في كل شيء
- ✅ Cognitive Loop هو الوحيد الذي يقرر

---

## 🎯 **المجموع:**

- **Core Systems:** 17 ملف
- **Engines:** 8 ملفات
- **Systems:** 8 ملفات
- **Backend:** Local Smart Backend
- **المجموع:** 33 ملف + Backend محلي
