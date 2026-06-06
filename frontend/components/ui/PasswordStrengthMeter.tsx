"use client";

import React, { useMemo } from "react";
import zxcvbn from "zxcvbn";
import { Check, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

export default function PasswordStrengthMeter({
  password,
  onValidationChange,
}: PasswordStrengthMeterProps) {
  // Rules checking
  const rules = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`-]/.test(password);

    return {
      hasMinLength,
      hasUpperAndLower,
      hasDigit,
      hasSpecial,
    };
  }, [password]);

  // zxcvbn analysis
  const analysis = useMemo(() => {
    if (!password) {
      return { score: 0, warning: "", suggestions: [] };
    }
    const result = zxcvbn(password);
    
    // Turkish translations for common zxcvbn warning/suggestions
    const translateWarning = (warn: string) => {
      const translations: Record<string, string> = {
        "This is a top-10 common password": "Bu en yaygın 10 şifreden biridir.",
        "This is a top-100 common password": "Bu en yaygın 100 şifreden biridir.",
        "This is a very common password": "Bu çok yaygın bir şifredir.",
        "This is similar to a commonly used password": "Bu sık kullanılan bir şifreye benziyor.",
        "A word by itself is easy to guess": "Tek başına bir kelimeyi tahmin etmek kolaydır.",
        "Names and surnames by themselves are easy to guess": "Yalnızca isim ve soyisimleri tahmin etmek kolaydır.",
        "Common names and surnames are easy to guess": "Yaygın isim ve soyisimleri tahmin etmek kolaydır.",
        "Straight rows of keys are easy to guess": "Klavye üzerindeki ardışık tuş dizilerini tahmin etmek kolaydır.",
        "Short keyboard patterns are easy to guess": "Kısa klavye desenlerini tahmin etmek kolaydır.",
        "Repeats like \"aaa\" are easy to guess": "\"aaa\" gibi tekrarları tahmin etmek kolaydır.",
        "Repeats like \"abcabcabc\" are only slightly harder to guess than \"abc\"": "Tekrarlanan şablonları tahmin etmek kolaydır.",
        "Sequences like \"abc\" or \"6543\" are easy to guess": "\"abc\" veya \"6543\" gibi ardışık dizileri tahmin etmek kolaydır.",
        "Recent years are easy to guess": "Yakın yıllara ait tarihleri tahmin etmek kolaydır.",
        "Dates are easy to guess": "Tarihleri tahmin etmek kolaydır.",
        "This is a association-based password": "Bu tahmin edilebilir bir ilişkilendirme içeriyor.",
      };
      return translations[warn] || warn;
    };

    const translateSuggestion = (sug: string) => {
      const translations: Record<string, string> = {
        "Use a few words, avoid common phrases": "Birkaç kelime kullanın, yaygın ifadelerden kaçının.",
        "No need for symbols, digits, or uppercase letters": "Fazladan sembol, rakam veya büyük harf gerekmez (kelime sayısı çoksa).",
        "Add another word or two. Uncommon words are better.": "Bir veya iki kelime daha ekleyin. Yaygın olmayan kelimeler daha iyidir.",
        "Avoid printable keyboard patterns": "Klavye üzerindeki sıralı tuşlardan kaçının.",
        "Avoid consecutive sequence of keys": "Klavye üzerindeki ardışık tuş dizilerinden kaçının.",
        "Avoid repetitions": "Tekrarlardan kaçının.",
        "Avoid sequences": "Sıralı dizilerden kaçının.",
        "Avoid recent years": "Yakın yıllara ait tarihleri kullanmaktan kaçının.",
        "Avoid dates and years that are associated with you": "Sizinle ilişkili tarihleri ve yılları kullanmaktan kaçının.",
        "Avoid using your name, email or other personal info": "Adınızı, e-postanızı veya kişisel bilgilerinizi kullanmaktan kaçının.",
        "Use a longer keyboard pattern with more turns": "Daha karmaşık ve kıvrımlı klavye desenleri kullanın.",
      };
      return translations[sug] || sug;
    };

    const rawWarning = result.feedback?.warning || "";
    const rawSuggestions = result.feedback?.suggestions || [];

    return {
      score: result.score,
      warning: translateWarning(rawWarning),
      suggestions: rawSuggestions.map(translateSuggestion),
    };
  }, [password]);

  // Combined validity check
  const isValid = useMemo(() => {
    const rulesOk = Object.values(rules).every(Boolean);
    const scoreOk = !password || analysis.score >= 3;
    const finalVal = password.length > 0 && rulesOk && scoreOk;
    
    // Notify parent component
    if (onValidationChange) {
      onValidationChange(finalVal);
    }
    return finalVal;
  }, [rules, analysis.score, password, onValidationChange]);

  // Visual meter styling based on score
  const scoreInfo = useMemo(() => {
    if (!password) {
      return { color: "bg-cream/10", width: "w-0", text: "Şifre girilmedi", labelColor: "text-cream/40" };
    }
    switch (analysis.score) {
      case 0:
        return { color: "bg-red-500", width: "w-1/5", text: "Çok Zayıf", labelColor: "text-red-400" };
      case 1:
        return { color: "bg-orange-500", width: "w-2/5", text: "Zayıf", labelColor: "text-orange-400" };
      case 2:
        return { color: "bg-yellow-500", width: "w-3/5", text: "Orta", labelColor: "text-yellow-400" };
      case 3:
        return { color: "bg-lime-500", width: "w-4/5", text: "Güçlü", labelColor: "text-lime-400" };
      case 4:
        return { color: "bg-emerald-500", width: "w-full", text: "Çok Güçlü", labelColor: "text-emerald-400" };
      default:
        return { color: "bg-cream/10", width: "w-0", text: "Çok Zayıf", labelColor: "text-cream/40" };
    }
  }, [analysis.score, password]);

  if (!password) return null;

  return (
    <div className="mt-3.5 space-y-3 p-4 bg-navy-dark/60 border border-gold/10 rounded-xl animate-fade-in text-[11px]">
      {/* Visual strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
          <span className="text-cream/60 uppercase">ŞİFRE GÜCÜ</span>
          <span className={`${scoreInfo.labelColor} uppercase font-extrabold flex items-center gap-1`}>
            {analysis.score < 3 ? (
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            ) : analysis.score === 3 ? (
              <Shield className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            )}
            {scoreInfo.text}
          </span>
        </div>
        <div className="h-1.5 w-full bg-navy-dark border border-gold/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${scoreInfo.color} ${scoreInfo.width} transition-all duration-500 ease-out`}
          />
        </div>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gold/5 pt-2.5">
        <div className="flex items-center space-x-2">
          {rules.hasMinLength ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-cream/20 shrink-0" />
          )}
          <span className={rules.hasMinLength ? "text-cream/90" : "text-cream/40"}>En az 8 Karakter</span>
        </div>

        <div className="flex items-center space-x-2">
          {rules.hasUpperAndLower ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-cream/20 shrink-0" />
          )}
          <span className={rules.hasUpperAndLower ? "text-cream/90" : "text-cream/40"}>Büyük & Küçük Harf</span>
        </div>

        <div className="flex items-center space-x-2">
          {rules.hasDigit ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-cream/20 shrink-0" />
          )}
          <span className={rules.hasDigit ? "text-cream/90" : "text-cream/40"}>En az 1 Rakam</span>
        </div>

        <div className="flex items-center space-x-2">
          {rules.hasSpecial ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-cream/20 shrink-0" />
          )}
          <span className={rules.hasSpecial ? "text-cream/90" : "text-cream/40"}>Özel Karakter (!@#...)</span>
        </div>
      </div>

      {/* Warning and Suggestions */}
      {(analysis.warning || analysis.suggestions.length > 0) && (
        <div className="border-t border-gold/5 pt-2 text-[10px] leading-relaxed space-y-1 bg-amber-950/20 px-2.5 py-2 rounded-lg border border-amber-500/10">
          {analysis.warning && (
            <p className="text-amber-300 font-semibold">
              ⚠️ {analysis.warning}
            </p>
          )}
          {analysis.suggestions.map((suggestion, index) => (
            <p key={index} className="text-cream/70 pl-3.5 relative">
              <span className="absolute left-1">•</span> {suggestion}
            </p>
          ))}
        </div>
      )}

      {/* Safety feedback */}
      {!isValid && (
        <p className="text-[10px] text-red-400/90 font-medium text-center">
          Kayıt işlemi için şifre kuralları karşılanmalı ve "Güçlü" olmalıdır.
        </p>
      )}
    </div>
  );
}
