# RARE 4N - Client Portal

## الوصف
بوابة العميل مع Widget على شكل RARE للتواصل مع Auto Builder

## المميزات
- ✅ Widget RARE صوتي/نصي
- ✅ Form للطلبات
- ✅ ربط مع Auto Builder Terminal
- ✅ إشعارات فورية
- ✅ معاينة الثيمات
- ✅ ربط رقم الهاتف والإيميل

## التشغيل
1. افتح `index.html` في متصفح
2. أو استخدم خادم محلي:
```bash
npx serve .
```

## الربط
- Widget يتصل بـ Socket.IO: `/client-portal`
- Form يرسل إلى: `/api/client-portal/form-submit`
- Auto Builder يستقبل من: `/auto-builder`








