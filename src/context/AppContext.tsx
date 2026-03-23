import React, { createContext, useContext, useState, useCallback } from "react";
import { AppData, UserRole } from "@/types/pearl-hub";
import { INITIAL_DATA } from "@/data/pearl-hub-data";

interface RecentlyViewed {
  id: string;
  title: string;
  type: "property" | "stay" | "vehicle" | "event";
  price?: number;
  image: string;
  location: string;
  viewedAt: number;
}

export interface CompareItem {
  id: string;
  title: string;
  itemType: string;
  location: string;
  price?: number;
  priceUnit?: string;
  rating?: number;
  subtype?: string;
  details?: string;
  features?: string;
}

interface AppContextType {
  data: AppData;
  currentUser: UserRole;
  setCurrentUser: (role: UserRole) => void;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  toast: { message: string; type: string; id: number } | null;
  clearToast: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notifications: Notification[];
  addNotification: (title: string, message: string) => void;
  markNotificationRead: (id: number) => void;
  recentlyViewed: RecentlyViewed[];
  addRecentlyViewed: (item: Omit<RecentlyViewed, "viewedAt">) => void;
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data] = useState<AppData>(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState<UserRole>("customer");
  const [toast, setToast] = useState<{ message: string; type: string; id: number } | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Welcome to Pearl Hub!", message: "Explore properties, stays, vehicles and events across Sri Lanka.", read: false, time: "Just now" },
    { id: 2, title: "New Properties Listed", message: "12 new properties have been added in Colombo area.", read: false, time: "2 hours ago" },
    { id: 3, title: "Special Offer", message: "Get 10% off on your first vehicle rental booking.", read: true, time: "1 day ago" },
  ]);

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>(() => {
    try {
      const stored = localStorage.getItem("pearl-hub-recent");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const showToast = useCallback((message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }, []);

  const addNotification = useCallback((title: string, message: string) => {
    setNotifications(prev => [{ id: Date.now(), title, message, read: false, time: "Just now" }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addRecentlyViewed = useCallback((item: Omit<RecentlyViewed, "viewedAt">) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== item.id);
      const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, 10);
      localStorage.setItem("pearl-hub-recent", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToCompare = useCallback((item: CompareItem) => {
    setCompareItems(prev => {
      if (prev.find(c => c.id === item.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareItems(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareItems([]), []);

  return (
    <AppContext.Provider value={{ data, currentUser, setCurrentUser, showToast, toast, clearToast, favorites, toggleFavorite, notifications, addNotification, markNotificationRead, recentlyViewed, addRecentlyViewed, compareItems, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </AppContext.Provider>
  );
};
