import { Player, Team, GamePreset } from '../types';

export const TEAM_COLOR_PALETTES = [
  {
    id: 'team-1',
    name: 'تیم بنفش (شاهین)',
    color: '#a855f7',
    bgGradient: 'from-purple-950 via-slate-900 to-slate-950',
    borderColor: 'border-purple-400/80 shadow-purple-500/20',
    textColor: 'text-purple-300',
    badgeBg: 'bg-purple-600 text-white font-black',
    iconName: 'Zap',
    slogan: 'سرعت و تمرکز',
  },
  {
    id: 'team-2',
    name: 'تیم آبی فیروزه‌ای (اقیانوس)',
    color: '#06b6d4',
    bgGradient: 'from-cyan-950 via-slate-900 to-slate-950',
    borderColor: 'border-cyan-400/80 shadow-cyan-500/20',
    textColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-600 text-white font-black',
    iconName: 'Waves',
    slogan: 'هماهنگی و جریان',
  },
  {
    id: 'team-3',
    name: 'تیم قرمز آتشین (اژدها)',
    color: '#f43f5e',
    bgGradient: 'from-rose-950 via-slate-900 to-slate-950',
    borderColor: 'border-rose-400/80 shadow-rose-500/20',
    textColor: 'text-rose-300',
    badgeBg: 'bg-rose-600 text-white font-black',
    iconName: 'Flame',
    slogan: 'شور و قدرت پیروزی',
  },
  {
    id: 'team-4',
    name: 'تیم طلایی درخشان (خورشید)',
    color: '#eab308',
    bgGradient: 'from-amber-950 via-slate-900 to-slate-950',
    borderColor: 'border-yellow-400/80 shadow-yellow-500/20',
    textColor: 'text-yellow-300',
    badgeBg: 'bg-amber-500 text-slate-950 font-black',
    iconName: 'Crown',
    slogan: 'تاکتیک و درخشش',
  },
  {
    id: 'team-5',
    name: 'تیم سبز زمرد (سپر)',
    color: '#10b981',
    bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-400/80 shadow-emerald-500/20',
    textColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-600 text-white font-black',
    iconName: 'Shield',
    slogan: 'سرسخت و نفوذناپذیر',
  },
  {
    id: 'team-6',
    name: 'تیم نارنجی شعله (ققنوس)',
    color: '#f97316',
    bgGradient: 'from-orange-950 via-slate-900 to-slate-950',
    borderColor: 'border-orange-400/80 shadow-orange-500/20',
    textColor: 'text-orange-300',
    badgeBg: 'bg-orange-600 text-white font-black',
    iconName: 'Sun',
    slogan: 'انرژی بی‌پایان',
  },
  {
    id: 'team-7',
    name: 'تیم صورتی نئون (ستاره)',
    color: '#ec4899',
    bgGradient: 'from-pink-950 via-slate-900 to-slate-950',
    borderColor: 'border-pink-400/80 shadow-pink-500/20',
    textColor: 'text-pink-300',
    badgeBg: 'bg-pink-600 text-white font-black',
    iconName: 'Sparkles',
    slogan: 'خلاقیت و جادو',
  },
  {
    id: 'team-8',
    name: 'تیم نقره‌ای فولادی (هدف)',
    color: '#94a3b8',
    bgGradient: 'from-slate-900 via-slate-950 to-black',
    borderColor: 'border-slate-300/80 shadow-slate-500/20',
    textColor: 'text-slate-200',
    badgeBg: 'bg-slate-300 text-slate-950 font-black',
    iconName: 'Target',
    slogan: 'دقت بی‌نقص',
  },
];

export function createInitialTeams(count = 4, preset: GamePreset = 'general'): Team[] {
  return Array.from({ length: count }, (_, idx) => {
    const palette = TEAM_COLOR_PALETTES[idx % TEAM_COLOR_PALETTES.length];
    let customName = `تیم ${['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم'][idx] || (idx + 1)}`;
    
    if (preset === 'food_chores') {
      const choreNames = ['گروه آشپزی و ناهار', 'گروه خرید و آماده‌سازی', 'گروه شستشو و نظافت', 'گروه چای و پذیرایی', 'گروه میوه و دسر', 'گروه نظم و ساماندهی'];
      customName = choreNames[idx] || `شیفت ${idx + 1}`;
    }

    return {
      id: `team-${idx + 1}`,
      name: customName,
      color: palette.color,
      bgGradient: palette.bgGradient,
      borderColor: palette.borderColor,
      textColor: palette.textColor,
      badgeBg: palette.badgeBg,
      iconName: palette.iconName,
      members: [],
      score: 0,
    };
  });
}

export const PRESET_PLAYER_PACKS: Record<string, { title: string; desc: string; players: string[] }> = {
  football: {
    title: '⚽ فوتبال و فوتسال',
    desc: '۱۲ بازیکن با مهارت‌های متغیر برای بازی‌های دورهمی فوتبال',
    players: [
      'علی کریمی',
      'مهدی طارمی',
      'سردار آزمون',
      'سامان قدوس',
      'علیرضا بیرانوند',
      'سید جلال',
      'رامین رضاییان',
      'وحید امیری',
      'امید ابراهیمی',
      'احسان حاج‌صفی',
      'کریم انصاری‌فرد',
      'امیر عابدزاده'
    ]
  },
  friends: {
    title: '🎉 جمع دوستانه و کافه',
    desc: 'اسامی فارسی برای انواع بازی‌های فکری، پانتومیم و دورهمی',
    players: [
      'امیرحسین',
      'فاطمه',
      'محمد',
      'سارا',
      'نیما',
      'مریم',
      'سینا',
      'نگین',
      'رضا',
      'کیانا',
      'پارسا',
      'هستی',
      'آرش',
      'مینا'
    ]
  },
  chores: {
    title: '🍽️ نوبت غذا و نظافت خانه / شرکت',
    desc: 'تقسیم کار عادلانه آشپزی، خرید، نظافت و پذیرایی',
    players: [
      'حسین',
      'نرگس',
      'سعید',
      'مهسا',
      'کامران',
      'پریا',
      'آیدین',
      'بهاره',
      'سامان',
      'رویا'
    ]
  },
  mafia: {
    title: '🕵️‍♂️ مافیا و شب‌های مافیا',
    desc: 'تقسیم متوازن سایدها و بازیکنان با تجربه',
    players: [
      'امیرعلی (لیدر)',
      'سهراب',
      'نازنین',
      'بهنام',
      'روژین',
      'داریوش',
      'الناز',
      'کیوان',
      'فرناز',
      'شایان'
    ]
  }
};

export const INITIAL_SAMPLE_PLAYERS: Player[] = [
  { id: 'p1', name: 'علی رضایی', skill: 5, role: 'captain', isPresent: true },
  { id: 'p2', name: 'محمد محمدی', skill: 4, role: 'captain', isPresent: true },
  { id: 'p3', name: 'رضا حسینی', skill: 4, role: 'goalkeeper', isPresent: true },
  { id: 'p4', name: 'امیر مرادی', skill: 3, role: 'goalkeeper', isPresent: true },
  { id: 'p5', name: 'سارا کریمی', skill: 5, role: 'none', isPresent: true },
  { id: 'p6', name: 'نیما امینی', skill: 4, role: 'none', isPresent: true },
  { id: 'p7', name: 'مریم صالحی', skill: 3, role: 'none', isPresent: true },
  { id: 'p8', name: 'سینا احمدی', skill: 4, role: 'none', isPresent: true },
  { id: 'p9', name: 'نگین راد', skill: 3, role: 'none', isPresent: true },
  { id: 'p10', name: 'پارسا کاظمی', skill: 2, role: 'none', isPresent: true },
  { id: 'p11', name: 'کیانا افشار', skill: 4, role: 'none', isPresent: true },
  { id: 'p12', name: 'آرش نوری', skill: 3, role: 'none', isPresent: true },
];
