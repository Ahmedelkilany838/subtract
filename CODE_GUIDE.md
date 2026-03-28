# 📖 دليل الكود الكامل - Code Walkthrough

## 🗂️ هيكل المشروع

```
generated/
├── src/                          # المصادر الرئيسية
│   ├── App.tsx                   # المكون الرئيسي للتطبيق
│   ├── firebase.ts               # إعدادات و دوال Firebase
│   ├── main.tsx                  # نقطة الدخول للتطبيق
│   ├── index.css                 # الأنماط العامة
│   └── lib/                      # المكتبات المساعدة
│       ├── services.ts           # قاعدة بيانات الخدمات (Netflix, Spotify, إلخ)
│       ├── currencies.ts         # العملات و أسعار الصرف
│       └── utils.ts              # دوال مساعدة
├── components/                   # مكونات واجهة المستخدم
│   └── ui/                       # مكونات shadcn/ui
├── public/                       # الملفات العامة
├── firebase-applet-config.json   # إعدادات Firebase
├── package.json                  # Dependencies
├── vite.config.ts                # إعدادات Vite
└── tsconfig.json                 # إعدادات TypeScript
```

---

## 🔥 الملفات الأساسية

### 1️⃣ `src/firebase.ts` - إعدادات Firebase

**الغرض:** يحتوي على كل دوال Firebase (Authentication + Firestore)

**المكونات الرئيسية:**

```typescript
// تهيئة Firebase
import firebaseConfig from "../firebase-applet-config.json";
const app = initializeApp(firebaseConfig);

// الخدمات
export const auth = getAuth(app);
export const db = getFirestore(app);

// دوال التسجيل
export const loginWithGoogle = async () => { ... }
export const logout = async () => { ... }

// معالج الأخطاء
export const handleFirestoreError = (error, operation, path) => { ... }
```

**كيف يعمل:**
1. يستورد الإعدادات من `firebase-applet-config.json`
2. يهيئ Firebase App
3. يصدّر `auth` للمصادقة و `db` لـ Firestore
4. يوفر دوال جاهزة للتسجيل و إدارة البيانات

---

### 2️⃣ `src/App.tsx` - المكون الرئيسي

**الغرض:** واجهة التطبيق الكاملة

**الأقسام:**

#### أ) State Management
```typescript
const [user, setUser] = useState<FirebaseUser | null>(null);
const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
const [displayCurrency, setDisplayCurrency] = useState('USD');
const [theme, setTheme] = useState<'light' | 'dark'>('dark');
```

#### ب) Firebase Listeners
```typescript
useEffect(() => {
  // مراقبة حالة تسجيل الدخول
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
  });
  return () => unsubscribe();
}, []);
```

#### ج) Firestore Real-time Sync
```typescript
useEffect(() => {
  if (!user) return;
  
  // الاستماع لتحديثات الاشتراكات
  const q = query(
    collection(db, 'subscriptions'),
    where('uid', '==', user.uid)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const subs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSubscriptions(subs);
  });
  
  return () => unsubscribe();
}, [user]);
```

#### د) CRUD Operations
```typescript
// إضافة subscription
const handleAddSubscription = async (data) => {
  await addDoc(collection(db, 'subscriptions'), {
    ...data,
    uid: user.uid,
    createdAt: serverTimestamp()
  });
}

// تعديل subscription
const handleEditSubscription = async (id, data) => {
  await updateDoc(doc(db, 'subscriptions', id), data);
}

// حذف subscription
const handleDeleteSubscription = async (id) => {
  await deleteDoc(doc(db, 'subscriptions', id));
}
```

#### هـ) Calculations
```typescript
const stats = useMemo(() => {
  const monthly = subscriptions.reduce((sum, sub) => {
    const amount = convertToDisplay(sub.amount, sub.currency);
    return sum + (sub.billingCycle === 'monthly' ? amount : amount / 12);
  }, 0);
  
  return {
    count: subscriptions.length,
    monthly,
    yearly: monthly * 12
  };
}, [subscriptions, displayCurrency, exchangeRates]);
```

---

### 3️⃣ `src/lib/services.ts` - قاعدة بيانات الخدمات

**الغرض:** يحتوي على معلومات كل الخدمات الشهيرة

```typescript
export const GLOBAL_SERVICES: Service[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    slug: 'netflix',
    domain: 'netflix.com',
    category: 'Entertainment',
    color: 'E50914',
    plans: [
      { name: 'Basic', price: 9.99, currency: 'USD' },
      { name: 'Standard', price: 15.49, currency: 'USD' },
      { name: 'Premium', price: 19.99, currency: 'USD' }
    ]
  },
  // ... المزيد من الخدمات
];
```

**الاستخدام:**
- عند إضافة subscription جديد، يقترح من القائمة دي
- يوفر اللوجو من Simple Icons أو Clearbit
- يعرض الـ plans الجاهزة

---

### 4️⃣ `src/lib/currencies.ts` - العملات

**الغرض:** تحويل العملات

```typescript
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  // ... المزيد
];

export const getExchangeRates = async (baseCurrency = 'USD') => {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
  );
  const data = await response.json();
  return data.rates;
};
```

---

### 5️⃣ `firebase-applet-config.json` - إعدادات Firebase

```json
{
  "projectId": "gen-lang-client-0926721543",
  "appId": "1:832965596371:web:5874a4e6c421c869fff026",
  "apiKey": "AIzaSyCj6YovXekyHV7kZHH3l6m-aIG83Tk17fg",
  "authDomain": "gen-lang-client-0926721543.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-d27d0592-7b2e-4a5c-91bb-b152c18cac22",
  "storageBucket": "gen-lang-client-0926721543.firebasestorage.app",
  "messagingSenderId": "832965596371"
}
```

**ملاحظات:**
- الـ `apiKey` موجود في الكود - ده عادي و آمن لـ Firebase
- الأمان معتمد على Firestore Security Rules
- **لا تشارك** الملف ده لو عندك sensitive data

---

## 🎨 UI Components (shadcn/ui)

المشروع بيستخدم مكونات جاهزة من shadcn/ui:

- **Button** - الأزرار
- **Input** - حقول الإدخال
- **Dialog** - النوافذ المنبثقة
- **Select** - القوائم المنسدلة
- **Badge** - الشارات
- **ScrollArea** - المناطق القابلة للتمرير

**التخصيص:** كل المكونات موجودة في `components/ui/` و قابلة للتعديل

---

## 📊 Charts (Recharts)

المشروع بيستخدم Recharts للرسوم البيانية:

```typescript
<PieChart>
  <Pie
    data={categoryData}
    dataKey="value"
    innerRadius={80}
    outerRadius={120}
  />
</PieChart>
```

---

## 🔐 Security

### Firestore Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // كل يوزر يقدر يقرا و يكتب بياناته بس
    match /subscriptions/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.uid;
    }
  }
}
```

**الحماية:**
- مفيش حد يقدر يشوف subscriptions غيره
- لازم تكون مسجل دخول عشان تعمل أي حاجة
- كل subscription مربوط بـ `uid` بتاع اليوزر

---

## 🚀 Deployment

### للنشر على Vercel:

```bash
npm run build
```

ثم:
1. ارفع المشروع على GitHub
2. اربطه بـ Vercel
3. ضيف الـ domain في Firebase Authorized Domains

---

## 🔧 Customization Ideas

### إضافة ميزات جديدة:

1. **Notifications:** استخدم Firebase Cloud Messaging
2. **Recurring Reminders:** اضبط تنبيهات قبل موعد الدفع
3. **Export Data:** صدّر الـ subscriptions كـ CSV
4. **Sharing:** شارك الاشتراكات مع العائلة
5. **Analytics:** تتبع الموفر على مدار الشهور

---

## 📝 Notes

- المشروع متوافق مع React 19
- يستخدم TypeScript للأمان
- الأكواد منظمة و مفهومة
- كل دالة موثقة
