"use client";

import React, { useState } from "react";
import {
  Plus, Calendar, TrendingUp, Users, Clock,
  Zap, RefreshCw,
  AlertCircle, Trash2, Send,
  Sparkles, Hash, BarChart2, Target,
} from "lucide-react";

const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FbIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LiIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// ── Tipler ────────────────────────────────────────────────────────────────────

interface Platform {
  id: "instagram" | "facebook" | "twitter" | "linkedin";
  label: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  followers: number | null;
}

interface ScheduledPost {
  id: string;
  platforms: string[];
  content: string;
  imageUrl?: string;
  scheduledAt: string;
  status: "planned" | "sent" | "failed";
  source: "manual" | "ai" | "content";
}

// ── Demo veri ─────────────────────────────────────────────────────────────────

const DEMO_POSTS: ScheduledPost[] = [
  {
    id: "1",
    platforms: ["instagram", "facebook"],
    content: "İstanbul Anadolu yakasında muhteşem manzaralı 3+1 daire fırsatı! 🏙️ Deniz ve şehir manzarasını bir arada yaşayın. Detaylar için DM atın. #emlak #istanbul #daire",
    scheduledAt: "2026-06-10T09:00",
    status: "planned",
    source: "ai",
  },
  {
    id: "2",
    platforms: ["twitter", "linkedin"],
    content: "Modern mimari tasarım anlayışıyla şekillenen yeni konut projemiz inşaat aşamasına girdi. Sürdürülebilir malzemeler ve akıllı ev sistemleriyle donatılacak olan proje 2027 yılında teslim edilecek.",
    scheduledAt: "2026-06-10T12:00",
    status: "planned",
    source: "content",
  },
  {
    id: "3",
    platforms: ["instagram"],
    content: "Yaze Proje ile hayalinizdeki evi bulmak artık çok kolay! Web sitemizden binlerce ilan arasından arama yapın. 🔍 #yazeprojr #emlak #yazılım",
    scheduledAt: "2026-06-09T18:00",
    status: "sent",
    source: "ai",
  },
];

const CONTENT_SOURCES = [
  { id: "listings", label: "Emlak İlanları", icon: "🏠" },
  { id: "projects", label: "Mimari Projeler", icon: "🏛️" },
  { id: "news", label: "Haberler", icon: "📰" },
  { id: "software", label: "Yazılım Ürünleri", icon: "💻" },
];

const BEST_TIMES = [
  { time: "09:00", score: 92, label: "Sabah" },
  { time: "12:30", score: 88, label: "Öğle" },
  { time: "18:00", score: 95, label: "Akşam" },
  { time: "21:00", score: 79, label: "Gece" },
];

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function SosyalMedyaPanel() {
  const [subTab, setSubTab] = useState<"planned" | "compose" | "growth">("planned");
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: "instagram", label: "Instagram", icon: <span className="w-5 h-5 block"><IgIcon /></span>, color: "from-purple-500 to-pink-500", connected: false, followers: null },
    { id: "facebook", label: "Facebook", icon: <span className="w-5 h-5 block"><FbIcon /></span>, color: "from-blue-600 to-blue-400", connected: false, followers: null },
    { id: "twitter", label: "X (Twitter)", icon: <span className="w-5 h-5 block"><XIcon /></span>, color: "from-gray-700 to-gray-500", connected: false, followers: null },
    { id: "linkedin", label: "LinkedIn", icon: <span className="w-5 h-5 block"><LiIcon /></span>, color: "from-blue-700 to-blue-500", connected: false, followers: null },
  ]);

  // Compose form
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentMode, setContentMode] = useState<"manual" | "ai" | "content">("manual");
  const [postContent, setPostContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const [selectedSource, setSelectedSource] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>(DEMO_POSTS);

  // Platform bağlantı toggle (demo)
  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.map(p =>
      p.id === id ? { ...p, connected: !p.connected, followers: !p.connected ? Math.floor(Math.random() * 5000) + 500 : null } : p
    ));
  };

  const togglePostPlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleAiGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const samples = [
        "Yatırım değeri yüksek, konumu mükemmel! 📍 Merkezi lokasyonda modern tasarımlı dairelerimiz hakkında bilgi almak için bize ulaşın. #emlak #yatırım #gayrimenkul",
        "Mimari estetiği ile öne çıkan projemiz, yaşam standartlarını yeniden tanımlıyor. Ayrıntılar için web sitemizi ziyaret edin! 🏗️ #mimari #tasarım #modern",
        "Teknoloji ve konforu bir arada sunan akıllı ev sistemlerimizle tanışın. Geleceğin yaşam alanları bugün sizin için hazır! 🏠✨ #akıllıev #yazılım #teknoloji",
      ];
      setPostContent(samples[Math.floor(Math.random() * samples.length)]);
      setAiGenerating(false);
    }, 1500);
  };

  const handleSchedule = () => {
    if (!postContent || selectedPlatforms.length === 0) return;
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platforms: selectedPlatforms,
      content: postContent,
      scheduledAt: `${scheduleDate}T${scheduleTime}`,
      status: "planned",
      source: contentMode,
    };
    setPosts(prev => [newPost, ...prev]);
    setPostContent("");
    setSelectedPlatforms([]);
    setScheduleDate("");
    setSubTab("planned");
  };

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="flex flex-col h-full space-y-4">

      {/* ── Platform Kartları ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {platforms.map(p => (
          <div
            key={p.id}
            className={`relative bg-navy border rounded-xl p-4 transition-all cursor-pointer ${
              p.connected ? "border-gold/30 shadow-lg shadow-gold/5" : "border-gold/10 hover:border-gold/20"
            }`}
            onClick={() => togglePlatform(p.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${p.color} text-white`}>
                {p.icon}
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${p.connected ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-cream/20"}`} />
            </div>
            <p className="text-[10px] font-bold text-cream/60 uppercase tracking-wider">{p.label}</p>
            {p.connected && p.followers !== null ? (
              <p className="text-sm font-bold text-gold mt-0.5">{p.followers.toLocaleString("tr-TR")} <span className="text-[9px] text-cream/40 font-normal">takipçi</span></p>
            ) : (
              <p className="text-[10px] text-cream/30 mt-0.5">Bağlantı kur</p>
            )}
          </div>
        ))}
      </div>

      {connectedCount === 0 && (
        <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200">Platform bağlantısı için karta tıklayın (demo modu). Gerçek bağlantı için API anahtarları gereklidir.</p>
        </div>
      )}

      {/* ── Alt Sekmeler ───────────────────────────────────────────── */}
      <div className="flex gap-2 shrink-0">
        {[
          { id: "planned", label: "Planlanan", icon: <Calendar className="w-3.5 h-3.5" /> },
          { id: "compose", label: "Yeni Paylaşım", icon: <Plus className="w-3.5 h-3.5" /> },
          { id: "growth", label: "Takipçi Büyüme", icon: <TrendingUp className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === t.id
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-cream/60 hover:text-cream border border-transparent hover:bg-navy-dark"
            }`}
          >
            {t.icon}
            {t.label}
            {t.id === "planned" && (
              <span className="bg-gold/20 text-gold text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {posts.filter(p => p.status === "planned").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Planlanan Paylaşımlar ──────────────────────────────────── */}
      {subTab === "planned" && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-10 h-10 text-gold/20 mb-3" />
              <p className="text-sm text-cream/40">Henüz planlanmış paylaşım yok</p>
              <button onClick={() => setSubTab("compose")} className="mt-3 text-xs text-gold hover:underline">Yeni paylaşım oluştur →</button>
            </div>
          )}
          {posts.map(post => (
            <div key={post.id} className="bg-navy border border-gold/10 rounded-xl p-4 hover:border-gold/20 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Platform ikonları */}
                  <div className="flex items-center gap-2 mb-2">
                    {post.platforms.map(pid => {
                      const pl = platforms.find(p => p.id === pid);
                      return pl ? (
                        <span key={pid} className={`p-1 rounded-md bg-gradient-to-br ${pl.color} text-white w-5 h-5 flex items-center justify-center`}>
                          {pl.icon}
                        </span>
                      ) : null;
                    })}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      post.status === "sent" ? "bg-emerald-900/40 text-emerald-400" :
                      post.status === "failed" ? "bg-red-900/40 text-red-400" :
                      "bg-gold/10 text-gold"
                    }`}>
                      {post.status === "sent" ? "Gönderildi" : post.status === "failed" ? "Başarısız" : "Planlandı"}
                    </span>
                    <span className="text-[9px] text-cream/30 uppercase tracking-wider">
                      {post.source === "ai" ? "✨ AI" : post.source === "content" ? "📦 İçerik" : "✏️ Manuel"}
                    </span>
                  </div>
                  <p className="text-xs text-cream/80 line-clamp-2 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-cream/40">
                    <Clock className="w-3 h-3" />
                    {new Date(post.scheduledAt).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {post.status === "planned" && (
                    <button onClick={() => handleDelete(post.id)} className="p-1.5 text-cream/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Yeni Paylaşım ─────────────────────────────────────────── */}
      {subTab === "compose" && (
        <div className="flex-1 overflow-y-auto">
          <div className="bg-navy border border-gold/10 rounded-xl p-5 space-y-5">

            {/* Platform seçimi */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">Platform Seç</label>
              <div className="flex flex-wrap gap-2">
                {platforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePostPlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedPlatforms.includes(p.id)
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-gold/10 text-cream/50 hover:border-gold/20 hover:text-cream/70"
                    }`}
                  >
                    <span className={`bg-gradient-to-br ${p.color} text-white p-0.5 rounded w-5 h-5 flex items-center justify-center shrink-0`}>
                      {p.icon}
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* İçerik modu */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">İçerik Kaynağı</label>
              <div className="flex gap-2">
                {[
                  { id: "manual", label: "Manuel Yaz", icon: "✏️" },
                  { id: "ai", label: "AI ile Üret", icon: "✨" },
                  { id: "content", label: "Mevcut İçerik", icon: "📦" },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setContentMode(m.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      contentMode === m.id
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-gold/10 text-cream/50 hover:border-gold/20"
                    }`}
                  >
                    <span>{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mevcut içerik kaynağı seçimi */}
            {contentMode === "content" && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">İçerik Türü</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CONTENT_SOURCES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSource(s.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSource === s.id
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-gold/10 text-cream/50 hover:border-gold/20"
                      }`}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI üret butonu */}
            {contentMode === "ai" && (
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-dark text-navy-dark rounded-lg text-xs font-bold shadow-md disabled:opacity-60 transition-all"
              >
                {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {aiGenerating ? "İçerik üretiliyor..." : "AI ile İçerik Üret"}
              </button>
            )}

            {/* İçerik kutusu */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">Paylaşım Metni</label>
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                rows={4}
                placeholder="Paylaşım metninizi buraya yazın veya AI ile üretin..."
                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-xl px-4 py-3 text-xs text-cream placeholder-cream/25 outline-none transition-colors resize-none"
              />
              <p className="text-[9px] text-cream/30 mt-1 text-right">{postContent.length} karakter</p>
            </div>

            {/* Zamanlama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">Tarih</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">Saat</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">Tekrar</label>
                <select
                  value={repeat}
                  onChange={e => setRepeat(e.target.value)}
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg px-3 py-2 text-xs text-cream outline-none transition-colors"
                >
                  <option value="none">Tekrar Yok</option>
                  <option value="daily">Her Gün</option>
                  <option value="weekly">Her Hafta</option>
                  <option value="monthly">Her Ay</option>
                </select>
              </div>
            </div>

            {/* En iyi saatler */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">
                <Zap className="w-3 h-3 inline mr-1" />
                Önerilen Paylaşım Saatleri
              </label>
              <div className="flex gap-2 flex-wrap">
                {BEST_TIMES.map(t => (
                  <button
                    key={t.time}
                    onClick={() => setScheduleTime(t.time)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                      scheduleTime === t.time
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-gold/10 text-cream/50 hover:border-gold/20"
                    }`}
                  >
                    <span>{t.time}</span>
                    <span className="text-cream/30">{t.label}</span>
                    <span className="text-emerald-400">%{t.score}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gönder */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSchedule}
                disabled={!postContent || selectedPlatforms.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-dark text-navy-dark rounded-lg text-xs font-bold shadow-md disabled:opacity-50 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                Planla
              </button>
              <button
                disabled={!postContent || selectedPlatforms.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-navy-dark border border-gold/20 hover:border-gold/40 text-gold rounded-lg text-xs font-bold disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Şimdi Paylaş
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Takipçi Büyüme ────────────────────────────────────────── */}
      {subTab === "growth" && (
        <div className="flex-1 overflow-y-auto space-y-4">

          {/* Genel istatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Toplam Takipçi", value: platforms.filter(p => p.connected).reduce((s, p) => s + (p.followers || 0), 0).toLocaleString("tr-TR"), icon: <Users className="w-4 h-4" />, color: "text-gold" },
              { label: "Bu Hafta Kazanılan", value: "+247", icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-400" },
              { label: "Planlanan Gönderi", value: posts.filter(p => p.status === "planned").length.toString(), icon: <Calendar className="w-4 h-4" />, color: "text-blue-400" },
              { label: "Etkileşim Oranı", value: "%4.2", icon: <BarChart2 className="w-4 h-4" />, color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="bg-navy border border-gold/10 rounded-xl p-4">
                <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-cream/40 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hashtag önerileri */}
          <div className="bg-navy border border-gold/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-gold" />
              <h3 className="text-xs font-bold text-cream uppercase tracking-wider">Önerilen Hashtagler</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {["#emlak", "#istanbul", "#gayrimenkul", "#daire", "#satılık", "#kiralık", "#mimari", "#tasarım", "#yazılım", "#teknoloji", "#yazeprojr", "#konut", "#yatırım", "#modern"].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-navy-dark border border-gold/10 rounded-lg text-[10px] text-cream/60 hover:text-gold hover:border-gold/30 cursor-pointer transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Büyüme araçları */}
          <div className="bg-navy border border-gold/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-gold" />
              <h3 className="text-xs font-bold text-cream uppercase tracking-wider">Büyüme Araçları</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: "Hedef Kitle Analizi", desc: "Takipçi demografisi ve ilgi alanlarını analiz et", badge: "Yakında" },
                { title: "Rakip Takip", desc: "Sektördeki rakip hesapları izle ve karşılaştır", badge: "Yakında" },
                { title: "Otomatik Yorum Yanıtlama", desc: "AI destekli yorum ve mesaj yönetimi", badge: "Yakında" },
                { title: "Influencer Eşleştirme", desc: "Sektörel influencer'larla iş birliği fırsatları", badge: "Yakında" },
              ].map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-navy-dark rounded-lg border border-gold/5 hover:border-gold/15 transition-all">
                  <div>
                    <p className="text-xs font-semibold text-cream">{tool.title}</p>
                    <p className="text-[10px] text-cream/40 mt-0.5">{tool.desc}</p>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                    {tool.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
