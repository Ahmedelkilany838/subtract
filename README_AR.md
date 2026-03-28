# 🎯 Subtract - Subscription Manager

تطبيق إدارة الاشتراكات الشهرية و السنوية بتصميم احترافي و clean.

## ✨ المميزات

- 🔐 **تسجيل دخول بـ Google** - Firebase Authentication
- 💾 **حفظ البيانات** - Firestore Database
- 💰 **تتبع المصاريف** - Monthly & Yearly tracking
- 📊 **تحليلات بصرية** - Charts & Statistics
- 🌍 **دعم عملات متعددة** - Multi-currency support
- 🎨 **Dark Mode** - Light & Dark themes
- 📱 **Responsive** - يشتغل على موبايل و ديسكتوب

---

## 🚀 التشغيل

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Setup Firebase

**اتبع الخطوات في `FIREBASE_SETUP_GUIDE.md`** ⬆️

### 3️⃣ Run Development Server

```bash
npm run dev
```

التطبيق هيفتح على: `http://localhost:3000`

### 4️⃣ Build للـ Production

```bash
npm run build
```

---

## 📁 البنية

```
generated/
├── src/
│   ├── App.tsx           # المكون الرئيسي
│   ├── firebase.ts       # إعدادات Firebase
│   ├── main.tsx          # Entry point
│   ├── index.css         # Styles
│   └── lib/
│       ├── services.ts   # قائمة الخدمات
│       └── currencies.ts # العملات
├── components/           # UI Components (shadcn/ui)
├── firebase-applet-config.json  # Firebase config
└── package.json
```

---

## 🔧 المشاكل الشائعة و حلولها

### ❌ **"Firebase: Error (auth/unauthorized-domain)"**

**الحل:**
1. روح Firebase Console → Authentication → Settings → Authorized domains
2. ضيف `localhost` و `127.0.0.1`

### ❌ **"Missing or insufficient permissions"**

**الحل:**
روح Firestore Database → Rules و اتأكد إن الـ rules زي ما في `FIREBASE_SETUP_GUIDE.md`

### ❌ **البيانات مش بتتحفظ**

**الحل:**
1. تأكد إنك مسجّل دخول بـ Google
2. افتح Console في المتصفح و شوف الـ errors
3. تأكد من الـ Firestore Rules

---

## 🎨 التخصيص

### تغيير الألوان
عدّل الملف `src/index.css` - الـ CSS variables في `:root`

### إضافة خدمات جديدة
عدّل `src/lib/services.ts` - الـ `GLOBAL_SERVICES` array

### تغيير العملات
عدّل `src/lib/currencies.ts`

---

## 📦 التقنيات المستخدمة

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Firebase** - Backend (Auth + Firestore)
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Framer Motion** - Animations
- **Recharts** - Charts
- **React Hook Form + Zod** - Form Validation

---

## 📝 License

Coded by **Ahmed Kilany** - KILANY Brand
© 2026 Subtract

---

## 🆘 Need Help?

لو واجهتك أي مشكلة، شوف الملف `FIREBASE_SETUP_GUIDE.md` أو افتح issue.
