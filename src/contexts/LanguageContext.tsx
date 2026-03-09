import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "bn";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Navbar
  "nav.home": { en: "Home", bn: "হোম" },
  "nav.browse": { en: "Browse PDFs", bn: "পিডিএফ ব্রাউজ" },
  "nav.library": { en: "My Library", bn: "আমার লাইব্রেরি" },
  "nav.admin": { en: "Admin", bn: "অ্যাডমিন" },
  "nav.login": { en: "Login", bn: "লগইন" },
  "nav.logout": { en: "Logout", bn: "লগআউট" },
  "nav.adminPanel": { en: "Admin Panel", bn: "অ্যাডমিন প্যানেল" },

  // Home
  "home.badge": { en: "Premium Digital Library", bn: "প্রিমিয়াম ডিজিটাল লাইব্রেরি" },
  "home.title1": { en: "Discover Premium", bn: "প্রিমিয়াম" },
  "home.title2": { en: "Educational PDFs", bn: "শিক্ষামূলক পিডিএফ আবিষ্কার করুন" },
  "home.subtitle": { en: "Access curated, high-quality digital books from expert authors. Preview before you buy, download instantly.", bn: "বিশেষজ্ঞ লেখকদের উচ্চমানের ডিজিটাল বই পড়ুন। কেনার আগে প্রিভিউ দেখুন, তাৎক্ষণিক ডাউনলোড করুন।" },
  "home.browseCta": { en: "Browse Collection", bn: "কালেকশন দেখুন" },
  "home.topCategories": { en: "Top Categories", bn: "শীর্ষ ক্যাটাগরি" },
  "home.pdfsAvailable": { en: "PDFs Available", bn: "পিডিএফ আছে" },
  "home.happyReaders": { en: "Happy Readers", bn: "সন্তুষ্ট পাঠক" },
  "home.expertAuthors": { en: "Expert Authors", bn: "বিশেষজ্ঞ লেখক" },
  "home.instantDownload": { en: "Instant Download", bn: "তাৎক্ষণিক ডাউনলোড" },
  "home.instantDownloadDesc": { en: "Get your PDFs immediately after purchase", bn: "কেনার সাথে সাথে পিডিএফ পান" },
  "home.freePreview": { en: "Free Preview", bn: "ফ্রি প্রিভিউ" },
  "home.freePreviewDesc": { en: "Preview pages before buying", bn: "কেনার আগে পৃষ্ঠা দেখুন" },
  "home.lifetimeAccess": { en: "Lifetime Access", bn: "আজীবন অ্যাক্সেস" },
  "home.lifetimeAccessDesc": { en: "Download your purchases anytime", bn: "যেকোনো সময় ডাউনলোড করুন" },
  "home.bestsellers": { en: "Bestsellers", bn: "বেস্টসেলার" },
  "home.bestsellersSub": { en: "Most popular picks from our readers", bn: "আমাদের পাঠকদের সবচেয়ে জনপ্রিয়" },
  "home.featured": { en: "Featured Collection", bn: "ফিচার্ড কালেকশন" },
  "home.featuredSub": { en: "Hand-picked by our editorial team", bn: "আমাদের সম্পাদকীয় দলের বাছাই" },
  "home.viewAll": { en: "View All", bn: "সব দেখুন" },
  "home.browseByCategory": { en: "Browse by Category", bn: "ক্যাটাগরি অনুযায়ী ব্রাউজ" },
  "home.readyCta": { en: "Ready to Start Learning?", bn: "শেখা শুরু করতে প্রস্তুত?" },
  "home.readyCtaSub": { en: "Join thousands of readers who are expanding their knowledge with our premium PDF collection.", bn: "হাজার হাজার পাঠকদের সাথে যোগ দিন যারা আমাদের প্রিমিয়াম পিডিএফ কালেকশন দিয়ে জ্ঞান বাড়াচ্ছে।" },
  "home.exploreNow": { en: "Explore Now", bn: "এখনই দেখুন" },

  // Footer
  "footer.desc": { en: "Premium digital marketplace for educational PDFs. Learn from the best authors worldwide.", bn: "শিক্ষামূলক পিডিএফের প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস। বিশ্বের সেরা লেখকদের কাছ থেকে শিখুন।" },
  "footer.quickLinks": { en: "Quick Links", bn: "দ্রুত লিংক" },
  "footer.support": { en: "Support", bn: "সাপোর্ট" },
  "footer.legal": { en: "Legal", bn: "আইনি" },
  "footer.browsePdfs": { en: "Browse PDFs", bn: "পিডিএফ ব্রাউজ" },
  "footer.aboutCeo": { en: "About CEO", bn: "সিইও সম্পর্কে" },
  "footer.helpCenter": { en: "Help Center", bn: "হেল্প সেন্টার" },
  "footer.contactUs": { en: "Contact Us", bn: "যোগাযোগ" },
  "footer.refundPolicy": { en: "Refund Policy", bn: "রিফান্ড পলিসি" },
  "footer.faq": { en: "FAQ", bn: "জিজ্ঞাসা" },
  "footer.terms": { en: "Terms of Service", bn: "সেবার শর্তাবলী" },
  "footer.privacy": { en: "Privacy Policy", bn: "গোপনীয়তা নীতি" },
  "footer.cookies": { en: "Cookie Policy", bn: "কুকি নীতি" },
  "footer.rights": { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },

  // About CEO
  "ceo.badge": { en: "About", bn: "সম্পর্কে" },
  "ceo.title": { en: "About Our CEO", bn: "আমাদের সিইও সম্পর্কে" },
  "ceo.subtitle": { en: "Meet the visionary behind PDFStore", bn: "PDFStore এর পেছনের দূরদর্শী ব্যক্তিকে জানুন" },
  "ceo.name": { en: "Brazil Singh", bn: "ব্রাজিল সিং" },
  "ceo.role": { en: "Founder & CEO, PDFStore", bn: "প্রতিষ্ঠাতা ও সিইও, PDFStore" },
  "ceo.bio": { en: "A passionate entrepreneur and digital education advocate, Brazil Singh founded PDFStore with a vision to make premium educational content accessible to everyone across Bangladesh and beyond.", bn: "একজন উৎসাহী উদ্যোক্তা এবং ডিজিটাল শিক্ষার প্রবক্তা, ব্রাজিল সিং বাংলাদেশ এবং এর বাইরে সবার জন্য প্রিমিয়াম শিক্ষামূলক কন্টেন্ট সহজলভ্য করার লক্ষ্যে PDFStore প্রতিষ্ঠা করেন।" },
  "ceo.storyTitle": { en: "The Story", bn: "গল্প" },
  "ceo.storyP1": { en: "Brazil Singh's journey began with a simple observation — quality educational resources were either too expensive or too hard to find for students and professionals in Bangladesh. Growing up with a deep love for learning, Brazil experienced firsthand the challenges of accessing premium study materials. This personal struggle became the driving force behind PDFStore.", bn: "ব্রাজিল সিং এর যাত্রা শুরু হয়েছিল একটি সাধারণ পর্যবেক্ষণ থেকে — মানসম্মত শিক্ষামূলক সম্পদ হয় অত্যন্ত ব্যয়বহুল অথবা বাংলাদেশের শিক্ষার্থী ও পেশাদারদের জন্য খুঁজে পাওয়া কঠিন ছিল।" },
  "ceo.storyP2": { en: "In 2026, Brazil launched PDFStore to bridge this gap, creating a platform where expert authors could share their knowledge through affordable, high-quality PDFs, and learners could access them with just a few clicks using familiar payment methods like bKash and Nagad.", bn: "২০২৬ সালে, ব্রাজিল এই শূন্যতা পূরণ করতে PDFStore চালু করেন, এমন একটি প্ল্যাটফর্ম তৈরি করেন যেখানে বিশেষজ্ঞ লেখকরা সাশ্রয়ী, উচ্চমানের পিডিএফের মাধ্যমে জ্ঞান শেয়ার করতে পারেন।" },
  "ceo.visionTitle": { en: "Vision", bn: "ভিশন" },
  "ceo.visionQuote": { en: "\"I believe that education should have no barriers. My vision for PDFStore is to become the leading digital education platform in South Asia, empowering millions of learners with curated, expert-authored content at prices everyone can afford.\"", bn: "\"আমি বিশ্বাস করি শিক্ষার কোনো বাধা থাকা উচিত নয়। PDFStore এর জন্য আমার ভিশন হলো দক্ষিণ এশিয়ায় শীর্ষস্থানীয় ডিজিটাল শিক্ষা প্ল্যাটফর্ম হওয়া।\"" },
  "ceo.philosophyTitle": { en: "Philosophy", bn: "দর্শন" },
  "ceo.philosophy": { en: "Brazil believes in three core principles: Accessibility — making knowledge available to everyone regardless of their economic background; Quality — ensuring every PDF on the platform meets rigorous standards; and Trust — building a transparent relationship with customers through honest business practices.", bn: "ব্রাজিল তিনটি মূল নীতিতে বিশ্বাস করেন: প্রবেশযোগ্যতা — অর্থনৈতিক অবস্থা নির্বিশেষে সবার জন্য জ্ঞান সহজলভ্য করা; মান — প্ল্যাটফর্মের প্রতিটি পিডিএফ কঠোর মান পূরণ করে; এবং আস্থা — সৎ ব্যবসায়িক অনুশীলনের মাধ্যমে গ্রাহকদের সাথে স্বচ্ছ সম্পর্ক তৈরি করা।" },
  "ceo.beyondTitle": { en: "Beyond Business", bn: "ব্যবসার বাইরে" },
  "ceo.beyond": { en: "Outside of PDFStore, Brazil is deeply involved in community education initiatives. He regularly mentors young entrepreneurs and advocates for digital literacy programs across Bangladesh. His passion for technology and education continues to shape the future of PDFStore.", bn: "PDFStore এর বাইরে, ব্রাজিল সম্প্রদায় শিক্ষা উদ্যোগে গভীরভাবে জড়িত। তিনি নিয়মিত তরুণ উদ্যোক্তাদের পরামর্শ দেন এবং বাংলাদেশজুড়ে ডিজিটাল সাক্ষরতা কর্মসূচির পক্ষে কাজ করেন।" },
  "ceo.globalTitle": { en: "Global Ambition", bn: "বৈশ্বিক উচ্চাকাঙ্ক্ষা" },
  "ceo.global": { en: "While PDFStore started in Bangladesh, Brazil's ambition is global. Plans are underway to expand the platform to serve learners across South Asia, the Middle East, and beyond, bringing premium educational content to millions more students and professionals worldwide.", bn: "PDFStore বাংলাদেশে শুরু হলেও ব্রাজিলের উচ্চাকাঙ্ক্ষা বৈশ্বিক। দক্ষিণ এশিয়া, মধ্যপ্রাচ্য এবং এর বাইরে শিক্ষার্থীদের সেবা দিতে প্ল্যাটফর্ম সম্প্রসারণের পরিকল্পনা চলছে।" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved === "bn" ? "bn" : "en") as Language;
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
