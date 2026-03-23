/**
 * BookingChat — multilingual real-time chat between guest and provider.
 *
 * Key features:
 * - Supabase Realtime for live message delivery
 * - Automatic AI translation via Anthropic API (every message shown in
 *   sender's original language AND recipient's preferred language)
 * - Web Speech API: voice input + text-to-speech playback
 * - Language auto-detection from user profile / browser locale
 * - Works for any language pair (German ↔ Sinhala, Tamil ↔ Russian, etc.)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/store/useStore";
import {
  Send, Mic, MicOff, Volume2, VolumeX,
  Languages, Loader2, X, Minimize2, Maximize2,
  MessageSquare, Globe, ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Supported UI languages ─────────────────────────────────
const LANGUAGES: Record<string, { label: string; voice: string; flag: string }> = {
  en: { label: "English",    voice: "en-US", flag: "🇬🇧" },
  si: { label: "Sinhala",    voice: "si-LK", flag: "🇱🇰" },
  ta: { label: "Tamil",      voice: "ta-IN", flag: "🇮🇳" },
  de: { label: "Deutsch",    voice: "de-DE", flag: "🇩🇪" },
  fr: { label: "Français",   voice: "fr-FR", flag: "🇫🇷" },
  ru: { label: "Русский",    voice: "ru-RU", flag: "🇷🇺" },
  zh: { label: "中文",       voice: "zh-CN", flag: "🇨🇳" },
  ar: { label: "العربية",    voice: "ar-SA", flag: "🇸🇦" },
  ja: { label: "日本語",     voice: "ja-JP", flag: "🇯🇵" },
};

interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  sender_lang: string;
  original_text: string;
  translations: Record<string, string>; // lang → translated text
  sent_at: string;
  is_voice: boolean;
}

interface BookingChatProps {
  bookingId: string;
  otherPartyName: string;
  otherPartyLang?: string;
  isOpen: boolean;
  onClose: () => void;
  compact?: boolean;
}

// ── Claude API translation helper ──────────────────────────
async function translateText(
  text: string,
  fromLang: string,
  toLang: string,
  apiKey?: string
): Promise<string> {
  if (fromLang === toLang) return text;
  if (!apiKey) {
    // No API key — return with language prefix label so UI still works
    return `[${LANGUAGES[toLang]?.label ?? toLang}] ${text}`;
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `You are a translation assistant. Translate the user's text from ${fromLang} to ${toLang}. Return ONLY the translated text, no explanation, no quotes.`,
        messages: [{ role: "user", content: text }],
      }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? text;
  } catch {
    return text;
  }
}

export default function BookingChat({
  bookingId, otherPartyName, otherPartyLang = "en",
  isOpen, onClose, compact = false,
}: BookingChatProps) {
  const { user, profile } = useAuth();
  const { language: storeLanguage } = useStore();

  // Detect user language from profile / store / browser
  const myLang = (profile as any)?.preferred_language
    ?? storeLanguage
    ?? navigator.language.split("-")[0]
    ?? "en";

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [translating, setTranslating] = useState(false);
  const [listening, setListening]   = useState(false);
  const [muted, setMuted]           = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [minimized, setMinimized]   = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [userLang, setUserLang]     = useState(myLang);
  const [unread, setUnread]         = useState(0);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // ── Load message history ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || !bookingId) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("booking_messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("sent_at", { ascending: true });
      if (data) setMessages(data);
    };
    load();
  }, [isOpen, bookingId]);

  // ── Supabase Realtime subscription ───────────────────────
  useEffect(() => {
    if (!bookingId) return;
    const channel = supabase
      .channel(`booking-chat-${bookingId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "booking_messages",
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (minimized || !isOpen) setUnread(u => u + 1);
        // TTS for incoming messages from the other party
        if (msg.sender_id !== user?.id && !muted) {
          const textToSpeak = msg.translations?.[userLang] ?? msg.original_text;
          speak(textToSpeak, LANGUAGES[userLang]?.voice ?? "en-US");
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [bookingId, user?.id, userLang, muted, minimized, isOpen]);

  // ── Auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Clear unread on open ──────────────────────────────────
  useEffect(() => {
    if (isOpen && !minimized) setUnread(0);
  }, [isOpen, minimized]);

  // ── Text-to-speech ────────────────────────────────────────
  const speak = useCallback((text: string, voiceLang: string) => {
    if (!("speechSynthesis" in window) || muted) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = voiceLang;
    utt.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }, [muted]);

  // ── Speech recognition ────────────────────────────────────
  const startListening = () => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SR();
    rec.lang = LANGUAGES[userLang]?.voice ?? "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ── Send message ──────────────────────────────────────────
  const sendMessage = async (isVoice = false) => {
    const text = input.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setInput("");

    // Build translation map: always include sender lang + recipient lang
    const langs = [userLang, otherPartyLang, "en"].filter((l, i, a) => a.indexOf(l) === i);
    setTranslating(true);
    const translations: Record<string, string> = {};
    await Promise.all(
      langs.map(async (toLang) => {
        if (toLang === userLang) {
          translations[toLang] = text; // original
        } else {
          translations[toLang] = await translateText(text, userLang, toLang, apiKey);
        }
      })
    );
    setTranslating(false);

    const { error } = await (supabase as any).from("booking_messages").insert({
      booking_id:    bookingId,
      sender_id:     user.id,
      sender_name:   profile?.full_name ?? "Guest",
      sender_lang:   userLang,
      original_text: text,
      translations,
      is_voice:      isVoice,
    });

    if (error) console.error("Message send error:", error);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Display text for a message ────────────────────────────
  const getDisplayText = (msg: ChatMessage): { show: string; original: string; isDifferent: boolean } => {
    const isMine = msg.sender_id === user?.id;
    const viewLang = isMine ? userLang : userLang;
    const show = msg.translations?.[viewLang] ?? msg.original_text;
    const original = msg.original_text;
    return { show, original, isDifferent: show !== original && showTranslations };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed z-[2000] shadow-2xl rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-900 flex flex-col ${
          compact
            ? "bottom-24 right-6 w-96"
            : "bottom-6 right-6 w-[420px]"
        } ${minimized ? "h-14" : "h-[600px]"}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center text-sm font-black text-primary-foreground">
              {otherPartyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-black text-pearl uppercase tracking-tight">{otherPartyName}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] text-mist/50 font-medium">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangPickerOpen(!langPickerOpen)}
                className="flex items-center gap-1.5 text-[10px] font-black text-mist uppercase tracking-widest bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5 hover:border-primary/30 transition-all"
              >
                <Globe size={10} />
                {LANGUAGES[userLang]?.flag} {userLang.toUpperCase()}
                <ChevronDown size={10} />
              </button>
              {langPickerOpen && (
                <div className="absolute top-8 right-0 bg-zinc-900 border border-white/10 rounded-2xl p-2 z-50 w-44 shadow-2xl">
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => { setUserLang(code); setLangPickerOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                        userLang === code ? "bg-primary/20 text-primary font-bold" : "text-mist hover:bg-white/5"
                      }`}
                    >
                      <span>{lang.flag}</span> {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              title="Toggle translations"
              className={`p-1.5 rounded-lg transition-colors ${showTranslations ? "text-primary bg-primary/10" : "text-mist/40 hover:text-mist"}`}
            >
              <Languages size={14} />
            </button>
            <button onClick={() => setMuted(!muted)} title="Toggle voice"
              className={`p-1.5 rounded-lg transition-colors ${muted ? "text-mist/40" : "text-primary"}`}>
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button onClick={() => setMinimized(!minimized)}
              className="p-1.5 rounded-lg text-mist/40 hover:text-mist transition-colors">
              {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-mist/40 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* ── Translation notice ── */}
            <div className="px-4 py-2 bg-primary/5 border-b border-white/5 flex items-center gap-2">
              <Languages size={12} className="text-primary flex-shrink-0" />
              <p className="text-[10px] text-primary/80">
                Messages auto-translated between{" "}
                <strong>{LANGUAGES[userLang]?.label ?? userLang}</strong> ↔{" "}
                <strong>{LANGUAGES[otherPartyLang]?.label ?? otherPartyLang}</strong>
              </p>
              {translating && <Loader2 size={10} className="animate-spin text-primary ml-auto" />}
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <MessageSquare size={32} className="text-mist/20" />
                  <p className="text-xs text-mist/40 font-medium">
                    Start chatting with {otherPartyName}.<br />
                    Messages are automatically translated.
                  </p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                const { show, original, isDifferent } = getDisplayText(msg);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                  >
                    {/* Sender name + lang badge */}
                    <div className={`flex items-center gap-1.5 mb-1 ${isMine ? "flex-row-reverse" : ""}`}>
                      <span className="text-[9px] font-black text-mist/40 uppercase tracking-widest">
                        {msg.sender_name}
                      </span>
                      <Badge className="text-[8px] px-1.5 py-0 bg-white/5 border-white/10 text-mist/30">
                        {LANGUAGES[msg.sender_lang]?.flag ?? "🌐"} {msg.sender_lang.toUpperCase()}
                      </Badge>
                      {msg.is_voice && <span className="text-[8px] text-primary">🎤</span>}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-white/8 border border-white/5 text-pearl rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{show}</p>

                      {/* Show original if translated */}
                      {isDifferent && (
                        <div className={`mt-2 pt-2 border-t ${isMine ? "border-white/20" : "border-white/10"}`}>
                          <p className={`text-[10px] italic opacity-60 leading-relaxed`}>
                            "{original}"
                          </p>
                          <p className={`text-[9px] uppercase tracking-widest font-black mt-0.5 ${isMine ? "text-white/40" : "text-mist/30"}`}>
                            {LANGUAGES[msg.sender_lang]?.label ?? "Original"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* TTS play button for incoming messages */}
                    {!isMine && (
                      <button
                        onClick={() => speak(show, LANGUAGES[userLang]?.voice ?? "en-US")}
                        className="mt-1 text-[9px] text-mist/30 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Volume2 size={10} /> Play
                      </button>
                    )}

                    <span className="text-[8px] text-mist/20 mt-0.5">
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div className="px-4 py-3 bg-zinc-950 border-t border-white/5 flex-shrink-0">
              <div className="flex items-end gap-2">
                {/* Voice input */}
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    listening
                      ? "bg-red-500/20 text-red-400 animate-pulse"
                      : "bg-white/5 text-mist/50 hover:text-primary hover:bg-primary/10"
                  }`}
                  title="Hold to speak"
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message in ${LANGUAGES[userLang]?.label ?? userLang}…`}
                    rows={1}
                    maxLength={1000}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-pearl placeholder:text-mist/20 outline-none focus:border-primary/50 transition-all resize-none"
                    style={{ minHeight: "40px", maxHeight: "120px" }}
                  />
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending || translating}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary hover:bg-gold-light text-primary-foreground flex items-center justify-center transition-all disabled:opacity-40"
                >
                  {sending || translating
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />
                  }
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-[9px] text-mist/20">
                  Hold mic to voice-input · Enter to send
                </p>
                <p className="text-[9px] text-mist/20">
                  {input.length}/1000
                </p>
              </div>
            </div>
          </>
        )}

        {/* Unread badge when minimized */}
        {minimized && unread > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
            {unread}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
