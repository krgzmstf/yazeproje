import os

# 1. Create App Store
store_dir = r"D:\yazılım\yazesym\frontend\src\store"
store_file = os.path.join(store_dir, "appSelection.ts")
os.makedirs(store_dir, exist_ok=True)
with open(store_file, "w", encoding="utf-8") as f:
    f.write("""import { create } from 'zustand'

interface AppSelectionState {
  currentApp: 'yazesym' | 'yazepart'
  setApp: (app: 'yazesym' | 'yazepart') => void
}

export const useAppSelectionStore = create<AppSelectionState>((set) => ({
  currentApp: 'yazesym',
  setApp: (app) => set({ currentApp: app }),
}))
""")

# 2. Create UygulamaSecPage.tsx
page_dir = r"D:\yazılım\yazesym\frontend\src\pages\uygulama_sec"
os.makedirs(page_dir, exist_ok=True)
page_file = os.path.join(page_dir, "UygulamaSecPage.tsx")
with open(page_file, "w", encoding="utf-8") as f:
    f.write("""import { useNavigate } from 'react-router-dom'
import { Building2, Settings2, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useAppSelectionStore } from '@/store/appSelection'

export function UygulamaSecPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const setApp = useAppSelectionStore(s => s.setApp)

  const handleSelect = (app: 'yazesym' | 'yazepart') => {
    setApp(app)
    if (user?.rol === 'sakin' || user?.rol === 'goruntule') {
      navigate('/portal')
    } else if (user?.rol === 'super_admin') {
      navigate('/site-sec')
    } else {
      navigate('/panel')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 bg-white px-4 py-2 rounded-lg shadow font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mb-4 font-playfair">
            Hoş Geldiniz, {user?.ad_soyad}
          </h1>
          <p className="text-gray-600 text-lg">
            Lütfen giriş yapmak istediğiniz uygulamayı seçin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* YazeSYM Card */}
          <button
            onClick={() => handleSelect('yazesym')}
            className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#C9A961] flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="w-24 h-24 bg-[#0A1F44]/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-12 h-12 text-[#0A1F44]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1F44] mb-3">YazeSYM</h2>
            <p className="text-gray-500 text-sm">
              Apartman, Site ve Tesis Yönetim Sistemi. Tüm yönetim, finans ve iletişim işlemleriniz burada.
            </p>
          </button>

          {/* YazePart Card */}
          <button
            onClick={() => handleSelect('yazepart')}
            className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#C9A961] flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="w-24 h-24 bg-[#C9A961]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Settings2 className="w-12 h-12 text-[#C9A961]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1F44] mb-3">YazePart</h2>
            <p className="text-gray-500 text-sm">
              Yedek Parça ve Teknik Servis Yönetim Sistemi. Envanter ve hizmet takibi için özel modül.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
""")

# 3. Modify LoginPage.tsx
login_path = r"D:\yazılım\yazesym\frontend\src\pages\auth\LoginPage.tsx"
with open(login_path, "r", encoding="utf-8") as f:
    login_content = f.read()

# Replace routing in LoginPage.tsx
# Find the routing part after setAuth
old_route = """      if (user.rol === 'sakin' || user.rol === 'goruntule') { 
        navigate('/portal')
      } else if (user.rol === 'super_admin') {
        navigate('/site-sec')
      } else {
        navigate('/panel')
      }"""
new_route = """      navigate('/uygulama-sec')"""
login_content = login_content.replace(old_route, new_route)

with open(login_path, "w", encoding="utf-8") as f:
    f.write(login_content)

# 4. Modify App.tsx
app_path = r"D:\yazılım\yazesym\frontend\src\App.tsx"
with open(app_path, "r", encoding="utf-8") as f:
    app_content = f.read()

# Add import
if "UygulamaSecPage" not in app_content:
    app_content = app_content.replace("import { LoginPage } from '@/pages/auth/LoginPage'", "import { LoginPage } from '@/pages/auth/LoginPage'\nimport { UygulamaSecPage } from '@/pages/uygulama_sec/UygulamaSecPage'")

# Route RootPage logic
old_root = """  if (user?.rol === 'sakin' || user?.rol === 'goruntule') return <Navigate to="/portal\n" replace />
  if (user?.rol === 'super_admin' && !activeSiteId) return <Navigate to="/site-sec" replace />
  return <Navigate to="/panel" replace />"""
new_root = """  return <Navigate to="/uygulama-sec" replace />"""
app_content = app_content.replace(old_root, new_root)
app_content = app_content.replace("if (user?.rol === 'sakin' || user?.rol === 'goruntule') return <Navigate to=\"/portal\" replace />", "return <Navigate to=\"/uygulama-sec\" replace />")

# Add route
if "/uygulama-sec" not in app_content:
    app_content = app_content.replace('<Route path="/panel" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>', '<Route path="/uygulama-sec" element={<ProtectedRoute><UygulamaSecPage /></ProtectedRoute>} />\n        <Route path="/panel" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>')

with open(app_path, "w", encoding="utf-8") as f:
    f.write(app_content)

# 5. Modify Header / Sidebar to show YazePart dynamically based on store
sidebar_path = r"D:\yazılım\yazesym\frontend\src\components\layout\Sidebar.tsx"
if os.path.exists(sidebar_path):
    with open(sidebar_path, "r", encoding="utf-8") as f:
        sb_content = f.read()
    if "useAppSelectionStore" not in sb_content:
        sb_content = sb_content.replace("import { Link, useLocation } from 'react-router-dom'", "import { Link, useLocation } from 'react-router-dom'\nimport { useAppSelectionStore } from '@/store/appSelection'")
        sb_content = sb_content.replace("export function Sidebar() {", "export function Sidebar() {\n  const currentApp = useAppSelectionStore(s => s.currentApp)")
        sb_content = sb_content.replace("ApartmanPro", "{currentApp === 'yazepart' ? 'YazePart' : 'ApartmanPro'}")
        with open(sidebar_path, "w", encoding="utf-8") as f:
            f.write(sb_content)

header_path = r"D:\yazılım\yazesym\frontend\src\components\layout\Header.tsx"
if os.path.exists(header_path):
    with open(header_path, "r", encoding="utf-8") as f:
        hd_content = f.read()
    if "useAppSelectionStore" not in hd_content:
        hd_content = hd_content.replace("import { useAuthStore } from '@/store/auth'", "import { useAuthStore } from '@/store/auth'\nimport { useAppSelectionStore } from '@/store/appSelection'")
        hd_content = hd_content.replace("export function Header({ onMenuClick }: { onMenuClick: () => void }) {", "export function Header({ onMenuClick }: { onMenuClick: () => void }) {\n  const currentApp = useAppSelectionStore(s => s.currentApp)")
        hd_content = hd_content.replace("Apartman Yönetim Sistemi", "{currentApp === 'yazepart' ? 'Yedek Parça Sistemi' : 'Apartman Yönetim Sistemi'}")
        with open(header_path, "w", encoding="utf-8") as f:
            f.write(hd_content)

print("Setup completed successfully.")
