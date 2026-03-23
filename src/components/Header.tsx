import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import TripBundle from "./TripBundle";
import { UserRole } from "@/types";
import { PERMISSIONS } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import CurrencySwitcher from "./CurrencySwitcher";
import { 
  Building2, 
  Car, 
  Calendar, 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Bell, 
  Menu, 
  X, 
  Sparkles, 
  MessageCircle,
  Sun,
  Moon,
  ShoppingCart
} from "lucide-react";

const Header = () => {
  const { 
    currentUser, setCurrentUser, 
    userRole, setUserRole,
    notifications, markNotificationRead,
    language, setLanguage,
    bundleItems
  } = useStore() as any;
  const [showBundle, setShowBundle] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pearl-hub-theme");
      if (stored) return stored === "dark";
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pearl-hub-theme", next ? "dark" : "light");
  };

  const navItems = [
    { path: "/property", label: t("nav.property"), icon: "🏘️" },
    { path: "/stays", label: t("nav.stays"), icon: "🏨" },
    { path: "/vehicles", label: t("nav.vehicles"), icon: "🚗" },
    { path: "/events", label: t("nav.events"), icon: "🎭" },
    { path: "/sme", label: t("nav.sme"), icon: "🛍️" },
    { path: "/social", label: t("nav.social"), icon: "🌐" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAuthAction = () => {
    if (currentUser) {
      setCurrentUser(null);
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    // In a real app, we'd fetch the corresponding user profile
    // For this robust demo, we'll just toggle the role
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  };

  return (
    <header className="bg-obsidian sticky top-0 z-[500] border-b border-primary/20">
      <div className="container flex items-center gap-6 h-16 px-4 mx-auto">
        {/* Logo */}
        <Link to="/" className="cursor-pointer flex items-center gap-2.5 flex-shrink-0">
          <img src="/favicon.png" alt="Pearl Hub" className="w-[38px] h-[38px] rounded-full object-contain animate-gold-glow" />
          <div className="hidden sm:block">
            <div className="font-display font-bold text-lg text-pearl leading-none">Pearl Hub</div>
            <div className="text-[9px] text-primary tracking-[2px] uppercase">Sri Lanka Premium</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-1 flex-1 justify-center">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all flex items-center gap-1.5 border ${
                location.pathname === item.path
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-transparent text-fog hover:text-pearl"
              }`}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-pearl text-xl ml-auto">
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Global Search */}
        <form onSubmit={e => { 
          e.preventDefault(); 
          const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value; 
          if (q?.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`); 
        }} className="hidden md:flex items-center">
          <input name="q" placeholder="🔍 Search…" className="bg-white/[0.08] border border-white/15 text-pearl placeholder:text-fog rounded-md px-3 py-1.5 text-xs w-32 focus:w-48 transition-all outline-none focus:border-primary/40" />
        </form>

        {/* Controls */}
        <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative bg-white/[0.08] border border-white/15 text-pearl rounded-md p-2 text-sm cursor-pointer hover:bg-white/10 transition-colors">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-ruby text-[10px] font-bold text-pearl rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[600]">
                <div className="p-3 border-b border-white/10 font-bold text-sm text-pearl bg-white/5">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-fog text-xs italic">No new notifications</div>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)}
                      className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? "bg-primary/10" : ""}`}>
                      <div className="font-semibold text-sm text-pearl flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        {n.title}
                      </div>
                      <div className="text-xs text-fog mt-1">{n.message}</div>
                      <div className="text-[10px] text-mist mt-1.5">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={toggleDarkMode} className="bg-white/[0.08] border border-white/15 text-pearl rounded-md p-2 text-sm hover:bg-white/10 transition-colors">
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Language Hub */}
          <div className="relative group">
            <button className="bg-white/[0.08] border border-white/15 text-pearl rounded-md px-2.5 py-1.5 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer">
              <span>{
                language === 'en' ? '🇬🇧' : 
                language === 'si' ? '🇱🇰' : 
                language === 'ta' ? '🇱🇰' : 
                language === 'de' ? '🇩🇪' : 
                language === 'ru' ? '🇷🇺' :
                language === 'fr' ? '🇫🇷' :
                language === 'zh' ? '🇨🇳' :
                language === 'ar' ? '🇦🇪' : '🇯🇵'
              }</span>
              <span className="uppercase">{language}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[600]">
              {[
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'si', label: 'Sinhala', flag: '🇱🇰' },
                { code: 'ta', label: 'Tamil', flag: '🇱🇰' },
                { code: 'de', label: 'German', flag: '🇩🇪' },
                { code: 'fr', label: 'French', flag: '🇫🇷' },
                { code: 'ru', label: 'Russian', flag: '🇷🇺' },
                { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
                { code: 'ar', label: 'Arabic', flag: '🇦🇪' },
                { code: 'ja', label: 'Japanese', flag: '🇯🇵' }
              ].map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    i18n.changeLanguage(lang.code);
                  }}
                  className={`w-full px-4 py-2 text-left text-[11px] font-bold flex items-center gap-3 hover:bg-primary/10 transition-colors ${language === lang.code ? 'text-primary' : 'text-mist'}`}
                >
                  <span className="text-base">{lang.flag}</span> {lang.label}
                </button>
              ))}
            </div>
          </div>

          <CurrencySwitcher />

          <button onClick={handleAuthAction}
            className="bg-white/[0.08] border border-white/15 text-pearl rounded-md px-3 py-[7px] text-[13px] font-medium hover:bg-white/15 transition-all">
            {currentUser ? "Sign Out" : "Sign In"}
          </button>

          <Link to={PERMISSIONS.isAdmin(userRole) ? "/admin" : PERMISSIONS.isProvider(userRole) ? "/provider" : "/dashboard"}
            className="bg-gradient-to-br from-primary to-gold-dark text-primary-foreground px-4 py-[7px] rounded-md text-[13px] font-bold flex items-center gap-1.5 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
            📊 Dashboard
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900 border-t border-white/10 pb-6 animate-in slide-in-from-top duration-300">
          <div className="container px-4 mx-auto flex flex-col gap-2 pt-4">
            {/* Mobile search */}
            <form onSubmit={e => { 
              e.preventDefault(); 
              const q = (e.currentTarget.elements.namedItem("mq") as HTMLInputElement)?.value; 
              if (q?.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); setMobileMenuOpen(false); } 
            }} className="mb-4">
              <input name="mq" placeholder="🔍 Search…" className="w-full bg-white/5 border border-white/10 text-pearl placeholder:text-mist rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/40" />
            </form>
            
            {navItems.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                  location.pathname === item.path ? "bg-primary/20 text-primary" : "text-fog hover:bg-white/5"
                }`}>
                <span className="text-base">{item.icon}</span> {item.label}
              </Link>
            ))}

            <div className="h-px bg-white/5 my-4" />

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button onClick={toggleDarkMode} className="flex-1 bg-white/5 border border-white/10 text-pearl rounded-lg py-2.5 flex items-center justify-center text-sm">
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
                <button onClick={() => setShowNotifications(!showNotifications)} className="flex-1 bg-white/5 border border-white/10 text-pearl rounded-lg py-2.5 flex items-center justify-center text-sm relative">
                  🔔 Notifications
                  {unreadCount > 0 && <span className="ml-2 w-5 h-5 bg-ruby text-[10px] font-bold text-pearl rounded-full flex items-center justify-center">{unreadCount}</span>}
                </button>
              </div>

              <button onClick={() => { handleAuthAction(); setMobileMenuOpen(false); }}
                className="w-full bg-white/5 border border-white/10 text-pearl py-3 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">
                {currentUser ? "Sign Out" : "Sign In"}
              </button>

              <Link to={PERMISSIONS.isAdmin(userRole) ? "/admin" : PERMISSIONS.isProvider(userRole) ? "/provider" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-gradient-to-r from-primary to-gold-dark text-primary-foreground py-3 rounded-lg text-sm font-bold text-center shadow-lg">
                📊 Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
      <TripBundle isOpen={showBundle} onClose={() => setShowBundle(false)} />
};

export default Header;