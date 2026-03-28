# ⚡ ابدأ هنا - خطوات التشغيل

## ✅ Firebase Setup تم! 

تم إنشاء Firebase Project جديد باسم **subtract-dc755**

---

## 🚀 الخطوات (3 دقائق فقط!)

### خطوة 1: فك الضغط

فك الملف `subtract_FINAL.zip` في:
```
D:\AI\AI Apps\subtract
```

---

### خطوة 2: افتح Terminal

1. اضغط **Windows Key**
2. اكتب: `cmd`
3. اكتب:
```bash
cd "D:\AI\AI Apps\subtract"
```

---

### خطوة 3: ثبّت المكتبات

```bash
npm install
```

استنى 2-3 دقايق...

---

### خطوة 4: شغّل المشروع

```bash
npm run dev
```

**هتشوف:**
```
➜  Local:   http://localhost:3000/
```

---

### خطوة 5: افتح المتصفح

1. افتح Chrome
2. روح: **http://localhost:3000**
3. اضغط **"Sign in with Google"**
4. سجّل دخول

---

## 🎉 اختبر!

جرب تضيف Subscription:
1. اضغط **"Add Subscription"**
2. اختار Netflix مثلاً
3. احفظ

**لو ظهر و فضل موجود = Firebase شغال 100%!** ✅

---

## 🌐 للنشر على Vercel

### بعد ما تتأكد إن كل حاجة شغالة:

```bash
# 1. اعمل Git repo
git init
git add .
git commit -m "Subtract app ready"

# 2. ارفع على GitHub
# (اعمل repo جديد على GitHub اسمه subtract)
git remote add origin https://github.com/YOUR_USERNAME/subtract.git
git push -u origin main

# 3. Deploy على Vercel
# روح vercel.com → Import repo → Deploy
```

### بعد النشر:
1. خد الـ domain من Vercel (مثلاً: `subtract-xyz.vercel.app`)
2. روح Firebase Console:
   ```
   https://console.firebase.google.com/project/subtract-dc755/authentication/settings
   ```
3. في **Authorized domains** → Add domain
4. الصق الـ Vercel domain
5. Save

**✅ خلاص! شغال على Vercel**

---

## 📞 لو حصلت مشكلة

### Error: "unauthorized-domain"
**الحل:** تأكد إنك عملت كل خطوات Firebase Setup اللي فوق

### Port 3000 مستخدم
**الحل:** 
```bash
npm run dev -- --port 3001
```

### الصفحة بيضاء
**الحل:** 
- اضغط F12
- شوف Console
- ابعتلي screenshot من الـ error

---

## 🔗 روابط Firebase

**Firebase Console:**
https://console.firebase.google.com/project/subtract-dc755

**Authentication:**
https://console.firebase.google.com/project/subtract-dc755/authentication

**Firestore Database:**
https://console.firebase.google.com/project/subtract-dc755/firestore

---

## ✨ المشروع جاهز ل:

- ✅ التشغيل المحلي (localhost)
- ✅ النشر على Vercel
- ✅ الشغل في Google AI Studio
- ✅ كله بنفس الـ Database!

---

**Good luck! 🚀**
