# ⚡ Quick Start - ابدأ في 3 دقايق

## 🎯 الخطوات

### 1️⃣ افتح Terminal في مجلد المشروع و اكتب:

```bash
npm install
```

---

### 2️⃣ روح Firebase Console:

افتح الرابط ده: https://console.firebase.google.com/project/gen-lang-client-0926721543

**اعمل الحاجات دي:**

#### أ) فعّل Google Sign-In
1. اختار **Authentication** من السايدبار
2. اضغط **Get Started**
3. اختار **Google** و فعّله
4. اضغط **Save**

#### ب) ضيف localhost للـ Authorized Domains
1. في نفس صفحة Authentication، اختار تاب **Settings**
2. تحت **Authorized domains**، اضغط **Add domain**
3. اكتب: `localhost`
4. اضغط Add domain تاني و اكتب: `127.0.0.1`

#### ج) اعمل Firestore Database
1. اختار **Firestore Database** من السايدبار
2. اضغط **Create database**
3. اختار **Start in test mode**
4. اختار location قريب منك
5. اضغط **Enable**

#### د) اضبط Security Rules
1. في صفحة Firestore Database، اختار تاب **Rules**
2. امسح اللي موجود و حط الكود ده:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /subscriptions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
    
    match /test/{document} {
      allow read: if true;
    }
  }
}
```

3. اضغط **Publish**

---

### 3️⃣ ارجع للـ Terminal و اكتب:

```bash
npm run dev
```

---

### 4️⃣ افتح المتصفح على:

```
http://localhost:3000
```

---

## ✅ خلاص! المفروض دلوقتي:

- ✓ تشوف صفحة الـ login
- ✓ تقدر تسجل دخول بـ Google
- ✓ تضيف subscriptions و تتحفظ

---

## ❌ لو حصلت مشكلة:

### Error: "auth/unauthorized-domain"
👉 ارجع للخطوة 2ب و تأكد إنك ضفت `localhost`

### Error: "Missing or insufficient permissions"
👉 ارجع للخطوة 2د و اضبط الـ Firestore Rules

### الصفحة بيضاء أو مفيش حاجة
👉 افتح Console في المتصفح (F12) و شوف الـ error

---

## 📞 محتاج مساعدة؟

شوف الملف `FIREBASE_SETUP_GUIDE.md` للتفاصيل الكاملة
