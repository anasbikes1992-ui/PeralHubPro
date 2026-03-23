import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, X, Send, Mic, Languages, 
  Volume2, Check, CheckCheck, Sparkles, Phone
} from "lucide-react";
import VoiceCallWidget from "./VoiceCallWidget";

const translations: Record<string, any> = {
  en: {
    welcome: "Welcome to Pearl Hub! How can we assist you today?",
    placeholder: "Type a message...",
    translate: "Translate",
    tapToVoice: "Record Voice",
    support: "Support"
  },
  si: {
    welcome: "පර්ල් හබ් වෙත සාදරයෙන් පිළිගනිමු! අද අපට ඔබට උදව් කළ හැක්කේ කෙසේද?",
    placeholder: "පණිවිඩයක් ටයිප් කරන්න...",
    translate: "පරිවර්තනය කරන්න",
    tapToVoice: "හඬ පටිගත කරන්න",
    support: "සහාය"
  },
  ta: {
    welcome: "பேர்ல் ஹப்பிற்கு வரவேற்கிறோம்! இன்று நாங்கள் உங்களுக்கு எப்படி உதவ முடியும்?",
    placeholder: "செய்தியைத் தட்டச்சு செய்க...",
    translate: "மொழிபெயர்க்க",
    tapToVoice: "குரலைப் பதிவுசெய்க",
    support: "ஆதரவு"
  },
  de: {
    welcome: "Willkommen beim Pearl Hub! Wie können wir Ihnen heute helfen?",
    placeholder: "Nachricht eingeben...",
    translate: "Übersetzen",
    tapToVoice: "Sprache aufnehmen",
    support: "Support"
  },
  fr: {
    welcome: "Bienvenue sur Pearl Hub ! Comment pouvons-nous vous aider aujourd'hui?",
    placeholder: "Tapez un message...",
    translate: "Traduire",
    tapToVoice: "Enregistrer la voix",
    support: "Assistance"
  },
  ru: {
    welcome: "Добро пожаловать в Pearl Hub! Чем мы можем вам помочь сегодня?",
    placeholder: "Введите сообщение...",
    translate: "Перевести",
    tapToVoice: "Записать голос",
    support: "Поддержка"
  },
  zh: {
    welcome: "欢迎来到 Pearl Hub！今天我们能为您提供什么帮助？",
    placeholder: "输入消息...",
    translate: "翻译",
    tapToVoice: "录音",
    support: "客户支持"
  },
  ar: {
    welcome: "مرحبًا بكم في بيرل هاب! كيف يمكننا مساعدتكم اليوم؟",
    placeholder: "اكتب رسالة...",
    translate: "ترجمة",
    tapToVoice: "تسجيل صوتي",
    support: "الدعم"
  },
  ja: {
    welcome: "Pearl Hubへようこそ！本日はどのようなご用件でしょうか？",
    placeholder: "メッセージを入力...",
    translate: "翻訳",
    tapToVoice: "音声を録音",
    support: "サポート"
  }
};

export default function ChatWidget() {
  const { chatMessages, addChatMessage, language, currentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language] || translations.en;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isOpen]);

  const handleSend = () => {
    if (!msg.trim()) return;
    addChatMessage({ sender: currentUser?.name || "Guest", text: msg });
    setMsg("");
    
    // Mock auto-reply
    setTimeout(() => {
      addChatMessage({ sender: "Support", text: "Our team has received your message and will respond shortly. Thank you for choosing Pearl Hub!" });
    }, 1500);
  };

  const handleVoiceMsg = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      addChatMessage({ sender: currentUser?.name || "Guest", text: "Voice Note (0:04)", isVoice: true });
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[550px] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/30 to-zinc-900 px-6 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                    <Sparkles size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-pearl uppercase tracking-widest">{t.support}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Concierge Active</span>
                     <span className="w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
                     <button 
                       onClick={() => setIsCallOpen(true)}
                       className="ml-2 text-primary hover:text-gold-light transition-colors flex items-center gap-1"
                     >
                       <Phone size={12} /> <span className="text-[8px] font-black uppercase tracking-widest">Call Expert</span>
                     </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-mist hover:bg-ruby hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {chatMessages.map((m) => {
                const isMe = m.sender !== "Support";
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 relative group ${isMe ? "bg-primary text-primary-foreground" : "bg-white/5 text-mist border border-white/5"}`}>
                      {m.isVoice ? (
                        <div className="flex items-center gap-3 py-1">
                           <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Volume2 size={16} /></div>
                           <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4 }} className="h-full bg-white" />
                           </div>
                           <span className="text-[10px] font-bold">0:04</span>
                        </div>
                      ) : (
                        <p className="text-[13px] font-medium leading-relaxed">{m.text}</p>
                      )}
                      
                      <div className={`flex items-center gap-2 mt-2 ${isMe ? "justify-end" : "justify-start"}`}>
                         <span className="text-[9px] font-black uppercase opacity-40">{m.time}</span>
                         {isMe && <CheckCheck size={10} className="text-white/40" />}
                      </div>

                      {!isMe && (
                        <button className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                           <Languages size={10} /> {t.translate}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-6 bg-zinc-900/50 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input 
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.placeholder}
                    className="h-12 bg-white/5 border-white/10 rounded-2xl pl-12 pr-4 text-xs font-medium focus:ring-primary/20"
                  />
                  <button onClick={handleVoiceMsg} className={`absolute left-4 top-3.5 ${isRecording ? 'text-ruby' : 'text-mist'} hover:text-primary transition-colors`}>
                    <Mic size={16} className={isRecording ? "animate-pulse" : ""} />
                  </button>
                </div>
                <Button onClick={handleSend} className="h-12 w-12 rounded-2xl bg-primary hover:bg-gold-light text-primary-foreground shadow-lg shadow-primary/20">
                  <Send size={18} />
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
                 {['en', 'si', 'ta', 'de', 'fr', 'ru', 'zh', 'ar', 'ja'].map(lang => (
                   <button 
                     key={lang} 
                     onClick={() => useStore.getState().setLanguage(lang as any)}
                     className={`text-[9px] uppercase font-black tracking-[0.2em] transition-all whitespace-nowrap px-2 py-1 rounded-md ${language === lang ? 'text-primary bg-primary/10' : 'text-mist/40 hover:text-mist hover:bg-white/5'}`}
                   >
                     {lang === 'en' ? '🇬🇧 EN' : 
                      lang === 'si' ? '🇱🇰 SI' : 
                      lang === 'ta' ? '🇱🇰 TA' : 
                      lang === 'de' ? '🇩🇪 DE' : 
                      lang === 'fr' ? '🇫🇷 FR' : 
                      lang === 'ru' ? '🇷🇺 RU' : 
                      lang === 'zh' ? '🇨🇳 ZH' : 
                      lang === 'ar' ? '🇦🇪 AR' : '🇯🇵 JA'}
                   </button>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[2rem] bg-zinc-950 border border-white/10 flex items-center justify-center text-primary shadow-2xl relative group"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-ruby text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-obsidian">1</div>
        )}
      </motion.button>
      
      <VoiceCallWidget 
        isOpen={isCallOpen} 
        onClose={() => setIsCallOpen(false)} 
        partnerName="Prabath Perera" 
        partnerRole="Senior Concierge Expert"
      />
    </div>
  );
}
