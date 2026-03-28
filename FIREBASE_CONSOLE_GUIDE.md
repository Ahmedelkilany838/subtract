# 🎯 Firebase Console - الدليل المصوّر خطوة بخطوة

## 🌐 الوصول للمشروع

### الخطوة 0: افتح Firebase Console

```
الرابط المباشر لمشروعك:
https://console.firebase.google.com/project/gen-lang-client-0926721543/overview
```

**ملاحظة:** لازم تكون مسجل دخول بنفس حساب Google اللي عملت بيه المشروع.

---

## 🔐 إعداد Authentication

### الخطوة 1: الذهاب لصفحة Authentication

```
في السايدبار الشمال:
📍 اضغط على "Build" (لو مش موجود)
📍 اضغط على "Authentication"
```

**لو أول مرة:**
- هتشوف زرار "Get started"
- اضغط عليه

---

### الخطوة 2: تفعيل Google Sign-In

```
في الصفحة الرئيسية لـ Authentication:
📍 اختار تاب "Sign-in method" (من فوق)
📍 هتشوف قائمة بكل الـ providers
📍 دور على "Google" في القائمة
📍 اضغط على السطر بتاع Google
```

**هتفتح نافذة منبثقة:**
```
1. هتشوف toggle (مفتاح) في أعلى النافذة
2. اضغط عليه عشان يتحول للون الأزرق (Enabled)
3. تحت، في حقل "Project support email"
4. اختار الإيميل بتاعك من القائمة المنسدلة
5. اضغط "Save" في آخر النافذة
```

**النتيجة:**
- Google هيبقى مكتوب عليه "Enabled" باللون الأخضر

---

### الخطوة 3: إضافة Authorized Domains

```
لسه في نفس صفحة Authentication:
📍 اختار تاب "Settings" (من فوق)
📍 scroll لتحت شوية
📍 هتلاقي section اسمها "Authorized domains"
```

**الإعداد:**
```
1. هتشوف قائمة فيها domains موجودة (مثلاً firebaseapp.com)
2. اضغط على زرار "Add domain" (أزرق اللون)
3. في الحقل اللي يظهر، اكتب: localhost
4. اضغط Enter أو "Add"
5. كرر نفس الخطوات و اكتب: 127.0.0.1
```

**النتيجة النهائية - Authorized domains:**
```
✅ gen-lang-client-0926721543.firebaseapp.com (موجود أصلاً)
✅ localhost (أضفته)
✅ 127.0.0.1 (أضفته)
```

**ملاحظة مهمة:** لو هتنشر المشروع على Vercel أو أي مكان تاني، لازم تضيف الـ domain بتاعهم هنا كمان.

---

## 🗄️ إعداد Firestore Database

### الخطوة 4: إنشاء Database

```
في السايدبار الشمال:
📍 اضغط على "Build" (لو مش موجود)
📍 اضغط على "Firestore Database"
```

**لو أول مرة:**
```
1. هتشوف صفحة فيها زرار "Create database"
2. اضغط عليه
```

**النافذة المنبثقة - الخطوة الأولى:**
```
🎯 Set up database

📍 اختار "Start in test mode"
   - ده هيسمح لأي حد مسجل دخول يقرا و يكتب
   - هنغيّره بعدين للـ production rules

📍 اضغط "Next"
```

**النافذة المنبثقة - الخطوة الثانية:**
```
🌍 Set Cloud Firestore location

📍 اختار location قريب منك:
   - لو في مصر أو الخليج: eur3 (europe-west)
   - لو في أوروبا: eur3 (europe-west)
   - لو في أمريكا: us-central1

⚠️ ملاحظة مهمة: الـ location ده مش هتقدر تغيّره بعدين!

📍 اضغط "Enable"
```

**الانتظار:**
```
⏳ Firebase بيجهز الـ database
⏳ ممكن ياخد 1-2 دقيقة
```

**النتيجة:**
```
✅ Firestore Database جاهز
✅ هتشوف صفحة فاضية (No documents yet)
```

---

### الخطوة 5: ضبط Security Rules

```
لسه في صفحة Firestore Database:
📍 اختار تاب "Rules" (من فوق)
📍 هتشوف محرر كود
```

**الكود الموجود (Test mode):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 4, 28);
    }
  }
}
```

**امسح كل ده و حط الكود الجديد:**
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection: subscriptions
    // كل يوزر يقدر يقرا و يكتب بياناته بس
    match /subscriptions/{subscriptionId} {
      // للقراءة: لازم يكون مسجل دخول و الـ uid بتاع الـ document يطابق uid بتاعه
      allow read: if request.auth != null 
                  && request.auth.uid == resource.data.uid;
      
      // للكتابة (تعديل/حذف): نفس الشرط
      allow update, delete: if request.auth != null 
                            && request.auth.uid == resource.data.uid;
      
      // للإنشاء: لازم يحط الـ uid بتاعه في الـ document
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.uid;
    }
    
    // Collection: test (للتجربة بس)
    match /test/{document} {
      allow read: if true;
    }
  }
}
```

**بعد ما تحط الكود:**
```
📍 اضغط زرار "Publish" (فوق على اليمين)
📍 هتظهر رسالة تأكيد
📍 اضغط "Publish" تاني
```

**النتيجة:**
```
✅ Rules updated successfully
✅ التطبيق دلوقتي آمن - كل يوزر يشوف بياناته بس
```

---

## 🧪 اختبار الإعداد

### اختبار Authentication

```
1. ارجع لتاب "Authentication"
2. اختار "Users" من فوق
3. المفروض تشوف قائمة فاضية (No users yet)
4. بمجرد ما حد يسجل دخول في التطبيق، هيظهر هنا
```

### اختبار Firestore

```
1. ارجع لتاب "Firestore Database"
2. اختار "Data" من فوق
3. المفروض تشوف "No documents yet"
4. بمجرد ما حد يضيف subscription، هيظهر collection اسمها "subscriptions"
```

---

## 📊 فهم البيانات في Firestore

### البنية المتوقعة:

```
Firestore Database
│
└── 📁 subscriptions (Collection)
    │
    ├── 📄 doc_id_1 (Document)
    │   ├── uid: "google_user_id_123"
    │   ├── serviceName: "Netflix"
    │   ├── amount: 15.49
    │   ├── currency: "USD"
    │   ├── billingCycle: "monthly"
    │   └── createdAt: timestamp
    │
    ├── 📄 doc_id_2 (Document)
    │   ├── uid: "google_user_id_123"
    │   ├── serviceName: "Spotify"
    │   ├── amount: 9.99
    │   └── ...
    │
    └── ...
```

**ملاحظات:**
- كل document = subscription واحد
- الـ uid يربط الـ subscription باليوزر اللي عمله
- الـ doc_id بيتولّد تلقائياً من Firebase

---

## 🔍 مراقبة النشاط

### في الوقت الفعلي:

```
صفحة Firestore Database → Data:
📍 هتشوف التحديثات live
📍 بمجرد ما يضاف/يتعدل/يتمسح document، هيظهر فوراً
📍 ممكن تضغط على أي document تشوف تفاصيله
```

### في Authentication:

```
صفحة Authentication → Users:
📍 هتشوف كل اليوزرز اللي سجلوا دخول
📍 تقدر تشوف:
   - UID (unique identifier)
   - Email
   - Provider (Google)
   - Created date
   - Last sign-in
```

---

## 🛡️ الأمان - Security Best Practices

### ✅ ما تعمله:

1. **استخدم Security Rules دايماً**
   - متسيبش الـ database مفتوح لأي حد
   
2. **اختبر الـ Rules**
   - Firebase بيوفر "Rules Simulator" في تاب Rules
   - اضغط عليه و اختبر scenarios مختلفة

3. **راجع الـ Rules بانتظام**
   - خصوصاً لو ضفت collections جديدة

### ❌ ما تعملهوش:

1. **متحطش sensitive data في Firestore**
   - زي passwords أو payment info
   - استخدم Firebase Authentication لكده

2. **متشيلش الـ uid check من الـ rules**
   - ده خط الدفاع الأساسي

3. **متسيبش "allow read, write: if true"**
   - ده بيسمح لأي حد يقرا/يكتب كل حاجة

---

## 📈 Usage & Quotas

### شوف استهلاكك:

```
في السايدبار:
📍 اضغط على ⚙️ (Settings) - تحت خالص
📍 اختار "Usage and billing"
📍 اختار تاب "Details"
```

**Free Tier Limits:**
```
✅ Firestore:
   - 1 GB stored data
   - 50,000 reads/day
   - 20,000 writes/day

✅ Authentication:
   - Unlimited users
   - 10,000 verifications/month (phone)
```

**ملاحظة:** التطبيق ده مش هيقرب من الحدود دي حتى لو عندك 100 يوزر نشط.

---

## ✅ Checklist النهائي

قبل ما تبدأ التطبيق، تأكد إنك عملت:

- [ ] ✓ فتحت Firebase Console
- [ ] ✓ روحت صفحة Authentication
- [ ] ✓ فعّلت Google Sign-in
- [ ] ✓ ضفت localhost في Authorized domains
- [ ] ✓ ضفت 127.0.0.1 في Authorized domains
- [ ] ✓ عملت Firestore Database
- [ ] ✓ ضبطت Security Rules
- [ ] ✓ ضغطت Publish على الـ Rules

**لو عملت كل ده، يبقى جاهز! 🎉**

---

## 🆘 مشاكل شائعة

### "I don't see Authentication in sidebar"
👉 اضغط على "Build" الأول، بعدين هتظهر

### "Can't find my project"
👉 تأكد إنك مسجل دخول بنفس حساب Google

### "Publish button is disabled"
👉 لازم تعدل حاجة في الـ Rules الأول

### "Rules contain errors"
👉 تأكد إنك نسخت الكود صح، بالضبط زي ما فوق

---

**خلاص! Firebase جاهز للاستخدام ✨**
