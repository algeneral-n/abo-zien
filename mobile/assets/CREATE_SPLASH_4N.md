# 🎨 إنشاء Splash Screen بـ "4N"

## ✅ **المطلوب:**

### **1. Splash Screen (splash.png):**
- **الحجم:** 1284×2778 بكسل (iPhone 15 Pro Max)
- **الخلفية:** #000000 (أسود)
- **النص:** "4N" باللون #00eaff (أزرق نيون)
- **الخط:** Bold, كبير (72pt أو أكبر)
- **الموقع:** في المنتصف

### **2. App Icon (icon.png):**
- **الحجم:** 1024×1024 بكسل
- **الخلفية:** #000408 (أسود داكن)
- **النص:** "4N" أو شعار RARE
- **اللون:** #00eaff

---

## 🚀 **الطريقة السريعة:**

### **استخدام Online Tool:**

1. **افتح:** https://www.canva.com/ أو https://www.figma.com/

2. **أنشئ Splash Screen:**
   - حجم: 1284×2778
   - خلفية: #000000
   - أضف نص "4N" باللون #00eaff
   - خط: Bold, حجم كبير
   - في المنتصف

3. **أنشئ Icon:**
   - حجم: 1024×1024
   - خلفية: #000408
   - أضف "4N" أو شعار RARE
   - لون: #00eaff

4. **حمّل واحفظ:**
   - `splash.png` → `mobile/assets/splash.png`
   - `icon.png` → `mobile/assets/icon.png`

---

## 🎯 **أو استخدم Python (إذا كان مثبت):**

```python
from PIL import Image, ImageDraw, ImageFont

# إنشاء Splash Screen
splash = Image.new('RGB', (1284, 2778), color='#000000')
draw = ImageDraw.Draw(splash)

# إضافة نص "4N"
font_size = 200
try:
    font = ImageFont.truetype("arial.ttf", font_size)
except:
    font = ImageFont.load_default()

text = "4N"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

x = (1284 - text_width) // 2
y = (2778 - text_height) // 2

draw.text((x, y), text, fill='#00eaff', font=font)
splash.save('mobile/assets/splash.png')

# إنشاء Icon
icon = Image.new('RGB', (1024, 1024), color='#000408')
draw = ImageDraw.Draw(icon)

text = "4N"
font_size = 300
try:
    font = ImageFont.truetype("arial.ttf", font_size)
except:
    font = ImageFont.load_default()

bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

x = (1024 - text_width) // 2
y = (1024 - text_height) // 2

draw.text((x, y), text, fill='#00eaff', font=font)
icon.save('mobile/assets/icon.png')
```

---

## ✅ **بعد الإنشاء:**

1. **احفظ الملفات:**
   - `mobile/assets/splash.png`
   - `mobile/assets/icon.png`

2. **أعد تشغيل التطبيق:**
   ```bash
   cd mobile
   npx expo start --clear
   ```

3. **سترى:**
   - Splash Screen بـ "4N" عند فتح التطبيق
   - Icon جديد على الشاشة الرئيسية

---

## 🎨 **الألوان المستخدمة:**

- **#000000** - أسود (Splash background)
- **#000408** - أسود داكن (Icon background)
- **#00eaff** - أزرق نيون (النص)


