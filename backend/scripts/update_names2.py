import os

path = r'D:\yazılım\yazesym\frontend\src\pages\uygulama_sec\UygulamaSecPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace YazeSYM card text
c = c.replace("""              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide group-hover:text-[#C9A961] transition-colors">
                YazeSYM
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 h-16">
                Gelişmiş Tesis ve Yönetim Modülü. Tüm aidat, finans, sakin yönetimi ve iletişim işlemleri için ana portal.
              </p>""",
"""              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide group-hover:text-[#C9A961] transition-colors">
                SYM
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 h-16">
                Gelişmiş Apartman ve SİTE YÖNETİM MERKEZİ. Tüm aidat, finans, sakin yönetimi ve iletişim işlemleri için ana portal.
              </p>""")

# Replace YazePart card text
c = c.replace("""              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide group-hover:text-[#C9A961] transition-colors">
                YazePart
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 h-16">
                Apartman, Site Yönetimi ve Aidat Takip Modülü. Depo, envanter ve hizmet takibi için özel modül.
              </p>""",
"""              <h2 className="text-3xl font-bold text-white mb-4 tracking-wide group-hover:text-[#C9A961] transition-colors">
                APART
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 h-16">
                Apart, Rezidans yönetim merkezi.
              </p>""")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated texts successfully.')
