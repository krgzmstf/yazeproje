"use client";

import React from "react";
import { Phone, Mail, Globe } from "lucide-react";

interface TopBarProps {
  settings?: Record<string, any>;
}

export default function TopBar({ settings = {} }: TopBarProps) {
  const phone = settings.contact_phone || "0312 444 0 999";
  const email = settings.contact_email || "info@yazeproje.com";

  // Clean phone string for tel: link (remove spaces)
  const telLink = `tel:${phone.replace(/\s+/g, "")}`;
  const mailLink = `mailto:${email}`;

  return (
    <div className="bg-navy-dark/95 backdrop-blur-sm text-cream/80 border-b border-gold/10 text-xs py-2.5 px-4 md:px-8 hidden md:block select-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Contact Info */}
        <div className="flex items-center space-x-6">
          <a
            href={telLink}
            className="flex items-center space-x-2 hover:text-gold transition-colors duration-200"
          >
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span>{phone}</span>
          </a>
          <a
            href={mailLink}
            className="flex items-center space-x-2 hover:text-gold transition-colors duration-200"
          >
            <Mail className="w-3.5 h-3.5 text-gold" />
            <span>{email}</span>
          </a>
        </div>

        {/* Right Side: Social Media + Lang Switch */}
        <div className="flex items-center space-x-6">
          {/* Social Icons - Circular badges */}
          <div className="flex items-center space-x-2.5 border-r border-cream/20 pr-6">
            {settings.social_facebook && (
              <a
                href={settings.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-cream/5 border border-cream/25 flex items-center justify-center text-cream hover:bg-[#3b5998] hover:border-transparent hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
            )}
            {settings.social_twitter && (
              <a
                href={settings.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-cream/5 border border-cream/25 flex items-center justify-center text-cream hover:bg-black hover:border-transparent hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="Twitter (X)"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {settings.social_instagram && (
              <a
                href={settings.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-cream/5 border border-cream/25 flex items-center justify-center text-cream hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:border-transparent hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            )}
            {settings.social_youtube && (
              <a
                href={settings.social_youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-cream/5 border border-cream/25 flex items-center justify-center text-cream hover:bg-[#ff0000] hover:border-transparent hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="YouTube"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {settings.social_linkedin && (
              <a
                href={settings.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-cream/5 border border-cream/25 flex items-center justify-center text-cream hover:bg-[#0077b5] hover:border-transparent hover:text-white hover:scale-105 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
          </div>

          {/* Language Switch */}
          <div className="flex items-center space-x-2 cursor-pointer hover:text-gold transition-colors duration-200">
            <Globe className="w-3.5 h-3.5 text-gold" />
            <span className="font-semibold">TR</span>
            <span className="text-cream/40">|</span>
            <span className="text-cream/50 hover:text-gold">EN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
