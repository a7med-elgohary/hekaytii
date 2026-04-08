# حكايتي - AI Kids App

تطبيق واجهة هبوط عربي لمشروع "حكايتي" يعرض تجربة إنشاء قصص أطفال مخصصة باستخدام الذكاء الاصطناعي.

## المتطلبات

- Node.js 20+
- npm 10+

## التشغيل محليًا

```bash
npm install
npm run dev
```

## أوامر مهمة

- `npm run dev`: تشغيل بيئة التطوير
- `npm run build`: بناء نسخة الإنتاج
- `npm run preview`: معاينة نسخة الإنتاج محليًا
- `npm run lint`: فحص ESLint
- `npm run test`: تشغيل اختبارات Vitest مرة واحدة
- `npm run test:watch`: تشغيل الاختبارات بوضع المراقبة
- `npm run check`: فحص شامل (lint + test)

## البيئة

انسخ القيم من `.env.example` إلى ملف `.env` وعدّلها حسب بيئتك:

```bash
cp .env.example .env
```

## المجلدات الأساسية

- `src/App.jsx`: الصفحة الرئيسية والتفاعلات
- `src/App.css`: تنسيقات الواجهة
- `src/NewHeroPage.jsx`: صفحة بديلة للواجهة الرئيسية
- `src/test/`: إعداد الاختبارات
