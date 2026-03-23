
// Simulated AI Localizer for Pearl Hub
// Provides high-fidelity translations for metadata/descriptions based on selected language

const TRANSLATIONS: Record<string, Record<string, string>> = {
  "Shangri-La Colombo": {
    si: "සැන්ග්‍රි-ලා කොළඹ",
    ta: "சாங்ரி-லா கொழும்பு",
    de: "Shangri-La Colombo (Premium Hotel)",
    fr: "Shangri-La Colombo (Hôtel de Luxe)",
    ru: "Шангри-Ла Коломбо",
    zh: "科伦坡香格里拉大酒店",
    ar: "شانغريلا كولومبو",
    ja: "シャングリラ・コロンボ"
  },
  "Iconic 5-star luxury on Colombo waterfront.": {
    si: "කොළඹ වෙරළ තීරයේ පිහිටි පංච තරු සුඛෝපභෝගී හෝටලයකි.",
    ta: "கொழும்பு நீர்முனையில் உள்ள 5 நட்சத்திர ஆடம்பர ஹோட்டல்.",
    de: "Ikonischer 5-Sterne-Luxus an der Waterfront von Colombo.",
    fr: "Luxe 5 étoiles emblématique sur le front de mer de Colombo.",
    ru: "Культовая 5-звездочная роскошь на набережной Коломбо.",
    zh: "科伦坡海滨标志性的五星级奢华酒店。",
    ar: "فخامة أيقونية من فئة 5 نجوم على واجهة كولومبو البحرية.",
    ja: "コロンボのウォーターフロントにある象徴的な5つ星のラグジュアリー。"
  },
  "Eco-Friendly Toyota Prius": {
    si: "පරිසර හිතකාමී ටොයෝටා ප්‍රියස්",
    ta: "சுற்றுச்சூழலுக்கு உகந்த டொயோட்டா பிரியஸ்",
    ja: "エコフレンドリーなトヨタ・プリウス"
  },
  "Find Perfect Accommodation": {
    "si": "පරිපූර්ණ නවාතැන සොයන්න",
    "de": "Finden Sie die perfekte Unterkunft"
  },
  "Hotels • Villas • Guest Houses • Hostels • Sri Lanka Tourism Board Approved": {
    "si": "හෝටල් • විලා • අමුත්තන්ගේ නිවාස • ශ්‍රී ලංකා සංචාරක මණ්ඩලය අනුමත කර ඇත",
    "de": "Hotels • Villen • Pensionen • Sri Lanka Tourism Board Approved"
  },
  "AI Suggestions: Similar Stays": {
    "si": "AI යෝජනා: සමාන නවාතැන්",
    "de": "KI-Vorschläge: Ähnliche Unterkünfte"
  }
};

export const localizeContent = (text: string, targetLang: string): string => {
  if (targetLang === 'en') return text;
  
  // Simulation: If we have a direct translation, use it. 
  // Otherwise, return a bracketed simulation of machine translation
  if (TRANSLATIONS[text] && TRANSLATIONS[text][targetLang]) {
    return TRANSLATIONS[text][targetLang];
  }
  
  // Fallback simulation
  const prefixes: Record<string, string> = {
    si: "[පරිවර්තනය කළා]",
    ta: "[மொழிபெயர்க்கப்பட்டது]",
    de: "[Übersetzt]",
    fr: "[Traduit]",
    ru: "[Переведено]",
    zh: "[翻译]",
    ar: "[مترجم]",
    ja: "[翻訳済み]"
  };
  
  return `${prefixes[targetLang] || '[AI]'} ${text}`;
};
