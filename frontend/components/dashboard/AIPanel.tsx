"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  aiGenerateEmail,
  aiGenerateProjectDescription,
  aiAnalyzeMessage,
} from "@/lib/api";

type Tab = "email" | "description" | "analyze";

export default function AIPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("email");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Email form
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [service, setService] = useState("");

  // Description form
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [features, setFeatures] = useState("");

  // Analyze form
  const [message, setMessage] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await aiGenerateEmail(companyName, contactName, service);
      setResult(res.email);
    } catch {
      setError("AI yanıt vermedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await aiGenerateProjectDescription(
        projectName,
        projectType,
        features,
      );
      setResult(res.description);
    } catch {
      setError("AI yanıt vermedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await aiAnalyzeMessage(message);
      const parsed = JSON.parse(res.analysis);
      setResult(JSON.stringify(parsed, null, 2));
    } catch {
      setError("AI yanıt vermedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-navy border border-gold/20 rounded-lg px-3 py-2 text-xs text-cream placeholder-cream/30 focus:outline-none focus:border-gold/50 transition-colors";
  const labelClass =
    "block text-[10px] text-cream/50 uppercase tracking-wider mb-1";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "email",
      label: "Lead Email",
      icon: <Mail className="w-3.5 h-3.5" />,
    },
    {
      id: "description",
      label: "Proje Açıklaması",
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: "analyze",
      label: "Mesaj Analizi",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="border-b border-gold/10 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <h2 className="font-playfair text-2xl font-bold text-cream">
            AI Asistan
          </h2>
        </div>
        <p className="text-xs text-cream/50 mt-1">
          GPT-4.1 destekli içerik üretimi
        </p>
      </div>

      {/* Tab butonları */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setResult("");
              setError("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gold text-navy-dark"
                : "bg-navy border border-gold/20 text-cream/70 hover:text-gold"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-navy border border-gold/10 rounded-xl p-5">
          {activeTab === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Şirket Adı *</label>
                <input
                  className={inputClass}
                  placeholder="ABC Apartman Yönetimi"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Yetkili Adı</label>
                <input
                  className={inputClass}
                  placeholder="Ahmet Bey"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Sunulan Hizmet *</label>
                <input
                  className={inputClass}
                  placeholder="Apartman yönetim yazılımı"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold text-navy-dark text-xs font-bold py-2.5 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? "Üretiliyor..." : "Email Yaz"}
              </button>
            </form>
          )}

          {activeTab === "description" && (
            <form onSubmit={handleDescriptionSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Proje Adı *</label>
                <input
                  className={inputClass}
                  placeholder="YazeProje"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Proje Türü *</label>
                <input
                  className={inputClass}
                  placeholder="Web Uygulaması"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Özellikler *</label>
                <textarea
                  className={`${inputClass} resize-none h-20`}
                  placeholder="Proje yönetimi, real estate, blog..."
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold text-navy-dark text-xs font-bold py-2.5 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? "Üretiliyor..." : "Açıklama Yaz"}
              </button>
            </form>
          )}

          {activeTab === "analyze" && (
            <form onSubmit={handleAnalyzeSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Müşteri Mesajı *</label>
                <textarea
                  className={`${inputClass} resize-none h-40`}
                  placeholder="Müşteriden gelen mesajı buraya yapıştır..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gold text-navy-dark text-xs font-bold py-2.5 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {loading ? "Analiz Ediliyor..." : "Mesajı Analiz Et"}
              </button>
            </form>
          )}
        </div>

        {/* Sonuç */}
        <div className="bg-navy border border-gold/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-cream/50 uppercase tracking-wider">
              Sonuç
            </span>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[10px] text-cream/50 hover:text-gold transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Kopyalandı" : "Kopyala"}
              </button>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {!result && !error && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-cream/20 text-center">
                Formu doldurup butona bas,
                <br />
                AI sonucu burada görünecek.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          )}

          {result && (
            <pre className="text-xs text-cream/80 whitespace-pre-wrap font-sans leading-relaxed overflow-auto flex-1">
              {result}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
