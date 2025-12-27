
import { HeirDefinition, HeirKey } from './types';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  nameEn: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', nameEn: 'US Dollar' },
  { code: 'EUR', symbol: '€', nameEn: 'Euro' },
  { code: 'GBP', symbol: '£', nameEn: 'British Pound' },
  { code: 'SAR', symbol: '﷼', nameEn: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', nameEn: 'UAE Dirham' },
  { code: 'PKR', symbol: '₨', nameEn: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', nameEn: 'Indian Rupee' },
  { code: 'TRY', symbol: '₺', nameEn: 'Turkish Lira' },
  { code: 'IDR', symbol: 'Rp', nameEn: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', nameEn: 'Malaysian Ringgit' },
  { code: 'EGP', symbol: 'E£', nameEn: 'Egyptian Pound' },
  { code: 'KWD', symbol: 'KD', nameEn: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'QR', nameEn: 'Qatari Riyal' },
  { code: 'BDT', symbol: '৳', nameEn: 'Bangladeshi Taka' },
  { code: 'NGN', symbol: '₦', nameEn: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', nameEn: 'South African Rand' },
  { code: 'CAD', symbol: 'C$', nameEn: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', nameEn: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', nameEn: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', nameEn: 'Chinese Yuan' }
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'ur', name: 'اردو' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
];

export const MALE_HEIRS: HeirDefinition[] = [
  { id: 'son', nameEn: 'Son', nameAr: 'ابن', gender: 'M' },
  { id: 'grandson', nameEn: "Son's son", nameAr: 'ابن الابن', gender: 'M' },
  { id: 'father', nameEn: 'Father', nameAr: 'أب', gender: 'M' },
  { id: 'grandfather', nameEn: 'Paternal grandfather', nameAr: 'جد', gender: 'M' },
  { id: 'fullBrother', nameEn: 'Full brother', nameAr: 'أخ شقيق', gender: 'M' },
  { id: 'paternalBrother', nameEn: 'Paternal brother', nameAr: 'أخ لأب', gender: 'M' },
  { id: 'maternalBrother', nameEn: 'Maternal brother', nameAr: 'أخ لأم', gender: 'M' },
  { id: 'nephewFull', nameEn: 'Son of full brother', nameAr: 'ابن الأخ الشقيق', gender: 'M' },
  { id: 'nephewPaternal', nameEn: 'Son of paternal brother', nameAr: 'ابن الأخ لأب', gender: 'M' },
  { id: 'uncleFull', nameEn: 'Paternal uncle (full)', nameAr: 'عم شقيق', gender: 'M' },
  { id: 'unclePaternal', nameEn: 'Paternal uncle (paternal)', nameAr: 'عم لأب', gender: 'M' },
  { id: 'cousinFull', nameEn: 'Son of full paternal uncle', nameAr: 'ابن العم الشقيق', gender: 'M' },
  { id: 'cousinPaternal', nameEn: 'Son of paternal uncle (paternal)', nameAr: 'ابن العم لأب', gender: 'M' },
  { id: 'husband', nameEn: 'Husband', nameAr: 'زوج', gender: 'M' },
  { id: 'freedSlaveMale', nameEn: 'Freed male slave', nameAr: 'معتِق', gender: 'M' }
];

export const FEMALE_HEIRS: HeirDefinition[] = [
  { id: 'daughter', nameEn: 'Daughter', nameAr: 'بنت', gender: 'F' },
  { id: 'granddaughter', nameEn: "Son's daughter", nameAr: 'بنت الابن', gender: 'F' },
  { id: 'mother', nameEn: 'Mother', nameAr: 'أم', gender: 'F' },
  { id: 'paternalGrandmother', nameEn: 'Paternal grandmother', nameAr: 'جدة لأب', gender: 'F' },
  { id: 'maternalGrandmother', nameEn: 'Maternal grandmother', nameAr: 'جدة لأم', gender: 'F' },
  { id: 'fullSister', nameEn: 'Full sister', nameAr: 'أخت شقيقة', gender: 'F' },
  { id: 'paternalSister', nameEn: 'Paternal sister', nameAr: 'أخت لأب', gender: 'F' },
  { id: 'maternalSister', nameEn: 'Maternal sister', nameAr: 'أخت لأم', gender: 'F' },
  { id: 'wife', nameEn: 'Wife', nameAr: 'زوجة', gender: 'F' },
  { id: 'freedSlaveFemale', nameEn: 'Freed female slave', nameAr: 'معتِقة', gender: 'F' }
];

export const ALL_HEIRS = [...MALE_HEIRS, ...FEMALE_HEIRS];

const heirTranslations: Record<string, Record<HeirKey, string>> = {
  en: {
    son: 'Son', grandson: "Son's son", father: 'Father', grandfather: 'Paternal grandfather',
    fullBrother: 'Full brother', paternalBrother: 'Paternal brother', maternalBrother: 'Maternal brother',
    nephewFull: 'Son of full brother', nephewPaternal: 'Son of paternal brother',
    uncleFull: 'Paternal uncle (full)', unclePaternal: 'Paternal uncle (paternal)',
    cousinFull: 'Son of full paternal uncle', cousinPaternal: 'Son of paternal uncle (paternal)',
    husband: 'Husband', freedSlaveMale: 'Freed male slave',
    daughter: 'Daughter', granddaughter: "Son's daughter", mother: 'Mother',
    paternalGrandmother: 'Paternal grandmother', maternalGrandmother: 'Maternal grandmother',
    fullSister: 'Full sister', paternalSister: 'Paternal sister', maternalSister: 'Maternal sister',
    wife: 'Wife', freedSlaveFemale: 'Freed female slave',
    governmentTreasury: 'Government Treasury (Bait-ul-Maal)'
  },
  ur: {
    son: 'بیٹا', grandson: 'پوتا', father: 'والد', grandfather: 'دادا',
    fullBrother: 'سگا بھائی', paternalBrother: 'علاتی بھائی', maternalBrother: 'اخیافی بھائی',
    nephewFull: 'بھتیجا (سگے بھائی کا بیٹا)', nephewPaternal: 'بھتیجا (علاتی بھائی کا بیٹا)',
    uncleFull: 'سگا چچا', unclePaternal: 'علاتی چچا',
    cousinFull: 'سگے چچا کا بیٹا', cousinPaternal: 'علاتی چچا کا بیٹا',
    husband: 'شوہر', freedSlaveMale: 'آزاد کردہ غلام',
    daughter: 'بیٹی', granddaughter: 'پوتی', mother: 'والدہ',
    paternalGrandmother: 'دادی', maternalGrandmother: 'نانی',
    fullSister: 'سگی بہن', paternalSister: 'علاتی بہن', maternalSister: 'اخیافی بہن',
    wife: 'بیوی', freedSlaveFemale: 'آزاد کردہ لونڈی',
    governmentTreasury: 'بیت المال'
  },
  ar: {
    son: 'ابن', grandson: 'ابن ابن', father: 'أب', grandfather: 'جد لأب',
    fullBrother: 'أخ شقيق', paternalBrother: 'أخ لأب', maternalBrother: 'أخ لأم',
    nephewFull: 'ابن أخ شقيق', nephewPaternal: 'ابن أخ لأب',
    uncleFull: 'عم شقيق', unclePaternal: 'عم لأب',
    cousinFull: 'ابن عم شقيق', cousinPaternal: 'ابن عم لأب',
    husband: 'زوج', freedSlaveMale: 'معتق',
    daughter: 'بنت', granddaughter: 'بنت ابن', mother: 'أم',
    paternalGrandmother: 'جدة لأب', maternalGrandmother: 'جدة لأم',
    fullSister: 'أخت شقيقة', paternalSister: 'أخت لأب', maternalSister: 'أخت لأم',
    wife: 'زوجة', freedSlaveFemale: 'معتقة',
    governmentTreasury: 'بيت المال'
  },
  hi: {
    son: 'बेटा', grandson: 'पोता', father: 'पिता', grandfather: 'दादा',
    fullBrother: 'सगा भाई', paternalBrother: 'सौतेला भाई (पिता)', maternalBrother: 'सौतेला भाई (माता)',
    nephewFull: 'भतीजा', nephewPaternal: 'भतीजा',
    uncleFull: 'चाचा', unclePaternal: 'चाचा',
    cousinFull: 'चचेरा भाई', cousinPaternal: 'चचेरा भाई',
    husband: 'पति', freedSlaveMale: 'आज़ाद गुलाम',
    daughter: 'बेटी', granddaughter: 'पोटी', mother: 'माँ',
    paternalGrandmother: 'दादी', maternalGrandmother: 'नानी',
    fullSister: 'सगी बहन', paternalSister: 'सौतेली बहन (पिता)', maternalSister: 'सौतेली बहन (माता)',
    wife: 'पत्नी', freedSlaveFemale: 'आज़ाद दासी',
    governmentTreasury: 'बैतुल माल (सरकारी खजाना)'
  }
};

const currencyTranslations: Record<string, Record<string, string>> = {
  en: { USD: 'US Dollar', SAR: 'Saudi Riyal', PKR: 'Pakistani Rupee', INR: 'Indian Rupee', AED: 'UAE Dirham', EUR: 'Euro', GBP: 'British Pound' },
  ur: { USD: 'امریکی ڈالر', SAR: 'سعودی ریال', PKR: 'پاکستانی روپیہ', INR: 'بھارتی روپیہ', AED: 'اماراتی درہم', EUR: 'یورو', GBP: 'برطانوی پاؤنڈ' },
  ar: { USD: 'دولار أمريكي', SAR: 'ريال سعودي', PKR: 'روبية باكستانية', INR: 'روبية هندية', AED: 'درهم إماراتي', EUR: 'يورو', GBP: 'جنيه إسترليني' },
  hi: { USD: 'अमेरिकी डॉलर', SAR: 'सऊदी रियाल', PKR: 'पाकिस्तानी रुपया', INR: 'भारतीय रुपया', AED: 'यूएई दिरहम', EUR: 'यूरो', GBP: 'ब्रिटिश पाउंड' }
};

export const i18nStrings: Record<string, any> = {
  en: {
    title: 'Inheritance Calculator',
    subtitle: 'Al-Farā’iḍ/Mirath',
    distributionAmount: 'Amount to Divide',
    funeralExpenses: 'Funeral Expenses',
    debts: 'Debts',
    wasiyyat: '(UpTo 1/3)',
    wasiyyatLimit: 'Up to 1/3',
    currency: 'Currency',
    fiqhSchool: 'Fiqh School',
    language: 'Language',
    deceasedGender: 'Deceased Gender',
    heirsSelection: 'Select Heirs',
    calculate: 'Calculate Shares',
    recalculate: 'Recalculate',
    reset: 'Start Over',
    results: 'Results',
    shareTable: 'Share Table',
    familyTree: 'Visual Tree',
    explanation: 'Detailed Explanations',
    blockedBy: 'Blocked by',
    male: 'Male (مرد)',
    female: 'Female (عورت)',
    summary: 'Asset Details',
    deductions: 'Deductions',
    noHeirs: 'Please select heirs on the left.',
    heirs: heirTranslations.en,
    currencies: currencyTranslations.en
  },
  ar: {
    title: 'الفرائض',
    subtitle: 'حاسبة المواريث',
    distributionAmount: 'المبلغ للتقسيم',
    funeralExpenses: 'نفقات الجنازة',
    debts: 'الديون',
    wasiyyat: '(حتى 1/3)',
    wasiyyatLimit: 'حتى 1/3',
    currency: 'العملة',
    fiqhSchool: 'المذهب',
    language: 'اللغة',
    deceasedGender: 'جنس المتوفى',
    heirsSelection: 'اختر الورثة',
    calculate: 'احسب الأنصبة',
    recalculate: 'إعادة الحساب',
    reset: 'إعادة ضبط',
    results: 'النتائج',
    shareTable: 'جدول الأنصبة',
    familyTree: 'شجرة العائلة',
    explanation: 'الشرح التفصيلي',
    blockedBy: 'محجوب بـ',
    male: 'ذكر',
    female: 'أنثى',
    summary: 'تفاصيل الأصول',
    deductions: 'الخصوم',
    noHeirs: 'يرجى اختيار الورثة من القائمة.',
    heirs: heirTranslations.ar,
    currencies: currencyTranslations.ar
  },
  ur: {
    title: 'الفرائض',
    subtitle: 'وراثت کیلکولیٹر',
    distributionAmount: 'تقسیم کی رقم',
    funeralExpenses: 'تجہیز و تکفین',
    debts: 'قرض',
    wasiyyat: '(ایک تہائی تک)',
    wasiyyatLimit: 'ایک تہائی تک',
    currency: 'کرنسی',
    fiqhSchool: 'فقہی مسلک',
    language: 'زبان',
    deceasedGender: 'میت کی جنس',
    heirsSelection: 'وارثین چنیں',
    calculate: 'حصے معلوم کریں',
    recalculate: 'دوبارہ حساب کریں',
    reset: 'دوبارہ شروع کریں',
    results: 'نتائج',
    shareTable: 'حصص کا ٹیبل',
    familyTree: 'شجرہ',
    explanation: 'وضاحت',
    blockedBy: 'بوجہ',
    male: 'مرد',
    female: 'عورت',
    summary: 'رقم کی تفصیل',
    deductions: 'اخراجات',
    noHeirs: 'وارثوں کا انتخاب کریں۔',
    heirs: heirTranslations.ur,
    currencies: currencyTranslations.ur
  },
  hi: {
    title: 'अल-फराइज़',
    subtitle: 'विरासत कैलकुलेटर',
    distributionAmount: 'विभाजित की जाने वाली राशि',
    funeralExpenses: 'अंतिम संस्कार का खर्च',
    debts: 'कर्ज',
    wasiyyat: '(1/3 तक)',
    wasiyyatLimit: '1/3 तक',
    currency: 'मुद्रा',
    fiqhSchool: 'फ़िक़्ह स्कूल',
    language: 'भाषा',
    deceasedGender: 'मृतक का लिंग',
    heirsSelection: 'वारिस चुनें',
    calculate: 'हिस्से की गणना करें',
    recalculate: 'पुनः गणना',
    reset: 'पुनः आरंभ करें',
    results: 'परिणाम',
    shareTable: 'हिस्सा तालिका',
    familyTree: 'पारिवारिक ट्री',
    explanation: 'विस्तृत विवरण',
    blockedBy: 'द्वारा अवरुद्ध',
    male: 'पुरुष',
    female: 'स्त्री',
    summary: 'संपत्ति का विवरण',
    deductions: 'कटौती',
    noHeirs: 'कृपया बाएं वारिस चुनें।',
    heirs: heirTranslations.hi,
    currencies: currencyTranslations.hi
  }
};
