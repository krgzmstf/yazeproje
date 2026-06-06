"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/lib/api";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Geçersiz veya eksik şifre sıfırlama tokeni.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    if (!isPasswordValid) {
      setError("Şifreniz yeterince güçlü değil veya kuralları karşılamıyor.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      setSuccess(res.message || "Şifreniz başarıyla güncellendi.");
      setTimeout(() => {
        router.push("/dashboard/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Şifre sıfırlanırken bir hata oluştu. Bağlantının süresi dolmuş olabilir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-navy border border-gold/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
      
      {/* Glow Effects */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />

      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-navy-dark border border-gold/15 rounded-full mb-3 shadow-inner">
          <Lock className="w-6 h-6 text-gold" />
        </div>
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-cream">Yeni Şifre Belirle</h2>
        <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold" /> YAZE PROJE Güvenlik
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
        <div className="flex items-center space-x-2 bg-green-950/40 border border-green-500/20 text-green-200 text-xs px-4 py-3 rounded-lg mb-6">
          <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Yeni Şifre</label>
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
          <PasswordStrengthMeter password={password} onValidationChange={setIsPasswordValid} />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-2">Yeni Şifre Tekrar</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-10 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3.5 text-cream/45 hover:text-gold transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-gold/15 active:scale-98 disabled:opacity-50 mt-2"
        >
          <span>{loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}</span>
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Navigation */}
      <div className="text-center mt-6 text-[10px]">
        <Link href="/dashboard/login" className="text-gold font-bold hover:text-gold-light transition-colors">
          Giriş Sayfasına Dön
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-navy-dark min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      <Suspense fallback={<div className="text-cream text-xs">Yükleniyor...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
