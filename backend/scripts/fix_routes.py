import os

path = r'D:\yazılım\yazesym\frontend\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

target = '<Route path="/site-kur" element={<ProtectedRoute><SiteKurPage /></ProtectedRoute>} />'
injection = target + '\n            <Route path="/uygulama-sec" element={<ProtectedRoute><UygulamaSecPage /></ProtectedRoute>} />'

if '<Route path="/uygulama-sec"' not in c:
    c = c.replace(target, injection)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Route fixed successfully")
