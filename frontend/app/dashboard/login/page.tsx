"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiBase = typeof window !== "undefined" && window.location.hostname.includes("yazeproje.com")
        ? "https://api.yazeproje.com/api/v1"
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:1002/api/v1");
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Trigger standard storage event for Header component tracking
      window.dispatchEvent(new Event("storage"));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy-dark min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      <div className="max-w-md w-full bg-navy border border-gold/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-navy-dark border border-gold/15 rounded-full mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-gold" />
          </div>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-cream">Yönetim Paneli</h2>
          <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold" /> YAZE PROJE CMS
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-950/40 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-lg mb-6 animate-shake">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">E-posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Örn: mimar@yazeproje.com"
                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-10 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-cream/45 hover:text-gold transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold">
            <Link href="/dashboard/forgot-password" className="text-gold hover:text-gold-light transition-colors">
              Şifremi Unuttum
            </Link>
            <Link href="/dashboard/register" className="text-cream/50 hover:text-cream transition-colors">
              Yeni Hesap Oluştur
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-gold/15 active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? "Giriş Yapılıyor..." : "Giriş Yap"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Sub Info */}
        <div className="text-center mt-6 text-[10px] text-cream/40">
          YAZE Proje Yönetim Paneli
        </div>
      </div>
    </div>
  );
}
