import os

path = r'D:\yazılım\yazesym\frontend\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

target = '<Route path="/uygulama-sec" element={<ProtectedRoute><UygulamaSecPage /></ProtectedRoute>} />'
new_route = '<Route path="/uygulama-sec" element={<UygulamaSecPage />} />'
if target in c:
    c = c.replace(target, new_route)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

path2 = r'D:\yazılım\yazesym\frontend\src\pages\uygulama_sec\UygulamaSecPage.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    c2 = f.read()

c2 = c2.replace('{user?.ad} {user?.soyad}', '{user ? user.ad + " " + user.soyad : "Misafir"}')

# If not logged in, go to login. Else, proceed normally.
logic_old = """    if (user?.rol === 'sakin' || user?.rol === 'goruntule') {"""
logic_new = """    if (!user) {
      navigate('/login')
    } else if (user?.rol === 'sakin' || user?.rol === 'goruntule') {"""
if "if (!user)" not in c2:
    c2 = c2.replace(logic_old, logic_new)

# Hide logout button if not logged in
btn_old = """<button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center space-x-2 text-white/70 hover:text-red-400 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300 font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Güvenli Çıkış</span>
        </button>"""
btn_new = """{user && <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center space-x-2 text-white/70 hover:text-red-400 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300 font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Güvenli Çıkış</span>
        </button>}"""
c2 = c2.replace(btn_old, btn_new)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(c2)

print('Unprotected uygulama-sec')
