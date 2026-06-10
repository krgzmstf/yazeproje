import os

# 1. Fix UygulamaSecPage.tsx
path = r'D:\yazılım\yazesym\frontend\src\pages\uygulama_sec\UygulamaSecPage.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('user?.ad_soyad', 'user?.ad} {user?.soyad')
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

# 2. Fix Sidebar.tsx
path2 = r'D:\yazılım\yazesym\frontend\src\components\layout\Sidebar.tsx'
with open(path2, 'r', encoding='utf-8') as f:
    c2 = f.read()
if 'useAppSelectionStore' not in c2:
    c2 = c2.replace("import { useAuthStore } from '@/store/auth'", "import { useAuthStore } from '@/store/auth'\nimport { useAppSelectionStore } from '@/store/appSelection'")
with open(path2, 'w', encoding='utf-8') as f:
    f.write(c2)

print("Fixes applied successfully.")
