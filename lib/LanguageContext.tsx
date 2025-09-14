'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Home page
    'hero.title': 'MyDevFolioXD',
    'hero.subtitle': 'Transform Your GitHub Into Magic ✨',
    'hero.description': 'Create a stunning developer portfolio that makes recruiters go "Wow!" Just enter your GitHub username and watch the magic happen!',
    'hero.cta': 'Create My Magical Portfolio',
    'hero.placeholder': 'your-username',
    'hero.github': 'github.com/',
    'hero.analyzing': 'Creating Magic...',

    // Features
    'features.instant': '⚡ Instant Magic',
    'features.instant_desc': '✨ Your dream portfolio in seconds! Just type your GitHub username and watch the magic unfold! 🎉',
    'features.showcase': '🎨 Showcase Your Art',
    'features.showcase_desc': '🌟 Your projects deserve the spotlight! Beautiful cards that make your code shine like stars ✨',
    'features.share': '🔗 Share & Shine',
    'features.share_desc': '🎯 Share your amazing portfolio with a cute link! Updates magically with your latest GitHub adventures! 🚀',

    // Footer
    'footer.ready': 'Ready to shine?',
    'footer.portfolio': 'Your magical portfolio awaits at',
    'footer.signup': 'No signup needed',
    'footer.free': 'Free forever',
    'footer.magic': 'Pure magic',
    'footer.instant': 'Instant creation',

    // AI Features
    'ai.career.title': 'AI Career Path Predictor',
    'ai.career.desc': 'Personalized career recommendations based on your GitHub profile and market trends',
    'ai.dream.title': 'AI Code Dream Generator',
    'ai.dream.desc': 'Generate innovative project ideas based on your coding style',
    'ai.review.title': 'AI Code Review Assistant',
    'ai.review.desc': 'Automated code analysis and improvement suggestions',
    'ai.recommend.title': 'Smart Project Recommendation',
    'ai.recommend.desc': 'Find perfect open-source projects for your skill set',
    'ai.dreamweaver.title': 'Neural Code Dream Weaver',
    'ai.dreamweaver.desc': 'Visual representations of your coding subconscious',
    'ai.assistant.title': 'AI Portfolio Assistant',
    'ai.assistant.desc': 'Conversational AI for instant portfolio help',

    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'retry': 'Retry',
    'close': 'Close',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'share': 'Share',
    'download': 'Download',
    'view': 'View',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
  },
  es: {
    'hero.title': 'MyDevFolioXD',
    'hero.subtitle': 'Transforma Tu GitHub En Magia ✨',
    'hero.description': '¡Crea un portafolio de desarrollador impresionante que haga que los reclutadores digan "¡Wow!"! Solo ingresa tu nombre de usuario de GitHub y mira la magia suceder.',
    'hero.cta': 'Crear Mi Portafolio Mágico',
    'hero.placeholder': 'tu-usuario',
    'hero.github': 'github.com/',
    'hero.analyzing': 'Creando Magia...',
    'features.instant': '⚡ Magia Instantánea',
    'features.instant_desc': '✨ ¡Tu portafolio soñado en segundos! Solo escribe tu nombre de usuario de GitHub y mira la magia desplegarse. 🎉',
    'features.showcase': '🎨 Muestra Tu Arte',
    'features.showcase_desc': '🌟 ¡Tus proyectos merecen el spotlight! Tarjetas hermosas que hacen que tu código brille como estrellas ✨',
    'features.share': '🔗 Comparte y Brilla',
    'features.share_desc': '🎯 ¡Comparte tu increíble portafolio con un enlace adorable! Se actualiza mágicamente con tus últimas aventuras de GitHub. 🚀',
    'footer.ready': '¿Listo para brillar?',
    'footer.portfolio': 'Tu portafolio mágico te espera en',
    'footer.signup': 'Sin registro necesario',
    'footer.free': 'Gratis para siempre',
    'footer.magic': 'Pura magia',
    'footer.instant': 'Creación instantánea',
  },
  fr: {
    'hero.title': 'MyDevFolioXD',
    'hero.subtitle': 'Transformez Votre GitHub En Magie ✨',
    'hero.description': 'Créez un portfolio de développeur époustouflant qui fait dire "Wow!" aux recruteurs ! Entrez simplement votre nom d\'utilisateur GitHub et regardez la magie opérer.',
    'hero.cta': 'Créer Mon Portfolio Magique',
    'hero.placeholder': 'votre-utilisateur',
    'hero.github': 'github.com/',
    'hero.analyzing': 'Création de Magie...',
    'features.instant': '⚡ Magie Instantanée',
    'features.instant_desc': '✨ Votre portfolio de rêve en secondes ! Tapez simplement votre nom d\'utilisateur GitHub et regardez la magie se déployer. 🎉',
    'features.showcase': '🎨 Montrez Votre Art',
    'features.showcase_desc': '🌟 Vos projets méritent les projecteurs ! De belles cartes qui font briller votre code comme des étoiles ✨',
    'features.share': '🔗 Partagez et Brillez',
    'features.share_desc': '🎯 Partagez votre incroyable portfolio avec un lien mignon ! Se met à jour magiquement avec vos dernières aventures GitHub. 🚀',
    'footer.ready': 'Prêt à briller ?',
    'footer.portfolio': 'Votre portfolio magique vous attend sur',
    'footer.signup': 'Aucune inscription requise',
    'footer.free': 'Gratuit pour toujours',
    'footer.magic': 'Magie pure',
    'footer.instant': 'Création instantanée',
  },
  de: {
    'hero.title': 'MyDevFolioXD',
    'hero.subtitle': 'Verwandeln Sie Ihr GitHub In Magie ✨',
    'hero.description': 'Erstellen Sie ein atemberaubendes Entwicklerportfolio, das Recruiter "Wow!" sagen lässt! Geben Sie einfach Ihren GitHub-Benutzernamen ein und erleben Sie die Magie.',
    'hero.cta': 'Mein Magisches Portfolio Erstellen',
    'hero.placeholder': 'ihr-benutzername',
    'hero.github': 'github.com/',
    'hero.analyzing': 'Magie Wird Erstellt...',
    'features.instant': '⚡ Sofortige Magie',
    'features.instant_desc': '✨ Ihr Traumportfolio in Sekunden! Geben Sie einfach Ihren GitHub-Benutzernamen ein und sehen Sie die Magie entfalten. 🎉',
    'features.showcase': '🎨 Zeigen Sie Ihre Kunst',
    'features.showcase_desc': '🌟 Ihre Projekte verdienen die Spotlight! Schöne Karten, die Ihren Code wie Sterne leuchten lassen ✨',
    'features.share': '🔗 Teilen und Strahlen',
    'features.share_desc': '🎯 Teilen Sie Ihr fantastisches Portfolio mit einem süßen Link! Aktualisiert sich magisch mit Ihren neuesten GitHub-Abenteuern. 🚀',
    'footer.ready': 'Bereit zu strahlen?',
    'footer.portfolio': 'Ihr magisches Portfolio erwartet Sie bei',
    'footer.signup': 'Keine Anmeldung erforderlich',
    'footer.free': 'Für immer kostenlos',
    'footer.magic': 'Reine Magie',
    'footer.instant': 'Sofortige Erstellung',
  },
  hi: {
    'hero.title': 'MyDevFolioXD',
    'hero.subtitle': 'अपने GitHub को जादू में बदलें ✨',
    'hero.description': 'एक शानदार डेवलपर पोर्टफोलियो बनाएं जो रिक्रूटर्स को "Wow!" कहलवाए! बस अपना GitHub username डालें और जादू देखें!',
    'hero.cta': 'मेरा जादुई पोर्टफोलियो बनाएं',
    'hero.placeholder': 'आपका-username',
    'hero.github': 'github.com/',
    'hero.analyzing': 'जादू बन रहा है...',
    'features.instant': '⚡ तत्काल जादू',
    'features.instant_desc': '✨ सेकंडों में आपका सपना पोर्टफोलियो! बस अपना GitHub username टाइप करें और जादू देखें। 🎉',
    'features.showcase': '🎨 अपनी कला दिखाएं',
    'features.showcase_desc': '🌟 आपके प्रोजेक्ट्स को spotlight मिलना चाहिए! सुंदर कार्ड जो आपके कोड को सितारों की तरह चमकाते हैं ✨',
    'features.share': '🔗 शेयर करें और चमकें',
    'features.share_desc': '🎯 अपने शानदार पोर्टफोलियो को प्यारे लिंक से शेयर करें! आपकी नई GitHub adventures के साथ magically अपडेट होता है। 🚀',
    'footer.ready': 'चमकने के लिए तैयार?',
    'footer.portfolio': 'आपका जादुई पोर्टफोलियो यहाँ आपका इंतजार कर रहा है',
    'footer.signup': 'कोई साइनअप नहीं',
    'footer.free': 'हमेशा फ्री',
    'footer.magic': 'शुद्ध जादू',
    'footer.instant': 'तत्काल निर्माण',
  },
  zh: {
    'hero.title': 'MyDevFolioXD',
    'hero.subtitle': '将您的 GitHub 转化为魔法 ✨',
    'hero.description': '创建一个令人惊叹的开发者作品集，让招聘人员说"哇！"。只需输入您的 GitHub 用户名，看着魔法发生！',
    'hero.cta': '创建我的魔法作品集',
    'hero.placeholder': '您的用户名',
    'hero.github': 'github.com/',
    'hero.analyzing': '正在创造魔法...',
    'features.instant': '⚡ 即时魔法',
    'features.instant_desc': '✨ 几秒钟内实现您的梦想作品集！只需输入您的 GitHub 用户名，看着魔法展开。🎉',
    'features.showcase': '🎨 展示您的艺术',
    'features.showcase_desc': '🌟 您的项目值得 spotlight！让您的代码像星星一样闪耀的美丽卡片 ✨',
    'features.share': '🔗 分享并闪耀',
    'features.share_desc': '🎯 用可爱的链接分享您的惊人作品集！随着您的最新 GitHub 冒险神奇地更新。🚀',
    'footer.ready': '准备闪耀吗？',
    'footer.portfolio': '您的魔法作品集在',
    'footer.signup': '无需注册',
    'footer.free': '永远免费',
    'footer.magic': '纯魔法',
    'footer.instant': '即时创建',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('mydevfolio-language') as Language;
    if (savedLang && Object.keys(translations).includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (Object.keys(translations).includes(browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mydevfolio-language', lang);
  };

  const t = (key: string): string => {
    const langTranslations = translations[language] || translations.en;
    return (langTranslations as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
