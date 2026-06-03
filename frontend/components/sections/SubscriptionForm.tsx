"use client";

import React, { useState } from "react";
import { Mail, Phone, User, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { subscribe } from "@/lib/api";

export default function SubscriptionForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !consent) {
      setErrorMsg("Lütfen tüm alanları doldurun ve KVKK onayını işaretleyin.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Normalize phone number for the backend regex: must contain 10 to 15 digits
    let cleanPhone = phone.replace(/[^\d+]/g, ""); // Keep only numbers and plus sign
    
    try {
      const res = await subscribe({
        email: email.trim(),
        phone: cleanPhone,
        full_name: name.trim(),
      });

      if (res.status === "success") {
        setSubmitted(true);
      } else {
        setErrorMsg(res.message || "Abonelik başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (err) {
      setErrorMsg("Abonelik kaydı yapılamadı. Lütfen daha sonra tekrar deneyiniz.");
      console.error("Subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-navy py-24 select-none relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-navy-dark border border-gold/15 rounded-2xl p-8 md:p-12 shadow-2xl max-w-4xl mx-auto">
          
          {submitted ? (
            <div className="text-center py-12 flex flex-col items-center justify-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-playfair font-bold text-2xl text-cream mb-3">
                Başarıyla Abone Oldunuz!
              </h3>
              <p className="text-sm text-cream/70 max-w-md mx-auto leading-relaxed">
                SMS ve E-posta aboneliğiniz tamamlanmıştır. En son imar güncellemeleri, gayrimenkul fırsatları ve haberler düzenli olarak tarafınıza iletilecektir.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              
              {/* Text Left */}
              <div className="lg:col-span-2">
                <span className="text-xs font-bold text-gold uppercase tracking-[0.2em] block mb-3">
                  Bilgi Akışı
                </span>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold text-cream leading-tight mb-4">
                  Çift Kanallı Bültene Abone Olun
                </h2>
                <p className="text-xs text-cream/65 leading-relaxed font-light">
                  İmar plan değişiklikleri, yeni satılık/kiralık ilanlar ve Gölbaşı yerel ihalelerinden hem SMS hem de E-posta aracılığıyla anında haberdar olmak için kaydolun.
                </p>
              </div>

              {/* Form Right */}
              <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/35 text-red-200 text-xs rounded-lg p-3">
                    {errorMsg}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60" />
                    <input
                      type="text"
                      placeholder="Ad Soyad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-navy border border-gold/15 rounded-lg text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* Phone field */}
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60" />
                    <input
                      type="tel"
                      placeholder="Telefon No (örn: 05321234567)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-navy border border-gold/15 rounded-lg text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all disabled:opacity-50"
                      required
                    />
                  </div>

                </div>

                {/* Email field */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60" />
                  <input
                    type="email"
                    placeholder="E-posta Adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-navy border border-gold/15 rounded-lg text-xs text-cream placeholder-cream/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all disabled:opacity-50"
                    required
                  />
                </div>

                {/* KVKK Consent Checkbox */}
                <div className="flex items-start space-x-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="kvkk"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 w-4 h-4 rounded border-gold/30 text-gold focus:ring-gold bg-navy cursor-pointer focus:outline-none disabled:opacity-50"
                    required
                  />
                  <label htmlFor="kvkk" className="text-[10px] text-cream/65 cursor-pointer leading-normal">
                    <span>
                      Verilerimin Bülten Gönderimi Amacıyla İşlenmesine ve İletişim Kanallarıma Bildirim Gönderilmesine İlişkin{" "}
                    </span>
                    <a href="#" className="underline text-gold hover:text-gold-light">
                      KVKK Aydınlatma Metnini
                    </a>
                    <span> okudum, onaylıyorum.</span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-navy-dark font-bold text-xs py-3.5 rounded-lg shadow-lg hover:shadow-gold/20 transition-all duration-300 hover:scale-101 disabled:opacity-75 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Kayıt Yapılıyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Abone Ol</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}
          
        </div>
      </div>
    </section>
  );
}
