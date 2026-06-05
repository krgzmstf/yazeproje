"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccess(res.message || "Şifre sıfırlama bağlantısı gönderildi.");
      setEmail("");
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
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-cream">Şifremi Unuttum</h2>
          <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold" /> YAZE PROJE Şifre Sıfırlama
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-950/40 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-lg mb-6 animate-shake">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex flex-col space-y-2 bg-green-950/40 border border-green-500/20 text-green-200 text-xs px-4 py-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
              <span className="font-bold">Bağlantı Gönderildi</span>
            </div>
            <p className="text-[10px] text-cream/70 leading-relaxed">
              Eğer girilen e-posta adresi sistemde kayıtlı ise, şifre sıfırlama yönergesini içeren bağlantı gönderilmiştir.
              <br />
              <span className="text-gold font-bold">Not:</span> Yerel geliştirme ortamında, sıfırlama bağlantısını görmek için arka uç (backend) konsol/terminal çıktılarını kontrol edebilirsiniz.
            </p>
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
                placeholder="Hesabınıza kayıtlı e-posta adresi"
                className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-gold/15 active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Return to Login */}
        <div className="text-center mt-6 text-[10px]">
          <Link href="/dashboard/login" className="text-gold font-bold hover:text-gold-light transition-colors">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
