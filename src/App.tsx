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
  Moon,
  StickyNote,
  Archive,
  ArchiveRestore,
  Facebook,
  Instagram,
  Linkedin,
  Coins,
  Wallet
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
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line
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

export const BrandLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="30" fill="url(#brandGrad)" />
    <rect x="25" y="43" width="50" height="14" rx="7" fill="#ffffff" />
  </svg>
);

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
  notes?: string;
  isArchived?: boolean;
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
  notes: z.string().optional(),
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

// ─── Calendar View Component ──────────────────────────────────────────────────
function CalendarView({
  subscriptions,
  convertToDisplay,
  displayCurrency,
}: {
  subscriptions: Subscription[];
  convertToDisplay: (amount: number, currency: string) => number;
  displayCurrency: string;
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName  = viewDate.toLocaleString('en-US', { month: 'long' });
  const firstDay   = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Filter subscriptions valid for the current view Date
  const validSubscriptions = useMemo(() => {
    // Future months are empty (as per user request)
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return [];
    }
    
    return subscriptions.filter(sub => {
      let createdDate: Date | null = null;
      if (sub.createdAt?.toDate) {
        createdDate = sub.createdAt.toDate();
      } else if (sub.createdAt) {
        createdDate = new Date(sub.createdAt);
      } else {
        return true; // Fallback if no creation date
      }

      const createdYear = createdDate.getFullYear();
      const createdMonth = createdDate.getMonth();

      // Skip if viewed month is before the subscription was created
      if (year < createdYear || (year === createdYear && month < createdMonth)) {
        return false;
      }

      // Yearly subscriptions only bill in their specific creation month
      if (sub.billingCycle === 'yearly' && month !== createdMonth) {
        return false;
      }

      return true;
    });
  }, [subscriptions, year, month, currentYear, currentMonth]);

  // Build a map: day → subscriptions that bill on that day
  const dayMap = useMemo(() => {
    const map: Record<number, Subscription[]> = {};
    validSubscriptions.forEach(sub => {
      // Use createdAt as a proxy for billing day (day-of-month)
      let billingDay: number | null = null;
      if (sub.createdAt?.toDate) {
        billingDay = sub.createdAt.toDate().getDate();
      } else if (sub.createdAt) {
        billingDay = new Date(sub.createdAt).getDate();
      }
      if (billingDay && billingDay >= 1 && billingDay <= daysInMonth) {
        if (!map[billingDay]) map[billingDay] = [];
        map[billingDay].push(sub);
      }
    });
    return map;
  }, [validSubscriptions, daysInMonth]);

  const totalThisMonth = validSubscriptions.reduce((sum, sub) => {
    // Actual amount billed this month (for calendar view, we use full amount of yearly since it only appears in its billing month)
    const amount = convertToDisplay(sub.amount, sub.currency);
    return sum + amount;
  }, 0);

  const currencySymbol = displayCurrency === 'USD' ? '$' : displayCurrency === 'EUR' ? '€' : displayCurrency === 'GBP' ? '£' : displayCurrency;

  const prev = () => setViewDate(new Date(year, month - 1, 1));
  const next = () => setViewDate(new Date(year, month + 1, 1));

  // Generate grid cells: leading empty + day numbers
  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      key={`${year}-${month}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-medium text-foreground tracking-tight">{monthName} {year}</h2>
          <p className="text-muted-foreground text-xs mt-1">
            {validSubscriptions.length} subscriptions · {currencySymbol}{Math.round(totalThisMonth)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-3 h-8 rounded-lg bg-card border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            Today
          </button>
          <button
            onClick={next}
            className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          const isToday = cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const subs = cell.day ? (dayMap[cell.day] || []) : [];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.008, duration: 0.25 }}
              className={cn(
                "min-h-[80px] md:min-h-[100px] rounded-xl p-2 border transition-all",
                cell.day
                  ? isToday
                    ? "bg-primary/10 border-primary/40"
                    : subs.length > 0
                      ? "bg-card border-border hover:bg-accent cursor-default"
                      : "bg-card/50 border-border/50"
                  : "bg-transparent border-transparent"
              )}
            >
              {cell.day && (
                <>
                  <span className={cn(
                    "text-[11px] font-semibold leading-none",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    {cell.day}
                  </span>
                  <div className="mt-1.5 space-y-1">
                    {subs.slice(0, 2).map(sub => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-1 overflow-hidden"
                        title={`${sub.serviceName} · ${currencySymbol}${Math.round(convertToDisplay(sub.amount, sub.currency))}`}
                      >
                        <div className="w-4 h-4 rounded-sm overflow-hidden shrink-0">
                          <ServiceLogo
                            name={sub.serviceName}
                            domain={sub.domain}
                            slug={sub.slug}
                            color={sub.color}
                            className="w-full h-full"
                          />
                        </div>
                        <span className="text-[9px] font-medium text-foreground truncate leading-none">
                          {sub.serviceName}
                        </span>
                      </motion.div>
                    ))}
                    {subs.length > 2 && (
                      <span className="text-[9px] text-muted-foreground font-medium pl-1">
                        +{subs.length - 2} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Summary Strip */}
      {validSubscriptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-xl bg-card border border-border flex flex-wrap gap-3"
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium self-center mr-2">
            This month
          </div>
          {validSubscriptions.map(sub => {
            const billedAmount = convertToDisplay(sub.amount, sub.currency);
            return (
              <div key={sub.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                  <ServiceLogo
                    name={sub.serviceName}
                    domain={sub.domain}
                    slug={sub.slug}
                    color={sub.color}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-xs font-medium text-foreground">{sub.serviceName}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {currencySymbol}{Math.round(billedAmount)}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LOADING_PHRASES = [
  "Authenticating secure session",
  "Fetching active subscriptions",
  "Evaluating currency variations",
  "Preparing your workspace"
];

function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const onCompleteRef = React.useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => {
        const next = prev + 1;
        if (next >= LOADING_PHRASES.length) {
          clearInterval(interval);
          if (onCompleteRef.current) onCompleteRef.current();
          return prev;
        }
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full dark:mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full dark:mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        <div className="relative flex items-center justify-center mb-4">
          <BrandLogo className="w-16 h-16 shadow-xl relative z-10" />
          <div className="absolute -inset-3 border-[1.5px] border-border/40 border-t-primary/30 rounded-full animate-spin [animation-duration:2s]" />
          <div className="absolute -inset-6 border-[1px] border-border/20 border-b-primary/20 rounded-full animate-spin [animation-duration:3.5s]" style={{ animationDirection: 'reverse' }} />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="h-6 relative overflow-visible flex items-center justify-center w-[300px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-muted-foreground text-sm font-medium tracking-tight absolute text-center w-full"
              >
                {LOADING_PHRASES[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <p className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.4em] font-bold mt-2">
            Subtract &bull; Workspace
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [isEditingCap, setIsEditingCap] = useState(false);
  const [tempBudget, setTempBudget] = useState(500);
  const subscriptions = useMemo(() => allSubscriptions.filter(s => !s.isArchived), [allSubscriptions]);
  const archivedSubscriptions = useMemo(() => allSubscriptions.filter(s => !!s.isArchived), [allSubscriptions]);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [showNotesField, setShowNotesField] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'dashboard' | 'calendar' | 'archive'>('list');
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
    // Safety timeout: if Firebase auth never responds within 5s, unblock the UI
    const authTimeout = setTimeout(() => {
      setAuthReady(true);
    }, 5000);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      clearTimeout(authTimeout);
      setUser(user);
      if (user) {
        // Sync user profile/settings
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setBudgetGoal(data.budgetGoal || 500);
            setTempBudget(data.budgetGoal || 500);
            setDisplayCurrency(data.displayCurrency || 'USD');
          } else {
            // Initialize user doc (fire-and-forget, don't block auth)
            setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              budgetGoal: 500,
              displayCurrency: 'USD',
              role: 'user',
              createdAt: serverTimestamp()
            }).catch((error) => {
              console.error('Failed to initialize user doc:', error);
            });
          }
        } catch (error) {
          // Don't throw — just log. We still want to show the app.
          console.error('Failed to load user settings:', error);
        } finally {
          setAuthReady(true);
        }
      } else {
        setAuthReady(true);
      }
    });

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  // Firestore Subscriptions Listener
  useEffect(() => {
    if (!user || !authReady) {
      setAllSubscriptions([]);
      return;
    }

    const q = query(collection(db, 'subscriptions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];
      setAllSubscriptions(subs.sort((a, b) => {
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
      notes: '',
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
      setValue('planName', editingSub.planName || '');
      setValue('amount', editingSub.amount.toString());
      setValue('currency', editingSub.currency);
      setValue('billingCycle', editingSub.billingCycle);
      setValue('notes', editingSub.notes || '');
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

  const dailyProjectionData = useMemo(() => {
    const days = 30;
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        const renewals = subscriptions.filter(s => {
            if (!s.nextBillingDate) return false;
            const nb = parseISO(s.nextBillingDate);
            return nb.getDate() === d.getDate() && nb.getMonth() === d.getMonth();
        });

        const cost = renewals.reduce((sum, s) => sum + convertToDisplay(s.amount, s.currency), 0);
        data.push({
            date: format(d, 'MMM dd'),
            amount: Math.round(cost),
            count: renewals.length
        });
    }
    return data;
  }, [subscriptions, exchangeRates, displayCurrency]);

  const savingsInsights = useMemo(() => {
    return subscriptions
      .filter(s => s.billingCycle === 'monthly')
      .map(s => {
        const monthlyAmount = convertToDisplay(s.amount, s.currency);
        // Estimate 20% average saving for switching to yearly
        const potentialSaving = (monthlyAmount * 12) * 0.2;
        return {
          ...s,
          potentialSaving
        };
      })
      .sort((a, b) => b.potentialSaving - a.potentialSaving)
      .slice(0, 3);
  }, [subscriptions, exchangeRates, displayCurrency]);

  const financialHealthScore = useMemo(() => {
    if (budgetGoal <= 0) return 0;
    const ratio = stats.monthly / budgetGoal;
    return Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)));
  }, [stats.monthly, budgetGoal]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

  const filteredSubscriptions = useMemo(() => {
    if (selectedCategory === 'All') return subscriptions;
    return subscriptions.filter(sub => sub.category === selectedCategory);
  }, [subscriptions, selectedCategory]);

  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: {
      sub: Subscription;
      days: number;
      type: 'urgent' | 'warning' | 'notice';
      colorClass: string;
      dotClass: string;
      pingClass: string;
    }[] = [];

    subscriptions.forEach(sub => {
      let createdDate: Date | null = null;
      if (sub.createdAt?.toDate) {
        createdDate = sub.createdAt.toDate();
      } else if (sub.createdAt) {
        createdDate = new Date(sub.createdAt);
      }
      
      if (!createdDate) return;
      createdDate.setHours(0, 0, 0, 0);

      const nextBillingDate = new Date(createdDate.getTime());
      
      if (sub.billingCycle === 'monthly') {
        while (nextBillingDate < today) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        }
      } else {
        while (nextBillingDate < today) {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }
      }

      // Ignore if they just subscribed today
      if (nextBillingDate.getTime() === today.getTime() && createdDate.getTime() === today.getTime()) {
        if (sub.billingCycle === 'monthly') {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }
      }

      const diffTime = nextBillingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        let type: 'urgent' | 'warning' | 'notice';
        let colorClass = '';
        let dotClass = '';
        let pingClass = '';

        if (diffDays === 0) {
          type = 'urgent';
          colorClass = 'bg-red-500/10 text-red-500';
          dotClass = 'bg-red-500';
          pingClass = 'bg-red-400';
        } else if (diffDays <= 3) {
          type = 'warning';
          colorClass = 'bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400';
          dotClass = 'bg-amber-500';
          pingClass = 'bg-amber-400';
        } else {
          type = 'notice';
          colorClass = 'bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400';
          dotClass = 'bg-blue-500';
          pingClass = 'bg-blue-400';
        }

        upcoming.push({ sub, days: diffDays, type, colorClass, dotClass, pingClass });
      }
    });

    return upcoming.sort((a, b) => a.days - b.days);
  }, [subscriptions]);

  const onSubmit = async (data: SubscriptionFormValues) => {
    if (!selectedService || !user) return;

    if (editingSub) {
      const updates = {
        planName: data.planName || 'Standard',
        amount: parseFloat(data.amount),
        currency: data.currency,
        billingCycle: data.billingCycle,
        notes: data.notes || '',
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
        notes: data.notes || '',
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
    setShowNotesField(false);
    setEditingSub(null);
    setSelectedService(null);
    reset();
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsAddingInline(true);
    setShowNotesField(!!sub.notes);
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

  const archiveSubscription = async (id: string) => {
    try {
      await updateDoc(doc(db, 'subscriptions', id), { isArchived: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subscriptions/${id}`);
    }
  };

  const restoreSubscription = async (id: string) => {
    try {
      await updateDoc(doc(db, 'subscriptions', id), { isArchived: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subscriptions/${id}`);
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

  const isInitializing = !authReady || !minLoadingDone;

  let content;

  if (isInitializing) {
    content = (
      <motion.div key="loader" exit={{ opacity: 0, filter: "blur(5px)", scale: 0.98 }} transition={{ duration: 0.7, ease: "easeInOut" }}>
        <LoadingScreen onComplete={() => setMinLoadingDone(true)} />
      </motion.div>
    );
  } else if (!user) {
    content = (
      <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
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
          <BrandLogo className="w-14 h-14 mx-auto mb-8 shadow-lg shadow-blue-500/10 relative group" />
          
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
      </motion.div>
    );
  } else {
    content = (
      <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-screen w-full flex bg-background text-foreground font-sans selection:bg-blue-500/30 overflow-hidden relative">
        {/* Soft Ambient Blue Light */}
        <div className="fixed inset-0 pointer-events-none flex justify-center z-0">
          <div className="absolute -top-[20%] w-[70%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full dark:mix-blend-screen" />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full dark:mix-blend-screen" />
          <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full dark:mix-blend-screen" />
        </div>
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* --- LEFT SIDEBAR (Desktop) --- */}
        <aside className="hidden md:flex flex-col w-[260px] border-r border-border bg-card/10 backdrop-blur-3xl relative z-20 shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-3">
              <BrandLogo className="w-6 h-6 shadow-sm shadow-primary/20" />
              <h1 className="text-[14px] font-semibold tracking-wide text-foreground tracking-tight">Subtract Pro</h1>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-3 px-2">Menu</p>
            <nav className="space-y-1 flex flex-col">
              <button onClick={() => setActiveView('list')} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group", activeView === 'list' ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <LayoutDashboard className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeView === 'list' ? "text-primary-foreground" : "text-muted-foreground/70")} />
                List View
              </button>
              <button onClick={() => setActiveView('dashboard')} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group", activeView === 'dashboard' ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <Activity className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeView === 'dashboard' ? "text-primary-foreground" : "text-muted-foreground/70")} />
                Dashboard
              </button>
              <button onClick={() => setActiveView('calendar')} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group", activeView === 'calendar' ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <Calendar className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeView === 'calendar' ? "text-primary-foreground" : "text-muted-foreground/70")} />
                Calendar
              </button>
            </nav>
            
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mt-8 mb-3 px-2">Data</p>
            <nav className="space-y-1 flex flex-col">
              <button onClick={() => setActiveView('archive')} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group", activeView === 'archive' ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <Archive className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeView === 'archive' ? "text-primary-foreground" : "text-muted-foreground/70")} />
                Archive
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-border/50 bg-background/50 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-accent transition-all cursor-pointer group/user overflow-hidden border border-transparent hover:border-border text-left">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                    <img src={user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{user?.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-popover border-border p-2 rounded-xl shadow-xl ml-4 mb-2" side="right" sideOffset={10}>
                <Button variant="ghost" onClick={logout} className="w-full justify-start text-rose-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg h-9 font-medium text-xs">
                  <Trash2 className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </aside>

        {/* --- MAIN CONTENT COLUMN --- */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-full min-w-0">
          
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-background/30 backdrop-blur-2xl relative z-20 shrink-0">
             <div className="flex items-center gap-4">
               {/* Mobile Logo */}
               <div className="md:hidden flex items-center gap-3">
                 <BrandLogo className="w-6 h-6 shadow-sm shadow-primary/20" />
                 <h1 className="text-[14px] font-semibold tracking-wide tracking-tight text-foreground">Subtract</h1>
               </div>
               {/* Page Title */}
               <h2 className="text-[13px] font-medium tracking-wide tracking-tight text-muted-foreground hidden md:block select-none">
                 {activeView === 'list' && 'Your Subscriptions'}
                 {activeView === 'dashboard' && 'Analytics Dashboard'}
                 {activeView === 'calendar' && 'Upcoming Renewals'}
                 {activeView === 'archive' && 'Archived Records'}
               </h2>
             </div>
             
             {/* Right Controls */}
             <div className="flex items-center gap-3 md:gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-all cursor-pointer text-muted-foreground hover:text-foreground">
                    <Bell className="w-4 h-4" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", alerts[0].pingClass)}></span>
                        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5 border border-card", alerts[0].dotClass)}></span>
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-popover border border-border p-0 rounded-xl shadow-2xl z-[100] overflow-hidden" align="end" sideOffset={8}>
                  <div className="flex items-center justify-between p-4 bg-muted/40 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-foreground/5 border border-border/50 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5 text-foreground" />
                      </div>
                      <span className="font-semibold text-[13px] text-foreground tracking-tight">Upcoming Renewals</span>
                    </div>
                    {alerts.length > 0 && (
                      <Badge className={cn("text-white border-transparent px-1.5 py-0 text-[10px] font-bold", alerts[0].dotClass)}>
                        {alerts.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">You're all set!</p>
                          <p className="text-xs text-muted-foreground mt-0.5">No renewals in the next 7 days.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {alerts.map((alert, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-card border border-border shrink-0 flex items-center justify-center p-1.5">
                              <ServiceLogo 
                                name={alert.sub.serviceName}
                                domain={alert.sub.domain}
                                slug={alert.sub.slug}
                                color={alert.sub.color}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-foreground truncate">{alert.sub.serviceName}</h4>
                                <span className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                  alert.colorClass
                                )}>
                                  {alert.type === 'urgent' ? 'Today' : `${alert.days} Day${alert.days > 1 ? 's' : ''}`}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Your <span className="font-medium text-foreground">{alert.sub.planName}</span> plan renews {alert.type === 'urgent' ? <span className="text-red-500 font-semibold">today</span> : 'for'} <span className="font-medium text-foreground tabular-nums">{displayCurrency === 'USD' ? '$' : displayCurrency === 'EUR' ? '€' : displayCurrency === 'GBP' ? '£' : displayCurrency}{Math.round(convertToDisplay(alert.sub.amount, alert.sub.currency))}</span>.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

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
                  <button className="md:hidden w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-all cursor-pointer group/user overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground group-hover/user:text-foreground transition-colors" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-popover border-border p-4 rounded-xl shadow-xl mr-4" align="end" sideOffset={10}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                        <img src={user?.photoURL || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium text-sm truncate">{user?.displayName}</p>
                        <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Separator className="bg-muted" />
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="w-full justify-start text-rose-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg h-10 font-medium text-xs"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full pb-24 md:pb-0 relative scroll-smooth group main-scrollable-container">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12 relative z-10 w-full min-h-full flex flex-col">
        
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
                              setShowNotesField(false);
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

                        <div className="space-y-4 pt-6 border-t border-border">
                          {showNotesField ? (
                            <>
                              <div className="flex items-center justify-between ml-1">
                                <Label className="text-muted-foreground text-[10px] font-medium">Subscription Notes (Optional)</Label>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setShowNotesField(false);
                                    setValue('notes', '');
                                  }} 
                                  className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  Remove Note
                                </button>
                              </div>
                              <textarea
                                {...register('notes')}
                                rows={3}
                                className="w-full bg-card border border-border rounded-lg text-sm p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring transition-all resize-none"
                                placeholder="Add your notes here (e.g. Family sharing details, reminders...)"
                              />
                            </>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowNotesField(true)}
                              className="w-full h-10 border-dashed border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                            >
                              <Plus className="w-3.5 h-3.5 mr-2" />
                              Add Subscription Note
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
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
                                setShowNotesField(false);
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
                                  archiveSubscription(editingSub.id);
                                  setIsAddingInline(false);
                                  setShowNotesField(false);
                                  setEditingSub(null);
                                  setSelectedService(null);
                                  reset();
                                }} 
                                className="w-10 h-10 rounded-lg text-muted-foreground hover:text-primary border border-border hover:border-primary/50 transition-all flex items-center justify-center p-0"
                                title="Move to Archive"
                              >
                                <Archive className="w-4 h-4" />
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
                          {sub.notes && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-accent shrink-0" />
                              <Popover>
                                <PopoverTrigger 
                                  className="flex items-center justify-center p-1 -m-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                >
                                  <StickyNote className="w-3 h-3" />
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-72 p-0 bg-popover border border-border rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col"
                                >
                                  <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/40 border-b border-border/60">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                      <StickyNote className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-xs font-semibold tracking-tight text-foreground">Subscription Note</span>
                                  </div>
                                  <div className="p-4 text-[13px] font-medium text-muted-foreground whitespace-pre-wrap break-words leading-relaxed text-left">
                                    {sub.notes}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </>
                          )}
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
                            className="w-8 h-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center relative z-20 cursor-pointer"
                            title="Archive Subscription"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </PopoverTrigger>
                          <PopoverContent className="bg-popover border-border text-foreground p-4 w-64 rounded-xl shadow-xl z-50">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Archive Service?</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">It will be moved to your Archive and stop appearing in active calculations, you can restore it anytime safely.</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 rounded-md h-8 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border">Cancel</Button>
                                <Button 
                                  size="sm" 
                                  className="flex-1 rounded-md h-8 text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                  onClick={() => archiveSubscription(sub.id)}
                                >
                                  Archive
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
        ) : activeView === 'dashboard' ? (
          <motion.div 
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col xl:flex-row gap-6 lg:gap-8 overflow-visible"
          >
            {/* Main Stats Column */}
            <div className="flex-1 space-y-6 lg:space-y-8 min-w-0">
              
              {/* Top Analytical Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { label: 'System Burn Rate', value: `${currencySymbol}${Math.round(stats.monthly).toLocaleString()}`, icon: Activity, desc: 'Cost per month' },
                   { label: 'Next Cycle Load', value: `${currencySymbol}${Math.round(dailyProjectionData.find(d => d.amount > 0)?.amount || 0).toLocaleString()}`, icon: TrendingDown, desc: 'Next pay interval' },
                   { label: 'Health Score', value: `${financialHealthScore}%`, icon: Zap, color: financialHealthScore > 70 ? 'text-emerald-500' : financialHealthScore > 40 ? 'text-amber-500' : 'text-rose-500', desc: 'System stability' },
                   { label: 'Total Yearly Load', value: `${currencySymbol}${Math.round(stats.yearly).toLocaleString()}`, icon: Globe, desc: 'Annual projected' },
                 ].map((s, i) => (
                   <div key={i} className="bg-card/50 border border-border/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{s.label}</p>
                          <s.icon className={cn("w-3.5 h-3.5", s.color || "text-muted-foreground/60")} />
                        </div>
                        <p className={cn("text-xl font-bold tracking-tight text-foreground", s.color)}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 truncate">{s.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Main Visualization: Cashflow Projection AREA */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 lg:p-8 flex flex-col shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/5 transition-all duration-1000" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                   <div>
                     <h3 className="text-foreground font-bold text-lg tracking-tight">Financial Timeline Analysis</h3>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1 opacity-60">Estimated daily burn rate & sequence</p>
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/50 rounded-lg border border-border text-[11px] font-bold text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Monthly Cycle Projection
                   </div>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyProjectionData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'currentColor', fontSize: 9, fontWeight: 700, opacity: 0.4 }} 
                        interval={4} 
                      />
                      <YAxis hide domain={[0, 'auto']} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '11px', fontWeight: 800, padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: 'var(--primary)' }}
                        formatter={(val: number) => [`${currencySymbol}${val}`, 'Load']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="var(--primary)" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                        animationDuration={2000}
                        dot={{ r: 0 }}
                        activeDot={{ r: 6, stroke: 'var(--background)', strokeWidth: 3, fill: 'var(--primary)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Optimization and Stability Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Savings Focus */}
                <div className="bg-card/40 border border-border/80 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-foreground font-sans">Cost Optimization</h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Efficiency Engine</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {savingsInsights.length > 0 ? (
                      <>
                        <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                          System detected potential <span className="text-emerald-500 font-bold">{currencySymbol}{Math.round(savingsInsights.reduce((a,b)=>a+b.potentialSaving, 0)).toLocaleString()}/yr</span> savings by consolidating monthly fees to annual logic.
                        </p>
                        <div className="space-y-2 mt-4">
                           {savingsInsights.map(sub => (
                             <div key={`insight-${sub.id}`} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors">
                               <div className="flex items-center gap-3">
                                 <div className="w-7 h-7 rounded-lg overflow-hidden border border-border bg-background p-1.5 shrink-0">
                                   <ServiceLogo name={sub.serviceName} domain={sub.domain} slug={sub.slug} color={sub.color} className="w-full h-full" />
                                 </div>
                                 <span className="text-[11px] font-bold text-foreground">{sub.serviceName}</span>
                               </div>
                               <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">-{currencySymbol}{Math.round(sub.potentialSaving)}</span>
                             </div>
                           ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">Your stack is optimized.</p>
                    )}
                  </div>
                </div>

                {/* System Stability HUD */}
                <div className="bg-card/40 border border-border/80 rounded-3xl p-6 flex flex-col justify-between group">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="text-[13px] font-bold text-foreground font-sans">Node Health</h4>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Resource Monitoring</p>
                      </div>
                      <div className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-md border",
                        financialHealthScore > 70 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : 
                        financialHealthScore > 40 ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : 
                        "bg-rose-500/10 text-rose-500 border-rose-500/30"
                      )}>
                        {financialHealthScore > 70 ? 'STABLE' : financialHealthScore > 40 ? 'WARNING' : 'CRITICAL'}
                      </div>
                   </div>

                   <div className="relative h-32 w-full flex items-center justify-center">
                      <div className="absolute inset-x-0 bottom-0 top-[20%] flex flex-col items-center justify-center">
                         <span className="text-3xl font-black tracking-tight text-foreground">{financialHealthScore}%</span>
                         <div className="flex items-center gap-2 mt-1">
                            <Activity className={cn("w-3 h-3", financialHealthScore > 70 ? "text-emerald-500" : "text-rose-500")} />
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">Efficiency Range</span>
                         </div>
                      </div>
                      <svg className="w-40 h-40 -rotate-90">
                         <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted/10" />
                         <motion.circle 
                           cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="10" fill="transparent" strokeLinecap="round" 
                           className={cn(financialHealthScore > 70 ? "text-emerald-500" : financialHealthScore > 40 ? "text-amber-500" : "text-rose-500")}
                           initial={{ strokeDasharray: "0, 402" }}
                           animate={{ strokeDasharray: `${(financialHealthScore / 100) * 402}, 402` }}
                           transition={{ duration: 2, ease: "circOut" }}
                         />
                      </svg>
                   </div>
                </div>
              </div>

            </div>

            {/* Tactical Sidebar / Digital HUD */}
            <div className="xl:w-[350px] shrink-0 space-y-6 lg:space-y-8 min-w-0">
               
               {/* --- DIGITAL TOKEN HUD (REFINED) --- */}
               <div className="bg-card/60 backdrop-blur-3xl border-2 border-primary/20 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                             <Coins className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-foreground font-black text-sm tracking-tight leading-none uppercase">Budget Wallet</h3>
                            <p className="text-[9px] text-muted-foreground font-black tracking-widest mt-1 opacity-70 uppercase">Financial Token HUD</p>
                          </div>
                       </div>
                       {!isEditingCap ? (
                         <button onClick={() => setIsEditingCap(true)} className="w-8 h-8 rounded-full bg-accent hover:bg-muted border border-border flex items-center justify-center transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                         </button>
                       ) : (
                         <button onClick={() => {
                            setBudgetGoal(tempBudget);
                            setIsEditingCap(false);
                         }} className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 border border-primary/20 flex items-center justify-center transition-colors">
                            <Check className="w-4 h-4 text-primary-foreground" />
                         </button>
                       )}
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-background/40 border border-border/80 backdrop-blur-md">
                           <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Available Credits</p>
                              {isEditingCap && (
                                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2 py-0.5">
                                   <span className="text-[10px] font-bold text-muted-foreground">{currencySymbol}</span>
                                   <input 
                                     autoFocus
                                     type="number" 
                                     value={tempBudget} 
                                     onChange={(e) => setTempBudget(Number(e.target.value))}
                                     onKeyDown={(e) => { if(e.key === 'Enter') { setBudgetGoal(tempBudget); setIsEditingCap(false); } }}
                                     className="bg-transparent border-none p-0 text-[11px] font-black text-foreground w-16 focus:ring-0 outline-none tabular-nums"
                                   />
                                </motion.div>
                              )}
                           </div>
                           <div className="flex items-baseline justify-between gap-2">
                              <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                                {currencySymbol}{Math.max(0, Math.round(budgetGoal - stats.monthly)).toLocaleString()}
                              </span>
                              <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest",
                                stats.monthly > budgetGoal ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              )}>
                                <span>{stats.monthly > budgetGoal ? 'Exceeded' : 'Active'}</span>
                              </div>
                           </div>

                           {/* Dynamic usage bar colors: Green -> Amber -> Rose */}
                           {(() => {
                              const usage = (stats.monthly / (budgetGoal || 1)) * 100;
                              const barColor = usage > 90 ? "bg-rose-500" : usage > 70 ? "bg-amber-500" : "bg-primary";
                              return (
                                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden mt-5 relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(usage, 100)}%` }}
                                    className={cn("h-full transition-all duration-1000", barColor)}
                                  />
                                </div>
                              );
                           })()}

                           <div className="flex justify-between items-center mt-3">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Usage: {Math.round((stats.monthly / (budgetGoal || 1)) * 100)}%</span>
                              <span className="text-[9px] font-bold text-foreground/80 uppercase tracking-widest">Cap: {currencySymbol}{budgetGoal.toLocaleString()}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-4 rounded-2xl border border-border/50 bg-background/20">
                              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-1">Burn Rate</p>
                              <p className="text-[13px] font-black text-foreground">{currencySymbol}{Math.round(stats.monthly / 30).toLocaleString()}<span className="text-[9px] text-muted-foreground ml-1">/D</span></p>
                           </div>
                           <div className="p-4 rounded-2xl border border-border/50 bg-background/20">
                              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-1">Stack Size</p>
                              <p className="text-[13px] font-black text-foreground">{stats.count}<span className="text-[9px] text-muted-foreground ml-1">Nodes</span></p>
                           </div>
                        </div>
                    </div>
                  </div>
               </div>

               {/* Allocation Focus */}
               <div className="bg-card/60 backdrop-blur-xl border border-border/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-foreground font-black text-sm tracking-tight mb-8 flex items-center justify-between uppercase">
                    Node Allocation
                    <Globe className="w-4 h-4 text-muted-foreground/30" />
                  </h3>
                  <div className="h-[180px] w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center pt-2">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{categoryData.length} Points</p>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '14px', fontSize: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Chronological Sequence Queue */}
               <div className="bg-card/60 backdrop-blur-xl border border-border/80 rounded-[32px] p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-foreground font-black text-sm tracking-tight uppercase">Timeline Hub</h3>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-50">Operation Sequence</p>
                    </div>
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  
                  <div className="space-y-6">
                    {subscriptions.filter(s => s.nextBillingDate).length > 0 ? (
                      [...subscriptions]
                        .filter(s => s.nextBillingDate)
                        .sort((a,b) => new Date(a.nextBillingDate!).getTime() - new Date(b.nextBillingDate!).getTime())
                        .slice(0, 5)
                        .map((sub, i) => {
                          const nextDate = parseISO(sub.nextBillingDate!);
                          const isToday = nextDate.toDateString() === new Date().toDateString();
                          return (
                            <div key={`queue-${sub.id}`} className="flex items-start gap-4 group">
                               <div className="flex flex-col items-center gap-1.5 mt-1 shrink-0">
                                  <div className={cn("w-2 h-2 rounded-full border-2 border-card shadow-lg", isToday ? "bg-rose-500 scale-[1.5]" : "bg-primary/60")} />
                                  {i < 4 && <div className="w-[1.5px] h-10 bg-gradient-to-b from-primary/10 to-transparent" />}
                               </div>
                               <div className="flex-1 -mt-1 pb-4">
                                  <div className="flex justify-between items-start mb-1">
                                     <p className="text-[12px] font-black text-foreground tracking-tight">{sub.serviceName}</p>
                                     <span className="text-[11px] font-black text-foreground tabular-nums">-{currencySymbol}{Math.round(convertToDisplay(sub.amount, sub.currency))}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                                     {isToday ? 'CRITICAL: DUE TODAY' : format(nextDate, 'MMMM dd')}
                                  </p>
                               </div>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-10">Empty Sequence.</p>
                    )}
                  </div>
                  
                  <button onClick={() => setActiveView('calendar')} className="w-full mt-4 py-3.5 rounded-2xl bg-background/40 border border-border/50 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:bg-muted/80 transition-all hover:text-foreground">
                     Access Network Calendar
                  </button>
               </div>
            </div>
          </motion.div>
        ) : activeView === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <CalendarView subscriptions={subscriptions} convertToDisplay={convertToDisplay} displayCurrency={displayCurrency} />
          </motion.div>
        ) : activeView === 'archive' ? (
          <motion.div
            key="archive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                <Archive className="w-8 h-8 text-primary" />
                Archived Subscriptions
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                Subscriptions here are paused and do not count towards your monthly or yearly spending.
              </p>
            </div>
            
            {archivedSubscriptions.length === 0 ? (
              <div className="bg-card/30 border border-border/40 backdrop-blur-xl rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <Archive className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">Your archive is empty</h3>
                <p className="text-sm text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
                  When you no longer use a service but want to keep its history securely, archive it. It will safely stay here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5 auto-rows-max">
                {archivedSubscriptions.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[20px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-card rounded-[20px] border border-border p-5 flex flex-col h-full opacity-60 hover:opacity-100 transition-all duration-300 pointer-events-auto">
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-[14px] overflow-hidden bg-card border border-border shrink-0 flex items-center justify-center p-2.5 grayscale hover:grayscale-0 transition-all">
                          <ServiceLogo 
                            name={sub.serviceName}
                            domain={sub.domain}
                            slug={sub.slug}
                            color={sub.color}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-foreground truncate">{sub.serviceName}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium border-border/50 text-muted-foreground">
                              {sub.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1 mt-4">
                          <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">
                            {displayCurrency === 'USD' ? '$' : displayCurrency === 'EUR' ? '€' : displayCurrency === 'GBP' ? '£' : displayCurrency}{Math.round(convertToDisplay(sub.amount, sub.currency))}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground uppercase opacity-80">
                            /{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                        <button
                          onClick={() => restoreSubscription(sub.id)}
                          className="w-8 h-8 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center relative z-20 cursor-pointer"
                          title="Restore to Active"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                        <Popover>
                          <PopoverTrigger 
                            className="w-8 h-8 rounded-md text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all flex items-center justify-center relative z-20 cursor-pointer"
                            title="Permanent Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </PopoverTrigger>
                          <PopoverContent className="bg-popover border-border text-foreground p-4 w-64 rounded-xl shadow-xl z-[100] mr-4">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">Permanent Delete</p>
                                <p className="text-[11px] text-muted-foreground">This action cannot be undone. Data will be completely erased.</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 rounded-md h-8 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="flex-1 rounded-md h-8 text-[11px] font-medium bg-red-500 text-foreground hover:bg-red-600 cursor-pointer"
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
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : null}

        <footer className="mt-auto border-t border-border pt-8 pb-8 md:pb-12 w-full shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-8">
            <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity">
              <BrandLogo className="w-5 h-5 grayscale" />
              <p className="text-[11px] font-medium text-foreground tracking-widest uppercase">
                Subtract &copy; 2026
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Designed by <span className="text-foreground">Ahmed Kilany</span>
              </span>
              
              <div className="h-4 w-px bg-border hidden md:block" />
              
              <div className="flex items-center gap-3">
                <a href="#" className="w-7 h-7 rounded bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all" title="Facebook">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="w-7 h-7 rounded bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/20 transition-all" title="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="w-7 h-7 rounded bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/20 transition-all" title="LinkedIn">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
            </div>
          </main>
          
          {/* Mobile Bottom Navigation Layout */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-background/90 backdrop-blur-3xl border-t border-border z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] dark:shadow-[0_-20px_40px_rgba(0,0,0,1)]">
            <button onClick={() => setActiveView('list')} className={cn("flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-colors", activeView === 'list' ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground")}>
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">List</span>
            </button>
            <button onClick={() => setActiveView('dashboard')} className={cn("flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-colors", activeView === 'dashboard' ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground")}>
              <Activity className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">Analytics</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={cn("flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-colors", activeView === 'calendar' ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground")}>
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">Calendar</span>
            </button>
            <button onClick={() => setActiveView('archive')} className={cn("flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-colors", activeView === 'archive' ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground")}>
              <Archive className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">Archive</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
