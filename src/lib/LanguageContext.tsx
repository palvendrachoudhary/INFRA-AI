import React, { createContext, useContext, useState, useEffect } from "react";

export type Language =
  | "English"
  | "Hindi"
  | "Marathi"
  | "Tamil"
  | "Telugu"
  | "Bengali"
  | "Gujarati"
  | "Kannada"
  | "Punjabi"
  | "Malayalam";

export interface LanguageInfo {
  id: Language;
  label: string;
  native: string;
}

export const LANGUAGES: Language[] = [
  "English", "Hindi", "Marathi", "Tamil", "Telugu", 
  "Bengali", "Gujarati", "Kannada", "Punjabi", "Malayalam"
];

export const LANGUAGE_DETAILS: LanguageInfo[] = [
  { id: "English", label: "English", native: "English" },
  { id: "Hindi", label: "Hindi", native: "हिन्दी" },
  { id: "Marathi", label: "Marathi", native: "मराठी" },
  { id: "Tamil", label: "Tamil", native: "தமிழ்" },
  { id: "Telugu", label: "Telugu", native: "తెలుగు" },
  { id: "Bengali", label: "Bengali", native: "বাংলা" },
  { id: "Gujarati", label: "Gujarati", native: "ગુજરાતી" },
  { id: "Kannada", label: "Kannada", native: "ಕನ್ನಡ" },
  { id: "Punjabi", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { id: "Malayalam", label: "Malayalam", native: "മലയാളം" },
];

export const TRANSLATIONS: Record<string, Partial<Record<Language, string>>> = {
  // Brand & Header
  "Infra.ai": {
    Hindi: "Infra.ai",
    Marathi: "Infra.ai",
  },
  "By Team THEKEDAAR": {
    Hindi: "टीम ठेकेदार द्वारा",
    Marathi: "टीम ठेकेदार द्वारे",
    Tamil: "டீம் தேகேதார்",
    Telugu: "టీమ్ థెకేదార్ సమర్పణ",
    Bengali: "টিম থেকেদার দ্বারা",
    Gujarati: "ટીમ ઠેકેદાર દ્વારા",
    Kannada: "ಟೀಮ್ ಥೇಕೇದಾರ್ ಮೂಲಕ",
    Punjabi: "ਟੀਮ ਠੇਕੇਦਾਰ ਵੱਲੋਂ",
    Malayalam: "ടീം തെക്കേദാർ വഴി",
  },
  "Report Issue": {
    Hindi: "समस्या दर्ज करें",
    Marathi: "तक्रार नोंदवा",
    Tamil: "சிக்கலைப் புகாரளிக்கவும்",
    Telugu: "సమస్యను నివేదించండి",
    Bengali: "সমস্যা রিপোর্ট করুন",
    Gujarati: "સમસ્યા નોંધાવો",
    Kannada: "ಸಮಸ್ಯೆ ವರदी ಮಾಡಿ",
    Punjabi: "ਮਸਲਾ ਦਰਜ ਕਰੋ",
    Malayalam: "പരാതിപ്പെടുക",
  },
  "Admin Portal": {
    Hindi: "प्रशासन पोर्टल",
    Marathi: "प्रशासक पोर्टल",
    Tamil: "நிர்வாக போர்டல்",
    Telugu: "అడ్మిన్ పోర్టల్",
    Bengali: "অ্যাডমিন পোর্টাল",
    Gujarati: "એડમિન પોર્ટલ",
    Kannada: "ಆಡಳಿತ ಪೋರ್ಟಲ್",
    Punjabi: "ਐਡਮਿਨ ਪੋਰਟਲ",
    Malayalam: "അഡ്മിൻ പോർട്ടൽ",
  },
  "Sign in with Google": {
    Hindi: "Google से साइन इन करें",
    Marathi: "Google सह साइन इन करा",
    Tamil: "Google மூலம் உள்நுழைக",
    Telugu: "Googleతో సైన్ ఇన్ చేయండి",
    Bengali: "Google দিয়ে সাইন ইন করুন",
    Gujarati: "Google સાથે સાઇન ઇન કરો",
    Kannada: "Google ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    Punjabi: "Google ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ",
    Malayalam: "Google ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക",
  },

  // Navigation Items
  "Home": {
    Hindi: "मुख्य पृष्ठ",
    Marathi: "मुख्यपृष्ठ",
    Tamil: "முகப்பு",
    Telugu: "హోమ్",
    Bengali: "হোম",
    Gujarati: "મુખ્ય પૃષ્ઠ",
    Kannada: "ಮುಖಪುಟ",
    Punjabi: "ਮੁੱਖ ਪੰਨਾ",
    Malayalam: "ഹോം",
  },
  "Collapse": {
    Hindi: "संकुचित करें",
    Marathi: "मिटवा",
    Tamil: "சுருக்கு",
    Telugu: "కుదించు",
    Bengali: "সংকুচিত করুন",
  },
  "Expand Sidebar": {
    Hindi: "साइडबार विस्तार करें",
    Marathi: "साइडबार विस्तार करा",
    Tamil: "சைடுபாரை விரிவுபடுத்து",
    Telugu: "సైడ్‌బార్‌ను విస్తరించు",
    Bengali: "সাইডবার বড় করুন",
  },
  "Collapse Sidebar": {
    Hindi: "साइडबार संकुचित करें",
    Marathi: "साइडबार मिटवा",
    Tamil: "சைடுபாரைச் சுருக்கு",
    Telugu: "సైడ్‌బార్‌ను కుదించు",
    Bengali: "সাইডবার সংকুচিত করুন",
  },
  "Map / Bharat (Urban+Rural)": {
    Hindi: "मानचित्र / भारत (शहरी + ग्रामीण)",
    Marathi: "नकाशा / भारत (शहरी + ग्रामीण)",
    Tamil: "வரைபடம் / பாரதம்",
    Telugu: "మ్యాప్ / భారత్",
    Bengali: "মানচিত্র / ভারত",
  },
  "Pan-India Coverage": {
    Hindi: "अखिल भारतीय कवरेज",
    Marathi: "अखिल भारतीय व्याप्ती",
    Tamil: "அனைத்திந்திய கவரேजी",
    Telugu: "పాన్-ఇండియా కవరేజ్",
    Bengali: "সর্বভারতীয় কভারেজ",
  },
  "Real-time urban and rural infrastructure monitoring, citizen audits, satellite risk mapping, and democratic public voting across India.": {
    Hindi: "पूरे भारत में वास्तविक समय शहरी और ग्रामीण बुनियादी ढांचा निगरानी, नागरिक ऑडिट, सैटेलाइट जोखिम मैपिंग और लोकतांत्रिक जनमत मतदान।",
    Marathi: "संपूर्ण भारतात रिअल-टाइम शहरी आणि ग्रामीण पायाभूत सुविधांचे निरीक्षण, नागरिक ऑडिट, उपग्रह जोखीम मॅपिंग आणि लोकशाही सार्वजनिक मतदान.",
  },
  "Live Map & Bharat": {
    Hindi: "लाइव मैप एवं भारत",
    Marathi: "थेट नकाशा आणि भारत",
  },
  "Map / Seher": {
    Hindi: "मानचित्र / शहर",
    Marathi: "नकाशा / शहर",
    Tamil: "வரைபடம் / நகரம்",
    Telugu: "మ్యాప్ / నగరం",
    Bengali: "মানচিত্র / শহর",
    Gujarati: "નકશો / શહેર",
    Kannada: "ನಕ್ಷೆ / ನಗರ",
    Punjabi: "ਨਕਸ਼ਾ / ਸ਼ਹਿਰ",
    Malayalam: "മാപ്പ് / നഗരം",
  },
  "Recent Builds": {
    Hindi: "हालिया निर्माण",
    Marathi: "नवीन बांधकामे",
    Tamil: "சமீபத்திய பணிகள்",
    Telugu: "ఇటీవలి నిర్మాణాలు",
    Bengali: "সাম্প্রতিক কাজ",
    Gujarati: "તાજેતરના બાંધકામ",
    Kannada: "ಇತ್ತೀಚಿನ ಕಾಮಗಾರಿಗಳು",
    Punjabi: "ਹਾਲੀਆ ਉਸਾਰੀਆਂ",
    Malayalam: "സമീപകാല നിർമ്മാണങ്ങൾ",
  },
  "Public Voting": {
    Hindi: "जनमत मतदान",
    Marathi: "नागरी मतदान",
    Tamil: "பொது வாக்களிப்பு",
    Telugu: "ప్రజా ఓటింగ్",
    Bengali: "জনসাধারণের ভোট",
    Gujarati: "જાહેર મતદાન",
    Kannada: "ಸಾರ್ವಜನಿಕ ಮತದಾನ",
    Punjabi: "ਜਨਤਕ ਵੋਟਿੰਗ",
    Malayalam: "പൊതു വോട്ടെടുപ്പ്",
  },
  "Policymaker": {
    Hindi: "नीति निर्माता",
    Marathi: "धोरणकर्ते",
    Tamil: "கொள்கை வகுப்பாளர்",
    Telugu: "విధాన రూపకర్త",
    Bengali: "নীতি নির্ধারক",
    Gujarati: "નીતિ નિર્માતા",
    Kannada: "ನೀತಿ ನಿರೂಪಕರು",
    Punjabi: "ਨੀਤੀ ਨਿਰਮਾਤਾ",
    Malayalam: "നയരൂപീകരണ വിദഗ്ധർ",
  },
  "Data Hub": {
    Hindi: "डेटा केंद्र",
    Marathi: "डेटा हब",
    Tamil: "தரவு மையம்",
    Telugu: "డేటా కేంద్రం",
    Bengali: "উপাত্ত কেন্দ্র",
    Gujarati: "ડેટા હબ",
    Kannada: "ಡೇಟಾ ಕೇಂದ್ರ",
    Punjabi: "ਡੇਟਾ ਹੱਬ",
    Malayalam: "ഡാറ്റ ഹബ്",
  },
  "Navigation": {
    Hindi: "नेविगेशन",
    Marathi: "मार्गक्रमण",
    Tamil: "வழிசெலுத்தல்",
    Telugu: "నావిగేషన్",
    Bengali: "নেভিগেশন",
    Gujarati: "નેવિગેશન",
    Kannada: "ನ್ಯಾವಿಗೇಷನ್",
    Punjabi: "ਨੇਵੀਗੇਸ਼ਨ",
    Malayalam: "നാവിഗേഷൻ",
  },
  "Live": {
    Hindi: "लाइव",
    Marathi: "थेट",
    Tamil: "நேரலை",
    Telugu: "ప్రత్యక్షం",
    Bengali: "লাইভ",
    Gujarati: "લાઇવ",
    Kannada: "ಲೈವ್",
    Punjabi: "ਲਾਈਵ",
    Malayalam: "തത്സമയം",
  },
  "Referendum": {
    Hindi: "जनमत संग्रह",
    Marathi: "सार्वमत",
    Tamil: "வாக்கெடுப்பு",
    Telugu: "ప్రజాభిప్రాయం",
    Bengali: "গণভোট",
    Gujarati: "જનમત સંગ્રહ",
    Kannada: "ಜನಾಭಿಪ್ರಾಯ",
    Punjabi: "ਜਨਮਤ ਸੰਗ੍ਰਹਿ",
    Malayalam: "ജനഹിതപരിശോധന",
  },

  // Home Screen Content
  "Empowering Indian Citizens": {
    Hindi: "भारतीय नागरिकों का सशक्तिकरण",
    Marathi: "भारतीय नागरिकांचे सक्षमीकरण",
    Tamil: "இந்தியக் குடிமக்களை மேம்படுத்துதல்",
    Telugu: "భారతీయ పౌరుల సాధికారత",
    Bengali: "ভারতীয় নাগরিকদের ক্ষমতায়ন",
    Gujarati: "ભારતીય નાગરિકોનું સશક્તિકરણ",
    Kannada: "ಭಾರತೀಯ ನಾಗರಿಕರ ಸಬಲೀಕರಣ",
    Punjabi: "ਭਾਰਤੀ ਨਾਗਰਿਕਾਂ ਦਾ ਸਸ਼ਕਤੀਕਰਨ",
    Malayalam: "ഭാരതീയ പൗരന്മാരെ ശാക്തീകരിക്കൽ",
  },
  "AI-Powered Civic Infrastructure Intelligence": {
    Hindi: "एआई-संचालित नागरिक बुनियादी ढांचा निगरानी",
    Marathi: "एआय-सक्षम नागरी पायाभूत सुविधा प्रणाली",
    Tamil: "AI-இயங்கும் குடிமை உள்கட்டமைப்பு நுண்ணறிவு",
    Telugu: "AI-ఆధారిత పౌర మౌలిక సదుపాయాల నిఘా",
    Bengali: "কৃত্রিম বুদ্ধিমত্তা-চালিত নাগরিক অবকাঠামো পর্যবেক্ষণ",
    Gujarati: "AI-સંચાલિત નાગરિક ઈન્ફ્રાસ્ટ્રક્ચર ઇન્ટેલિજન્સ",
    Kannada: "AI-ಚಾಲಿತ ನಾಗರಿಕ ಮೂಲಸೌಕರ್ಯ ಮೇಲ್ವಿಚಾರಣೆ",
    Punjabi: "AI-ਸੰਚਾਲਿਤ ਨਾਗਰਿਕ ਬੁਨਿਆਦੀ ਢਾਂਚਾ ਇੰਟੈਲੀਜੈਂਸ",
    Malayalam: "AI-അധിഷ്ഠിത പൗര അടിസ്ഥാനസൗകര്യ നിരീക്ഷണം",
  },
  "Real-time urban infrastructure monitoring, citizen audits, satellite risk mapping, and democratic public voting across Tier 1, 2, and 3 Indian cities.": {
    Hindi: "टीयर 1, 2 और 3 भारतीय शहरों में वास्तविक समय शहरी बुनियादी ढांचा निगरानी, नागरिक ऑडिट, सैटेलाइट जोखिम मैपिंग और लोकतांत्रिक जनमत मतदान।",
    Marathi: "टीयर 1, 2 आणि 3 भारतीय शहरांमध्ये रीअल-टाइम नागरी पायाभूत सुविधांचे निरीक्षण, नागरिक ऑडिट, उपग्रह जोखीम मॅपिंग आणि लोकशाही सार्वजनिक मतदान.",
    Tamil: "நிலை 1, 2 மற்றும் 3 இந்திய நகரங்களில் நிகழ்நேர உள்கட்டமைப்பு கண்காணிப்பு, குடிமக்கள் தணிக்கை, செயற்கைக்கோள் இடர் வரைபடம் மற்றும் ஜனநாயக பொது வாக்களிப்பு.",
    Telugu: "టైర్ 1, 2 మరియు 3 భారతీయ నగరాల్లో రియల్ టైమ్ పట్టణ మౌలిక సదుపాయాల పర్యవేక్షణ, పౌర ఆడిట్లు, ఉపగ్రహ ముప్పు మ్యాపింగ్ మరియు ప్రజాస్వామిక ప్రజా ఓటింగ్.",
    Bengali: "টায়ার ১, ২ এবং ৩ ভারতীয় শহর জুড়ে রিয়েল-টাইম শহুরে অবকাঠামো পর্যবেক্ষণ, নাগরিক অডিট, স্যাটেলাইট ঝুঁকি ম্যাपिंग এবং গণতান্ত্রিক গণভোট।",
    Gujarati: "ટાયર 1, 2 અને 3 ભારતીય શહેરોમાં રિયલ-ટાઇમ શહેરી ઇન્ફ્રાસ્ટ્રક્ચર મોનિટરિંગ, નાગરિક ઓડિટ, સેટેલાઇટ જોખમ મેપિંગ અને લોકશાહી જાહેર મતદાન.",
    Kannada: "ಟೈರ್ 1, 2 ಮತ್ತು 3 ಭಾರತೀಯ ನಗರಗಳಲ್ಲಿ ನೈಜ-ಸಮಯದ ಮೂಲಸೌಕರ್ಯ ಮೇಲ್ವಿಚಾರಣೆ, ನಾಗರಿಕ ಲೆಕ್ಕಪರಿಶೋಧನೆ, ಉಪಗ್ರಹ ಅಪಾಯ ಮ್ಯಾಪಿಂಗ್ ಮತ್ತು ಪ್ರಜಾಸತ್ತಾತ್ಮಕ ಸಾರ್ವಜನಿಕ ಮತದಾನ.",
    Punjabi: "ਟੀਅਰ 1, 2 ਅਤੇ 3 ਭਾਰਤੀ ਸ਼ਹਿਰਾਂ ਵਿੱਚ ਰੀਅਲ-ਟਾਈਮ ਬੁਨਿਆਦੀ ਢਾਂਚਾ ਨਿਗਰਾਨੀ, ਨਾਗਰਿਕ ਆਡਿਟ, ਸੈਟੇਲਾਈਟ ਖਤਰਾ ਮੈਪਿੰਗ ਅਤੇ ਜਮਹੂਰੀ ਵੋਟਿੰਗ।",
    Malayalam: "ടയർ 1, 2, 3 ഇന്ത്യൻ നഗരങ്ങളിലുടനീളമുള്ള തത്സമയ അടിസ്ഥാന സൗകര്യ നിരീക്ഷണം, പൗര ഓഡിറ്റുകൾ, ഉപഗ്രഹ റിസ്ക് മാപ്പിംഗ്, ജനാധിപത്യ പൊതു വോട്ടെടുപ്പ്.",
  },
  "Live Map & 16 Cities": {
    Hindi: "लाइव मैप एवं 16 शहर",
    Marathi: "थेट नकाशा आणि 16 शहरे",
    Tamil: "நேரலை வரைபடம் & 16 நகரங்கள்",
    Telugu: "లైవ్ మ్యాప్ & 16 నగరాలు",
    Bengali: "লাইভ ম্যাপ ও ১৬ শহর",
    Gujarati: "લાઈવ નકશો અને 16 શહેરો",
    Kannada: "ಲೈವ್ ನಕ್ಷೆ ಮತ್ತು 16 ನಗರಗಳು",
    Punjabi: "ਲਾਈਵ ਨਕਸ਼ਾ ਅਤੇ 16 ਸ਼ਹਿਰ",
    Malayalam: "തത്സമയ മാപ്പും 16 നഗരങ്ങളും",
  },
  "Recent Gov Builds": {
    Hindi: "हालिया सरकारी निर्माण",
    Marathi: "नुकतीच शासकीय बांधकामे",
    Tamil: "சமீபத்திய அரசு திட்டங்கள்",
    Telugu: "ఇటీవలి ప్రభుత్వ నిర్మాణాలు",
    Bengali: "সাম্প্রতিক সরকারি কাজ",
    Gujarati: "તાજેતરના સરકારી પ્રોજેક્ટ્સ",
    Kannada: "ಇತ್ತೀಚಿನ ಸರ್ಕಾರಿ ಕಾಮಗಾರಿಗಳು",
    Punjabi: "ਹਾਲੀਆ ਸਰਕਾਰੀ ਪ੍ਰੋਜੈਕਟ",
    Malayalam: "സമീപകാല സർക്കാർ പ്രവൃത്തികൾ",
  },
  "Public Referendum & Veto": {
    Hindi: "जनमत संग्रह एवं वीटो",
    Marathi: "सार्वमत आणि नकाराधिकार",
    Tamil: "பொது வாக்கெடுப்பு & வீட்டோ",
    Telugu: "ప్రజాభిప్రాయం & వీటో",
    Bengali: "গণভোট ও ভেটো",
    Gujarati: "લોકમત અને વીટો અધિકાર",
    Kannada: "ಸಾರ್ವಜನಿಕ ಜನಾಭಿಪ್ರಾಯ & ವೀಟೋ",
    Punjabi: "ਜਨਤਕ ਰਾਏਸ਼ੁਮਾਰੀ ਅਤੇ ਵੀਟੋ",
    Malayalam: "പൊതു വോട്ടെടുപ്പും വീറ്റോയും",
  },

  // Key Civic Voting & Recent Builds Terms
  "Public Voting, Needs Suggestion & Project Veto": {
    Hindi: "जनमत मतदान, आवश्यकता सुझाव एवं परियोजना वीटो",
    Marathi: "नागरी मतदान, गरजेनुसार सूचना आणि प्रकल्प नकाराधिकार",
    Tamil: "பொது வாக்களிப்பு, தேவைகள் பரிந்துரை & திட்ட வீட்டோ",
    Telugu: "ప్రజా ఓటింగ్, అవసరాల సూచన & ప్రాజెక్ట్ వీటో",
    Bengali: "জনসাধারণের ভোট, চাহিদার পরামর্শ এবং প্রকল্প ভেটো",
    Gujarati: "જાહેર મતદાન, જરૂરિયાતોનું સૂચન અને પ્રોજેક્ટ વીટો",
    Kannada: "ಸಾರ್ವಜನಿಕ ಮತದಾನ, ಅಗತ್ಯಗಳ ಸಲಹೆ ಮತ್ತು ಯೋಜನಾ ವೀಟೋ",
    Punjabi: "ਜਨਤਕ ਵੋਟਿੰਗ, ਜ਼ਰੂਰਤਾਂ ਦੇ ਸੁਝਾਅ ਅਤੇ ਪ੍ਰੋਜੈਕਟ ਵੀਟੋ",
    Malayalam: "പൊതു വോട്ടെടുപ്പ്, ആവശ്യങ്ങളുടെ നിർദ്ദേശം & പദ്ധതി വീറ്റോ",
  },
  "Propose Citizen Project": {
    Hindi: "नागरिक परियोजना प्रस्तावित करें",
    Marathi: "नागरिक प्रकल्प प्रस्तावित करा",
    Tamil: "குடிமக்கள் திட்டத்தை முன்மொழியுங்கள்",
    Telugu: "పౌర ప్రాజెక్టును ప్రతిపాదించండి",
    Bengali: "নাগরিক প্রকল্প প্রস্তাব করুন",
    Gujarati: "નાગરિક પ્રોજેક્ટ પ્રસ્તાવિત કરો",
    Kannada: "ನಾಗರಿಕ ಯೋಜನೆಯನ್ನು ಪ್ರಸ್ತಾಪಿಸಿ",
    Punjabi: "ਨਾਗਰਿਕ ਪ੍ਰੋਜੈਕਟ ਪ੍ਰਸਤਾਵਿਤ ਕਰੋ",
    Malayalam: "പൗര പദ്ധതി നിർദ്ദേശിക്കുക",
  },
  "Propose as Government": {
    Hindi: "सरकार के रूप में प्रस्तावित करें",
    Marathi: "शासनाच्या वतीने प्रस्तावित करा",
    Tamil: "அரசு தரப்பில் முன்மொழியுங்கள்",
    Telugu: "ప్రభుత్వంగా ప్రతిపాదించండి",
    Bengali: "সরকার হিসেবে প্রস্তাব করুন",
    Gujarati: "સરકાર તરીકે પ્રસ્તાવિત કરો",
    Kannada: "ಸರ್ಕಾರವಾಗಿ ಪ್ರಸ್ತಾಪಿಸಿ",
    Punjabi: "ਸਰਕਾਰ ਵੱਜੋਂ ਪ੍ਰਸਤਾਵਿਤ ਕਰੋ",
    Malayalam: "സർക്കാർ ആയി നിർദ്ദേശിക്കുക",
  },
  "Approve Build": {
    Hindi: "स्वीकृत करें",
    Marathi: "मंजूर करा",
    Tamil: "ஒப்புதல்",
    Telugu: "ఆమోదించండి",
    Bengali: "অনুমোদন",
    Gujarati: "મંજૂર કરો",
    Kannada: "ಅನುಮೋದಿಸಿ",
    Punjabi: "ਪ੍ਰਵਾਨ ਕਰੋ",
    Malayalam: "അംഗീകരിക്കുക",
  },
  "Reject / Veto Build": {
    Hindi: "अस्वीकार / वीटो करें",
    Marathi: "फेटाळा / नकाराधिकार",
    Tamil: "நிராகரி / வீட்டோ",
    Telugu: "తిరస్కరించండి / వీటో",
    Bengali: "প্রত্যাখ্যান / ভেটো",
    Gujarati: "રદ / વીટો કરો",
    Kannada: "ತಿರಸ್ಕರಿಸಿ / ವೀಟೋ",
    Punjabi: "ਰੱਦ / ਵੀਟੋ ਕਰੋ",
    Malayalam: "നിരസിക്കുക / വീറ്റോ",
  },
  "Approved by You": {
    Hindi: "आपके द्वारा स्वीकृत",
    Marathi: "तुम्ही मंजूर केले",
    Tamil: "உங்களால் ஏற்கப்பட்டது",
    Telugu: "మీరు ఆమోదించారు",
    Bengali: "আপনার দ্বারা অনুমোদিত",
    Gujarati: "તમારા દ્વારા મંજૂર",
    Kannada: "ನಿಮ್ಮಿಂದ ಅನುಮೋದಿತ",
    Punjabi: "ਤੁਹਾਡੇ ਵੱਲੋਂ ਪ੍ਰਵਾਨਿਤ",
    Malayalam: "നിങ്ങൾ അംഗീകരിച്ചു",
  },
  "Rejected as Wasteful": {
    Hindi: "फिजूलखर्ची मानकर अस्वीकृत",
    Marathi: "उधळपट्टी म्हणून फेटाळले",
    Tamil: "வீணானது என நிராகரிக்கப்பட்டது",
    Telugu: "వృధాగా భావించి తిరస్కరించబడింది",
    Bengali: "অপচয়মূলক হিসেবে প্রত্যাখ্যাত",
    Gujarati: "નકામું ગણી રદ કરાયું",
    Kannada: "ವ್ಯರ್ಥವೆಂದು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    Punjabi: "ਫਜ਼ੂਲ ਖਰਚੀ ਮੰਨ ਕੇ ਰੱਦ",
    Malayalam: "ധൂർത്തായി കണ്ട് നിരസിച്ചു",
  },
  "Citizen Debates": {
    Hindi: "नागरिक विचार-विमर्श",
    Marathi: "नागरी चर्चा",
    Tamil: "குடிமக்கள் விவாதங்கள்",
    Telugu: "పౌర చర్చలు",
    Bengali: "নাগরিক বিতর্ক",
    Gujarati: "નાગરિક ચર્ચાઓ",
    Kannada: "ನಾಗರಿಕ ಚರ್ಚೆಗಳು",
    Punjabi: "ਨਾਗਰਿਕ ਬਹਿਸਾਂ",
    Malayalam: "പൗര ചർച്ചകൾ",
  },
  "Active Referendums": {
    Hindi: "सक्रिय जनमत संग्रह",
    Marathi: "सक्रिय सार्वमत",
    Tamil: "செயலில் உள்ள வாக்கெடுப்புகள்",
    Telugu: "యాక్టివ్ ప్రజాభిప్రాయాలు",
    Bengali: "সক্রিয় গণভোট",
    Gujarati: "સક્રિય લોકમત",
    Kannada: "ಸಕ್ರಿಯ ಜನಾಭಿಪ್ರಾಯಗಳು",
    Punjabi: "ਸਰਗਰਮ ਰੈਫਰੈਂਡਮ",
    Malayalam: "സജീവ വോട്ടെടുപ്പുകൾ",
  },
  "Useless Builds Vetoed": {
    Hindi: "जनता द्वारा रोके गए अनुचित निर्माण",
    Marathi: "जनतेने रोखलेली अनावश्यक बांधकामे",
    Tamil: "மக்களால் தடுக்கப்பட்ட வீண் திட்டங்கள்",
    Telugu: "ప్రజలు నిలిపివేసిన అనవసర పనులు",
    Bengali: "জনগণ কর্তৃক বাতিলকৃত অপ্রয়োজনীয় কাজ",
    Gujarati: "જનતા દ્વારા અટકાવાયેલા નકામા બાંધકામો",
    Kannada: "ಜನರಿಂದ ತಡೆಹಿಡಿಯಲಾದ ವ್ಯರ್ಥ ಕಾಮಗಾರಿಗಳು",
    Punjabi: "ਲੋਕਾਂ ਵੱਲੋਂ ਰੋਕੀਆਂ ਗਈਆਂ ਫਜ਼ੂਲ ਉਸਾਰੀਆਂ",
    Malayalam: "ജനങ്ങളാൽ തടയപ്പെട്ട അനാവശ്യ നിർമ്മാണങ്ങൾ",
  },
  "Public Approved": {
    Hindi: "जनता द्वारा स्वीकृत",
    Marathi: "जनतेने मंजूर केलेले",
    Tamil: "பொதுமக்கள் அங்கீகரித்தது",
    Telugu: "ప్రజల ఆమోదం పొందినవి",
    Bengali: "জনগণ কর্তৃক অনুমোদিত",
    Gujarati: "જનતા દ્વારા મંજૂર",
    Kannada: "ಜನರಿಂದ ಅನುಮೋದಿತ",
    Punjabi: "ਲੋਕਾਂ ਵੱਲੋਂ ਪ੍ਰਵਾਨਿਤ",
    Malayalam: "പൊതുജനങ്ങൾ അംഗീകരിച്ചത്",
  },
  "Total Citizen Votes": {
    Hindi: "कुल नागरिक मत",
    Marathi: "एकूण नागरी मते",
    Tamil: "மொத்த குடிமக்கள் வாக்குகள்",
    Telugu: "మొత్తం పౌర ఓట్లు",
    Bengali: "মোট নাগরিক ভোট",
    Gujarati: "કુલ નાગરિક મતો",
    Kannada: "ಒಟ್ಟು ನಾಗರಿಕ ಮತಗಳು",
    Punjabi: "ਕੁੱਲ ਨਾਗਰਿਕ ਵੋਟਾਂ",
    Malayalam: "ആകെ പൗര വോട്ടുകൾ",
  },
  "Completed": {
    Hindi: "पूर्ण",
    Marathi: "पूर्ण झाले",
    Tamil: "நிறைவடைந்தது",
    Telugu: "పూర్తయింది",
    Bengali: "সম্পন্ন",
    Gujarati: "પૂર્ણ",
    Kannada: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    Punjabi: "ਮੁਕੰਮਲ",
    Malayalam: "പൂർത്തിയായി",
  },
  "In Progress": {
    Hindi: "प्रगति पर",
    Marathi: "प्रगतीपथावर",
    Tamil: "நடைபெறுகிறது",
    Telugu: "పురోగతిలో ఉంది",
    Bengali: "চলমান",
    Gujarati: "ચાલુ છે",
    Kannada: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    Punjabi: "ਜਾਰੀ ਹੈ",
    Malayalam: "പുരോഗമിക്കുന്നു",
  },
  "Under Procurement": {
    Hindi: "निविदा प्रक्रियाधीन",
    Marathi: "खरेदी प्रक्रियेत",
    Tamil: "கொள்முதலில்",
    Telugu: "సేకరణలో ఉంది",
    Bengali: "সংগ্রহাধীন",
    Gujarati: "ટેન્ડર પ્રક્રિયામાં",
    Kannada: "ಖರೀದಿ ಹಂತದಲ್ಲಿದೆ",
    Punjabi: "ਟੈਂਡਰ ਅਧੀਨ",
    Malayalam: "ടെൻഡർ പ്രക്രിയയിൽ",
  },
  "Jump to City": {
    Hindi: "शहर चुनें",
    Marathi: "शहर निवडा",
    Tamil: "நகரத்தைத் தேர்வுசெய்க",
    Telugu: "నగరాన్ని ఎంచుకోండి",
    Bengali: "শহর নির্বাচন করুন",
    Gujarati: "શહેર પસંદ કરો",
    Kannada: "ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    Punjabi: "ਸ਼ਹਿਰ ਚੁਣੋ",
    Malayalam: "നഗരം തിരഞ്ഞെടുക്കുക",
  },
  "Filter by City Tier": {
    Hindi: "शहर श्रेणी (टीयर) अनुसार फ़िल्टर",
    Marathi: "शहर श्रेणीनुसार फिल्टर",
    Tamil: "நகர நிலை வாரியாக வடிகட்டவும்",
    Telugu: "నగర టైర్ ప్రకారం ఫిల్టర్",
    Bengali: "শহরের স্তর অনুযায়ী ফিল্টার",
    Gujarati: "શહેર શ્રેણી ફિલ્ટર",
    Kannada: "ನಗರ ಶ್ರೇಣಿ ಫಿಲ್ಟರ್",
    Punjabi: "ਸ਼ਹਿਰ ਦੇ ਟੀਅਰ ਅਨੁਸਾਰ ਫਿਲਟਰ",
    Malayalam: "നഗര തരം അനുസരിച്ച് ഫിൽട്ടർ",
  },
  "Interactive Layers": {
    Hindi: "इंटरैक्टिव परतें",
    Marathi: "परस्परसंवादी स्तर",
    Tamil: "ஊடாடும் அடுக்குகள்",
    Telugu: "ఇంటరాక్టివ్ లేయర్‌లు",
    Bengali: "ইন্টারেক্টিভ স্তর",
    Gujarati: "ઇન્ટરેક્ટિવ લેયર્સ",
    Kannada: "ಸಂವಾದಾತ್ಮಕ ಪದರಗಳು",
    Punjabi: "ਇੰਟਰਐਕਟਿਵ ਲੇਅਰਾਂ",
    Malayalam: "സംവേദനാത്മക ലെയറുകൾ",
  },
  "Government Builds": {
    Hindi: "सरकारी निर्माण",
    Marathi: "शासकीय बांधकामे",
    Tamil: "அரசு கட்டுமானங்கள்",
    Telugu: "ప్రభుత్వ నిర్మాణాలు",
    Bengali: "সরকারি কাজ",
    Gujarati: "સરકારી બાંધકામો",
    Kannada: "ಸರ್ಕಾರಿ ನಿರ್ಮಾಣಗಳು",
    Punjabi: "ਸਰਕਾਰੀ ਉਸਾਰੀਆਂ",
    Malayalam: "സർക്കാർ നിർമ്മാണങ്ങൾ",
  },
};

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  supportedLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("infra_ai_lang");
    if (saved && LANGUAGES.includes(saved as Language)) {
      return saved as Language;
    }
    return "English";
  });

  const handleSetLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem("infra_ai_lang", lang);
    } catch (e) {
      console.warn("Could not save language to localStorage", e);
    }
  };

  const t = (text: string): string => {
    if (!text || currentLanguage === "English") return text;
    
    // Exact match in dictionary
    if (TRANSLATIONS[text]?.[currentLanguage]) {
      return TRANSLATIONS[text]![currentLanguage]!;
    }

    // Trimmed match
    const trimmed = text.trim();
    if (TRANSLATIONS[trimmed]?.[currentLanguage]) {
      return TRANSLATIONS[trimmed]![currentLanguage]!;
    }

    // Default to original text
    return text;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language: currentLanguage, 
        currentLanguage, 
        setLanguage: handleSetLanguage, 
        t, 
        supportedLanguages: LANGUAGES 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
