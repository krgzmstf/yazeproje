import os

# 1. Update UygulamaSecPage.tsx names (YazeSYM -> SYM, YazePart -> Apart)
path = r'D:\yazılım\yazesym\frontend\src\pages\uygulama_sec\UygulamaSecPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('>YazeSYM<', '>SYM<')
c = c.replace('>YazePart<', '>Apart<')
c = c.replace('Apartman, Site ve Tesis Yönetim Sistemi.', 'Gelişmiş Tesis ve Yönetim Modülü.')
c = c.replace('Yedek Parça, Stok ve Teknik Servis Yönetim Sistemi.', 'Apartman, Site Yönetimi ve Aidat Takip Modülü.')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

# 2. Update Header.tsx and Sidebar.tsx to reflect the new names
header_path = r'D:\yazılım\yazesym\frontend\src\components\layout\Header.tsx'
if os.path.exists(header_path):
    with open(header_path, 'r', encoding='utf-8') as f:
        hd = f.read()
    hd = hd.replace("currentApp === 'yazepart' ? 'Yedek Parça Sistemi' : 'Apartman Yönetim Sistemi'", "currentApp === 'yazepart' ? 'Apart Yönetim' : 'SYM Sistemi'")
    with open(header_path, 'w', encoding='utf-8') as f:
        f.write(hd)

sidebar_path = r'D:\yazılım\yazesym\frontend\src\components\layout\Sidebar.tsx'
if os.path.exists(sidebar_path):
    with open(sidebar_path, 'r', encoding='utf-8') as f:
        sb = f.read()
    sb = sb.replace("currentApp === 'yazepart' ? 'YazePart' : 'ApartmanPro'", "currentApp === 'yazepart' ? 'Apart' : 'SYM'")
    with open(sidebar_path, 'w', encoding='utf-8') as f:
        f.write(sb)

# 3. Change LandingPage 'Giriş Yap' button to direct to /uygulama-sec instead of /login
landing_path = r'D:\yazılım\yazesym\frontend\src\pages\landing\LandingPage.tsx'
with open(landing_path, 'r', encoding='utf-8') as f:
    lp = f.read()
lp = lp.replace("navigate('/login')", "navigate('/uygulama-sec')")
with open(landing_path, 'w', encoding='utf-8') as f:
    f.write(lp)

# 4. Modify App.tsx to allow /uygulama-sec without auth (or keep it protected but direct from Landing)
# Actually, UygulamaSecPage uses useAuthStore(s => s.user). If not logged in, we should handle it.
# Let's check if UygulamaSecPage requires auth. Yes, it's currently under ProtectedRoute.
# If they click 'Giriş Yap' on landing, they go to '/uygulama-sec'. Since it's protected, they'll be redirected to /login first.
# After login, they go back to /uygulama-sec. This logic is already correct!

print("Names updated to SYM and Apart. LandingPage updated.")
