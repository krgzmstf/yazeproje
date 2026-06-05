"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Phone, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { registerUser, verifyEmail, resendVerificationCode } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  
  // Registration form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Flow states
  const [step, setStep] = useState<"register" | "verify">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCooldown = () => {
    setCooldown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        email,
        full_name: fullName,
        phone: phone || null,
        password,
      });

      setSuccess("Doğrulama kodu e-postanıza gönderildi! Lütfen e-postanızı kontrol edin.");
      setStep("verify");
      startCooldown();
    } catch (err: any) {
      setError(err.message || "Kayıt olurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (verificationCode.length !== 6) {
      setError("Doğrulama kodu 6 haneli olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      await verifyEmail(email, verificationCode);
      setSuccess("E-posta adresiniz doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push("/dashboard/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Doğrulama kodu doğrulanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      await resendVerificationCode(email);
      setSuccess("Yeni doğrulama kodu e-postanıza başarıyla gönderildi.");
      startCooldown();
    } catch (err: any) {
      setError(err.message || "Yeni kod gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-navy-dark min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 select-none">
      <div className="max-w-md w-full bg-navy border border-gold/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all duration-500" />

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-navy-dark border border-gold/15 rounded-full mb-3 shadow-inner">
            {step === "register" ? (
              <User className="w-6 h-6 text-gold" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-gold" />
            )}
          </div>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-cream">
            {step === "register" ? "Yeni Hesap Oluştur" : "E-posta Doğrulama"}
          </h2>
          <p className="text-[10px] text-cream/50 uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold" /> YAZE PROJE Üyelik
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

        {step === "register" ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Mustafa Karagöz"
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-1.5">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Örn: ornek@gmail.com"
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-1.5">Telefon Numarası (İsteğe Bağlı)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-cream/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Örn: 0532..."
                  className="w-full bg-navy-dark border border-gold/10 focus:border-gold rounded-lg pl-10 pr-4 py-3 text-xs text-cream outline-none placeholder-cream/35 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-1.5">Şifre</label>
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

            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider mb-1.5">Şifre Tekrar</label>
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-gold/15 active:scale-98 disabled:opacity-50 mt-2"
            >
              <span>{loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          /* VERIFICATION CODE FORM */
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div className="text-center text-xs text-cream/70 leading-relaxed mb-4">
              Lütfen <strong className="text-cream">{email}</strong> e-posta adresine gönderdiğimiz 6 haneli doğrulama kodunu aşağıdaki alana giriniz.
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-cream/65 tracking-wider text-center mb-3">6 Haneli Doğrulama Kodu</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-navy-dark border border-gold/15 focus:border-gold rounded-lg py-4 text-center text-2xl font-mono tracking-[10px] text-gold outline-none placeholder-gold/20 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs py-3.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-gold/15 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? "Doğrulanıyor..." : "Kodu Doğrula"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center mt-6 text-xs text-cream/50 flex flex-col space-y-3">
              <div>
                E-posta ulaşmadı mı?{" "}
                {cooldown > 0 ? (
                  <span className="text-gold font-bold">{cooldown} sn sonra tekrar gönder</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-gold font-bold hover:text-gold-light transition-colors underline cursor-pointer disabled:opacity-50"
                  >
                    {resendLoading ? "Gönderiliyor..." : "Yeni Kod Gönder"}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep("register")}
                className="text-cream/40 hover:text-cream/70 text-[10px] uppercase font-bold tracking-wider transition-colors pt-2"
              >
                Bilgileri Düzenle
              </button>
            </div>
          </form>
        )}

        {/* Navigation Link (Only in Register step) */}
        {step === "register" && (
          <div className="text-center mt-6 text-[10px] text-cream/50">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/dashboard/login" className="text-gold font-bold hover:text-gold-light transition-colors ml-1">
              Giriş Yapın
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
