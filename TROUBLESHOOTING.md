# 🔧 Troubleshooting Guide - دليل حل جميع المشاكل

## 🚨 مشاكل Firebase Authentication

### 1️⃣ Error: "auth/unauthorized-domain"

**الرسالة الكاملة:**
```
Firebase: Error (auth/unauthorized-domain)
This domain (localhost) is not authorized to run this operation.
```

**السبب:**
الـ domain اللي بتشغل عليه التطبيق مش مضاف في Firebase Console.

**الحل:**

```
خطوة 1: روح Firebase Console
https://console.firebase.google.com/project/gen-lang-client-0926721543

خطوة 2: اختار Authentication من السايدبار

خطوة 3: اختار تاب Settings

خطوة 4: تحت Authorized domains، اضغط Add domain

خطوة 5: أضف:
- localhost
- 127.0.0.1

خطوة 6: Save
```

**ملاحظة:** لو بتشغل على port مختلف (مثلاً 3001)، لسه هتستخدم نفس `localhost`.

---

### 2️⃣ Error: "auth/popup-blocked"

**الرسالة:**
```
The popup has been blocked by the browser
```

**السبب:**
المتصفح بيمنع الـ popup windows.

**الحل:**

**Option 1:** اسمح للـ popups في المتصفح
```
Chrome: Settings → Privacy and Security → Site Settings → Pop-ups and redirects → Allow
```

**Option 2:** استخدم redirect بدل popup

في `src/firebase.ts` غيّر:
```typescript
// من
const result = await signInWithPopup(auth, googleProvider);

// إلى
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
const result = await signInWithRedirect(auth, googleProvider);
```

---

### 3️⃣ Error: "auth/popup-closed-by-user"

**السبب:**
اليوزر قفل الـ popup قبل ما يكمل تسجيل الدخول.

**الحل:**
ده مش error فعلياً - اليوزر ببساطة ألغى العملية. مفيش حاجة محتاج تعملها.

---

## 🗄️ مشاكل Firestore

### 4️⃣ Error: "Missing or insufficient permissions"

**الرسالة الكاملة:**
```
FirebaseError: Missing or insufficient permissions
```

**السبب:**
الـ Firestore Security Rules مش مضبوطة أو اليوزر مش مسجل دخول.

**الحل:**

```
خطوة 1: تأكد إنك مسجل دخول
- شوف في الـ header لو في صورتك أو اسمك

خطوة 2: روح Firestore Console
https://console.firebase.google.com/project/gen-lang-client-0926721543/firestore

خطوة 3: اختار تاب Rules

خطوة 4: امسح كل حاجة و حط الكود ده:
```

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Subscriptions Collection
    match /subscriptions/{document} {
      // يقدر يقرا بس لو هو اللي عامل الـ document
      allow read: if request.auth != null && request.auth.uid == resource.data.uid;
      
      // يقدر يكتب/يعدل/يمسح بس لو هو اللي عامل الـ document
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
      
      // يقدر يعمل document جديد لو بيحط الـ uid بتاعه
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
    
    // Test Collection (للتجربة بس)
    match /test/{document} {
      allow read: if true;
    }
  }
}
```

```
خطوة 5: اضغط Publish

خطوة 6: ارجع للتطبيق و اعمل refresh
```

---

### 5️⃣ البيانات مش بتتحفظ

**الأعراض:**
- تضيف subscription جديد
- يظهر ثانية واحدة و يختفي
- أو مش بيظهر خالص

**السبب المحتمل 1:** Firestore مش موجود

**الحل:**
```
1. روح https://console.firebase.google.com/project/gen-lang-client-0926721543/firestore
2. لو شايف "Create database" يبقى محتاج تعمل database
3. اضغط Create database
4. اختار "Start in test mode"
5. اختار location
6. Enable
```

**السبب المحتمل 2:** الـ uid مش موجود

**الحل:**
افتح Console في المتصفح (F12) و شوف الـ errors. لو شايف حاجة زي:
```
uid is undefined
```

يبقى في مشكلة في الكود. تأكد إن في `src/App.tsx`:
```typescript
const handleAddSubscription = async (data) => {
  if (!user) return; // مهم جداً!
  
  await addDoc(collection(db, 'subscriptions'), {
    ...data,
    uid: user.uid, // لازم يكون موجود
    createdAt: serverTimestamp()
  });
}
```

---

### 6️⃣ Error: "the client is offline"

**الرسالة:**
```
Please check your Firebase configuration. The client is offline.
```

**السبب:**
- مفيش إنترنت
- أو الـ Firebase config غلط
- أو الـ Firestore Database مش موجود

**الحل:**

```
1. تأكد من الإنترنت

2. تأكد من الـ config في firebase-applet-config.json:
{
  "projectId": "gen-lang-client-0926721543",
  "appId": "1:832965596371:web:5874a4e6c421c869fff026",
  "apiKey": "AIzaSyCj6YovXekyHV7kZHH3l6m-aIG83Tk17fg",
  "authDomain": "gen-lang-client-0926721543.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-d27d0592-7b2e-4a5c-91bb-b152c18cac22",
  "storageBucket": "gen-lang-client-0926721543.firebasestorage.app",
  "messagingSenderId": "832965596371"
}

3. تأكد إن Firestore Database موجود و شغال
```

---

## 💻 مشاكل Development

### 7️⃣ npm install فشل

**Error:**
```
npm ERR! code ECONNRESET
```

**الحل:**

```bash
# امسح الـ cache
npm cache clean --force

# حاول تاني
npm install

# لو برضه فشل، جرب
npm install --legacy-peer-deps
```

---

### 8️⃣ Port 3000 already in use

**Error:**
```
Port 3000 is in use
```

**الحل:**

**Option 1:** استخدم port تاني
```bash
npm run dev -- --port 3001
```

**Option 2:** اقفل الـ process اللي شغال على 3000

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

### 9️⃣ صفحة بيضاء فاضية

**الأعراض:**
المتصفح يفتح بس مفيش حاجة ظاهرة، صفحة بيضاء.

**الحل:**

```
خطوة 1: اضغط F12 لفتح Developer Tools

خطوة 2: اختار تاب Console

خطوة 3: شوف الـ errors الحمرا

خطوة 4: الأخطاء الشائعة:
```

**Error:** `Module not found: @/components/ui/button`
**الحل:** 
```bash
# تأكد إنك عملت npm install
npm install
```

**Error:** `Cannot find module './firebase'`
**الحل:**
تأكد إن ملف `src/firebase.ts` موجود

**Error:** `Unexpected token '<'`
**الحل:**
في مشكلة في الـ build. جرب:
```bash
npm run clean
npm run dev
```

---

### 🔟 TypeScript Errors

**Error:**
```
TS2307: Cannot find module '@/components/ui/button'
```

**الحل:**

تأكد من `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

و من `vite.config.ts`:
```typescript
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
```

---

## 🎨 مشاكل UI/UX

### 1️⃣1️⃣ اللوجوهات مش بتظهر

**السبب:**
الـ CDN بتاع Simple Icons أو Clearbit مش راد.

**الحل:**
ده طبيعي - التطبيق بيجرب 3 sources:
1. Simple Icons
2. Clearbit
3. Google Favicon
4. Initial Letter

لو واحد مش اشتغل، بيجرب اللي بعده.

**لو كلهم مش اشتغلوا:**
- تأكد من الإنترنت
- جرب disable أي ad blocker
- استخدم متصفح تاني

---

### 1️⃣2️⃣ الـ Dark Mode مش شغال

**الحل:**

تأكد إن في `src/index.css` موجود ده:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... باقي المتغيرات */
  }
}
```

و في `src/App.tsx`:
```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('dark');

useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, [theme]);
```

---

## 🌐 مشاكل Deployment (Vercel)

### 1️⃣3️⃣ Build failed on Vercel

**Error:**
```
Build failed: npm ERR!
```

**الحل:**

```
خطوة 1: تأكد إن package.json فيه build script:
{
  "scripts": {
    "build": "vite build"
  }
}

خطوة 2: في Vercel Settings:
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

خطوة 3: لو فيه TypeScript errors:
- روح package.json
- امسح "lint": "tsc --noEmit" من scripts
- أو صلّح الـ errors
```

---

### 1️⃣4️⃣ Firebase not working on Vercel

**Error:**
```
auth/unauthorized-domain on Vercel
```

**الحل:**

```
خطوة 1: خد الـ domain من Vercel (مثلاً: subtract-xyz.vercel.app)

خطوة 2: روح Firebase Console → Authentication → Settings → Authorized domains

خطوة 3: Add domain → حط الـ Vercel domain

خطوة 4: Save

خطوة 5: ارجع للموقع و اعمل hard refresh (Ctrl+Shift+R)
```

---

## 📱 مشاكل Mobile/Responsive

### 1️⃣5️⃣ التطبيق مش شغال على الموبايل

**الحل:**

تأكد إن في `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

و في `tailwind.config.js` (أو المكان المناسب):
```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
    },
  },
}
```

---

## 🆘 Last Resort - لو مفيش حاجة اشتغلت

```bash
# امسح كل حاجة و ابدأ من جديد
rm -rf node_modules
rm -rf dist
rm package-lock.json
npm cache clean --force
npm install
npm run dev
```

---

## 📞 محتاج مساعدة إضافية؟

### افتح Issue في GitHub مع:
1. الـ error message كامل
2. Screenshot من Console (F12)
3. وصف إيه اللي كنت بتعمله لما حصل الـ error
4. Browser و OS version

### أو:
- راجع `CODE_GUIDE.md` لفهم الكود
- راجع `FIREBASE_SETUP_GUIDE.md` للتأكد من الإعدادات
- راجع `QUICK_START.md` للخطوات السريعة

---

**تم بحمد الله ✨**
