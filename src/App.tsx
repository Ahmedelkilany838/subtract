/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useMemo, Component } from 'react';
import { 
  Plus, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Globe, 
  Trash2, 
  Edit3,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  Settings,
  Bell,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Activity,
  Zap,
  Sparkles,
  AlertCircle,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  onSnapshot, 
  query, 
  where, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType,
  User as FirebaseUser,
  Timestamp
} from './firebase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { GLOBAL_SERVICES, getLogoUrl, getFallbackLogoUrl, Service } from '@/src/lib/services';
import { CURRENCIES, getExchangeRates } from '@/src/lib/currencies';
import { cn } from '@/lib/utils';

interface Subscription {
  id: string;
  serviceId: string;
  serviceName: string;
  slug: string;
  domain: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  category: string;
  color?: string;
  uid: string;
  createdAt: any;
}

const subscriptionSchema = z.object({
  planName: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  currency: z.string().min(1, 'Currency is required'),
  billingCycle: z.enum(['monthly', 'yearly']),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

// ─── Adobe Creative Cloud — unique gradient ID per instance ──────────────────
const AdobeCreativeCloudIcon = ({ className }: { className?: string }) => {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ccg${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FC3B26"/>
          <stop offset="28%"  stopColor="#FC7B20"/>
          <stop offset="54%"  stopColor="#FFC612"/>
          <stop offset="78%"  stopColor="#68C8A0"/>
          <stop offset="100%" stopColor="#3290D9"/>
        </linearGradient>
        <clipPath id={`ccc${id}`}>
          <circle cx="34" cy="60" r="20"/>
          <circle cx="66" cy="60" r="18"/>
          <circle cx="50" cy="44" r="20"/>
          <rect x="14" y="58" width="72" height="20"/>
        </clipPath>
      </defs>
      <rect width="100" height="100" rx="18" fill="#1a1a1a"/>
      <rect x="8" y="24" width="84" height="56" fill={`url(#ccg${id})`} clipPath={`url(#ccc${id})`}/>
    </svg>
  );
};

/** Generic Adobe app icon */
const AdobeAppIcon = ({
  bg, letter, letterColor, className
}: { bg: string; letter: string; letterColor: string; className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill={bg}/>
    <text x="50" y="54" textAnchor="middle" dominantBaseline="middle"
      fill={letterColor} fontFamily="'Helvetica Neue',Arial,sans-serif"
      fontWeight="800" fontSize="36" letterSpacing="-1">{letter}</text>
  </svg>
);

const ADOBE_ICON_MAP: Record<string, React.ReactElement> = {
  'adobecreativecloud': <AdobeCreativeCloudIcon />,
  'adobephotoshop':    <AdobeAppIcon bg="#001E36" letter="Ps" letterColor="#31A8FF" />,
  'adobeillustrator':  <AdobeAppIcon bg="#330000" letter="Ai" letterColor="#FF9A00" />,
  'adobeaftereffects': <AdobeAppIcon bg="#00005B" letter="Ae" letterColor="#9999FF" />,
  'adobepremierepro':  <AdobeAppIcon bg="#0A0026" letter="Pr" letterColor="#EA77FF" />,
  'adobelightroom':    <AdobeAppIcon bg="#001A34" letter="Lr" letterColor="#31A8FF" />,
  'adobeindesign':     <AdobeAppIcon bg="#2E001F" letter="Id" letterColor="#FF3366" />,
  'adobexd':           <AdobeAppIcon bg="#2E001D" letter="Xd" letterColor="#FF61F6" />,
  'adobeaudition':     <AdobeAppIcon bg="#001A14" letter="Au" letterColor="#00E5B3" />,
  'adobeacrobatreader':<AdobeAppIcon bg="#3D0000" letter="Ac" letterColor="#FF2116" />,
  'adobedreamweaver':  <AdobeAppIcon bg="#001A26" letter="Dw" letterColor="#35FA00" />,
  'adobeanimate':      <AdobeAppIcon bg="#2E0000" letter="An" letterColor="#FF6C00" />,
  'adobefresco':       <AdobeAppIcon bg="#2E1500" letter="Fr" letterColor="#FF9A00" />,
  'adobebridge':       <AdobeAppIcon bg="#001A34" letter="Br" letterColor="#9999FF" />,
};

// ─── Google Service Icons — official 4-color brand ───────────────────────────
const GR = '#EA4335'; const GB = '#4285F4'; const GG = '#34A853'; const GY = '#FBBC04';

/** Google G multicolor ring */
const GoogleGIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    {/* Ring quadrants */}
    <path d="M50,18 A32,32,0,0,1,82,50 L65,50 A15,15,0,0,0,50,33 Z" fill={GR}/>
    <path d="M82,50 A32,32,0,0,1,50,82 L50,67 A15,15,0,0,0,65,50 Z" fill={GY}/>
    <path d="M50,82 A32,32,0,0,1,18,50 L35,50 A15,15,0,0,0,50,67 Z" fill={GG}/>
    <path d="M18,50 A32,32,0,0,1,50,18 L50,33 A15,15,0,0,0,35,50 Z" fill={GB}/>
    {/* White gap on right (makes it a G not O) */}
    <rect x="62" y="33" width="22" height="34" fill="white"/>
    {/* G horizontal bar */}
    <rect x="50" y="44" width="32" height="12" fill={GB}/>
    {/* Inner white circle */}
    <circle cx="50" cy="50" r="15" fill="white"/>
  </svg>
);

/** Google Photos — 4-color pinwheel */
const GooglePhotosIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <path d="M50,50 L82,50 A32,32,0,0,0,50,18 Z" fill={GR}/>
    <path d="M50,50 L50,18 A32,32,0,0,0,18,50 Z" fill={GB}/>
    <path d="M50,50 L18,50 A32,32,0,0,0,50,82 Z" fill={GG}/>
    <path d="M50,50 L50,82 A32,32,0,0,0,82,50 Z" fill={GY}/>
    <circle cx="50" cy="50" r="11" fill="white"/>
  </svg>
);

/** Google Drive — 3-color triangle */
const GoogleDriveIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <polygon points="50,14 10,82 35,82" fill={GB}/>
    <polygon points="50,14 90,82 65,82" fill={GG}/>
    <polygon points="35,82 65,82 90,82 10,82" fill={GY}/>
    <polygon points="35,82 65,82 50,56" fill={GR}/>
  </svg>
);

/** YouTube Music — red with note */
const YouTubeMusicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="#FF0000"/>
    <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="7"/>
    <circle cx="50" cy="50" r="10" fill="white"/>
  </svg>
);

/** Google Analytics — orange bar chart */
const GoogleAnalyticsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <rect x="14" y="55" width="18" height="30" rx="4" fill={GY}/>
    <rect x="41" y="35" width="18" height="50" rx="4" fill={GR}/>
    <rect x="68" y="18" width="18" height="67" rx="4" fill="#E37400"/>
  </svg>
);

/** Google Keep — yellow notepad */
const GoogleKeepIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill={GY}/>
    <rect x="28" y="20" width="44" height="55" rx="5" fill="white"/>
    <rect x="36" y="32" width="28" height="5" rx="2" fill="#bbb"/>
    <rect x="36" y="44" width="28" height="5" rx="2" fill="#bbb"/>
    <rect x="36" y="56" width="18" height="5" rx="2" fill="#bbb"/>
    <rect x="38" y="10" width="24" height="14" rx="4" fill="#F6C000"/>
  </svg>
);

/** Google Workspace — colorful grid dots */
const GoogleWorkspaceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <circle cx="32" cy="32" r="14" fill={GB}/>
    <circle cx="68" cy="32" r="14" fill={GR}/>
    <circle cx="32" cy="68" r="14" fill={GG}/>
    <circle cx="68" cy="68" r="14" fill={GY}/>
  </svg>
);

/** Google Cloud — stylized cloud */
const GoogleCloudIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <circle cx="38" cy="55" r="18" fill={GB}/>
    <circle cx="62" cy="55" r="16" fill={GR}/>
    <circle cx="50" cy="42" r="16" fill={GY}/>
    <rect x="20" y="52" width="60" height="16" fill={GG}/>
    <rect x="14" y="55" width="72" height="18" rx="9" fill={GB}/>
  </svg>
);

/** Google Ads — colored bars */
const GoogleAdsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <rect x="14" y="45" width="18" height="40" rx="4" fill={GB}/>
    <rect x="41" y="25" width="18" height="60" rx="4" fill={GG}/>
    <rect x="68" y="55" width="18" height="30" rx="4" fill={GY}/>
  </svg>
);

/** Google Domains — globe */
const GoogleDomainsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke={GB} strokeWidth="7"/>
    <ellipse cx="50" cy="50" rx="16" ry="32" fill="none" stroke={GB} strokeWidth="7"/>
    <line x1="18" y1="50" x2="82" y2="50" stroke={GB} strokeWidth="7"/>
    <line x1="24" y1="32" x2="76" y2="32" stroke={GB} strokeWidth="5"/>
    <line x1="24" y1="68" x2="76" y2="68" stroke={GB} strokeWidth="5"/>
  </svg>
);

/** Google Play — colored triangle */
const GooglePlayIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <polygon points="20,15 20,55 55,35" fill={GG}/>
    <polygon points="20,55 20,85 55,65" fill={GR}/>
    <polygon points="20,15 55,35 55,65 20,85" fill={GB}/>
    <polygon points="55,35 80,50 55,65" fill={GY}/>
  </svg>
);

/** Google Tasks — check circle */
const GoogleTasksIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="white"/>
    <circle cx="50" cy="50" r="32" fill={GB}/>
    <polyline points="34,50 46,62 66,38" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Google One — blue G style */
const GoogleOneIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill={GB}/>
    <text x="50" y="56" textAnchor="middle" dominantBaseline="middle"
      fill="white" fontFamily="'Helvetica Neue',Arial,sans-serif"
      fontWeight="700" fontSize="44">1</text>
  </svg>
);

const GOOGLE_ICON_MAP: Record<string, React.ReactElement> = {
  'google':         <GoogleGIcon />,
  'googleworkspace':<GoogleWorkspaceIcon />,
  'googlecloud':    <GoogleCloudIcon />,
  'googlephotos':   <GooglePhotosIcon />,
  'googledrive':    <GoogleDriveIcon />,
  'youtubemusic':   <YouTubeMusicIcon />,
  'googleads':      <GoogleAdsIcon />,
  'googleanalytics':<GoogleAnalyticsIcon />,
  'googledomains':  <GoogleDomainsIcon />,
  'googleplay':     <GooglePlayIcon />,
  'googlekeep':     <GoogleKeepIcon />,
  'googletasks':    <GoogleTasksIcon />,
};

// Special case: google-one uses GoogleOneIcon (slug is 'google' but id is 'google-one')
const GOOGLE_ID_MAP: Record<string, React.ReactElement> = {
  'google-one': <GoogleOneIcon />,
};

// ─── Universal Service Logo ───────────────────────────────────────────────────
const ServiceLogo = ({
  name,
  domain,
  slug,
  color,
  className
}: {
  name: string;
  domain: string;
  slug: string;
  color?: string;
  className?: string;
}) => {
  const [errorStage, setErrorStage] = useState(0);

  // Adobe products → inline SVG
  if (ADOBE_ICON_MAP[slug]) {
    return React.cloneElement(ADOBE_ICON_MAP[slug], {
      className: cn('w-full h-full', className)
    });
  }

  // Google products → inline SVG (multicolor, no CDN needed)
  const googleBySlug = GOOGLE_ICON_MAP[slug];
  if (googleBySlug) {
    return React.cloneElement(googleBySlug, {
      className: cn('w-full h-full', className)
    });
  }

  // All other services — cascading CDN fallback
  // Stage 0: Simple Icons (SVG, correct brand color)
  // Stage 1: Clearbit  (high-res company PNG)
  // Stage 2: Google Favicon
  // Stage 3: Letter initial
  const sources = [
    `https://cdn.simpleicons.org/${slug}/${color || 'white'}`,
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  ];

  if (errorStage >= sources.length) {
    return (
      <div className={cn(
        'flex items-center justify-center font-bold text-xs rounded-lg',
        'bg-muted text-foreground/40 uppercase w-full h-full',
        className
      )}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={sources[errorStage]}
      alt={name}
      className={cn('w-full h-full object-contain transition-opacity duration-300', className)}
      onError={() => setErrorStage(prev => prev + 1)}
      referrerPolicy="no-referrer"
    />
  );
};

export default function App() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'dashboard'>('list');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const [budgetGoal, setBudgetGoal] = useState<number>(500);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Sync user profile/settings
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setBudgetGoal(data.budgetGoal || 500);
            setDisplayCurrency(data.displayCurrency || 'USD');
          } else {
            // Initialize user doc
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              budgetGoal: 500,
              displayCurrency: 'USD',
              role: 'user',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Subscriptions Listener
  useEffect(() => {
    if (!user || !authReady) {
      setSubscriptions([]);
      return;
    }

    const q = query(collection(db, 'subscriptions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
      setSubscriptions(subs.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'subscriptions');
    });

    return () => unsubscribe();
  }, [user, authReady]);

  // Update User Settings
  const updateUserSettings = async (updates: Partial<{ budgetGoal: number, displayCurrency: string }>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    if (authReady && user) {
      updateUserSettings({ budgetGoal });
    }
  }, [budgetGoal]);

  useEffect(() => {
    if (authReady && user) {
      updateUserSettings({ displayCurrency });
    }
  }, [displayCurrency]);

  // Migration: Update existing subscriptions' categories based on latest GLOBAL_SERVICES
  useEffect(() => {
    if (!user || !authReady) return;
    
    subscriptions.forEach(async (sub) => {
      const service = GLOBAL_SERVICES.find(s => s.id === sub.serviceId);
      if (service && service.category !== sub.category) {
        try {
          await updateDoc(doc(db, 'subscriptions', sub.id), { category: service.category });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `subscriptions/${sub.id}`);
        }
      }
    });
  }, [subscriptions, user, authReady]);

  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalCategory, setModalCategory] = useState<string>('All');
  const allCategories = useMemo(() => {
    const cats = new Set(GLOBAL_SERVICES.map(s => s.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  const activeCategories = useMemo(() => {
    const cats = new Set(subscriptions.map(s => s.category));
    return ['All', ...Array.from(cats).sort()];
  }, [subscriptions]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      planName: '',
      amount: '',
      currency: 'USD',
      billingCycle: 'monthly',
    },
  });

  const billingCycleValue = watch('billingCycle');
  const currencyValue = watch('currency');

  useEffect(() => {
    const fetchRates = async () => {
      const rates = await getExchangeRates(displayCurrency);
      if (rates) setExchangeRates(rates);
    };
    fetchRates();
  }, [displayCurrency]);

  useEffect(() => {
    if (editingSub) {
      const service = GLOBAL_SERVICES.find(s => s.id === editingSub.serviceId);
      setSelectedService(service || null);
      setValue('planName', editingSub.planName);
      setValue('amount', editingSub.amount.toString());
      setValue('currency', editingSub.currency);
      setValue('billingCycle', editingSub.billingCycle);
    }
  }, [editingSub, setValue]);

  const convertToDisplay = (amount: number, fromCurrency: string) => {
    if (fromCurrency === displayCurrency) return amount;
    if (!exchangeRates || !exchangeRates[fromCurrency]) return amount;
    return amount / exchangeRates[fromCurrency];
  };

  const stats = useMemo(() => {
    let monthlyTotal = 0;
    subscriptions.forEach(sub => {
      const converted = convertToDisplay(sub.amount, sub.currency);
      if (sub.billingCycle === 'yearly') {
        monthlyTotal += converted / 12;
      } else {
        monthlyTotal += converted;
      }
    });
    return {
      monthly: monthlyTotal,
      yearly: monthlyTotal * 12,
      count: subscriptions.length
    };
  }, [subscriptions, exchangeRates, displayCurrency]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const converted = convertToDisplay(sub.amount, sub.currency);
      const monthly = sub.billingCycle === 'yearly' ? converted / 12 : converted;
      totals[sub.category] = (totals[sub.category] || 0) + monthly;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [subscriptions, exchangeRates, displayCurrency]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

  const filteredSubscriptions = useMemo(() => {
    if (selectedCategory === 'All') return subscriptions;
    return subscriptions.filter(sub => sub.category === selectedCategory);
  }, [subscriptions, selectedCategory]);

  const onSubmit = async (data: SubscriptionFormValues) => {
    if (!selectedService || !user) return;

    if (editingSub) {
      const updates = {
        planName: data.planName || 'Standard',
        amount: parseFloat(data.amount),
        currency: data.currency,
        billingCycle: data.billingCycle,
      };
      try {
        await updateDoc(doc(db, 'subscriptions', editingSub.id), updates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `subscriptions/${editingSub.id}`);
      }
    } else {
      const newSub = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        slug: selectedService.slug,
        domain: selectedService.domain,
        planName: data.planName || 'Standard',
        amount: parseFloat(data.amount),
        currency: data.currency,
        billingCycle: data.billingCycle,
        category: selectedService.category,
        color: selectedService.color,
        uid: user.uid,
        createdAt: serverTimestamp()
      };
      try {
        await addDoc(collection(db, 'subscriptions'), newSub);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'subscriptions');
      }
    }

    setIsAddingInline(false);
    setEditingSub(null);
    setSelectedService(null);
    reset();
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsAddingInline(true);
    // Scroll to top to see the inline form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeSubscription = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subscriptions/${id}`);
    }
  };

  const filteredServices = useMemo(() => {
    return GLOBAL_SERVICES.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = modalCategory === 'All' || s.category === modalCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, modalCategory]);

  const currencySymbol = CURRENCIES.find(c => c.code === displayCurrency)?.symbol || displayCurrency;

  if (!authReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">Initializing Secure Session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full dark:mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full dark:mix-blend-screen" />
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border border-border p-8 md:p-12 rounded-xl max-w-md w-full text-center relative z-10"
        >
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-8 border border-border relative group">
            <Zap className="w-5 h-5 text-foreground relative z-10" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-3 tracking-tight">
            Subtract <span className="text-foreground/50">Pro</span>
          </h1>
          
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            The minimal command center for your digital subscriptions.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={loginWithGoogle}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group border-none text-sm"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            
            <p className="text-[11px] text-muted-foreground font-medium px-8 leading-relaxed">
              By continuing, you agree to our <span className="text-foreground/80 underline cursor-pointer hover:text-foreground transition-colors">Terms of Service</span> and <span className="text-foreground/80 underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-border flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Activity, label: 'Real-time' },
                { icon: CreditCard, label: 'Budgeting' },
                { icon: LayoutDashboard, label: 'Analytics' }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group/feat">
                  <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover/feat:bg-muted transition-all duration-300">
                    <feature.icon className="w-4 h-4 text-muted-foreground group-hover/feat:text-foreground transition-colors" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover/feat:text-foreground/80 transition-colors">{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-all duration-500">
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-foreground/50" />
                <span className="text-[10px] font-medium text-foreground/50">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-foreground/50" />
                <span className="text-[10px] font-medium text-foreground/50">GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-foreground/50" />
                <span className="text-[10px] font-medium text-foreground/50">AES-256</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-12 flex flex-col items-center gap-6 relative z-10">
          <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-full border border-border backdrop-blur-md">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
              All Systems Operational
            </p>
          </div>
          <div className="flex items-center gap-8 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-bold">
            <span className="hover:text-foreground/80 cursor-pointer transition-colors">Help Center</span>
            <span className="hover:text-foreground/80 cursor-pointer transition-colors">Security</span>
            <span className="hover:text-foreground/80 cursor-pointer transition-colors">Status</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 selection:text-foreground relative overflow-x-hidden">
      {/* Soft Ambient Blue Light */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-0">
        <div className="absolute -top-[20%] w-[70%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full dark:mix-blend-screen" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full dark:mix-blend-screen" />
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full dark:mix-blend-screen" />
      </div>

      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border transition-all duration-300 group-hover:bg-accent">
              <Zap className="w-4 h-4 text-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-medium tracking-tight text-foreground leading-none">Subtract</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-border mr-2 md:mr-4">
              <button
                onClick={() => setActiveView('list')}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-2",
                  activeView === 'list' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutDashboard className="w-3 h-3" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-2",
                  activeView === 'dashboard' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Activity className="w-3 h-3" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-all cursor-pointer text-muted-foreground hover:text-foreground"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-1 bg-card p-0.5 rounded-lg border border-border">
                <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                  <SelectTrigger className="w-[80px] md:w-[90px] border-none bg-transparent text-foreground/80 h-7 text-[11px] font-medium focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground rounded-lg">
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code} className="text-[11px] font-medium focus:bg-accent focus:text-foreground rounded-md">
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-all cursor-pointer group/user overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground group-hover/user:text-foreground transition-colors" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-popover border-border p-4 rounded-xl shadow-xl">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                        <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">{user.displayName}</p>
                        <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <Separator className="bg-muted" />
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="w-full justify-start text-rose-500 hover:text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 dark:bg-rose-400/10 rounded-lg h-10 font-medium text-xs"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16 relative z-10">
        
        {activeView === 'list' ? (
          <>
            {/* Reference-based Header Section */}
            <header className="mb-12 flex flex-col items-center text-center relative">
              
              {/* Top Tier: Monthly */}
              <div className="mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Monthly Spend</p>
                </div>
                <div className="text-5xl md:text-6xl font-medium text-foreground tracking-tight tabular-nums flex items-baseline justify-center gap-2">
                  <span className="text-muted-foreground text-2xl md:text-3xl font-light">{currencySymbol}</span>
                  {Math.round(stats.monthly).toLocaleString()}
                </div>
              </div>

              {/* Bottom Tier: Yearly, Daily, Active */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-xl relative z-10">
                <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Yearly</p>
                  <div className="text-lg md:text-xl font-medium text-foreground tabular-nums flex items-baseline justify-center gap-1">
                    <span className="text-muted-foreground text-xs font-light">{currencySymbol}</span>
                    {Math.round(stats.yearly).toLocaleString()}
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Daily</p>
                  <div className="text-lg md:text-xl font-medium text-foreground tabular-nums flex items-baseline justify-center gap-1">
                    <span className="text-muted-foreground text-xs font-light">{currencySymbol}</span>
                    {Math.round(stats.monthly / 30).toLocaleString()}
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center gap-1">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">Active</p>
                  <div className="text-lg md:text-xl font-medium text-foreground tabular-nums">
                    {stats.count}
                  </div>
                </div>
              </div>
            </header>

        {/* Subscriptions List Section */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Badge className="bg-muted text-foreground/80 border-border rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest">
                {subscriptions.length}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="hidden lg:flex items-center gap-1 bg-card p-1 rounded-lg border border-border">
                {activeCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
                      selectedCategory === cat 
                        ? "bg-accent text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Button 
                onClick={() => {
                  if (isAddingInline) {
                    setIsAddingInline(false);
                    setEditingSub(null);
                    setSelectedService(null);
                    reset();
                  } else {
                    setIsAddingInline(true);
                  }
                }}
                className={cn(
                  "rounded-md h-10 px-5 text-[11px] font-medium transition-all w-full sm:w-auto",
                  isAddingInline 
                    ? "bg-muted text-muted-foreground hover:bg-accent border border-border" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isAddingInline ? (
                  <>
                    <X className="w-3.5 h-3.5 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Add Subscription
                  </>
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isAddingInline && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                className="overflow-hidden border-b border-border"
              >
                <div className="py-8">
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8 relative overflow-hidden">
                    {!selectedService ? (
                      <div className="space-y-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                          <div className="space-y-1">
                            <h3 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">Select Service</h3>
                            <p className="text-muted-foreground text-xs font-medium max-w-md">Choose from our curated list of global services.</p>
                          </div>
                          <div className="relative w-full md:w-[20rem] group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-foreground transition-all duration-300" />
                            <Input 
                              placeholder="Search services..." 
                              className="pl-9 bg-card border-border h-10 rounded-lg focus:ring-0 text-xs font-medium placeholder:text-muted-foreground transition-all focus:border-ring focus:bg-accent"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2">
                          {allCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setModalCategory(cat)}
                              className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
                                modalCategory === cat 
                                  ? "bg-accent text-foreground" 
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                              <div
                                key={service.id}
                                className="group relative flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent hover:border-border transition-all duration-300 cursor-pointer overflow-hidden"
                                onClick={() => setSelectedService(service)}
                              >
                              <div className={cn(
                                  "w-11 h-11 rounded-lg overflow-hidden border border-border/60 group-hover:scale-105 transition-transform duration-300 shrink-0 flex items-center justify-center",
                                  (ADOBE_ICON_MAP[service.slug] || GOOGLE_ICON_MAP[service.slug]) ? "bg-transparent p-0" : "bg-muted p-1.5"
                                )}>
                                  <ServiceLogo 
                                    name={service.name}
                                    domain={service.domain}
                                    slug={service.slug}
                                    color={service.color}
                                    className="w-full h-full"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-medium text-sm text-foreground truncate">{service.name}</h4>
                                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{service.category}</p>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                  <Plus className="w-3 h-3 text-foreground" />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full py-20 text-center">
                              <p className="text-muted-foreground text-sm font-medium">No services found for "{searchQuery}"</p>
                              <p className="text-muted-foreground text-xs mt-2 opacity-60">Try searching with a different keyword</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <motion.form 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-10 relative z-10"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-16 h-16 rounded-xl overflow-hidden border border-border flex items-center justify-center",
                                (ADOBE_ICON_MAP[selectedService.slug] || GOOGLE_ICON_MAP[selectedService.slug]) ? "bg-transparent p-0" : "bg-card p-3"
                              )}>
                              <ServiceLogo 
                                name={selectedService.name}
                                domain={selectedService.domain}
                                slug={selectedService.slug}
                                color={selectedService.color}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">{selectedService.name}</h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                                  onClick={() => window.open(`https://${selectedService.domain}`, '_blank')}
                                  title={`Visit ${selectedService.name} website`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-medium mt-1">{selectedService.category}</p>
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                              setSelectedService(null);
                              setEditingSub(null);
                            }} 
                            className="text-[10px] text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded-lg px-4 h-8 font-medium border border-border"
                          >
                            <ArrowLeft className="w-3 h-3 mr-2" />
                            Change Service
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <Label className="text-muted-foreground text-[10px] font-medium ml-1">Plan Name</Label>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {['Basic', 'Pro', 'Premium', 'Ultra'].map(plan => (
                                <button
                                  key={plan}
                                  type="button"
                                  onClick={() => setValue('planName', plan)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-md text-[10px] font-medium border transition-all",
                                    watch('planName') === plan 
                                      ? "bg-primary text-primary-foreground border-primary" 
                                      : "bg-muted text-muted-foreground border-border hover:border-ring hover:text-foreground"
                                  )}
                                >
                                  {plan}
                                </button>
                              ))}
                            </div>
                            <Input 
                              {...register('planName')} 
                              className="bg-card border-border h-10 rounded-lg focus:ring-0 text-sm font-medium px-4 placeholder:text-muted-foreground transition-all focus:border-ring" 
                              placeholder="Custom plan name..." 
                            />
                          </div>

                          <div className="space-y-4">
                            <Label className="text-muted-foreground text-[10px] font-medium ml-1">Billing Cycle & Amount</Label>
                            <div className="grid grid-cols-2 gap-1 p-1 bg-card rounded-lg border border-border mb-4">
                              <button
                                type="button"
                                onClick={() => setValue('billingCycle', 'monthly')}
                                className={cn(
                                  "h-8 rounded-md text-[10px] font-medium transition-all",
                                  watch('billingCycle') === 'monthly' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                              >
                                Monthly
                              </button>
                              <button
                                type="button"
                                onClick={() => setValue('billingCycle', 'yearly')}
                                className={cn(
                                  "h-8 rounded-md text-[10px] font-medium transition-all",
                                  watch('billingCycle') === 'yearly' ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                              >
                                Yearly
                              </button>
                            </div>
                            <div className="relative group/amount">
                              <Input 
                                type="number" 
                                step="0.01" 
                                {...register('amount')} 
                                className="bg-card border-border h-10 rounded-lg focus:ring-0 text-lg font-medium px-4 focus:border-ring transition-all tabular-nums" 
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-medium pointer-events-none">
                                {watch('currency')}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-muted-foreground text-[10px] font-medium ml-1">Currency</Label>
                            <Select value={watch('currency')} onValueChange={(v) => setValue('currency', v)}>
                              <SelectTrigger className="bg-card border-border h-10 rounded-lg focus:ring-0 text-sm font-medium px-4 hover:bg-muted transition-all">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border text-foreground rounded-lg p-1">
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-1">
                                    {CURRENCIES.map(c => (
                                      <SelectItem key={c.code} value={c.code} className="font-medium py-2 px-3 rounded-md focus:bg-accent focus:text-foreground transition-all cursor-pointer">
                                        <div className="flex items-center justify-between w-full gap-4">
                                          <span className="text-xs">{c.code}</span>
                                          <span className="text-[10px] opacity-50">{c.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                          <Button 
                            type="submit" 
                            className="flex-[2] h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-medium transition-all"
                          >
                            {editingSub ? 'Update Subscription' : 'Confirm Subscription'}
                          </Button>
                          <div className="flex gap-3 flex-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsAddingInline(false);
                                setEditingSub(null);
                                setSelectedService(null);
                                reset();
                              }} 
                              className="flex-1 h-10 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border bg-transparent"
                            >
                              Cancel
                            </Button>
                            {editingSub && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  removeSubscription(editingSub.id);
                                  setIsAddingInline(false);
                                  setEditingSub(null);
                                  setSelectedService(null);
                                  reset();
                                }} 
                                className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-foreground border border-red-500/20 transition-all flex items-center justify-center p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter (Mobile & Tablet) */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
            {activeCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border",
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted text-foreground/40 border-border hover:text-foreground hover:bg-accent"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredSubscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group"
                >
                  <div className="relative p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border rounded-lg transition-all duration-300 hover:border-border hover:bg-accent">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={cn(
                          "w-11 h-11 rounded-lg overflow-hidden border border-border shrink-0 transition-all duration-300 flex items-center justify-center",
                          (ADOBE_ICON_MAP[sub.slug] || GOOGLE_ICON_MAP[sub.slug]) ? "bg-transparent p-0" : "bg-card p-2 group-hover:bg-muted"
                        )}>
                        <ServiceLogo 
                          name={sub.serviceName}
                          domain={sub.domain}
                          slug={sub.slug}
                          color={sub.color}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm md:text-base tracking-tight truncate text-foreground">{sub.serviceName}</h4>
                          <Badge className="bg-muted text-muted-foreground border-border rounded-md px-1.5 py-0.5 text-[9px] font-medium shrink-0">
                            {sub.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[10px] font-medium truncate">{sub.planName}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-accent shrink-0" />
                          <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-muted-foreground text-[10px] font-medium shrink-0 capitalize">{sub.billingCycle}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline justify-start sm:justify-end gap-1">
                          <span className="text-muted-foreground text-[10px] font-medium">{displayCurrency}</span>
                          <p className="font-medium text-lg tracking-tight tabular-nums text-foreground">
                            {Math.round(convertToDisplay(sub.amount, sub.currency)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 sm:-translate-x-2 group-hover:translate-x-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          onClick={() => window.open(`https://${sub.domain}`, '_blank')}
                          title={`Visit ${sub.serviceName} website`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          onClick={() => handleEdit(sub)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Popover>
                          <PopoverTrigger 
                            className="w-8 h-8 rounded-md text-muted-foreground hover:text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:bg-red-400/10 transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </PopoverTrigger>
                          <PopoverContent className="bg-popover border-border text-foreground p-4 w-64 rounded-xl shadow-xl">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Remove Subscription?</p>
                                <p className="text-[11px] text-muted-foreground">This action will permanently disconnect this service.</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 rounded-md h-8 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="flex-1 rounded-md h-8 text-[11px] font-medium bg-red-500 text-foreground hover:bg-red-600"
                                  onClick={() => removeSubscription(sub.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredSubscriptions.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 md:py-20 border border-dashed border-border rounded-xl bg-card/50"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-xs md:text-sm font-medium">
                  {selectedCategory === 'All' ? 'No active subscriptions' : `No data in ${selectedCategory}`}
                </p>
              </motion.div>
            )}
          </div>
        </section>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Total Active', value: stats.count, icon: LayoutDashboard, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-400/10' },
                { label: 'Monthly Spend', value: `${currencySymbol}${Math.round(stats.monthly).toLocaleString()}`, icon: CreditCard, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-400/10' },
                { label: 'Yearly Spend', value: `${currencySymbol}${Math.round(stats.yearly).toLocaleString()}`, icon: Calendar, color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-500/10 dark:bg-pink-400/10' },
                { label: 'Avg. Monthly', value: `${currencySymbol}${Math.round(stats.monthly / (stats.count || 1)).toLocaleString()}`, icon: Activity, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-400/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-4 md:p-5 rounded-lg border border-border relative overflow-hidden group hover:bg-accent transition-colors">
                  <div className={cn("w-8 h-8 rounded-md flex items-center justify-center mb-4 border border-border", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium mb-1">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-medium text-foreground tabular-nums tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
              {/* Spending Overview Chart */}
              <div className="bg-card rounded-xl p-5 md:p-6 border border-border relative overflow-hidden">
                <h3 className="text-sm md:text-base font-medium text-foreground mb-6 md:mb-8 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Category Distribution
                </h3>
                <div className="h-[300px] md:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '16px',
                          color: theme === 'dark' ? '#fff' : '#000'
                        }}
                        itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Budget Summary */}
              <div className="bg-card rounded-xl p-5 md:p-6 border border-border relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-sm md:text-base font-medium text-foreground mb-6 md:mb-8 tracking-tight flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Budget Summary
                  </h3>
                  <div className="space-y-4 md:space-y-5">
                    <div className="p-4 md:p-5 rounded-lg bg-card border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium mb-1">Monthly Budget Limit</p>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground text-sm font-medium">{currencySymbol}</span>
                            <input 
                              type="number" 
                              value={budgetGoal}
                              onChange={(e) => setBudgetGoal(Number(e.target.value))}
                              className="bg-transparent text-xl md:text-2xl font-medium text-foreground w-32 focus:outline-none border-b border-border focus:border-primary transition-all tabular-nums"
                            />
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-medium">
                          <span className="text-muted-foreground">Usage</span>
                          <span className={cn(
                            stats.monthly > budgetGoal ? "text-rose-500" : "text-emerald-500"
                          )}>
                            {Math.round((stats.monthly / (budgetGoal || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((stats.monthly / (budgetGoal || 1)) * 100, 100)}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              stats.monthly > budgetGoal ? "bg-rose-500" : "bg-emerald-500"
                            )}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {stats.monthly > budgetGoal 
                            ? `Over budget by ${currencySymbol}${Math.round(stats.monthly - budgetGoal)}` 
                            : `Under budget by ${currencySymbol}${Math.round(budgetGoal - stats.monthly)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 md:p-5 rounded-lg bg-card border border-border">
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium mb-1">Yearly Projection</p>
                        <p className="text-xl md:text-2xl font-medium text-foreground tabular-nums tracking-tight">{currencySymbol}{Math.round(stats.yearly).toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-md bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Calendar className="w-5 h-5 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-5 p-4 md:p-5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-primary text-[10px] font-medium uppercase tracking-widest mb-2">Optimization Tip</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    You have <span className="text-foreground font-medium">{stats.count}</span> active subscriptions. 
                    Switching {subscriptions.filter(s => s.billingCycle === 'monthly').length} monthly plans to yearly could save you up to 20% on average.
                  </p>
                </div>
              </div>
            </div>

            {/* Top Subscriptions by Cost */}
            <div className="bg-card rounded-xl p-5 md:p-6 border border-border">
              <h3 className="text-sm md:text-base font-medium text-foreground mb-6 md:mb-8 tracking-tight flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                Highest Cost Subscriptions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...subscriptions]
                  .sort((a, b) => convertToDisplay(b.amount, b.currency) - convertToDisplay(a.amount, a.currency))
                  .slice(0, 6)
                  .map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent transition-colors group">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center p-2 border border-border">
                        <ServiceLogo 
                          name={sub.serviceName}
                          domain={sub.domain}
                          slug={sub.slug}
                          color={sub.color}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate text-sm">{sub.serviceName}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">{sub.planName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-medium tabular-nums text-sm">{currencySymbol}{Math.round(convertToDisplay(sub.amount, sub.currency))}</p>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-medium">{sub.billingCycle}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        <footer className="mt-32 text-center pb-12 border-t border-border pt-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
          <p className="text-muted-foreground text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-medium">
            Subtract &copy; 2026 &bull; Coded by Ahmed Kilany
          </p>
        </footer>
      </div>
    </div>
  );
}
