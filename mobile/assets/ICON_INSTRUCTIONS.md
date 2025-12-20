# 🎨 تعليمات إنشاء الأيقونات النهائية

## الأيقونات المطلوبة للتطبيق

### 1. App Icon (أيقونة التطبيق الرئيسية)
- **الملف**: `assets/app-icon.png`
- **الحجم**: 1024×1024 بكسل
- **التصميم**: متوفر في `assets/app-icon.svg`

### 2. Splash Screen (شاشة البداية)
- **الملف**: `assets/splash.png`
- **الحجم**: 1284×2778 بكسل (iPhone 15 Pro Max)
- **التصميم**: متوفر في `assets/splash.svg`

### 3. Adaptive Icon (لـ Android)
- **الملف**: `assets/adaptive-icon.png`
- **الحجم**: 1024×1024 بكسل
- **التصميم**: نفس app-icon لكن بدون خلفية rounded

---

## طريقة التحويل من SVG إلى PNG

### الخيار 1: Online Tool (الأسرع)
1. افتح: https://svgtopng.com/
2. ارفع `app-icon.svg`
3. اختر الحجم: 1024×1024
4. حمّل الصورة واحفظها كـ `app-icon.png`
5. كرر للـ `splash.svg` بحجم 1284×2778

### الخيار 2: استخدام Inkscape (مجاني)
```bash
# تحميل Inkscape من: https://inkscape.org/

# تحويل App Icon
inkscape app-icon.svg --export-type=png --export-filename=app-icon.png -w 1024 -h 1024

# تحويل Splash Screen  
inkscape splash.svg --export-type=png --export-filename=splash.png -w 1284 -h 2778
```

### الخيار 3: استخدام ImageMagick
```bash
# تحميل ImageMagick من: https://imagemagick.org/

# تحويل
magick convert -background none app-icon.svg -resize 1024x1024 app-icon.png
magick convert -background none splash.svg -resize 1284x2778 splash.png
```

### الخيار 4: استخدام Figma/Photoshop
1. افتح ملف SVG في Figma/Photoshop
2. Export as PNG بالحجم المطلوب
3. احفظ في مجلد `assets/`

---

## البديل السريع: استخدام صور مؤقتة

إذا كنت تريد البدء فوراً، استخدم هذا الأمر لإنشاء صور placeholder:

```bash
cd mobile/assets

# إنشاء صور ملونة بسيطة (Windows - PowerShell)
# سنحتاج Python PIL أو استخدام online tool

# أو ببساطة:
# 1. أنشئ صورة 1024×1024 بخلفية #000408
# 2. أضف نص "RARE 4N" بلون #00eaff في المنتصف
# 3. احفظها كـ app-icon.png
```

---

## التحقق من الأيقونات

بعد إنشاء الصور:
```bash
cd mobile

# تشغيل التطبيق لمعاينة الأيقونات
npx expo start

# أو بناء preview
npx eas build --platform ios --profile preview
```

---

## ملاحظات مهمة

1. **الخلفية الشفافة**: 
   - app-icon.png يجب أن يكون بدون شفافية (solid background)
   - استخدم #000408 كخلفية

2. **جودة الصورة**:
   - استخدم PNG-24 (ألوان كاملة)
   - لا تستخدم compression عالي

3. **Safe Area**:
   - اترك 10% من الحواف بدون محتوى مهم
   - لأن iOS سيقوم بـ mask الأيقونة

4. **الألوان**:
   - استخدم #00eaff للعناصر المضيئة
   - #000408 للخلفية
   - #001820 للتدرجات

---

## الخطوة التالية بعد إنشاء الأيقونات

1. ضع الصور في `mobile/assets/`:
   - app-icon.png
   - splash.png
   - adaptive-icon.png

2. شغّل التطبيق:
```bash
cd mobile
npx expo start
```

3. تحقق من الأيقونات في:
   - Home screen
   - Splash screen
   - Settings

4. إذا كانت جيدة، تابع البناء:
```bash
npx eas build --platform ios --profile production
```
