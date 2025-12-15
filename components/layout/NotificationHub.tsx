"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, Sparkles, Phone, Headset, ArrowRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { db } from "@/firebase/client"; // Use Client SDK
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from "firebase/firestore";
import { getCurrentUser } from "@/lib/actions/auth.action"; 

// ... existing code

// Function inside component
// const sendTestNotification = async () => {
//     if (!userId) return;
//     try {
//         await addDoc(collection(db, "users", userId, "notifications"), {
//             title: "Test Notification",
//             message: "This is a test notification from the client.",
//             type: "info",
//             read: false,
//             createdAt: serverTimestamp()
//         });
//     } catch (e) {
//         console.error("Error sending test notification:", e);
//     }
// };

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "interview" | "call" | "redirect";
  createdAt: any; // Firestore timestamp
  read: boolean;
  timestamp?: string; // Formatted for display
}

// Helper to format date
const formatTime = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000); // minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff/60)} hr ago`;
    return `${Math.floor(diff/1440)} day ago`;
}

export const NotificationHub = ({ userId }: { userId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const hubRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);

  // Sound Map
  const soundMap: Record<string, string | undefined> = {
    success: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3", // Beep (CV)
    info: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    warning: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    interview: "https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3", // Smooth Tech Start (Interview Created)
    call: "https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3", // Short Blip (Call)
    redirect: "https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3", // Smooth Tech Start (Redirect)
  };

  // Listen to Firestore
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: formatTime(doc.data().createdAt)
        })) as Notification[];

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter((n) => !n.read).length);

        // Play sound for NEW unread notifications
        if (!isInitialLoad.current) {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data() as Notification;
                    if (!data.read) {
                        const soundUrl = soundMap[data.type];
                        if (soundUrl) {
                            const audio = new Audio(soundUrl);
                            audio.volume = 0.5;
                            audio.play().catch(e => console.log("Audio play failed", e));
                        }
                    }
                }
            });
        }
        isInitialLoad.current = false;
    });

    return () => unsubscribe();
  }, [userId]);




  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    if (!userId) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
        if (!n.read) {
            batch.update(doc(db, "users", userId, "notifications", n.id), { read: true });
        }
    });
    try {
        await batch.commit();
    } catch(e) { console.error("Mark read failed", e); }
  };

  const clearAll = async () => {
    if (!userId || notifications.length === 0) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
        batch.delete(doc(db, "users", userId, "notifications", n.id));
    });
    try {
        await batch.commit();
        setIsOpen(false);
    } catch(e) { console.error("Clear failed", e); }
  };

  return (
    <div className="relative" ref={hubRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-full transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
      >
        <Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-4 w-80 sm:w-96 bg-black/95 backdrop-blur-2xl border border-neon-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden z-50 ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-neon-cyan/5 to-transparent">
              <h3 className="font-bold text-white tracking-wide text-sm uppercase flex items-center gap-2">
                <Bell className="w-4 h-4 text-neon-cyan" />
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold tracking-wider text-neon-cyan hover:text-white uppercase transition-colors border border-neon-cyan/30 px-2 py-1 rounded hover:bg-neon-cyan/20"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan/20 scrollbar-track-transparent">
              {notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3 opacity-50">
                  <Bell className="w-12 h-12 text-gray-600" />
                  <p className="text-gray-400 text-sm font-medium">No new notifications</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative",
                        !notification.read ? "bg-neon-cyan/5" : "opacity-80 hover:opacity-100"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                            "mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                            notification.type === "success" && "border-green-500 text-green-500 bg-green-500/10",
                            notification.type === "info" && "border-blue-500 text-blue-400 bg-blue-500/10",
                            notification.type === "warning" && "border-yellow-400 text-yellow-400 bg-yellow-400/10",
                            notification.type === "interview" && "border-purple-500 text-purple-500 bg-purple-500/10",
                            notification.type === "call" && "border-neon-cyan text-neon-cyan bg-neon-cyan/10",
                            notification.type === "redirect" && "border-orange-500 text-orange-500 bg-orange-500/10",
                        )}>
                            {notification.type === "success" && <Check className="w-5 h-5 drop-shadow-[0_0_5px_currentColor]" />}
                            {notification.type === "info" && <Info className="w-5 h-5 drop-shadow-[0_0_5px_currentColor]" />}
                            {notification.type === "warning" && <AlertTriangle className="w-5 h-5 drop-shadow-[0_0_5px_currentColor]" />}
                            {notification.type === "interview" && <Sparkles className="w-5 h-5 drop-shadow-[0_0_5px_currentColor]" />}
                            {notification.type === "call" && <Headset className="w-5 h-5 drop-shadow-[0_0_5px_currentColor]" />}
                            {notification.type === "redirect" && <ArrowRight className="w-5 h-5 drop-shadow-[0_0_5px_currentColor]" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className={cn("text-sm font-bold tracking-tight", !notification.read ? "text-white" : "text-gray-400")}>
                                {notification.title}
                            </h4>
                            <span className="text-[10px] font-mono text-gray-500 bg-black/50 px-1.5 py-0.5 rounded border border-white/5">{notification.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed font-light">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-2 border-t border-white/10 bg-black/40 text-center">
                <button 
                    onClick={clearAll}
                    className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors py-1 flex items-center justify-center gap-2 w-full"
                >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

