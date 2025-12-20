# 🤖 ElevenLabs Agent Configuration - RARE 4N

## 📋 **Agent Information:**

- **Agent ID:** `agent_0701kc4axybpf6fvak70xwfzpyka`
- **Name:** RARE 4N Customer Service Agent
- **Purpose:** التفاعل مع العملاء في Client Portal Widget

---

## 📁 **الملفات:**

### **1. `workflow.json`**
- ✅ **Workflows:** سير العمل الكامل للتفاعل مع العملاء
- ✅ **Flows:** Welcome, Library Review, Info Collection, Payment, Build Tracking, Revision, Delivery

### **2. `workflow_complete.json`**
- ✅ **Complete Workflow:** Workflow كامل مع Nodes و Edges
- ✅ **Ready for ElevenLabs Dashboard Import**

### **3. `tools.json`**
- ✅ **Tools:** الأدوات المتاحة للـ Agent
- ✅ **Functions:** Show Libraries, Collect Info, Payment, Build, Revision, Notifications, Upload, Translate

### **4. `knowledge_base.json`**
- ✅ **Knowledge Base:** قاعدة المعرفة للـ Agent
- ✅ **Categories:** Company Info, Pricing, Process, Libraries, Revisions, Support, Technical, Common Questions

### **5. `owner_voice_settings.json`**
- ✅ **Owner Voice Recognition:** إعدادات التعرف على صوت المالك (نادر)
- ✅ **Custom Instructions:** نظام حفظ التعليمات المخصصة

### **6. `owner_voice_service.js`**
- ✅ **Voice Recognition Service:** خدمة التعرف على الصوت
- ✅ **Command Detection:** اكتشاف الأوامر الصوتية
- ✅ **Instruction Processing:** معالجة التعليمات المخصصة

### **7. `custom_instructions_storage.json`**
- ✅ **Storage:** تخزين التعليمات المخصصة

---

## 🔧 **الإعداد:**

### **1. في ElevenLabs Dashboard:**

1. اذهب إلى Agent Settings
2. أضف **Tools** من `tools.json`
3. أضف **Knowledge Base** من `knowledge_base.json`
4. أضف **Workflows** من `workflow.json`

### **2. في Backend:**

```env
ELEVENLABS_CONVAI_AGENT_ID=agent_0701kc4axybpf6fvak70xwfzpyka
```

### **3. في Client Portal Widget:**

```html
<elevenlabs-convai agent-id="agent_0701kc4axybpf6fvak70xwfzpyka"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed@beta" async type="text/javascript"></script>
```

---

## 🎯 **الاستخدام:**

### **Workflows:**
- Agent يستخدم Workflows للتفاعل مع العملاء
- كل Flow له خطوات محددة
- Agent يتبع الخطوات تلقائياً

### **Tools:**
- Agent يستدعي Tools عند الحاجة
- Tools تتصل بـ Backend APIs
- النتائج تُعاد للـ Agent

### **Knowledge Base:**
- Agent يستخدم Knowledge Base للإجابة على الأسئلة
- البحث التلقائي في قاعدة المعرفة
- إجابات دقيقة وسريعة

### **Owner Voice Recognition:**
- Agent يتعرف على صوت المالك (نادر)
- يحفظ التعليمات المخصصة صوتياً
- يطبق التعليمات تلقائياً

**مثال:**
```
"نادر، رحب بالعميل سلطان وقوله مرحباً سلطان! أهلاً وسهلاً بك في RARE 4N."
```
→ Agent يحفظ التعليمات ويطبقها عند قدوم العميل سلطان

---

## ✅ **الخلاصة:**

- ✅ **Workflows:** جاهزة
- ✅ **Tools:** جاهزة
- ✅ **Knowledge Base:** جاهزة
- ✅ **Agent ID:** محدّث

**كل شيء جاهز للاستخدام!** 🚀

